export interface MailProviderConfig {
  activeProvider: 'smtp' | 'sendgrid' | 'resend' | 'aws_ses' | 'postmark' | 'simulated';
  senderEmail: string;
  senderName: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  sendgrid: {
    apiKey: string;
  };
  resend: {
    apiKey: string;
  };
  awsSes: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
  };
  postmark: {
    serverToken: string;
  };
  testRecipientEmail?: string;
  enableClickTracking?: boolean;
  enableOpenTracking?: boolean;
}

export const defaultMailConfig: MailProviderConfig = {
  activeProvider: 'simulated',
  senderEmail: 'outreach@9xen.ai',
  senderName: '9xen Enterprise Solutions',
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    pass: '',
  },
  sendgrid: {
    apiKey: '',
  },
  resend: {
    apiKey: '',
  },
  awsSes: {
    region: 'us-east-1',
    accessKeyId: '',
    secretAccessKey: '',
  },
  postmark: {
    serverToken: '',
  },
  testRecipientEmail: 'mustafaattamim@gmail.com',
  enableClickTracking: true,
  enableOpenTracking: true,
};
