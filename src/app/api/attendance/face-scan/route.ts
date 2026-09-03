import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSchoolCurrentTime } from '@/lib/timetable/period-engine';
import { emitRealtimeEvent } from '@/lib/realtime/event-bus';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

const PYTHON_API_URL = 'http://127.0.0.1:8001';

/**
 * Fallback CLI runner when FastAPI server is offline
 */
async function runPythonCli(args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'python_service', 'face_engine.py');
    const child = execFile('py', ['-3', scriptPath, ...args], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr || err.message));
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`Failed to parse Python output: ${stdout}`));
      }
    });
  });
}

/**
 * POST /api/attendance/face-scan
 * Matches face image against student enrollment photo and logs attendance.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, studentIdentifier } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Live face image frame is required.' }, { status: 400 });
    }

    // 1. Resolve Student (if identifier provided: 1:1 match; otherwise 1:N match)
    let candidateStudents = [];

    if (studentIdentifier) {
      const clean = studentIdentifier.trim();
      const student = await prisma.student.findFirst({
        where: {
          status: 'ENROLLED',
          OR: [
            { qrToken: clean },
            { studentId: clean },
            { admissionNo: clean },
            { rollNo: clean },
            { id: clean },
          ],
        },
        include: { class: true, section: true },
      });

      if (student) candidateStudents.push(student);
    }

    if (candidateStudents.length === 0) {
      // Fetch enrolled students who have a photoUrl
      candidateStudents = await prisma.student.findMany({
        where: {
          status: 'ENROLLED',
          photoUrl: { not: null },
        },
        include: { class: true, section: true },
        take: 30, // Limit search pool for fast response
      });
    }

    if (candidateStudents.length === 0) {
      return NextResponse.json(
        { error: 'No enrolled students with registered admission photos found for matching.' },
        { status: 404 }
      );
    }

    let matchResult: any = null;

    // 2. Try HTTP call to Python FastAPI server first
    try {
      const candidatesPayload = candidateStudents.map((s) => ({
        student_id: s.id,
        photo_url: s.photoUrl,
        name: s.fullName,
      }));

      const pyRes = await fetch(`${PYTHON_API_URL}/identify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          face_image_base64: imageBase64,
          candidates: candidatesPayload,
          threshold: 0.65,
        }),
        signal: AbortSignal.timeout(3500),
      });

      if (pyRes.ok) {
        matchResult = await pyRes.json();
      }
    } catch {
      // FastAPI server is not responding, use CLI fallback
      matchResult = null;
    }

    // 3. Fallback to direct Python CLI if FastAPI was not running
    if (!matchResult) {
      try {
        // Save live image to temp file for CLI processing
        const tempDir = path.join(process.cwd(), 'python_service', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const liveImagePath = path.join(tempDir, `live_${Date.now()}.png`);
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(liveImagePath, Buffer.from(base64Data, 'base64'));

        // Check against first candidate's photo
        const targetStudent = candidateStudents[0];
        let refImagePath = targetStudent.photoUrl;

        // If local or public path
        if (refImagePath && refImagePath.startsWith('/')) {
          refImagePath = path.join(process.cwd(), 'public', refImagePath.slice(1));
        }

        if (refImagePath && fs.existsSync(refImagePath)) {
          const cliRes = await runPythonCli([
            '--mode', 'verify',
            '--image1', liveImagePath,
            '--image2', refImagePath,
          ]);

          if (cliRes && cliRes.match) {
            matchResult = {
              matched: true,
              best_match: {
                student_id: targetStudent.id,
                similarity: cliRes.similarity,
                name: targetStudent.fullName,
              },
            };
          }
        }

        // Cleanup temp file
        try { fs.unlinkSync(liveImagePath); } catch {}
      } catch (cliErr) {
        console.warn('CLI face match fallback error:', cliErr);
      }
    }

    // 4. Evaluate Matching Results
    if (!matchResult || !matchResult.matched || !matchResult.best_match) {
      return NextResponse.json(
        {
          matched: false,
          message: 'Face scanned, but could not match with enrolled admission photo with sufficient confidence.',
          confidence: matchResult?.best_match?.similarity ? Math.round(matchResult.best_match.similarity * 100) : 0,
        },
        { status: 401 }
      );
    }

    const matchedStudent = candidateStudents.find((s) => s.id === matchResult.best_match.student_id);
    if (!matchedStudent) {
      return NextResponse.json({ error: 'Matched student record not found.' }, { status: 404 });
    }

    // 5. School Time & Date in Asia/Karachi
    const schoolTime = getSchoolCurrentTime();
    const todayMidnight = new Date(schoolTime.dateString);

    // Determine status (Late after 08:30)
    const lateThresholdMinutes = 8 * 60 + 30; // 08:30 AM
    const isLate = schoolTime.totalMinutes > lateThresholdMinutes;
    const attendanceStatus = isLate ? 'LATE' : 'PRESENT';

    // 6. Check if already marked today
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: matchedStudent.id,
        date: todayMidnight,
      },
    });

    let alreadyMarked = false;
    let attendanceRecord;

    if (existing) {
      alreadyMarked = true;
      attendanceRecord = existing;
    } else {
      attendanceRecord = await prisma.attendance.create({
        data: {
          studentId: matchedStudent.id,
          date: todayMidnight,
          status: attendanceStatus,
          time: schoolTime.timeString,
          method: 'FACE',
          remarks: `Automated Python Biometric Face Scan (${Math.round(matchResult.best_match.similarity * 100)}% Match)`,
        },
      });

      // Emit realtime attendance event
      emitRealtimeEvent('ATTENDANCE_UPDATED', {
        classId: matchedStudent.classId,
        sectionId: matchedStudent.sectionId,
        studentId: matchedStudent.id,
        data: {
          studentName: matchedStudent.fullName,
          status: attendanceStatus,
          time: schoolTime.timeString,
          method: 'FACE',
        },
      });
    }

    return NextResponse.json({
      success: true,
      matched: true,
      alreadyMarked,
      attendance: attendanceRecord,
      confidence: Math.round(matchResult.best_match.similarity * 100),
      student: {
        id: matchedStudent.id,
        fullName: matchedStudent.fullName,
        studentId: matchedStudent.studentId,
        rollNo: matchedStudent.rollNo,
        className: matchedStudent.class.name,
        sectionName: matchedStudent.section.name,
        photoUrl: matchedStudent.photoUrl,
        attendanceStatus,
        time: schoolTime.timeString,
        method: 'FACE',
      },
    });
  } catch (error: any) {
    console.error('Face scan error:', error);
    return NextResponse.json({ error: error.message || 'Face recognition service error' }, { status: 500 });
  }
}
