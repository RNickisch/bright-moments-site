const { createToken, json } = require('./_shared');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  const password = body.password || '';
  const expected = process.env.UPLOAD_PASSWORD;

  if (!expected) {
    return json(500, {
      error: 'This site is not configured yet. Set UPLOAD_PASSWORD in Netlify environment variables and redeploy.',
    });
  }

  if (password !== expected) {
    return json(401, { error: 'Incorrect password.' });
  }

  return json(200, { token: createToken() });
};
