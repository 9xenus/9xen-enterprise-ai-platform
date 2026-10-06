import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const CREDENTIALS_FILE = path.join(process.cwd(), 'mfa_credentials.json');

interface MfaUserRecord {
  email: string;
  secret: string;
  enabled: boolean;
  backupCodes: string[];
  lastUsedCode?: string;
  updatedAt: string;
}

let mfaCache: Record<string, MfaUserRecord> = {};

function loadMfaCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      mfaCache = JSON.parse(data);
    }
  } catch (err) {
    console.error('[MFA] Error loading MFA credentials:', err);
  }
}

function saveMfaCredentials() {
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(mfaCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('[MFA] Error saving MFA credentials:', err);
  }
}

loadMfaCredentials();

function base32Decode(base32: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let clean = base32.replace(/=+$/, '').toUpperCase().replace(/\s/g, '');
  const length = clean.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const buffer = Buffer.alloc(Math.ceil((length * 5) / 8));

  for (let i = 0; i < length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) throw new Error('Invalid Base32 character: ' + clean[i]);
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      buffer[index++] = (value >> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return buffer;
}

function normalizeMfaEmail(email: string): string {
  const clean = (email || '').toLowerCase().trim();
  if (['admin', 'root', 'superadmin', 'executive', 'admin@9xenai.com', 'admin@9xen.com'].includes(clean)) {
    return 'admin@9xen.com';
  }
  return clean;
}

export const MfaService = {
  generateSecret(length = 16): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      secret += alphabet[bytes[i] % alphabet.length];
    }
    return secret;
  },

  generateBackupCodes(count = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      codes.push(`${segment1}-${segment2}`);
    }
    return codes;
  },

  verifyTOTP(secret: string, code: string, window = 1): boolean {
    try {
      const key = base32Decode(secret);
      const epoch = Math.floor(Date.now() / 1000);
      const counter = Math.floor(epoch / 30);

      for (let i = -window; i <= window; i++) {
        const c = BigInt(counter + i);
        const buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(c, 0);
        const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
        const offset = hmac[hmac.length - 1] & 0xf;
        const binary =
          ((hmac[offset] & 0x7f) << 24) |
          ((hmac[offset + 1] & 0xff) << 16) |
          ((hmac[offset + 2] & 0xff) << 8) |
          (hmac[offset + 3] & 0xff);
        const otp = (binary % 1000000).toString().padStart(6, '0');
        if (otp === code) {
          return true;
        }
      }
    } catch (err) {
      console.error('[MFA] TOTP verification error:', err);
    }
    return false;
  },

  getUserRecord(email: string): MfaUserRecord | null {
    const key = normalizeMfaEmail(email);
    return mfaCache[key] || null;
  },

  isEnabled(email: string): boolean {
    const record = this.getUserRecord(email);
    return record ? record.enabled : false;
  },

  initiateSetup(email: string): { secret: string; backupCodes: string[]; qrUrl: string } {
    const key = normalizeMfaEmail(email);
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes();

    const appName = encodeURIComponent('9xen Enterprise Platform');
    const issuerName = encodeURIComponent('9xen Enterprise');
    const qrUrl = `otpauth://totp/${appName}:${key}?secret=${secret}&issuer=${issuerName}&algorithm=SHA1&digits=6&period=30`;

    mfaCache[key] = {
      email: key,
      secret,
      enabled: false,
      backupCodes,
      updatedAt: new Date().toISOString(),
    };
    saveMfaCredentials();
    return { secret, backupCodes, qrUrl };
  },

  confirmSetup(email: string, code: string): { success: boolean; error?: string } {
    const key = normalizeMfaEmail(email);
    const record = mfaCache[key];
    if (!record) {
      return { success: false, error: 'MFA setup session has expired or was not initiated.' };
    }
    const isValid = this.verifyTOTP(record.secret, code);
    if (!isValid) {
      return { success: false, error: 'Invalid 6-digit TOTP code. Please verify synchronization.' };
    }
    record.enabled = true;
    record.updatedAt = new Date().toISOString();
    saveMfaCredentials();
    return { success: true };
  },

  disableMfa(email: string): boolean {
    const key = normalizeMfaEmail(email);
    if (mfaCache[key]) {
      mfaCache[key].enabled = false;
      mfaCache[key].updatedAt = new Date().toISOString();
      saveMfaCredentials();
      return true;
    }
    return false;
  },

  verifyLoginAttempt(email: string, code: string): { success: boolean; method: 'totp' | 'backup' | null; error?: string } {
    const key = normalizeMfaEmail(email);
    const record = mfaCache[key];
    if (!record || !record.enabled) {
      return { success: true, method: null };
    }

    if (record.lastUsedCode && record.lastUsedCode === code) {
      return { success: false, method: null, error: 'Code has already been used. Please wait for the next time interval.' };
    }

    const cleanCode = code.replace(/\s/g, '');
    if (cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
      const isTotpValid = this.verifyTOTP(record.secret, cleanCode);
      if (isTotpValid) {
        record.lastUsedCode = cleanCode;
        saveMfaCredentials();
        return { success: true, method: 'totp' };
      }
    }

    const cleanBackupCode = code.toUpperCase().trim();
    const backupIndex = record.backupCodes.indexOf(cleanBackupCode);
    if (backupIndex !== -1) {
      record.backupCodes.splice(backupIndex, 1);
      record.lastUsedCode = cleanBackupCode;
      saveMfaCredentials();
      return { success: true, method: 'backup' };
    }

    return { success: false, method: null, error: 'Incorrect verification code or backup code.' };
  },
};
