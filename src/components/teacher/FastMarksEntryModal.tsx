'use client';

import React, { useState } from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Save, Loader2 } from 'lucide-react';

interface FastMarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  subjects: { id: string; name: string; code: string }[];
  students: { id: string; fullName: string; studentId: string; rollNo: string }[];
  onSuccess: () => void;
}

export default function FastMarksEntryModal({
  isOpen,
  onClose,
  classId,
  className,
  sectionId,
  sectionName,
  subjects,
  students,
  onSuccess,
}: FastMarksEntryModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [examTitle, setExamTitle] = useState('Monthly Class Test');
  const [marksMap, setMarksMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleMarkChange = (studentId: string, val: string) => {
    setMarksMap((prev) => ({ ...prev, [studentId]: val }));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.getElementById(`mark-input-${index + 1}`);
      nextInput?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.getElementById(`mark-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const marksList = students
      .filter((s) => marksMap[s.id] !== undefined && marksMap[s.id] !== '')
      .map((s) => ({
        studentId: s.id,
        marksObtained: parseFloat(marksMap[s.id]) || 0,
      }));

    if (marksList.length === 0) {
      setError('Please enter marks for at least one student');
      return;
    }

    // Validate max marks
    for (const m of marksList) {
      if (m.marksObtained > totalMarks || m.marksObtained < 0) {
        setError(`Marks cannot exceed total marks (${totalMarks}) or be negative`);
        return;
      }
    }

    setLoading(true);

    try {
      // Find or provision exam
      const res = await fetch('/api/teacher/marks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId,
          sectionId,
          subjectId: selectedSubjectId,
          totalMarks,
          marksList,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save marks');

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Error recording marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2A5F]/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#E2E8F0] shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Fast Marks Entry Roster</h3>
              <p className="text-xs text-[#64748B]">
                {className} • Section {sectionName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEE2E2] text-[#DC2626] text-xs font-bold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-[#DCFCE7] text-[#16A34A] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Marks recorded and verified successfully!</span>
          </div>
        )}

        {/* Configuration Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs">
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-[#0F172A] mb-1">Total Marks (Max):</label>
            <input
              type="number"
              min={10}
              max={1000}
              value={totalMarks}
              onChange={(e) => setTotalMarks(parseFloat(e.target.value) || 100)}
              className="w-full p-2 rounded-xl border border-[#E2E8F0] bg-white text-xs font-bold"
            />
          </div>
        </div>

        {/* Students Table with Keyboard Navigation */}
        <div className="flex-1 overflow-y-auto border border-[#E2E8F0] rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold sticky top-0">
              <tr>
                <th className="p-3">Roll</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Student ID</th>
                <th className="p-3 w-36">Marks (/{totalMarks})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {students.map((st, idx) => (
                <tr key={st.id} className="hover:bg-[#EFF6FF]/40 transition-colors">
                  <td className="p-3 font-mono font-bold text-[#0F172A]">{st.rollNo}</td>
                  <td className="p-3 font-bold text-[#0F172A]">{st.fullName}</td>
                  <td className="p-3 font-mono text-[#64748B]">{st.studentId}</td>
                  <td className="p-3">
                    <input
                      id={`mark-input-${idx}`}
                      type="number"
                      step="0.5"
                      min={0}
                      max={totalMarks}
                      placeholder="—"
                      value={marksMap[st.id] || ''}
                      onChange={(e) => handleMarkChange(st.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className="w-24 p-1.5 rounded-lg border border-[#E2E8F0] text-xs font-mono font-bold text-center focus:ring-2 focus:ring-[#2563EB] focus:outline-none"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F1F5F9]">
          <span className="text-[11px] text-[#64748B]">
            Tip: Press Enter or ↓ to advance to next student
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E2E8F0] text-[#475569] font-bold hover:bg-[#F8FAFC] text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || success}
              className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Marks</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
