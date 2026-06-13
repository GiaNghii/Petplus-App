import { Pet } from '../types';

export interface QuickCondition {
  id: string;
  name: string;
  symptoms: string;
  historyKeywords: string[];
}

export interface QuickTreatment {
  id: string;
  name: string;
  description: string;
  price: number;
  medKeywords: string[];
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

export const TREATMENTS: Record<string, QuickTreatment[]> = {
  condition_ear_mites: [
    {
      id: 'treat_ear_oridermyl',
      name: 'Nhỏ tai Oridermyl',
      description: 'Kháng sinh – kháng viêm – kháng nấm. Dùng 2 lần/ngày trong 7-10 ngày. Làm sạch tai trước khi nhỏ.',
      price: 50000,
      medKeywords: ['oridermyl', 'nhỏ tai oridermyl'],
    },
    {
      id: 'treat_ear_aurizon',
      name: 'Nhỏ tai Aurizon',
      description: 'Kết hợp kháng nấm + kháng viêm + diệt ve. Nhỏ 1 lần/ngày, liệu trình 5-7 ngày.',
      price: 80000,
      medKeywords: ['aurizon', 'nhỏ tai aurizon'],
    },
    {
      id: 'treat_ear_epiotic',
      name: 'Vệ sinh tai Epi-Otic',
      description: 'Dung dịch làm sạch tai chuyên dụng, loại bỏ ráy tai và mảng bám. Dùng trước khi nhỏ thuốc trị ve tai.',
      price: 120000,
      medKeywords: ['epi-otic', 'epiotic', 'vệ sinh tai'],
    },
    {
      id: 'treat_ear_frontline',
      name: 'Nhỏ gáy trị ve Frontline Combo',
      description: 'Diệt ve tai & ve toàn thân, hiệu quả kéo dài 1 tháng. Nhỏ trực tiếp lên da gáy.',
      price: 250000,
      medKeywords: ['frontline', 'nhỏ gáy'],
    },
  ],
  condition_watery_eyes: [
    {
      id: 'treat_eye_tobrex',
      name: 'Nhỏ mắt Tobrex',
      description: 'Kháng sinh phổ rộng trị viêm kết mạc, nhiễm trùng mắt. Nhỏ 2-3 giọt, 3-4 lần/ngày.',
      price: 45000,
      medKeywords: ['tobrex', 'nhỏ mắt tobrex'],
    },
    {
      id: 'treat_eye_gentamicin',
      name: 'Nhỏ mắt Gentamicin',
      description: 'Kháng sinh aminoglycoside, hiệu quả với vi khuẩn gram âm gây viêm mắt. Nhỏ 2 lần/ngày.',
      price: 35000,
      medKeywords: ['gentamicin', 'nhỏ mắt gentamicin'],
    },
    {
      id: 'treat_eye_ophthal',
      name: 'Vệ sinh mắt Ophthal',
      description: 'Dung dịch vệ sinh mắt sinh lý, làm sạch ghèn và bụi bẩn. Dùng hàng ngày, an toàn cho mèo.',
      price: 65000,
      medKeywords: ['ophthal', 'vệ sinh mắt'],
    },
  ],
  condition_hair_loss: [
    {
      id: 'treat_hair_omega',
      name: 'Omega-3 dầu cá bổ sung',
      description: 'Bổ sung Omega-3 & DHA giúp lông mềm mượt, giảm rụng lông do thiếu dưỡng chất. Dùng 1 viên/ngày.',
      price: 180000,
      medKeywords: ['omega', 'omega-3', 'dầu cá'],
    },
    {
      id: 'treat_hair_biotin',
      name: 'Biotin hỗ trợ mọc lông',
      description: 'Vitamin H (Biotin) kích thích mọc lông mới, giảm gãy rụng. Phù hợp thú cưng sau cạo lông hoặc rụng lông theo mùa.',
      price: 220000,
      medKeywords: ['biotin', 'mọc lông'],
    },
    {
      id: 'treat_hair_ointment',
      name: 'Thuốc bôi viêm da PetCare',
      description: 'Kháng viêm – kháng nấm tại chỗ. Bôi trực tiếp lên vùng da bị tổn thương 2 lần/ngày.',
      price: 150000,
      medKeywords: ['viêm da petcare', 'petcare', 'thuốc bôi viêm da'],
    },
    {
      id: 'treat_hair_malaseb',
      name: 'Sữa tắm trị nấm Malaseb',
      description: 'Sữa tắm chuyên trị nấm Malassezia và vi khuẩn gây rụng lông. Tắm 2 lần/tuần trong 4 tuần đầu.',
      price: 320000,
      medKeywords: ['malaseb', 'sữa tắm trị nấm', 'sữa tắm'],
    },
  ],
  condition_matted_fur: [
    {
      id: 'treat_fur_shampoo',
      name: 'Dầu gội chải chuốt Furminator',
      description: 'Dầu gội chuyên dụng giúp gỡ rối, làm mềm lông, giảm bết dính. Dùng 1-2 lần/tuần.',
      price: 280000,
      medKeywords: ['furminator', 'dầu gội', 'chải chuốt'],
    },
    {
      id: 'treat_fur_spray',
      name: 'Xịt dưỡng lông PetCare',
      description: 'Xịt dưỡng tức thì giúp gỡ rối nhanh, chống tĩnh điện, giữ lông bóng mượt cả ngày.',
      price: 95000,
      medKeywords: ['xịt dưỡng', 'dưỡng lông', 'xịt lông'],
    },
    {
      id: 'treat_fur_comb',
      name: 'Lược chải rối chuyên dụng',
      description: 'Lược thép không gỉ với lưỡi cắt đặc biệt, gỡ rối nhanh không gây đau cho thú cưng.',
      price: 75000,
      medKeywords: ['lược chải', 'chải rối'],
    },
  ],
};

export function checkPetHasCondition(pet: Pet, condition: QuickCondition): boolean {
  const history = pet.medicalHistory.toLowerCase();
  return condition.historyKeywords.some(kw => history.includes(kw.toLowerCase()));
}

export function checkTreatmentPrescribed(
  treatment: QuickTreatment,
  prescribedMedNames: string[]
): boolean {
  if (!treatment.medKeywords.length) return false;
  return prescribedMedNames.some(name =>
    treatment.medKeywords.some(kw => name.toLowerCase().includes(kw.toLowerCase()))
  );
}

export function buildQuickChatMessage(petName: string, conditionName: string): string {
  return `Chào bác sĩ, ${petName} nhà em đang bị ${conditionName.toLowerCase()}. Bác sĩ tư vấn giúp em với ạ.`;
}
