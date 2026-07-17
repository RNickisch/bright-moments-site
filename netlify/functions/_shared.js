const crypto = require('crypto');
const { getStore } = require('@netlify/blobs');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function store(name) {
  return getStore({
    name,
    siteID: process.env.NETLIFY_SITE_ID,
    token: process.env.NETLIFY_API_TOKEN,
  });
}

function sign(payload) {
  const secret = process.env.AUTH_SECRET || 'change-me-in-netlify-env-vars';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function createToken() {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = String(expires);
  const sig = sign(payload);
  return Buffer.from(`${payload}.${sig}`).toString('base64');
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [payload, sig] = decoded.split('.');
    if (!payload || !sig) return false;
    if (sign(payload) !== sig) return false;
    if (Date.now() > Number(payload)) return false;
    return true;
  } catch {
    return false;
  }
}

function getBearerToken(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function json(statusCode, data) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
}

module.exports = { createToken, verifyToken, getBearerToken, json, store };
