import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST — AI assistant (task generation, summary, writing)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, prompt, context } = await req.json();

  // Check if OPENAI_API_KEY is set
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Return mock responses for demo when no API key is configured
    return NextResponse.json(getMockResponse(action, prompt, context));
  }

  try {
    const systemPrompts: Record<string, string> = {
      'generate-tasks': `You are a project management assistant. Generate tasks based on the user's description. Return a JSON array of tasks with fields: title, description, priority (URGENT/HIGH/MEDIUM/LOW/NONE), estimate (story points 1-13). Only return valid JSON array, no extra text.`,
      'summarize': `You are a project management assistant. Summarize the given project/sprint/task data concisely. Focus on key metrics, blockers, and action items. Use markdown formatting.`,
      'write': `You are a writing assistant for project management. Help write clear, professional task descriptions, comments, and documentation. Use markdown formatting.`,
      'suggest-priority': `You are a project management assistant. Based on the task title and description, suggest a priority level (URGENT, HIGH, MEDIUM, LOW, or NONE) and explain briefly. Return JSON: { "priority": "...", "reason": "..." }`,
      'standup': `You are a project management assistant. Generate a daily standup report based on the provided activity data. Format it with sections: Yesterday, Today, Blockers. Use markdown with bullet points.`,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompts[action] || systemPrompts['write'] },
          { role: 'user', content: context ? `Context:\n${JSON.stringify(context)}\n\nRequest: ${prompt}` : prompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    // Try to parse JSON for structured responses
    if (action === 'generate-tasks' || action === 'suggest-priority') {
      try {
        const parsed = JSON.parse(content);
        return NextResponse.json({ result: parsed, raw: content });
      } catch {
        return NextResponse.json({ result: content, raw: content });
      }
    }

    return NextResponse.json({ result: content });
  } catch {
    // Fallback to mock on error
    return NextResponse.json(getMockResponse(action, prompt, context));
  }
}

function getMockResponse(action: string, prompt: string, context?: unknown) {
  switch (action) {
    case 'generate-tasks':
      return {
        result: [
          { title: 'Set up project infrastructure', description: 'Initialize the project with proper folder structure, linting, and CI/CD', priority: 'HIGH', estimate: 5 },
          { title: 'Design database schema', description: 'Create the data models and relationships for the application', priority: 'HIGH', estimate: 3 },
          { title: 'Implement authentication flow', description: 'Add login, register, and session management', priority: 'URGENT', estimate: 8 },
          { title: 'Create API endpoints', description: 'Build the REST API for core CRUD operations', priority: 'MEDIUM', estimate: 5 },
          { title: 'Build UI components', description: 'Develop reusable React components for the frontend', priority: 'MEDIUM', estimate: 8 },
          { title: 'Write unit tests', description: 'Add test coverage for critical business logic', priority: 'LOW', estimate: 5 },
        ],
        mock: true,
      };
    case 'summarize':
      return {
        result: `## Project Summary\n\n**Status:** On track with minor delays\n\n### Key Metrics\n- **Total Tasks:** 24 (18 completed, 4 in progress, 2 blocked)\n- **Sprint Progress:** 75% complete\n- **Team Velocity:** 32 story points/sprint\n\n### Highlights\n- Authentication module completed ahead of schedule\n- Dashboard UI is 90% done\n- API integration tests passing\n\n### Blockers\n- Waiting for design review on the settings page\n- Third-party API rate limiting needs investigation\n\n### Next Steps\n1. Complete the notification system\n2. Finalize analytics dashboard\n3. Prepare for demo`,
        mock: true,
      };
    case 'write':
      return {
        result: `${prompt}\n\n## Description\n\nThis task involves implementing the requested functionality with proper error handling, testing, and documentation.\n\n### Acceptance Criteria\n- [ ] Feature works as described\n- [ ] Unit tests added\n- [ ] Documentation updated\n- [ ] Code reviewed and approved\n\n### Technical Notes\nConsider edge cases and error states. Follow existing code patterns and conventions.`,
        mock: true,
      };
    case 'suggest-priority':
      return {
        result: { priority: 'MEDIUM', reason: 'This task appears to be a standard feature request that should be completed in the current sprint but is not blocking other work.' },
        mock: true,
      };
    case 'standup':
      return {
        result: `## Daily Standup — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n\n### Yesterday\n- Completed task detail modal implementation\n- Fixed drag-and-drop bug in Kanban board\n- Reviewed PR #23 for notification system\n\n### Today\n- Working on sprint management features\n- Starting analytics dashboard integration\n- Code review for team members\n\n### Blockers\n- No blockers at the moment`,
        mock: true,
      };
    default:
      return { result: 'AI feature is ready. Configure OPENAI_API_KEY for full functionality.', mock: true };
  }
}
