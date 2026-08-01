const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

const SYSTEM_PROMPT = `Eres un asistente que convierte una frase en español sobre un deseo de compra familiar en un objeto JSON estricto.
Devuelve SOLO un objeto JSON, sin texto adicional, con esta forma exacta:
{"articulo": string, "precio": number, "prioridad": "alta"|"media"|"baja", "estimado": boolean}

Reglas:
- "articulo" es una descripcion corta y clara del producto.
- "precio" es un numero en la moneda local mencionada (sin simbolos), si no se menciona un precio, infiere uno razonable para ese tipo de producto y marca "estimado": true.
- "prioridad" infierela del tono del texto (urgencia, palabras como "necesito" = alta, "seria bueno" = baja); si no hay pistas, usa "media".
- "estimado" es true si tuviste que inventar el precio o la prioridad, false si vinieron explicitos en el texto.`;

async function parseDeseoFromText(texto) {
  const body = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: texto }],
  };

  const command = new InvokeModelCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(body),
  });

  const response = await client.send(command);
  const raw = JSON.parse(Buffer.from(response.body).toString('utf-8'));
  const text = raw.content?.[0]?.text?.trim();

  if (!text) {
    throw new Error('Respuesta vacia de Bedrock');
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Bedrock no devolvio JSON valido');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (typeof parsed.articulo !== 'string' || !parsed.articulo.trim()) {
    throw new Error('Falta articulo en la respuesta de Bedrock');
  }
  if (typeof parsed.precio !== 'number' || parsed.precio < 0) {
    throw new Error('Precio invalido en la respuesta de Bedrock');
  }
  if (!['alta', 'media', 'baja'].includes(parsed.prioridad)) {
    parsed.prioridad = 'media';
  }
  parsed.estimado = Boolean(parsed.estimado);

  return parsed;
}

module.exports = { parseDeseoFromText };
