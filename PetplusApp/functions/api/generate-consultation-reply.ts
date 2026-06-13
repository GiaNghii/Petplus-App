interface Env {
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface MessageInput {
  senderRole?: 'customer' | 'doctor';
  text?: string;
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
  recentMessages?: MessageInput[];
}

const DEFAULT_MODEL = 'nvidia/nemotron-3-ultra-550b-a55b:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function compactMessages(messages: MessageInput[] = []) {
  return messages.slice(-8).map((message) => ({
    role: message.senderRole === 'customer' ? 'Khách hàng' : 'Bác sĩ',
    text: String(message.text || '').slice(0, 500),
  }));
}

function buildPrompt(data: GenerateReplyInput) {
  const recentMessages = compactMessages(data.recentMessages)
    .map((message) => `${message.role}: ${message.text}`)
    .join('\n');

  return [
    'Bạn là trợ lý soạn phản hồi cho bác sĩ thú y Petplus tại TP.HCM.',
    'Chỉ trả lời bằng tiếng Việt, giọng thân thiện, chuyên nghiệp, ngắn gọn.',
    'Không tự chẩn đoán chắc chắn. Không tự kê liều thuốc cụ thể. Không khẳng định khỏi bệnh.',
    'Nếu có dấu hiệu nặng, khuyên khách đưa thú cưng đến Petplus hoặc gọi phòng khám 24/7.',
    'Ưu tiên hỏi thêm thông tin cần thiết: thời gian triệu chứng, ăn uống, đi vệ sinh, nôn ói, tiêu chảy, mức độ mệt.',
    '',
    `Bác sĩ: ${data.doctorName || 'Bác sĩ Petplus'}`,
    `Thú cưng: ${data.petName || 'Thú cưng'}`,
    data.pet?.species ? `Loài: ${data.pet.species}` : '',
    data.pet?.breed ? `Giống: ${data.pet.breed}` : '',
    data.pet?.weight ? `Cân nặng: ${data.pet.weight}kg` : '',
    data.pet?.medicalHistory ? `Tiền sử: ${String(data.pet.medicalHistory).slice(0, 400)}` : '',
    '',
    'Tin nhắn gần đây:',
    recentMessages || 'Chưa có lịch sử.',
    '',
    `Tin nhắn mới của khách hàng: ${String(data.text || '').slice(0, 800)}`,
    '',
    'Hãy viết đúng 1 phản hồi bác sĩ, tối đa 3 câu.',
  ].filter(Boolean).join('\n');
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  if (!env.OPENROUTER_API_KEY) {
    return jsonResponse({ error: 'Thiếu cấu hình OpenRouter.' }, 500);
  }

  const data = await request.json() as GenerateReplyInput;
  const userText = String(data.text || '').trim();
  if (!userText) {
    return jsonResponse({ error: 'Tin nhắn không được để trống.' }, 400);
  }

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
          content: 'Bạn hỗ trợ bác sĩ thú y soạn phản hồi an toàn. Trả lời tiếng Việt.',
        },
        {
          role: 'user',
          content: buildPrompt(data),
        },
      ],
      temperature: 0.4,
      max_tokens: 220,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OpenRouter] request failed', response.status, errorText.slice(0, 500));
    return jsonResponse({ error: 'OpenRouter chưa phản hồi được.' }, 502);
  }

  const json = await response.json() as any;
  const text = json?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    return jsonResponse({ error: 'OpenRouter trả về phản hồi trống.' }, 502);
  }

  return jsonResponse({ text, model: env.OPENROUTER_MODEL || DEFAULT_MODEL });
};
