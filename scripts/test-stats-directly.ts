import prisma from '../src/lib/db';

async function testQueryDirectly() {
  console.log('Testing queries directly...');
  try {
    const totalStudents = await prisma.student.count({ where: { status: 'ENROLLED' } });
    console.log('totalStudents:', totalStudents);

    const activeTeachers = await prisma.teacher.count();
    console.log('activeTeachers:', activeTeachers);

    const recentPayments = await prisma.payment.findMany({
      take: 5,
      select: {
        id: true,
        receiptNo: true,
        amount: true,
        student: {
          select: {
            fullName: true,
            studentId: true,
            class: { select: { name: true } },
          },
        },
        invoice: {
          select: {
            title: true,
            month: true,
          },
        },
      },
    });
    console.log('recentPayments:', recentPayments.length);

    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        student: { select: { fullName: true } },
        teacher: { select: { fullName: true } },
        parent: { select: { fatherName: true } },
      },
    });
    console.log('users:', users.length);
  } catch (e) {
    console.error('Direct query error:', e);
  }
}

testQueryDirectly().catch(console.error);
