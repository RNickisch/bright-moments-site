const { getStore } = require('@netlify/blobs');
const { json } = require('./_shared');

exports.handler = async (event) => {
  const key = event.queryStringParameters && event.queryStringParameters.key;
  if (!key) return json(400, { error: 'Missing key parameter.' });

  const mediaStore = getStore('bright-moments-media');
  const result = await mediaStore.getWithMetadata(key, { type: 'arrayBuffer' });

  if (!result) return json(404, { error: 'Not found.' });

  const contentType = (result.metadata && result.metadata.contentType) || 'application/octet-stream';
  const buffer = Buffer.from(result.data);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  };
};
