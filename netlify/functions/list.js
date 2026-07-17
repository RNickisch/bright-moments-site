const { verifyToken, getBearerToken, json, store } = require('./_shared');

exports.handler = async (event) => {
  const manifestStore = store('bright-moments-manifest');
  const items = (await manifestStore.get('items.json', { type: 'json' })) || [];

  const wantsAll = event.queryStringParameters && event.queryStringParameters.all === 'true';

  if (wantsAll) {
    const token = getBearerToken(event);
    if (!token || !verifyToken(token)) {
      return json(401, { error: 'Not authorized.' });
    }
    return json(200, { items: items.slice().reverse() });
  }

  const approved = items.filter((item) => item.approved).reverse();
  return json(200, { items: approved });
};
