import prisma from '../db';
import { emailProvider } from './provider';
import { interpolateTemplate, DEFAULT_TEMPLATES } from './templates';

export interface EnqueueEmailParams {
  eventId?: string; // Idempotency key
  eventType: string; // e.g. "HOMEWORK", "FEE_INVOICE", "PAYMENT", "ATTENDANCE", "ADMISSION", "ANNOUNCEMENT"
  recipientEmail: string;
  recipientName: string;
  recipientRole?: string;
  templateCode?: string;
  subject?: string;
  bodyHtml?: string;
  variables?: Record<string, string | number | undefined | null>;
}

/**
 * Enterprise Email Queue Service
 * Handles asynchronous job queuing, duplicate prevention, and retries.
 */
class EmailQueueService {
  /**
   * Enqueue a new email notification job
   */
  async enqueue(params: EnqueueEmailParams): Promise<{ jobId: string; duplicate: boolean }> {
    // 1. Check Idempotency Key to prevent duplicate notification triggers
    if (params.eventId) {
      const existing = await prisma.emailJob.findFirst({
        where: {
          eventId: params.eventId,
          recipientEmail: params.recipientEmail,
        },
      });

      if (existing) {
        console.log(`[EmailQueue] Duplicate notification suppressed for eventId: ${params.eventId}`);
        return { jobId: existing.id, duplicate: true };
      }
    }

    // 2. Resolve template or raw subject/HTML
    let finalSubject = params.subject || 'Notification from The Hayatabad Model School';
    let finalHtml = params.bodyHtml || '<p>You have a new school notification.</p>';

    if (params.templateCode) {
      const template =
        (await prisma.notificationTemplate.findUnique({
          where: { code: params.templateCode },
        })) || DEFAULT_TEMPLATES.find((t) => t.code === params.templateCode);

      if (template) {
        finalSubject = interpolateTemplate(template.subject, params.variables || {});
        finalHtml = interpolateTemplate(template.bodyHtml, params.variables || {});
      }
    }

    // 3. Create Queued Job
    const job = await prisma.emailJob.create({
      data: {
        eventId: params.eventId || null,
        eventType: params.eventType,
        recipientEmail: params.recipientEmail,
        recipientName: params.recipientName,
        recipientRole: params.recipientRole || 'PARENT',
        subject: finalSubject,
        bodyHtml: finalHtml,
        status: 'QUEUED',
        attempts: 0,
        maxAttempts: 3,
      },
    });

    // Process immediately in background
    this.processJob(job.id).catch((err) => console.error('[EmailQueue] Background process error:', err));

    return { jobId: job.id, duplicate: false };
  }

  /**
   * Process a single queued email job
   */
  async processJob(jobId: string) {
    const job = await prisma.emailJob.findUnique({ where: { id: jobId } });
    if (!job || job.status === 'SENT' || job.status === 'CANCELLED') return;

    await prisma.emailJob.update({
      where: { id: jobId },
      data: { status: 'SENDING', attempts: { increment: 1 } },
    });

    try {
      const result = await emailProvider.sendEmail({
        to: job.recipientEmail,
        toName: job.recipientName,
        subject: job.subject,
        html: job.bodyHtml,
      });

      if (result.success) {
        await prisma.emailJob.update({
          where: { id: jobId },
          data: {
            status: 'SENT',
            sentAt: new Date(),
            lastError: null,
          },
        });

        await prisma.emailDeliveryLog.create({
          data: {
            emailJobId: job.id,
            recipientEmail: job.recipientEmail,
            eventType: job.eventType,
            provider: result.provider,
            status: 'SENT',
            response: result.messageId,
          },
        });
      } else {
        const hasMoreAttempts = job.attempts + 1 < job.maxAttempts;
        await prisma.emailJob.update({
          where: { id: jobId },
          data: {
            status: hasMoreAttempts ? 'QUEUED' : 'FAILED',
            lastError: result.error || 'Failed to dispatch email',
          },
        });

        await prisma.emailDeliveryLog.create({
          data: {
            emailJobId: job.id,
            recipientEmail: job.recipientEmail,
            eventType: job.eventType,
            provider: result.provider,
            status: 'FAILED',
            error: result.error,
          },
        });
      }
    } catch (err: any) {
      await prisma.emailJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          lastError: err?.message || 'Unexpected worker failure',
        },
      });
    }
  }

  /**
   * Retry failed jobs
   */
  async retryFailedJob(jobId: string) {
    await prisma.emailJob.update({
      where: { id: jobId },
      data: { status: 'QUEUED', attempts: 0 },
    });
    return this.processJob(jobId);
  }
}

export const emailQueue = new EmailQueueService();
