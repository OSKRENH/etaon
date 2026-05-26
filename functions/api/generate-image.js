const OPENAI_IMAGE_ENDPOINT = 'https://api.openai.com/v1/images/generations';

function getImageSize(width, height) {
  if (width > height * 1.15) return '1536x1024';
  if (height > width * 1.15) return '1024x1536';
  return '1024x1024';
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.OPENAI_API_KEY) {
    return jsonResponse({ error: 'OPENAI_API_KEY не задан в Cloudflare Pages.' }, 500);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: 'Некорректный запрос.' }, 400);
  }

  const prompt = String(payload.prompt || '').trim();
  const width = Number(payload.width) || 1024;
  const height = Number(payload.height) || 1024;

  if (prompt.length < 3) {
    return jsonResponse({ error: 'Опишите, какое изображение нужно сгенерировать.' }, 400);
  }

  const response = await fetch(OPENAI_IMAGE_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1.5',
      prompt,
      size: getImageSize(width, height),
      quality: 'medium',
      n: 1,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return jsonResponse(
      { error: data.error?.message || 'OpenAI не смог сгенерировать изображение.' },
      response.status,
    );
  }

  const image = data.data?.[0]?.b64_json;
  if (!image) {
    return jsonResponse({ error: 'OpenAI вернул пустой результат.' }, 502);
  }

  return jsonResponse({ image: `data:image/png;base64,${image}` });
}
