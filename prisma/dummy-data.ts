import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function generateDummyData() {
  console.log('Generating dummy data...');

  try {
    // Create additional users
    const users = [
      {
        id: 'user-1',
        email: 'manager@hamidawi.com',
        username: 'manager',
        password: await hashPassword('manager123'),
        name: 'مدير الحملة',
        phone: '+964712345678',
        roleId: 'campaign-manager-role',
      },
      {
        id: 'user-2',
        email: 'marketer1@hamidawi.com',
        username: 'marketer1',
        password: await hashPassword('marketer123'),
        name: 'مسوق ميداني 1',
        phone: '+964712345679',
        roleId: 'marketer-role',
      },
      {
        id: 'user-3',
        email: 'marketer2@hamidawi.com',
        username: 'marketer2',
        password: await hashPassword('marketer123'),
        name: 'مسوق رقمي 1',
        phone: '+964712345680',
        roleId: 'marketer-role',
      },
      {
        id: 'user-4',
        email: 'assistant1@hamidawi.com',
        username: 'assistant1',
        password: await hashPassword('assistant123'),
        name: 'مساعد 1',
        phone: '+964712345681',
        roleId: 'assistant-role',
      },
    ];

    for (const userData of users) {
      await db.user.upsert({
        where: { id: userData.id },
        update: {},
        create: userData,
      });
    }

    // Create additional areas
    const areas = [
      {
        id: 'area-1',
        name: 'المنصور',
        nameAr: 'المنصور',
        description: 'منطقة المنصور في بغداد',
        campaignId: 'sample-campaign',
        coordinates: '{"type":"Point","coordinates":[44.366111,33.315278]}',
      },
      {
        id: 'area-2',
        name: 'الكاظمية',
        nameAr: 'الكاظمية',
        description: 'منطقة الكاظمية في بغداد',
        campaignId: 'sample-campaign',
        coordinates: '{"type":"Point","coordinates":[44.438333,33.361944]}',
      },
      {
        id: 'area-3',
        name: 'الاعظمية',
        nameAr: 'الاعظمية',
        description: 'منطقة الاعظمية في بغداد',
        campaignId: 'sample-campaign',
        coordinates: '{"type":"Point","coordinates":[44.433611,33.295]}',
      },
    ];

    for (const areaData of areas) {
      await db.area.upsert({
        where: { id: areaData.id },
        update: {},
        create: areaData,
      });
    }

    // Create marketers
    const marketers = [
      {
        id: 'marketer-1',
        userId: 'user-2',
        campaignId: 'sample-campaign',
        areaId: 'area-1',
        specialty: 'field',
        performance: 85.5,
      },
      {
        id: 'marketer-2',
        userId: 'user-3',
        campaignId: 'sample-campaign',
        specialty: 'digital',
        performance: 92.3,
      },
    ];

    for (const marketerData of marketers) {
      await db.marketer.upsert({
        where: { id: marketerData.id },
        update: {},
        create: marketerData,
      });
    }

    // Create tasks
    const tasks = [
      {
        id: 'task-1',
        title: 'توزيع المنشورات في المنصور',
        titleAr: 'توزيع المنشورات في المنصور',
        description: 'توزيع 1000 منشور في منطقة المنصور',
        descriptionAr: 'توزيع 1000 منشور في منطقة المنصور',
        campaignId: 'sample-campaign',
        areaId: 'area-1',
        assignedTo: 'user-2',
        marketerId: 'marketer-1',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      },
      {
        id: 'task-2',
        title: 'إدارة حملة التواصل الاجتماعي',
        titleAr: 'إدارة حملة التواصل الاجتماعي',
        description: 'إدارة منشورات فيسبوك وتويتر للحملة',
        descriptionAr: 'إدارة منشورات فيسبوك وتويتر للحملة',
        campaignId: 'sample-campaign',
        assignedTo: 'user-3',
        marketerId: 'marketer-2',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'PENDING',
        priority: 'MEDIUM',
      },
      {
        id: 'task-3',
        title: 'تنظيم مؤتمر صحفي',
        titleAr: 'تنظيم مؤتمر صحفي',
        description: 'تنظيم مؤتمر صحفي في منطقة الكاظمية',
        descriptionAr: 'تنظيم مؤتمر صحفي في منطقة الكاظمية',
        campaignId: 'sample-campaign',
        areaId: 'area-2',
        assignedTo: 'user-1',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        status: 'PENDING',
        priority: 'URGENT',
      },
      {
        id: 'task-4',
        title: 'جمع التوقيعات',
        titleAr: 'جمع التوقيعات',
        description: 'جمع 500 توقيع في منطقة الاعظمية',
        descriptionAr: 'جمع 500 توقيع في منطقة الاعظمية',
        campaignId: 'sample-campaign',
        areaId: 'area-3',
        assignedTo: 'user-2',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'COMPLETED',
        priority: 'HIGH',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Completed 2 days ago
      },
    ];

    for (const taskData of tasks) {
      await db.task.upsert({
        where: { id: taskData.id },
        update: {},
        create: taskData,
      });
    }

    // Create posts
    const posts = [
      {
        id: 'post-1',
        title: 'إطلاق الحملة الانتخابية',
        titleAr: 'إطلاق الحملة الانتخابية',
        content: 'نعلن إطلاق حملتنا الانتخابية تحت شعار "التغيير نحو الأفضل"',
        contentAr: 'نعلن إطلاق حملتنا الانتخابية تحت شعار "التغيير نحو الأفضل"',
        type: 'ANNOUNCEMENT',
        status: 'PUBLISHED',
        campaignId: 'sample-campaign',
        authorId: 'admin-user',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        imageUrl: '/images/campaign-launch.jpg',
      },
      {
        id: 'post-2',
        title: 'برنامجنا الانتخابي',
        titleAr: 'برنامجنا الانتخابي',
        content: 'نقدم لكم برنامجنا الانتخابي الشامل الذي يركز على التعليم والصحة',
        contentAr: 'نقدم لكم برنامجنا الانتخابي الشامل الذي يركز على التعليم والصحة',
        type: 'PRESS_RELEASE',
        status: 'PUBLISHED',
        campaignId: 'sample-campaign',
        authorId: 'user-1',
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: 'post-3',
        title: 'زيارة ميدانية',
        titleAr: 'زيارة ميدانية',
        content: 'سنقوم بزيارة ميدانية لمنطقة المنصور يوم الجمعة',
        contentAr: 'سنقوم بزيارة ميدانية لمنطقة المنصور يوم الجمعة',
        type: 'EVENT',
        status: 'SCHEDULED',
        campaignId: 'sample-campaign',
        authorId: 'admin-user',
        scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      },
    ];

    for (const postData of posts) {
      await db.post.upsert({
        where: { id: postData.id },
        update: {},
        create: postData,
      });
    }

    // Create post interactions
    const interactions = [
      {
        postId: 'post-1',
        type: 'LIKE',
        userId: 'user-2',
      },
      {
        postId: 'post-1',
        type: 'COMMENT',
        userId: 'user-3',
        content: 'مبادرة رائعة!',
      },
      {
        postId: 'post-1',
        type: 'SHARE',
        userId: 'user-4',
      },
      {
        postId: 'post-2',
        type: 'LIKE',
        userId: 'user-1',
      },
      {
        postId: 'post-2',
        type: 'COMMENT',
        userId: 'user-2',
        content: 'برنامج متكامل ومميز',
      },
    ];

    for (const interactionData of interactions) {
      await db.postInteraction.create({
        data: interactionData,
      });
    }

    // Create join requests
    const joinRequests = [
      {
        id: 'join-1',
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '+964712345682',
        position: 'متطوع ميداني',
        experience: '5 سنوات في العمل التطوعي',
        message: 'أرغب في المساعدة في الحملة الانتخابية',
        campaignId: 'sample-campaign',
        status: 'PENDING',
      },
      {
        id: 'join-2',
        name: 'فاطمة علي',
        email: 'fatima@example.com',
        phone: '+964712345683',
        position: 'مساعدة إدارية',
        experience: '3 سنوات في العمل الإداري',
        message: 'لدي خبرة في التنظيم والإدارة',
        campaignId: 'sample-campaign',
        status: 'APPROVED',
        reviewedBy: 'admin-user',
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'join-3',
        name: 'محمد حسن',
        email: 'mohammed@example.com',
        phone: '+964712345684',
        position: 'مسوق رقمي',
        experience: 'خبير في التسويق الرقمي ووسائل التواصل',
        message: 'يمكنني المساعدة في الحملة الرقمية',
        campaignId: 'sample-campaign',
        status: 'REJECTED',
        reviewedBy: 'user-1',
        reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const joinRequestData of joinRequests) {
      await db.joinRequest.upsert({
        where: { id: joinRequestData.id },
        update: {},
        create: joinRequestData,
      });
    }

    // Create notifications
    const notifications = [
      {
        title: 'New Task Assigned',
        titleAr: 'تم تعيين مهمة جديدة',
        message: 'You have been assigned a new task: توزيع المنشورات في المنصور',
        messageAr: 'تم تعيين مهمة جديدة لك: توزيع المنشورات في المنصور',
        type: 'TASK_ASSIGNED',
        userId: 'user-2',
        metadata: JSON.stringify({ taskId: 'task-1', taskTitle: 'توزيع المنشورات في المنصور' }),
      },
      {
        title: 'Task Completed',
        titleAr: 'تم إكمال مهمة',
        message: 'Task "جمع التوقيعات" has been completed',
        messageAr: 'تم إكمال مهمة "جمع التوقيعات"',
        type: 'SUCCESS',
        userId: 'admin-user',
        metadata: JSON.stringify({ taskId: 'task-4', taskTitle: 'جمع التوقيعات' }),
      },
      {
        title: 'New Join Request',
        titleAr: 'طلب انضمام جديد',
        message: 'New join request from أحمد محمد',
        messageAr: 'طلب انضمام جديد من أحمد محمد',
        type: 'INFO',
        userId: 'admin-user',
        metadata: JSON.stringify({ joinRequestId: 'join-1', applicantName: 'أحمد محمد' }),
      },
      {
        title: 'Post Published',
        titleAr: 'تم نشر منشور',
        message: 'Post "برنامجنا الانتخابي" has been published',
        messageAr: 'تم نشر منشور "برنامجنا الانتخابي"',
        type: 'SUCCESS',
        userId: 'user-1',
        metadata: JSON.stringify({ postId: 'post-2', postTitle: 'برنامجنا الانتخابي' }),
      },
    ];

    for (const notificationData of notifications) {
      await db.notification.create({
        data: notificationData,
      });
    }

    // Create messages
    const messages = [
      {
        id: 'message-1',
        title: 'تذكير بالمؤتمر الصحفي',
        titleAr: 'تذكير بالمؤتمر الصحفي',
        content: 'نذكركم بالمؤتمر الصحفي المقرر يوم الجمعة',
        contentAr: 'نذكركم بالمؤتمر الصحفي المقرر يوم الجمعة',
        type: 'WHATSAPP',
        senderId: 'admin-user',
        recipients: JSON.stringify(['user-1', 'user-2', 'user-3']),
        status: 'SENT',
        sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'message-2',
        title: 'دعوة لحضور الاجتماع',
        titleAr: 'دعوة لحضور الاجتماع',
        content: 'ندعوكم لحضور الاجتماع الأسبوعي يوم الأحد',
        contentAr: 'ندعوكم لحضور الاجتماع الأسبوعي يوم الأحد',
        type: 'SMS',
        senderId: 'user-1',
        recipients: JSON.stringify(['user-2', 'user-3', 'user-4']),
        status: 'DRAFT',
      },
    ];

    for (const messageData of messages) {
      await db.message.upsert({
        where: { id: messageData.id },
        update: {},
        create: messageData,
      });
    }

    // Create QR codes
    const qrCodes = [
      {
        id: 'qr-1',
        title: 'صفحة الحملة الرئيسية',
        titleAr: 'صفحة الحملة الرئيسية',
        content: 'https://hamidawi-campaign.com',
        type: 'CAMPAIGN_LINK',
        campaignId: 'sample-campaign',
      },
      {
        id: 'qr-2',
        title: 'طلب الانضمام',
        titleAr: 'طلب الانضمام',
        content: 'https://hamidawi-campaign.com/join',
        type: 'JOIN_REQUEST',
        campaignId: 'sample-campaign',
      },
      {
        id: 'qr-3',
        title: 'منشور البرنامج الانتخابي',
        titleAr: 'منشور البرنامج الانتخابي',
        content: 'https://hamidawi-campaign.com/program',
        type: 'POST_SHARE',
        campaignId: 'sample-campaign',
        entityId: 'post-2',
      },
    ];

    for (const qrCodeData of qrCodes) {
      await db.qRCode.upsert({
        where: { id: qrCodeData.id },
        update: {},
        create: qrCodeData,
      });
    }

    // Create activity logs
    const activityLogs = [
      {
        userId: 'admin-user',
        action: 'CREATE_USER',
        entityType: 'User',
        entityId: 'user-1',
        newValues: JSON.stringify({ email: 'manager@hamidawi.com', name: 'مدير الحملة' }),
      },
      {
        userId: 'admin-user',
        action: 'CREATE_TASK',
        entityType: 'Task',
        entityId: 'task-1',
        newValues: JSON.stringify({ title: 'توزيع المنشورات في المنصور', assignedTo: 'user-2' }),
      },
      {
        userId: 'user-2',
        action: 'UPDATE_TASK',
        entityType: 'Task',
        entityId: 'task-1',
        oldValues: JSON.stringify({ status: 'PENDING' }),
        newValues: JSON.stringify({ status: 'IN_PROGRESS' }),
      },
      {
        userId: 'admin-user',
        action: 'PUBLISH_POST',
        entityType: 'Post',
        entityId: 'post-1',
        oldValues: JSON.stringify({ status: 'DRAFT' }),
        newValues: JSON.stringify({ status: 'PUBLISHED' }),
      },
      {
        userId: 'user-1',
        action: 'APPROVE_JOIN_REQUEST',
        entityType: 'JoinRequest',
        entityId: 'join-2',
        oldValues: JSON.stringify({ status: 'PENDING' }),
        newValues: JSON.stringify({ status: 'APPROVED' }),
      },
    ];

    for (const logData of activityLogs) {
      await db.activityLog.create({
        data: logData,
      });
    }

    // Create reports
    const reports = [
      {
        id: 'report-1',
        title: 'Campaign Weekly Summary',
        titleAr: 'تقرير أسبوعي ملخص للحملة',
        type: 'CAMPAIGN_SUMMARY',
        campaignId: 'sample-campaign',
        data: JSON.stringify({
          totalPosts: 3,
          publishedPosts: 2,
          totalTasks: 4,
          completedTasks: 1,
          totalMarketers: 2,
          totalJoinRequests: 3,
          approvedJoinRequests: 1,
        }),
        period: 'weekly',
      },
    ];

    for (const reportData of reports) {
      await db.report.upsert({
        where: { id: reportData.id },
        update: {},
        create: reportData,
      });
    }

    console.log('Dummy data generated successfully!');
    console.log('Test users created:');
    console.log('Manager: manager@hamidawi.com / manager123');
    console.log('Marketer 1: marketer1@hamidawi.com / marketer123');
    console.log('Marketer 2: marketer2@hamidawi.com / marketer123');
    console.log('Assistant: assistant1@hamidawi.com / assistant123');

  } catch (error) {
    console.error('Error generating dummy data:', error);
  } finally {
    await db.$disconnect();
  }
}

generateDummyData();