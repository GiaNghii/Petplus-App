import { Message, Pet } from '../types';
import { Product } from '../data/products';
import { ProductForAI, filterProductsForContext } from './productFilter';

const SEVERE_KEYWORDS = [
  'khó thở',
  'thở gấp',
  'co giật',
  'ngất',
  'bất tỉnh',
  'nôn ra máu',
  'tiêu chảy ra máu',
  'không đi tiểu',
  'bí tiểu',
  'ăn bả',
  'uống thuốc chuột',
  'chảy máu nhiều',
];

const FALLBACK_REPLIES = [
  'Dạ em đã ghi nhận thông tin. Anh/chị mô tả thêm giúp em thời gian bắt đầu, mức độ ăn uống và tình trạng đi vệ sinh của thú cưng nhé.',
  'Dạ với tình trạng này, anh/chị theo dõi thêm nhiệt độ, ăn uống và mức độ mệt. Nếu triệu chứng nặng hơn, mình nên đưa thú cưng đến Petplus để bác sĩ kiểm tra trực tiếp.',
  'Em cần thêm một chút thông tin để tư vấn an toàn hơn: thú cưng có nôn, tiêu chảy, bỏ ăn hoặc đau khi chạm vào vùng đó không ạ?',
  'Dạ anh/chị giữ thú cưng ở nơi thoáng, cho uống nước từng ít một nếu thú cưng còn tỉnh táo. Em sẽ tư vấn hướng xử lý tiếp theo dựa trên triệu chứng anh/chị cung cấp.',
];

export interface AIRecommendation {
  productId: string;
  reason: string;
}

export interface GenerateReplyInput {
  text: string;
  petName: string;
  doctorName: string;
  pet?: Pet | null;
  recentMessages: Message[];
  conditionName?: string;
  availableProducts?: ProductForAI[];
}

export interface GenerateReplyResult {
  text: string;
  source: 'ai' | 'fallback' | 'safety';
  recommendations?: AIRecommendation[];
}

let fallbackIndex = 0;

function hasSevereSignal(text: string): boolean {
  const normalized = text.toLowerCase();
  return SEVERE_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function buildSafetyReply(petName: string): string {
  return `Dạ tình trạng của ${petName} có dấu hiệu cần kiểm tra trực tiếp sớm. Anh/chị vui lòng đưa thú cưng đến chi nhánh Petplus gần nhất hoặc gọi phòng khám ngay để được hỗ trợ 24/7. Trong lúc di chuyển, giữ thú cưng nằm yên, thoáng khí và không tự ý dùng thuốc khi chưa có chỉ định của bác sĩ.`;
}

function getFallbackReply(): string {
  const reply = FALLBACK_REPLIES[fallbackIndex % FALLBACK_REPLIES.length];
  fallbackIndex += 1;
  return reply;
}

export async function generateConsultationReply(
  input: GenerateReplyInput
): Promise<GenerateReplyResult> {
  if (hasSevereSignal(input.text)) {
    return {
      text: buildSafetyReply(input.petName),
      source: 'safety',
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('/api/generate-consultation-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        ...input,
        recentMessages: input.recentMessages.slice(-8),
        availableProducts: input.availableProducts,
        conditionName: input.conditionName,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI proxy failed with status ${response.status}`);
    }

    const data = await response.json();
    const text = typeof data?.text === 'string' ? data.text.trim() : '';

    if (text) {
      return {
        text,
        source: 'ai',
        recommendations: data?.recommendations,
      };
    }
  } catch (error) {
    console.log('[AI Chat] fallback reply used:', error);
  }

  return {
    text: getFallbackReply(),
    source: 'fallback',
  };
}

export function buildProductsForAI(
  products: Product[],
  context: {
    species?: string;
    conditionKeywords?: string;
    medicalHistory?: string;
  }
): ProductForAI[] {
  return filterProductsForContext(products, context);
}
