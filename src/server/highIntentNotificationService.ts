import { db } from '../lib/db';
import { sendEmailPacket, defaultMailConfig } from './mailDispatcher';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'cmsData.json');

function getCmsData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading cmsData.json in highIntentNotificationService:', err);
  }
  return {};
}

// Specific High-Intent Keywords triggering immediate automated sales notifications
export const HIGH_INTENT_KEYWORDS = [
  'demo',
  'trial',
  'pricing',
  'budget',
  'aum',
  'fix',
  'mt5',
  'enterprise',
  'vpc',
  'soc-2',
  'trading',
  'quant',
  'bot',
  'deploy',
  'contract',
  'urgent',
  'slippage',
  'drawdown',
  'schedule',
  'call',
  'consultation',
  'proposal',
  'sandbox'
];

export interface LeadPayload {
  id?: string;
  name: string;
  email: string;
  company?: string;
  solutionOfInterest?: string;
  subject?: string;
  userMessage?: string;
  message?: string;
  intentScore?: string;
  classificationTag?: string;
  confidenceScore?: number;
  buyingSignals?: string[];
  sentiment?: any;
  agentSource?: string;
}

/**
 * Evaluates if a lead inquiry contains high-intent keywords or is classified as High Intent,
 * and triggers an automated executive alert email notification to the sales team.
 */
export async function checkAndNotifyHighIntentLead(lead: LeadPayload): Promise<{
  notified: boolean;
  reason?: string;
  dispatchResult?: any;
}> {
  try {
    const textToCheck = [
      lead.solutionOfInterest || '',
      lead.subject || '',
      lead.userMessage || lead.message || '',
      lead.company || '',
      lead.email || ''
    ].join(' ').toLowerCase();

    // Check keyword matches
    const matchedKeywords = HIGH_INTENT_KEYWORDS.filter((kw) => textToCheck.includes(kw));
    const isHighIntentTag = lead.classificationTag === 'High Intent' || lead.intentScore === 'Critical' || lead.intentScore === 'High';
    const hasEnoughKeywords = matchedKeywords.length >= 1;

    if (!isHighIntentTag && !hasEnoughKeywords) {
      return { notified: false, reason: 'Lead did not meet high-intent keyword or classification criteria.' };
    }

    // Load mail config and site settings from CMS / DuckDB
    const cms = getCmsData();
    const settings = cms.settings || {};
    const mailConfig = settings.mailProviderConfig || defaultMailConfig;

    // Determine target notification email (sales team / admin alert email)
    const notificationRecipient = settings.salesAlertEmail || mailConfig.testRecipientEmail || mailConfig.senderEmail || 'sales-executives@9xen.ai';
    const companyName = lead.company || 'Enterprise Prospect';
    const leadName = lead.name || 'Anonymous Prospect';
    const solution = lead.solutionOfInterest || lead.subject || '9xen Enterprise Solution';
    const messageContent = lead.userMessage || lead.message || 'No message provided.';

    const emailSubject = `🚨 HIGH-INTENT LEAD ALERT: ${leadName} (${companyName}) - ${solution}`;
    const emailBody = `EXECUTIVE SALES INTELLIGENCE ALERT
===============================================
A high-intent lead has been captured by the 9xen Sales Chatbot & Autonomous Outreach Engine.

PROSPECT PROFILE:
- Name: ${leadName}
- Email: ${lead.email}
- Company/Fund: ${companyName}
- Solution Inquired: ${solution}
- Intent Classification: ${lead.classificationTag || 'High Intent'}
- Intent Score: ${lead.intentScore || 'High'}
- Detected Keywords / Buying Signals: ${matchedKeywords.join(', ') || 'Direct Enterprise Inquiry'}

PROSPECT MESSAGE / TRANSCRIPT:
"${messageContent}"

RECOMMENDED NEXT STEPS:
1. Review lead dossier in 9xen Admin Portal Outreach Queue.
2. Approve or customize the AI-generated executive outreach draft.
3. Dispatch trial sandbox credentials and schedule technical briefing within 15 minutes.

-----------------------------------------------
Dispatched securely by 9xen Enterprise Autonomous Sales Gateway
Timestamp: ${new Date().toISOString()}`;

    console.log(`[HighIntentService] Triggering automated alert email for high-intent lead: ${lead.email} (Matched keywords: ${matchedKeywords.join(', ')})`);

    const dispatchResult = await sendEmailPacket(
      mailConfig,
      notificationRecipient,
      emailSubject,
      emailBody,
      '9xen Executive Sales Command'
    );

    // Record activity log
    await db.createActivityLog(
      'high_intent_email_notification',
      'lead',
      lead.id || lead.email,
      `Automated high-intent notification sent to ${notificationRecipient} for lead ${lead.email} (Keywords: ${matchedKeywords.join(', ')})`
    ).catch(() => {});

    return {
      notified: true,
      reason: `High-intent lead detected via keywords [${matchedKeywords.join(', ')}]. Alert sent to ${notificationRecipient}.`,
      dispatchResult,
    };
  } catch (err: any) {
    console.error('[HighIntentService] Error sending high-intent lead notification email:', err);
    return { notified: false, reason: err.message || 'Failed to dispatch notification email.' };
  }
}
