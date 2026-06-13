import { Pet } from '../types';

export interface QuickCondition {
  id: string;
  name: string;
  symptoms: string;
  historyKeywords: string[];
}

export const CONDITIONS: QuickCondition[] = [
  {
    id: 'condition_ear_mites',
    name: 'Rận tai',
    symptoms: 'Ngứa tai, gãi nhiều, ráy tai đen, ve tai',
    historyKeywords: ['rận tai', 've tai', 'ráy tai', 'viêm tai', 'ghẻ tai', 'ear mite'],
  },
  {
    id: 'condition_watery_eyes',
    name: 'Bị chảy nước mắt',
    symptoms: 'Chảy nước mắt, ghèn mắt, viêm kết mạc',
    historyKeywords: ['chảy nước mắt', 'ghèn mắt', 'viêm mắt', 'viêm kết mạc', 'đau mắt'],
  },
  {
    id: 'condition_hair_loss',
    name: 'Rụng lông',
    symptoms: 'Rụng lông từng mảng, lông thưa, nấm da',
    historyKeywords: ['rụng lông', 'rụng long', 'hói', 'nấm da', 'viêm da', 'nấm', 'malassezia'],
  },
  {
    id: 'condition_matted_fur',
    name: 'Bết lông',
    symptoms: 'Lông bết dính, xơ rối, khó chải',
    historyKeywords: ['bết lông', 'bết long', 'rối lông', 'xơ lông', 'lông bết'],
  },
];

export const CONDITION_KEYWORD_MAP: Record<string, string> = {
  condition_ear_mites: 'rận tai, ve tai, viêm tai',
  condition_watery_eyes: 'chảy nước mắt, ghèn mắt, viêm mắt',
  condition_hair_loss: 'rụng lông, nấm da, viêm da',
  condition_matted_fur: 'bết lông, rối lông',
};

export function checkPetHasCondition(pet: Pet, condition: QuickCondition): boolean {
  const history = pet.medicalHistory.toLowerCase();
  return condition.historyKeywords.some(kw => history.includes(kw.toLowerCase()));
}

export function buildQuickChatMessage(petName: string, conditionName: string): string {
  return `Chào bác sĩ, ${petName} nhà em đang bị ${conditionName.toLowerCase()}. Bác sĩ tư vấn giúp em với ạ.`;
}
