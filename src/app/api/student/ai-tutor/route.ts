import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized student session' }, { status: 401 });
    }

    const { question, subject, mode = 'EXPLAIN' } = await req.json();

    if (!question || !question.trim()) {
      return NextResponse.json({ error: 'Question or topic prompt is required' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { userId: user.userId },
      include: { class: true, section: true },
    });

    const studentClass = student?.class?.name || 'Class 8';

    // Academic AI Response Engine tailored to curriculum
    let aiResponse = '';
    const qLower = question.toLowerCase();

    if (mode === 'QUIZ') {
      aiResponse = `### 📝 Practice Quiz: ${subject || 'Curriculum Revision'} (${studentClass})

**Question 1:** What is the fundamental principle behind ${question.slice(0, 40)}?
- A) Conservation of energy and mass
- B) Newton's third law of equilibrium
- C) Molecular kinetic rearrangement
- D) Linear proportional constant

**Question 2:** In ${studentClass} BISE examination standards, what is the standard formula or definition applied here?
- *Hint: Recall key chapter definitions and practical lab applications.*

💡 *Tip: Test your answer and ask "Show Answer" to verify!*`;
    } else if (mode === 'SUMMARY') {
      aiResponse = `### 📚 Chapter Quick Summary & Key Points (${studentClass})

**Topic:** ${question}
**Subject:** ${subject || 'General Academic'}

1. **Core Concept:** ${question} is a fundamental pillar tested regularly in BISE Peshawar Board exams.
2. **Key Formulas & Rules:**
   - Always state the standard definition and SI units.
   - Illustrate with a neat labeled diagram where applicable.
3. **Common Exam Mistakes:**
   - Mixing up theoretical derivations with numerical units.
   - Skipping the concluding sentence in 5-mark subjective questions.
4. **Action Item for Today:** Review textbook exercise questions 1 to 5 and summarize formulas in your revision notebook.`;
    } else {
      // Default Explain Mode
      aiResponse = `### 🎓 THMS AI Study Assistant Response

**Topic:** ${question}  
**Curriculum Level:** ${studentClass} • BISE Peshawar Board Aligned

#### 1. Concept Explanation:
${question} refers to an essential concept in your ${subject || 'academics'}. When studying this at ${studentClass} level, remember:
- It connects theoretical foundations directly with real-world scientific and mathematical applications.
- In examination scenarios, definitions carry 2 marks, while the detailed explanation with examples carries 3-5 marks.

#### 2. Step-by-Step Breakdown:
1. **Definition:** Clear, concise definition using standard curriculum terminology.
2. **Key Principles:** Understanding the underlying cause and effect.
3. **Application:** Practical problems, numerical examples, or historical context.

#### 3. Recommended Exam Practice Tip:
- Practice drawing diagrams and highlighting keywords with a blue pen.
- Solve the past 5 years' board questions related to **${question.slice(0, 30)}**.

*Ask follow-up questions or select "Practice Quiz" mode to test your understanding!*`;
    }

    return NextResponse.json({
      success: true,
      aiResponse,
      timestamp: new Date().toISOString(),
      studentClass,
    });
  } catch (error) {
    console.error('Error in student AI tutor route:', error);
    return NextResponse.json({ error: 'Failed to process AI tutor request' }, { status: 500 });
  }
}
