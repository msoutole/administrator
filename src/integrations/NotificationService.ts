/**
 * Notification service for webhooks and integrations
 */

import { AnalysisResult } from '../types';

export interface WebhookConfig {
  url: string;
  events: ('analysis.complete' | 'analysis.low_score' | 'analysis.security_issue')[];
}

export interface NotificationPayload {
  event: string;
  timestamp: Date;
  repository: {
    owner: string;
    name: string;
    url: string;
  };
  score?: number;
  grade?: string;
  message: string;
}

export class NotificationService {
  private webhooks: WebhookConfig[] = [];
  private slackWebhookUrl?: string;
  private discordWebhookUrl?: string;

  constructor(webhooks?: WebhookConfig[], slackUrl?: string, discordUrl?: string) {
    this.webhooks = webhooks || [];
    this.slackWebhookUrl = slackUrl;
    this.discordWebhookUrl = discordUrl;
  }

  /**
   * Send notification for analysis completion
   */
  async notifyAnalysisComplete(result: AnalysisResult): Promise<void> {
    const events = ['analysis.complete'];

    // Add event-specific notifications
    if (result.score.overall < 50) {
      events.push('analysis.low_score');
    }

    if (result.metrics.security.vulnerabilities > 0 || result.metrics.security.secretsExposed > 0) {
      events.push('analysis.security_issue');
    }

    // Send to matching webhooks
    for (const webhook of this.webhooks) {
      for (const event of events) {
        if (webhook.events.includes(event as any)) {
          await this.sendWebhook(webhook, this.buildPayload(result, event));
        }
      }
    }

    // Send to Slack if configured
    if (this.slackWebhookUrl) {
      await this.sendSlack(result);
    }

    // Send to Discord if configured
    if (this.discordWebhookUrl) {
      await this.sendDiscord(result);
    }
  }

  /**
   * Add webhook configuration
   */
  addWebhook(webhook: WebhookConfig): void {
    this.webhooks.push(webhook);
  }

  /**
   * Set Slack webhook URL
   */
  setSlackWebhook(url: string): void {
    this.slackWebhookUrl = url;
  }

  /**
   * Set Discord webhook URL
   */
  setDiscordWebhook(url: string): void {
    this.discordWebhookUrl = url;
  }

  /**
   * Build notification payload
   */
  private buildPayload(result: AnalysisResult, event: string): NotificationPayload {
    let message = '';

    switch (event) {
      case 'analysis.complete':
        message = `✅ Analysis complete for ${result.repository.name}: ${result.score.overall}/100 (Grade: ${result.score.grade})`;
        break;
      case 'analysis.low_score':
        message = `⚠️ Low quality score for ${result.repository.name}: ${result.score.overall}/100`;
        break;
      case 'analysis.security_issue':
        message = `🔒 Security issues detected in ${result.repository.name}`;
        break;
      default:
        message = `Analysis event: ${event}`;
    }

    return {
      event,
      timestamp: result.timestamp,
      repository: {
        owner: result.repository.owner,
        name: result.repository.name,
        url: result.repository.url,
      },
      score: result.score.overall,
      grade: result.score.grade,
      message,
    };
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(webhook: WebhookConfig, payload: NotificationPayload): Promise<void> {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Webhook notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to send webhook notification: ${error}`);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(result: AnalysisResult): Promise<void> {
    if (!this.slackWebhookUrl) return;

    const color = this.getGradeColor(result.score.grade);

    const payload = {
      attachments: [
        {
          color,
          title: `${result.repository.owner}/${result.repository.name}`,
          title_link: result.repository.url,
          fields: [
            {
              title: 'Overall Score',
              value: `${result.score.overall} (${result.score.grade})`,
              short: true,
            },
            {
              title: 'Code Quality',
              value: result.score.breakdown.codeQuality,
              short: true,
            },
            {
              title: 'Documentation',
              value: result.score.breakdown.documentation,
              short: true,
            },
            {
              title: 'Testing',
              value: result.score.breakdown.testing,
              short: true,
            },
            {
              title: 'Community',
              value: result.score.breakdown.community,
              short: true,
            },
            {
              title: 'Security',
              value: result.score.breakdown.security,
              short: true,
            },
            {
              title: 'Dependencies',
              value: result.score.breakdown.dependencies,
              short: true,
            },
          ],
          ts: Math.floor(result.timestamp.getTime() / 1000),
        },
      ],
    };

    try {
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to send Slack notification: ${error}`);
    }
  }

  /**
   * Send Discord notification
   */
  private async sendDiscord(result: AnalysisResult): Promise<void> {
    if (!this.discordWebhookUrl) return;

    const color = parseInt(this.getGradeColorHex(result.score.grade).substring(1), 16);

    const payload = {
      embeds: [
        {
          title: `${result.repository.owner}/${result.repository.name}`,
          url: result.repository.url,
          color,
          fields: [
            {
              name: 'Overall Score',
              value: `${result.score.overall}/100 (Grade: ${result.score.grade})`,
              inline: true,
            },
            {
              name: 'Code Quality',
              value: String(result.score.breakdown.codeQuality),
              inline: true,
            },
            {
              name: 'Documentation',
              value: String(result.score.breakdown.documentation),
              inline: true,
            },
            {
              name: 'Testing',
              value: String(result.score.breakdown.testing),
              inline: true,
            },
            {
              name: 'Community',
              value: String(result.score.breakdown.community),
              inline: true,
            },
            {
              name: 'Security',
              value: String(result.score.breakdown.security),
              inline: true,
            },
            {
              name: 'Dependencies',
              value: String(result.score.breakdown.dependencies),
              inline: true,
            },
          ],
          timestamp: result.timestamp.toISOString(),
        },
      ],
    };

    try {
      const response = await fetch(this.discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Discord notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Failed to send Discord notification: ${error}`);
    }
  }

  /**
   * Get grade color
   */
  private getGradeColor(grade: string): string {
    const colors: Record<string, string> = {
      A: 'good',
      B: '#0099ff',
      C: 'warning',
      D: '#ff9900',
      F: 'danger',
    };
    return colors[grade] || '#808080';
  }

  /**
   * Get grade color hex
   */
  private getGradeColorHex(grade: string): string {
    const colors: Record<string, string> = {
      A: '#28a745',
      B: '#17a2b8',
      C: '#ffc107',
      D: '#fd7e14',
      F: '#dc3545',
    };
    return colors[grade] || '#6c757d';
  }
}

export default NotificationService;
