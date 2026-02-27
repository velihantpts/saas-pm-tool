import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = 'NexusFlow <noreply@nexusflow.dev>';

export async function sendTaskAssignedEmail(to: string, taskTitle: string, assignerName: string, taskUrl: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Task assigned: ${taskTitle}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1; font-size: 18px; margin-bottom: 16px;">NexusFlow</h2>
          <p style="color: #333; font-size: 14px;"><strong>${assignerName}</strong> assigned you a task:</p>
          <div style="background: #f8f9fa; border-left: 3px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="color: #333; font-size: 14px; font-weight: 600; margin: 0;">${taskTitle}</p>
          </div>
          <a href="${taskUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">View Task</a>
          <p style="color: #999; font-size: 11px; margin-top: 24px;">You received this because you have email notifications enabled in NexusFlow.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send task assigned email:', err);
  }
}

export async function sendMentionEmail(to: string, mentionerName: string, commentPreview: string, taskUrl: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `${mentionerName} mentioned you in a comment`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1; font-size: 18px; margin-bottom: 16px;">NexusFlow</h2>
          <p style="color: #333; font-size: 14px;"><strong>${mentionerName}</strong> mentioned you in a comment:</p>
          <div style="background: #f8f9fa; border-left: 3px solid #6366f1; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="color: #666; font-size: 13px; margin: 0; font-style: italic;">"${commentPreview}"</p>
          </div>
          <a href="${taskUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">View Comment</a>
          <p style="color: #999; font-size: 11px; margin-top: 24px;">You received this because you have email notifications enabled in NexusFlow.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send mention email:', err);
  }
}

export async function sendSprintStartedEmail(to: string, sprintName: string, projectName: string, sprintUrl: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Sprint started: ${sprintName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #6366f1; font-size: 18px; margin-bottom: 16px;">NexusFlow</h2>
          <p style="color: #333; font-size: 14px;">Sprint <strong>${sprintName}</strong> has started in project <strong>${projectName}</strong>.</p>
          <a href="${sprintUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500;">View Sprint</a>
          <p style="color: #999; font-size: 11px; margin-top: 24px;">You received this because you have email notifications enabled in NexusFlow.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send sprint started email:', err);
  }
}
