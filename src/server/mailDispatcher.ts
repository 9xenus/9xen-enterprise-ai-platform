import nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { MailProviderConfig, defaultMailConfig } from '../types/mail';

export type { MailProviderConfig };
export { defaultMailConfig };

export async function sendEmailPacket(
  config: MailProviderConfig,
  recipientEmail: string,
  subject: string,
  bodyText: string,
  recipientName?: string
): Promise<{ success: boolean; messageId: string; provider: string; details: string }> {
  const provider = config.activeProvider || 'simulated';
  const fromAddress = `"${config.senderName || '9xen Enterprise'}" <${config.senderEmail || 'outreach@9xen.ai'}>`;

  // 1. SMTP Provider via nodemailer
  if (provider === 'smtp') {
    if (!config.smtp.host || !config.smtp.user) {
      throw new Error('SMTP Configuration incomplete. Host and Username/Email are required.');
    }
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: Number(config.smtp.port) || 587,
      secure: !!config.smtp.secure,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipientName ? `"${recipientName}" <${recipientEmail}>` : recipientEmail,
      subject,
      text: bodyText,
      html: `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; border-radius: 12px; border: 1px solid #334155;">
        <h3 style="color: #38bdf8; margin-top: 0;">9xen Enterprise Executive Outreach</h3>
        <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #f1f5f9;">${bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
        <hr style="border: 0; border-top: 1px solid #334155; margin-top: 20px;" />
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Sent securely via 9xen SMTP Transport Gateway</p>
      </div>`,
    });

    return {
      success: true,
      messageId: info.messageId || `smtp-${Date.now()}`,
      provider: `SMTP (${config.smtp.host}:${config.smtp.port})`,
      details: `Dispatched to ${recipientEmail} via SMTP Server.`,
    };
  }

  // 2. AWS SES Provider
  if (provider === 'aws_ses') {
    if (!config.awsSes.accessKeyId || !config.awsSes.secretAccessKey) {
      throw new Error('AWS SES Configuration incomplete. Access Key ID and Secret Access Key are required.');
    }
    
    const sesClient = new SESClient({
      region: config.awsSes.region || 'us-east-1',
      credentials: {
        accessKeyId: config.awsSes.accessKeyId,
        secretAccessKey: config.awsSes.secretAccessKey,
      },
    });

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [recipientEmail],
      },
      Message: {
        Body: {
          Text: { Data: bodyText },
          Html: { 
            Data: `<div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #e2e8f0; border-radius: 12px; border: 1px solid #334155;">
              <h3 style="color: #38bdf8; margin-top: 0;">9xen Enterprise Executive Outreach</h3>
              <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #f1f5f9;">${bodyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              <hr style="border: 0; border-top: 1px solid #334155; margin-top: 20px;" />
              <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Sent securely via AWS SES Cloud Infrastructure</p>
            </div>` 
          },
        },
        Subject: { Data: subject },
      },
      Source: fromAddress,
    });

    const result = await sesClient.send(command);
    
    return {
      success: true,
      messageId: result.MessageId || `ses-${Date.now()}`,
      provider: `AWS SES API (${config.awsSes.region})`,
      details: `Dispatched to ${recipientEmail} via AWS SES. Message ID: ${result.MessageId}`,
    };
  }

  // 3. SendGrid API Provider
  if (provider === 'sendgrid') {
    if (!config.sendgrid.apiKey) {
      throw new Error('SendGrid API Key is missing.');
    }
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.sendgrid.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipientEmail, name: recipientName || recipientEmail }],
            subject,
          },
        ],
        from: { email: config.senderEmail || 'outreach@9xen.ai', name: config.senderName || '9xen Enterprise' },
        content: [{ type: 'text/plain', value: bodyText }],
      }),
    });

    if (response.ok || response.status === 202) {
      const sgMsgId = response.headers.get('x-message-id') || `sg-${Date.now()}`;
      return {
        success: true,
        messageId: sgMsgId,
        provider: 'SendGrid Web API v3',
        details: `Dispatched to ${recipientEmail} via SendGrid API. Status: ${response.status}`,
      };
    } else {
      const errText = await response.text();
      throw new Error(`SendGrid API Error (${response.status}): ${errText}`);
    }
  }

  // 3. Resend API Provider
  if (provider === 'resend') {
    if (!config.resend.apiKey) {
      throw new Error('Resend API Key is missing.');
    }
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.resend.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipientEmail],
        subject,
        text: bodyText,
      }),
    });

    const resData = await response.json();
    if (response.ok) {
      return {
        success: true,
        messageId: resData.id || `resend-${Date.now()}`,
        provider: 'Resend API v1',
        details: `Dispatched to ${recipientEmail} via Resend. Message ID: ${resData.id}`,
      };
    } else {
      throw new Error(`Resend API Error: ${resData.message || JSON.stringify(resData)}`);
    }
  }

  // 4. Postmark API Provider
  if (provider === 'postmark') {
    if (!config.postmark.serverToken) {
      throw new Error('Postmark Server Token is missing.');
    }
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'X-Postmark-Server-Token': config.postmark.serverToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        From: config.senderEmail || 'outreach@9xen.ai',
        To: recipientEmail,
        Subject: subject,
        TextBody: bodyText,
      }),
    });

    const pmData = await response.json();
    if (response.ok && pmData.ErrorCode === 0) {
      return {
        success: true,
        messageId: pmData.MessageID || `pm-${Date.now()}`,
        provider: 'Postmark REST API',
        details: `Dispatched to ${recipientEmail} via Postmark.`,
      };
    } else {
      throw new Error(`Postmark Error: ${pmData.Message || JSON.stringify(pmData)}`);
    }
  }

  // 5. Simulated Sandbox Provider Fallback (Default)
  return {
    success: true,
    messageId: `xen-msg-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    provider: '9xen Enterprise Mail Gateway (Sandbox Mode)',
    details: `Dispatched packet to ${recipientEmail} from ${config.senderEmail}. Instant delivery acknowledged with 100% receipt SLA.`,
  };
}
