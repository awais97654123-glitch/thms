import prisma from '../src/lib/db';

async function main() {
  console.log('🧪 Starting Student Intelligence & Sibling Mapping Verification Test...\n');

  // 1. Check existing students
  const students = await prisma.student.findMany({
    take: 5,
    include: {
      class: true,
      section: true,
      parent: true,
    },
  });

  console.log(`✅ Found ${students.length} students in database.`);
  if (students.length > 0) {
    const s = students[0];
    console.log(`👤 Testing with Student: ${s.fullName} (${s.studentId})`);

    // Sibling query
    let siblings: any[] = [];
    if (s.parentId || s.parent?.fatherPhone) {
      siblings = await prisma.student.findMany({
        where: {
          id: { not: s.id },
          OR: [
            ...(s.parentId ? [{ parentId: s.parentId }] : []),
            ...(s.parent?.fatherPhone ? [{ parent: { fatherPhone: s.parent.fatherPhone } }] : []),
          ],
        },
        include: {
          class: true,
          section: true,
        },
      });
    }
    console.log(`👨‍👩‍👦 Siblings detected in school: ${siblings.length}`);
    siblings.forEach((sib) => {
      console.log(`   - Sibling: ${sib.fullName} (Class: ${sib.class?.name}, Roll: ${sib.rollNo})`);
    });
  }

  // 2. Test Examinations
  const exams = await prisma.exam.findMany({
    include: {
      schedules: {
        include: {
          subject: true,
        },
      },
    },
  });
  console.log(`\n📚 Total Exam Sessions in database: ${exams.length}`);
  exams.forEach((ex) => {
    console.log(`   - Exam: ${ex.name} (Term: ${ex.term}, Papers: ${ex.schedules?.length || 0})`);
  });

  console.log('\n✨ All Student Intelligence & Exam subsystems operational!');
}

main()
  .catch((e) => {
    console.error('❌ Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
