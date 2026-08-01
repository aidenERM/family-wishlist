const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

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
  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    system: [{ text: SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: [{ text: texto }] }],
    inferenceConfig: { maxTokens: 300 },
  });

  const response = await client.send(command);
  const text = response.output?.message?.content?.[0]?.text?.trim();

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

const MONTO_SYSTEM_PROMPT = `Extrae el monto de dinero en pesos colombianos (COP) mencionado en el mensaje del usuario.
Devuelve SOLO un objeto JSON con esta forma exacta: {"monto": number}
Si el texto dice "2 millones" o "2M" interpreta 2000000. Si no encuentras ningun monto, devuelve {"monto": 0}.`;

async function extractMonto(texto) {
  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    system: [{ text: MONTO_SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: [{ text: texto }] }],
    inferenceConfig: { maxTokens: 100 },
  });

  const response = await client.send(command);
  const text = response.output?.message?.content?.[0]?.text?.trim();
  const jsonMatch = text?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Bedrock no devolvio JSON valido para el monto');
  }
  const parsed = JSON.parse(jsonMatch[0]);
  if (typeof parsed.monto !== 'number' || parsed.monto < 0) {
    throw new Error('Monto invalido en la respuesta de Bedrock');
  }
  return parsed.monto;
}

const NARRACION_SYSTEM_PROMPT = `Eres un asistente familiar que explica, en español, en 2-4 frases claras y calidas, que puede comprar la familia con la plata que tienen.
Se te dara un objeto JSON con hechos YA CALCULADOS (montos, meses, articulos). USA SOLO esos numeros y nombres exactamente como vienen - NUNCA inventes ni recalcules montos, precios o plazos.
Estructura sugerida: primero di que se puede comprar YA (lista de articulos agrupados si hay varios), luego menciona que mas se podria comprar esperando N meses (agrupa articulos que se alcanzan en el mismo mes).
Si no se puede comprar nada todavia, dilo con animo, mencionando cuanto falta para el primer articulo.
Responde solo con el texto final para el usuario, sin JSON, sin explicaciones tecnicas.`;

async function narrarConsulta(monto, plan) {
  const alcanzaYa = plan.filter((p) => p.alcanzaAhora);
  const porMes = new Map();
  for (const item of plan) {
    if (!item.alcanzaAhora && item.mesesFaltantes != null) {
      const key = item.mesesFaltantes;
      if (!porMes.has(key)) porMes.set(key, []);
      porMes.get(key).push(item.articulo);
    }
  }

  const hechos = {
    monto_disponible: monto,
    se_puede_comprar_ya: alcanzaYa.map((p) => p.articulo),
    espera_por_meses: Array.from(porMes.entries()).map(([meses, articulos]) => ({ meses, articulos })),
  };

  const command = new ConverseCommand({
    modelId: process.env.BEDROCK_MODEL_ID,
    system: [{ text: NARRACION_SYSTEM_PROMPT }],
    messages: [{ role: 'user', content: [{ text: JSON.stringify(hechos) }] }],
    inferenceConfig: { maxTokens: 400 },
  });

  const response = await client.send(command);
  const text = response.output?.message?.content?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Respuesta vacia de Bedrock');
  }
  return text;
}

module.exports = { parseDeseoFromText, extractMonto, narrarConsulta };
