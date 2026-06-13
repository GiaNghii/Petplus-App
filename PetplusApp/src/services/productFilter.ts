import { Product } from '../data/products';

export interface ProductForAI {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'OTC' | 'prescription';
  category: string;
}

/**
 * Map từ keyword triệu chứng sang category phù hợp.
 */
const SYMPTOM_CATEGORY_MAP: Record<string, string[]> = {
  'rận tai': ['thuoc'],
  've tai': ['thuoc'],
  'ráy tai': ['thuoc'],
  'viêm tai': ['thuoc'],
  'chảy nước mắt': ['thuoc'],
  'ghèn mắt': ['thuoc'],
  'viêm mắt': ['thuoc'],
  'rụng lông': ['thuoc'],
  'nấm da': ['thuoc'],
  'viêm da': ['thuoc'],
  'bết lông': ['thuoc', 'spa'],
  'rối lông': ['thuoc', 'spa'],
  'tiêu chảy': ['thuoc'],
  'nôn': ['thuoc'],
  'giun': ['thuoc'],
  'sán': ['thuoc'],
  've': ['thuoc'],
  'bọ chét': ['thuoc'],
};

const SYMPTOM_PRODUCT_KEYWORDS: Record<string, string[]> = {
  'rận tai': ['tai', 've', 'rận', 'xịt'],
  've tai': ['tai', 've', 'rận', 'xịt'],
  'ráy tai': ['tai'],
  'viêm tai': ['tai'],
  'chảy nước mắt': ['mắt'],
  'ghèn mắt': ['mắt'],
  'viêm mắt': ['mắt'],
  'rụng lông': ['rụng lông', 'dưỡng lông', 'lông', 'lecithin', 'hair'],
  'nấm da': ['da', 'lông', 'xịt'],
  'viêm da': ['da', 'lông', 'xịt'],
  'bết lông': ['dưỡng lông', 'lông', 'spa'],
  'rối lông': ['dưỡng lông', 'lông', 'spa'],
  'giun': ['giun', 'sán'],
  'sán': ['giun', 'sán'],
  've': ['ve', 'rận', 'bọ chét', 'xịt'],
  'bọ chét': ['bọ chét', 've', 'rận', 'xịt'],
};

const CONSULT_REQUIRED_KEYWORDS = [
  'nôn',
  'ói',
  'tiêu chảy',
  'phân lỏng',
  'bỏ ăn',
  'lừ đừ',
  'sốt',
];

function getMatchedProductKeywords(conditionLower: string, historyLower: string) {
  const matched = new Set<string>();
  const inputText = `${conditionLower} ${historyLower}`;

  for (const [symptom, keywords] of Object.entries(SYMPTOM_PRODUCT_KEYWORDS)) {
    if (inputText.includes(symptom)) {
      keywords.forEach((keyword) => matched.add(keyword));
    }
  }

  return matched;
}

function productTextMatchesKeyword(searchText: string, keyword: string) {
  if (keyword.includes(' ')) {
    return searchText.includes(keyword);
  }

  const tokens = searchText.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return tokens.includes(keyword);
}

/**
 * Từ danh sách sản phẩm đầy đủ, lọc ra các sản phẩm phù hợp
 * dựa trên loài, triệu chứng và lịch sử bệnh của thú cưng.
 * Trả về tối đa 8 sản phẩm relevant nhất.
 */
export function filterProductsForContext(
  allProducts: Product[],
  context: {
    species?: string;
    conditionKeywords?: string;
    medicalHistory?: string;
  }
): ProductForAI[] {
  const speciesLower = context.species?.toLowerCase() || '';
  const conditionLower = (context.conditionKeywords || '').toLowerCase();
  const historyLower = (context.medicalHistory || '').toLowerCase();
  const inputText = `${conditionLower} ${historyLower}`;
  const matchedProductKeywords = getMatchedProductKeywords(conditionLower, historyLower);
  const requiresConsult =
    CONSULT_REQUIRED_KEYWORDS.some((keyword) => inputText.includes(keyword)) &&
    matchedProductKeywords.size === 0;

  if (requiresConsult) {
    return [];
  }

  // Xác định category ưu tiên dựa trên triệu chứng
  const targetCategories = new Set<string>();
  for (const [keyword, cats] of Object.entries(SYMPTOM_CATEGORY_MAP)) {
    if (conditionLower.includes(keyword) || historyLower.includes(keyword)) {
      cats.forEach((c) => targetCategories.add(c));
    }
  }

  // Lọc theo loài dựa trên tên sản phẩm
  const isDogRelated = (name: string) =>
    /chó|dog|puppy|poodle|shiba/i.test(name);
  const isCatRelated = (name: string) =>
    /mèo|cat|kitten|meow/i.test(name);
  const isNeutral = (name: string) => !isDogRelated(name) && !isCatRelated(name);

  let scored = allProducts.map((p) => {
    let score = 0;
    const searchText = `${p.name} ${p.description}`.toLowerCase();
    let directProductMatch = false;

    // Ưu tiên theo loài
    if (speciesLower === 'dog') {
      if (isDogRelated(p.name)) score += 3;
      else if (isNeutral(p.name)) score += 1;
    } else if (speciesLower === 'cat') {
      if (isCatRelated(p.name)) score += 3;
      else if (isNeutral(p.name)) score += 1;
    } else {
      score += 1;
    }

    // Ưu tiên theo category phù hợp triệu chứng
    if (targetCategories.has(p.category)) {
      score += 5;
    }

    // Cộng điểm nếu description hoặc name chứa keyword triệu chứng
    if (conditionLower) {
      const conditionWords = conditionLower.split(/[\s,]+/).filter((w) => w.length > 2);
      for (const word of conditionWords) {
        if (searchText.includes(word)) score += 2;
      }
    }

    for (const keyword of matchedProductKeywords) {
      if (productTextMatchesKeyword(searchText, keyword)) {
        directProductMatch = true;
        score += 6;
      }
    }

    // Ưu tiên sản phẩm hot hoặc bán chạy
    if (p.isHot || p.isNew) score += 1;
    if (p.sold > 500) score += 1;

    return { product: p, score, directProductMatch };
  });

  // Sắp xếp theo điểm, lấy tối đa 8
  scored.sort((a, b) => b.score - a.score);
  const top = scored
    .filter((s) => {
      if (matchedProductKeywords.size > 0) return s.directProductMatch && s.score > 0;
      return s.score > 0;
    })
    .slice(0, 8);

  return top.map(({ product: p }) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    type: p.type,
    category: p.category,
  }));
}

/**
 * Map conditionId -> keyword để filter.
 */
export const CONDITION_KEYWORD_MAP: Record<string, string> = {
  condition_ear_mites: 'rận tai, ve tai, viêm tai',
  condition_watery_eyes: 'chảy nước mắt, ghèn mắt, viêm mắt',
  condition_hair_loss: 'rụng lông, nấm da, viêm da',
  condition_matted_fur: 'bết lông, rối lông',
};
