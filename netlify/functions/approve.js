const { verifyToken, getBearerToken, json, store } = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const token = getBearerToken(event);
  if (!token || !verifyToken(token)) {
    return json(401, { error: 'Not authorized.' });
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  const { id, action } = body;
  if (!id || (action !== 'approve' && action !== 'reject')) {
    return json(400, { error: 'id and action ("approve" or "reject") are required.' });
  }

  const manifestStore = store('bright-moments-manifest');
  const items = (await manifestStore.get('items.json', { type: 'json' })) || [];
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return json(404, { error: 'Item not found.' });

  if (action === 'approve') {
    items[index].approved = true;
  } else {
    const [removed] = items.splice(index, 1);
    if (removed && removed.blobKey) {
      const mediaStore = store('bright-moments-media');
      await mediaStore.delete(removed.blobKey);
    }
  }

  await manifestStore.setJSON('items.json', items);
  return json(200, { success: true });
};
