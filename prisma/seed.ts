import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Users ──────────────────────────────────────────
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexusflow.dev' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'admin@nexusflow.dev',
      password,
      image: null,
      timezone: 'America/New_York',
    },
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@nexusflow.dev' },
    update: {},
    create: {
      name: 'Sarah Chen',
      email: 'sarah@nexusflow.dev',
      password,
      timezone: 'America/Los_Angeles',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john@nexusflow.dev' },
    update: {},
    create: {
      name: 'John Williams',
      email: 'john@nexusflow.dev',
      password,
      timezone: 'Europe/London',
    },
  });

  const emily = await prisma.user.upsert({
    where: { email: 'emily@nexusflow.dev' },
    update: {},
    create: {
      name: 'Emily Davis',
      email: 'emily@nexusflow.dev',
      password,
      timezone: 'Europe/Paris',
    },
  });

  console.log('✅ Users created');

  // ─── Workspace ──────────────────────────────────────
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-team' },
    update: {},
    create: {
      name: 'Acme Team',
      slug: 'acme-team',
      plan: 'PRO',
    },
  });

  // Members
  const members = [
    { userId: admin.id, role: 'OWNER' as const },
    { userId: sarah.id, role: 'ADMIN' as const },
    { userId: john.id, role: 'MEMBER' as const },
    { userId: emily.id, role: 'MEMBER' as const },
  ];

  for (const m of members) {
    await prisma.workspaceMember.upsert({
      where: { userId_workspaceId: { userId: m.userId, workspaceId: workspace.id } },
      update: {},
      create: { ...m, workspaceId: workspace.id },
    });
  }

  console.log('✅ Workspace & members created');

  // ─── Labels ─────────────────────────────────────────
  const labelData = [
    { name: 'Bug', color: '#ef4444' },
    { name: 'Feature', color: '#3b82f6' },
    { name: 'Enhancement', color: '#06b6d4' },
    { name: 'Documentation', color: '#10b981' },
    { name: 'Design', color: '#8b5cf6' },
    { name: 'Performance', color: '#f59e0b' },
    { name: 'Security', color: '#f97316' },
    { name: 'Testing', color: '#14b8a6' },
  ];

  const labels: Record<string, string> = {};
  for (const l of labelData) {
    const label = await prisma.label.upsert({
      where: { name_workspaceId: { name: l.name, workspaceId: workspace.id } },
      update: {},
      create: { ...l, workspaceId: workspace.id },
    });
    labels[l.name] = label.id;
  }

  console.log('✅ Labels created');

  // ─── Projects ───────────────────────────────────────
  const platformProject = await prisma.project.upsert({
    where: { key_workspaceId: { key: 'PLT', workspaceId: workspace.id } },
    update: {},
    create: {
      name: 'Platform v2.0',
      key: 'PLT',
      description: 'Next-generation platform rebuild with modern architecture',
      color: '#6366f1',
      workspaceId: workspace.id,
      taskCounter: 0,
    },
  });

  const mobileProject = await prisma.project.upsert({
    where: { key_workspaceId: { key: 'MOB', workspaceId: workspace.id } },
    update: {},
    create: {
      name: 'Mobile App',
      key: 'MOB',
      description: 'iOS & Android mobile application',
      color: '#f59e0b',
      workspaceId: workspace.id,
      taskCounter: 0,
    },
  });

  const docsProject = await prisma.project.upsert({
    where: { key_workspaceId: { key: 'DOC', workspaceId: workspace.id } },
    update: {},
    create: {
      name: 'Documentation',
      key: 'DOC',
      description: 'API documentation and developer guides',
      color: '#10b981',
      workspaceId: workspace.id,
      taskCounter: 0,
    },
  });

  console.log('✅ Projects created');

  // ─── Columns ────────────────────────────────────────
  const defaultCols = [
    { name: 'Backlog', color: '#6b7280', order: 0 },
    { name: 'Todo', color: '#3b82f6', order: 1 },
    { name: 'In Progress', color: '#f59e0b', order: 2 },
    { name: 'In Review', color: '#8b5cf6', order: 3 },
    { name: 'Done', color: '#10b981', order: 4 },
  ];

  const projectColumns: Record<string, Record<string, string>> = {};

  for (const project of [platformProject, mobileProject, docsProject]) {
    projectColumns[project.id] = {};
    for (const col of defaultCols) {
      const existing = await prisma.column.findFirst({
        where: { projectId: project.id, name: col.name },
      });
      if (existing) {
        projectColumns[project.id][col.name] = existing.id;
      } else {
        const column = await prisma.column.create({
          data: { ...col, projectId: project.id },
        });
        projectColumns[project.id][col.name] = column.id;
      }
    }
  }

  console.log('✅ Columns created');

  // ─── Tasks for Platform v2.0 ────────────────────────
  const platformTasks = [
    { title: 'Set up Next.js project structure', status: 'DONE' as const, priority: 'HIGH' as const, assigneeId: admin.id, columnName: 'Done', estimate: 3 },
    { title: 'Design database schema', status: 'DONE' as const, priority: 'HIGH' as const, assigneeId: sarah.id, columnName: 'Done', estimate: 5 },
    { title: 'Implement authentication flow', status: 'DONE' as const, priority: 'URGENT' as const, assigneeId: admin.id, columnName: 'Done', estimate: 8 },
    { title: 'Create workspace management API', status: 'IN_REVIEW' as const, priority: 'HIGH' as const, assigneeId: john.id, columnName: 'In Review', estimate: 5 },
    { title: 'Build Kanban board with DnD', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, assigneeId: sarah.id, columnName: 'In Progress', estimate: 13 },
    { title: 'Add real-time collaboration', status: 'IN_PROGRESS' as const, priority: 'MEDIUM' as const, assigneeId: admin.id, columnName: 'In Progress', estimate: 8 },
    { title: 'Implement notification system', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: emily.id, columnName: 'Todo', estimate: 5 },
    { title: 'Build analytics dashboard', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: john.id, columnName: 'Todo', estimate: 8 },
    { title: 'Add AI task suggestions', status: 'TODO' as const, priority: 'LOW' as const, assigneeId: sarah.id, columnName: 'Todo', estimate: 5 },
    { title: 'Sprint management module', status: 'BACKLOG' as const, priority: 'MEDIUM' as const, assigneeId: null, columnName: 'Backlog', estimate: 8 },
    { title: 'Stripe billing integration', status: 'BACKLOG' as const, priority: 'LOW' as const, assigneeId: null, columnName: 'Backlog', estimate: 13 },
    { title: 'Dark/light theme system', status: 'DONE' as const, priority: 'MEDIUM' as const, assigneeId: emily.id, columnName: 'Done', estimate: 3 },
    { title: 'Fix drag-and-drop performance on mobile', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, assigneeId: john.id, columnName: 'In Progress', estimate: 3, dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { title: 'Add keyboard shortcuts system', status: 'IN_REVIEW' as const, priority: 'LOW' as const, assigneeId: emily.id, columnName: 'In Review', estimate: 3 },
    { title: 'Implement command palette (Ctrl+K)', status: 'DONE' as const, priority: 'MEDIUM' as const, assigneeId: admin.id, columnName: 'Done', estimate: 5 },
  ];

  let taskCounter = 0;
  for (const t of platformTasks) {
    taskCounter++;
    const columnId = projectColumns[platformProject.id][t.columnName];
    await prisma.task.create({
      data: {
        title: t.title,
        number: taskCounter,
        status: t.status,
        priority: t.priority,
        estimate: t.estimate,
        position: taskCounter,
        projectId: platformProject.id,
        columnId,
        assigneeId: t.assigneeId,
        creatorId: admin.id,
        dueDate: t.dueDate || (Math.random() > 0.6 ? new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null),
      },
    });
  }
  await prisma.project.update({ where: { id: platformProject.id }, data: { taskCounter } });

  // ─── Tasks for Mobile App ───────────────────────────
  const mobileTasks = [
    { title: 'Setup React Native project', status: 'DONE' as const, priority: 'HIGH' as const, assigneeId: john.id, columnName: 'Done', estimate: 3 },
    { title: 'Design mobile UI screens', status: 'IN_PROGRESS' as const, priority: 'HIGH' as const, assigneeId: emily.id, columnName: 'In Progress', estimate: 8 },
    { title: 'Implement push notifications', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: john.id, columnName: 'Todo', estimate: 5 },
    { title: 'Offline mode with sync', status: 'BACKLOG' as const, priority: 'LOW' as const, assigneeId: null, columnName: 'Backlog', estimate: 13 },
    { title: 'Biometric authentication', status: 'TODO' as const, priority: 'MEDIUM' as const, assigneeId: sarah.id, columnName: 'Todo', estimate: 5 },
  ];

  let mobCounter = 0;
  for (const t of mobileTasks) {
    mobCounter++;
    const columnId = projectColumns[mobileProject.id][t.columnName];
    await prisma.task.create({
      data: {
        title: t.title,
        number: mobCounter,
        status: t.status,
        priority: t.priority,
        estimate: t.estimate,
        position: mobCounter,
        projectId: mobileProject.id,
        columnId,
        assigneeId: t.assigneeId,
        creatorId: admin.id,
      },
    });
  }
  await prisma.project.update({ where: { id: mobileProject.id }, data: { taskCounter: mobCounter } });

  console.log('✅ Tasks created');

  // ─── Add Labels to some tasks ────────────────────────
  const allTasks = await prisma.task.findMany({ where: { projectId: platformProject.id }, take: 10 });
  const labelAssignments = [
    { taskIdx: 0, label: 'Feature' },
    { taskIdx: 1, label: 'Feature' },
    { taskIdx: 2, label: 'Security' },
    { taskIdx: 3, label: 'Feature' },
    { taskIdx: 4, label: 'Enhancement' },
    { taskIdx: 5, label: 'Feature' },
    { taskIdx: 6, label: 'Feature' },
    { taskIdx: 7, label: 'Enhancement' },
    { taskIdx: 8, label: 'Feature' },
    { taskIdx: 12, label: 'Bug' },
  ];

  for (const la of labelAssignments) {
    if (allTasks[la.taskIdx] && labels[la.label]) {
      await prisma.taskLabel.upsert({
        where: { taskId_labelId: { taskId: allTasks[la.taskIdx].id, labelId: labels[la.label] } },
        update: {},
        create: { taskId: allTasks[la.taskIdx].id, labelId: labels[la.label] },
      });
    }
  }

  console.log('✅ Task labels assigned');

  // ─── Comments ───────────────────────────────────────
  const taskForComments = allTasks[4]; // Kanban board task
  if (taskForComments) {
    await prisma.comment.createMany({
      data: [
        { content: 'Should we use @dnd-kit or react-beautiful-dnd for drag and drop?', taskId: taskForComments.id, authorId: sarah.id },
        { content: '@dnd-kit is more modern and has better TypeScript support. Let\'s go with that.', taskId: taskForComments.id, authorId: admin.id },
        { content: 'Agreed. I\'ll start with the column layout first, then add card dragging.', taskId: taskForComments.id, authorId: sarah.id },
        { content: 'The initial implementation is working! Still need to add cross-column drag.', taskId: taskForComments.id, authorId: sarah.id },
      ],
    });
  }

  console.log('✅ Comments created');

  // ─── Sprint ─────────────────────────────────────────
  const sprint = await prisma.sprint.create({
    data: {
      name: 'Sprint 1',
      goal: 'Complete core authentication and project management features',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      projectId: platformProject.id,
    },
  });

  // Assign some tasks to sprint
  const sprintTasks = allTasks.slice(0, 8);
  for (const t of sprintTasks) {
    await prisma.task.update({ where: { id: t.id }, data: { sprintId: sprint.id } });
  }

  await prisma.sprint.create({
    data: {
      name: 'Sprint 2',
      goal: 'Build analytics, notifications, and AI features',
      startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
      status: 'PLANNING',
      projectId: platformProject.id,
    },
  });

  console.log('✅ Sprints created');

  // ─── Activity Log ───────────────────────────────────
  const activities = [
    { action: 'created', entity: 'project', entityId: platformProject.id, userId: admin.id, details: { name: 'Platform v2.0' } },
    { action: 'created', entity: 'project', entityId: mobileProject.id, userId: admin.id, details: { name: 'Mobile App' } },
    { action: 'created', entity: 'task', entityId: allTasks[0]?.id || '', userId: admin.id, taskId: allTasks[0]?.id, details: { title: allTasks[0]?.title } },
    { action: 'updated', entity: 'task', entityId: allTasks[0]?.id || '', userId: sarah.id, taskId: allTasks[0]?.id, details: { status: 'DONE' } },
    { action: 'commented', entity: 'task', entityId: allTasks[4]?.id || '', userId: sarah.id, taskId: allTasks[4]?.id, details: { preview: 'Should we use @dnd-kit?' } },
    { action: 'started', entity: 'sprint', entityId: sprint.id, userId: admin.id, details: { name: 'Sprint 1' } },
    { action: 'created', entity: 'task', entityId: allTasks[4]?.id || '', userId: admin.id, taskId: allTasks[4]?.id, details: { title: allTasks[4]?.title } },
    { action: 'updated', entity: 'task', entityId: allTasks[2]?.id || '', userId: admin.id, taskId: allTasks[2]?.id, details: { status: 'DONE' } },
  ];

  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];
    await prisma.activity.create({
      data: {
        ...a,
        workspaceId: workspace.id,
        createdAt: new Date(Date.now() - (activities.length - i) * 3600000), // stagger by hours
      },
    });
  }

  console.log('✅ Activity log created');

  // ─── Notifications ──────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { type: 'task_assigned', title: 'Task Assigned', message: 'You have been assigned to PLT-5: Build Kanban board', link: '/w/acme-team/projects/PLT/board', userId: sarah.id, workspaceId: workspace.id },
      { type: 'comment', title: 'New Comment', message: 'Alex commented on PLT-5: "@dnd-kit is more modern..."', link: '/w/acme-team/projects/PLT/board', userId: sarah.id, workspaceId: workspace.id },
      { type: 'task_assigned', title: 'Task Assigned', message: 'You have been assigned to PLT-7: Implement notifications', link: '/w/acme-team/projects/PLT/board', userId: emily.id, workspaceId: workspace.id },
      { type: 'workspace_invite', title: 'Welcome!', message: 'You\'ve been added to Acme Team', link: '/w/acme-team', userId: john.id, workspaceId: workspace.id },
    ],
  });

  console.log('✅ Notifications created');
  console.log('\n🎉 Seed completed!\n');
  console.log('Demo accounts:');
  console.log('  admin@nexusflow.dev / password123');
  console.log('  sarah@nexusflow.dev / password123');
  console.log('  john@nexusflow.dev  / password123');
  console.log('  emily@nexusflow.dev / password123');
  console.log('\nWorkspace: /w/acme-team');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
