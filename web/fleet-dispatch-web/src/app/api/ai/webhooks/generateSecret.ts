import crypto from 'crypto';

export const dynamic = 'force-dynamic'
// This is going to generate a secure random secret for webhook authentication
export default function generateSecret(length = 32) {
    return crypto.randomBytes(length).toString('base64url');
} 