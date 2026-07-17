const { getStore } = require('@netlify/blobs');
const crypto = require('crypto');
const { verifyToken, getBearerToken, json } = require('./_shared');

const MAX_BYTES = 4.5 * 1024 * 1024; // ~4.5MB raw file limit

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const token = getBearerToken(event);
  if (!token || !verifyToken(token)) {
    return json(401, { error: 'Your session expired. Please log in again.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  const { type, title, caption, fileBase64, fileName, mimeType, vimeoUrl } = body;

  if (!title || !caption) {
    return json(400, { error: 'Title and caption are required.' });
  }
  if (type !== 'photo' && type !== 'video') {
    return json(400, { error: 'Type must be "photo" or "video".' });
  }

  const manifestStore = getStore('bright-moments-manifest');
  const items = (await manifestStore.get('items.json', { type: 'json' })) || [];

  const id = crypto.randomUUID();
  const entry = {
    id,
    type,
    title: String(title).slice(0, 120),
    caption: String(caption).slice(0, 400),
    approved: false,
    createdAt: new Date().toISOString(),
  };

  if (type === 'photo') {
    if (!fileBase64 || !fileName) {
      return json(400, { error: 'Please choose a photo file.' });
    }
    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > MAX_BYTES) {
      return json(400, { error: 'That photo is too large. Please keep files under 4.5MB.' });
    }
    const mediaStore = getStore('bright-moments-media');
    const blobKey = `${id}-${fileName}`;
    await mediaStore.set(blobKey, buffer, {
      metadata: { contentType: mimeType || 'application/octet-stream' },
    });
    entry.blobKey = blobKey;
  } else {
    if (!vimeoUrl || !/vimeo\.com\/\d+/.test(vimeoUrl)) {
      return json(400, {
        error: 'Please upload the video to Vimeo first, then paste the Vimeo link here.',
      });
    }
    entry.vimeoUrl = vimeoUrl;
  }

  items.push(entry);
  await manifestStore.setJSON('items.json', items);

  return json(200, { success: true, id });
};
