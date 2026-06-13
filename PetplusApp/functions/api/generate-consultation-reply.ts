interface Env {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface ProductInput {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'OTC' | 'prescription';
  category: string;
}

interface Recommendation {
  productId: string;
  reason: string;
  usageGuide: string;
}

interface GenerateReplyInput {
  text?: string;
  petName?: string;
  doctorName?: string;
  pet?: {
    species?: string;
    breed?: string;
    weight?: number;
    medicalHistory?: string;
  } | null;
  recentMessages?: Array<{
    senderRole?: 'customer' | 'doctor';
    text?: string;
  }>;
  conditionName?: string;
  availableProducts?: ProductInput[];
}

const DEFAULT_MODEL = 'google/gemma-4-31b-it:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_RECOMMENDATIONS = 3;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function compactMessages(messages: GenerateReplyInput['recentMessages'] = []) {
  return messages.slice(-8).map((message) => ({
    role: message.senderRole === 'customer' ? 'Khách hàng' : 'Bác sĩ',
    text: String(message.text || '').slice(0, 500),
  }));
}

function formatProducts(products: ProductInput[] = []) {
  if (!products.length) return '';
  return products
    .map((p) => {
      const typeLabel = p.type === 'prescription' ? 'kê đơn' : 'OTC';
      const desc = String(p.description || '').slice(0, 100);
      const note =
        p.type === 'prescription'
          ? ' - CHỈ khuyên đến phòng khám, KHÔNG kê đơn'
          : '';
      return `[${p.id}] ${p.name} (${p.price.toLocaleString('vi-VN')}đ, ${typeLabel}): ${desc}${note}`;
    })
    .join('\n');
}

function buildPrompt(data: GenerateReplyInput) {
  const recentMessages = compactMessages(data.recentMessages)
    .map((m) => `${m.role}: ${m.text}`)
    .join('\n');

  const hasProducts = (data.availableProducts || []).length > 0;
  const conditionContext = data.conditionName
    ? `Khách chọn vấn đề: ${data.conditionName}.`
    : '';
  const conditionHint = data.conditionName
    ? 'Khách đã chủ động chọn vấn đề này, hãy tập trung tư vấn và gợi ý sản phẩm phù hợp.'
    : '';

  return [
    'Bạn là trợ lý soạn phản hồi cho bác sĩ thú y Petplus tại TP.HCM.',
    'Chỉ trả lời bằng tiếng Việt, giọng thân thiện, chuyên nghiệp.',
    'Không tự chẩn đoán chắc chắn. Không kê liều thuốc cụ thể hoặc số lần dùng/ngày.',
    'Với sản phẩm kê đơn: CHỈ khuyên đến phòng khám, KHÔNG kê đơn.',
    'Với sản phẩm OTC: được phép đề xuất nếu phù hợp triệu chứng.',
    'Chỉ gợi ý sản phẩm khi triệu chứng khớp rõ với công dụng sản phẩm. Nếu không khớp, KHÔNG gợi ý sản phẩm.',
    'Nếu triệu chứng nặng (khó thở, co giật, nôn máu...): khuyên đến phòng khám ngay.',
    '',
    `Bác sĩ: ${data.doctorName || 'Bác sĩ Petplus'}`,
    `Thú cưng: ${data.petName || 'Thú cưng'}`,
    data.pet?.species ? `Loài: ${data.pet.species}` : '',
    data.pet?.breed ? `Giống: ${data.pet.breed}` : '',
    data.pet?.weight ? `Cân nặng: ${data.pet.weight}kg` : '',
    data.pet?.medicalHistory
      ? `Tiền sử: ${String(data.pet.medicalHistory).slice(0, 400)}`
      : '',
    conditionContext,
    conditionHint,
    '',
    'Lịch sử trò chuyện:',
    recentMessages || 'Chưa có lịch sử.',
    '',
    `Tin nhắn mới của khách: ${String(data.text || '').slice(0, 800)}`,
    '',
    hasProducts
      ? [
          'SẢN PHẨM CÓ SẴN tại Petplus:',
          formatProducts(data.availableProducts),
          '',
        ].join('\n')
      : '',
    'Viết phản hồi bác sĩ, tối đa 5 câu. Nếu triệu chứng là nôn, tiêu chảy, bỏ ăn, lừ đừ hoặc có nguy cơ cấp cứu mà danh sách không có thuốc tiêu hoá phù hợp, chỉ khuyên thăm khám và KHÔNG gợi ý sản phẩm.',
    'Sau đó:',
    hasProducts
      ? [
          'Nếu phù hợp rõ ràng, thêm 1-3 đề xuất sản phẩm OTC theo định dạng:',
          '>>>>SP:<productId>|<vì sao nên dùng, 1 câu ngắn>|<cách dùng an toàn, không nêu liều cụ thể>',
          'Mỗi sản phẩm 1 dòng.',
          'Phần cách dùng phải nói cách sử dụng theo nhãn/hướng dẫn bác sĩ, dấu hiệu cần ngưng và khi nào cần tái khám.',
          'KHÔNG đề xuất sản phẩm kê đơn.',
        ].join('\n')
      : 'KHÔNG đề xuất sản phẩm.',
  ]
    .filter(Boolean)
    .join('\n');
}

function parseResponse(
  rawText: string
): { text: string; recommendations: Recommendation[] } {
  const parts = rawText.split('>>>>SP:');
  const text = parts[0].trim();
  const recommendations: Recommendation[] = [];

  for (let i = 1; i < parts.length; i++) {
    const firstLine = parts[i].split('\n')[0].trim();
    const segments = firstLine.split('|').map((segment) => segment.trim());
    const [productId, reason, usageGuide] = segments;
    if (productId && reason) {
      recommendations.push({
        productId,
        reason,
        usageGuide:
          usageGuide ||
          'Dùng theo đúng hướng dẫn trên nhãn hoặc chỉ định của bác sĩ; ngưng dùng và liên hệ Petplus nếu thú cưng mệt hơn.',
      });
    }
  }

  return { text, recommendations };
}

function validateRecommendations(
  recommendations: Recommendation[],
  products: ProductInput[] = []
) {
  const availableProducts = new Map(products.map((product) => [product.id, product]));
  const seen = new Set<string>();
  const safeRecommendations: Recommendation[] = [];

  for (const recommendation of recommendations) {
    const product = availableProducts.get(recommendation.productId);
    if (!product || product.type === 'prescription' || seen.has(product.id)) {
      continue;
    }

    seen.add(product.id);
    safeRecommendations.push({
      productId: product.id,
      reason: recommendation.reason.slice(0, 180),
      usageGuide: recommendation.usageGuide.slice(0, 240),
    });

    if (safeRecommendations.length >= MAX_RECOMMENDATIONS) {
      break;
    }
  }

  return safeRecommendations;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

// Handle CORS preflight — required for cross-origin calls (e.g. from Firebase Hosting)
export const onRequestOptions = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!env.OPENROUTER_API_KEY) {
    return jsonResponse({ error: 'Thiếu cấu hình OpenRouter.' }, 500);
  }

  const data = (await request.json()) as GenerateReplyInput;
  const userText = String(data.text || '').trim();
  if (!userText) {
    return jsonResponse({ error: 'Tin nhắn không được để trống.' }, 400);
  }

  const prompt = buildPrompt(data);

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': new URL(request.url).origin,
      'X-OpenRouter-Title': 'Petplus',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL || DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Bạn hỗ trợ bác sĩ thú y soạn phản hồi an toàn. Trả lời tiếng Việt.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      '[OpenRouter] request failed',
      response.status,
      errorText.slice(0, 500)
    );
    return jsonResponse({ error: 'OpenRouter chưa phản hồi được.' }, 502);
  }

  const json = (await response.json()) as any;
  const rawText = json?.choices?.[0]?.message?.content?.trim();

  if (!rawText) {
    return jsonResponse({ error: 'OpenRouter trả về phản hồi trống.' }, 502);
  }

  const { text, recommendations } = parseResponse(rawText);
  const safeRecommendations = validateRecommendations(
    recommendations,
    data.availableProducts
  );

  return jsonResponse({
    text,
    model: env.OPENROUTER_MODEL || DEFAULT_MODEL,
    recommendations: safeRecommendations.length ? safeRecommendations : undefined,
  });
};
