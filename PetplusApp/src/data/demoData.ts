import { Appointment, Order, Pet, User } from '../types';

export const DEMO_USER: User = {
  id: 'demo_user',
  name: 'Nguyễn Văn A',
  email: 'demo@petplus.vn',
  phone: '0901234567',
  role: 'customer',
  createdAt: new Date('2024-01-01'),
};

export const DEMO_DEFAULTS = {
  branchId: 'go-vap',
  branchName: 'Petplus Gò Vấp',
  address: '123 Nguyễn Văn Lượng, Gò Vấp, TP. Hồ Chí Minh',
  orderNote: 'Demo: giao trong giờ hành chính, gọi trước khi đến.',
  primaryPetId: 'pet_1',
  secondaryPetId: 'pet_2',
};

export const DEMO_PETS: Pet[] = [
  {
    id: 'pet_1',
    ownerId: DEMO_USER.id,
    name: 'Chí A',
    species: 'dog',
    breed: 'Husky',
    weight: 20.5,
    birthDate: new Date('2021-06-10'),
    medicalHistory: 'Viêm da nhẹ (06/2026), Rụng lông (04/2026)',
    drugAllergies: [],
    vaccinationHistory: [
      { name: 'Vaccine dại', date: new Date('2024-06-15') },
      { name: 'Vaccine 5 bệnh', date: new Date('2024-06-15') },
    ],
    avatarUrl: 'https://i.pinimg.com/736x/9d/e2/58/9de258ae42e4cde4cba70f3d25acb3ff.jpg',
    createdAt: new Date('2024-06-15'),
    weightHistory: [
      { date: new Date('2025-01-10'), weight: 17.0 },
      { date: new Date('2025-03-10'), weight: 18.2 },
      { date: new Date('2025-05-10'), weight: 18.5 },
      { date: new Date('2025-07-10'), weight: 19.0 },
      { date: new Date('2025-09-10'), weight: 19.4 },
      { date: new Date('2025-11-10'), weight: 20.3 },
      { date: new Date('2026-01-10'), weight: 20.5 },
    ],
    medicalRecords: [
      { date: new Date('2026-05-12'), medication: 'Amoxicillin, Vitamin B', notes: 'Viêm da nhẹ' },
      { date: new Date('2026-02-15'), medication: 'Bravecto, Men vi sinh', notes: 'Tẩy giun sán' },
      { date: new Date('2025-03-11'), medication: 'Vitamin tổng hợp', notes: 'Khám sức khỏe định kỳ' },
    ],
    vaccinationSchedule: [
      { date: new Date('2026-04-10'), vaccine: 'Vaccine 7 bệnh (Lại nhắc)', status: 'completed' },
      { date: new Date('2026-02-10'), vaccine: 'Vaccine dại', status: 'completed' },
      { date: new Date('2025-10-10'), vaccine: 'Vaccine 5 bệnh (Lại nhắc)', status: 'completed' },
    ],
  },
  {
    id: 'pet_2',
    ownerId: DEMO_USER.id,
    name: 'Đậu đen',
    species: 'cat',
    breed: 'Mèo Anh lông dài',
    weight: 3,
    birthDate: new Date('2022-03-20'),
    medicalHistory: 'Rận tai (05/2026)',
    drugAllergies: ['Penicillin'],
    vaccinationHistory: [
      { name: 'Vaccine FVRCP', date: new Date('2025-03-20') },
    ],
    avatarUrl: 'https://i.pinimg.com/736x/79/34/ed/7934ed5be0020f7c4f4d7d23a0183c93.jpg',
    createdAt: new Date('2024-06-15'),
    weightHistory: [
      { date: new Date('2025-01-20'), weight: 2.5 },
      { date: new Date('2025-03-20'), weight: 2.8 },
      { date: new Date('2025-05-20'), weight: 3.0 },
      { date: new Date('2025-07-20'), weight: 3.1 },
      { date: new Date('2025-09-20'), weight: 3.0 },
      { date: new Date('2025-11-20'), weight: 3.2 },
      { date: new Date('2026-01-20'), weight: 3.0 },
    ],
    medicalRecords: [
      { date: new Date('2026-05-05'), medication: 'Revolution Plus', notes: 'Rận tai' },
      { date: new Date('2025-12-20'), medication: 'Vitamin tổng hợp', notes: 'Khám sức khỏe' },
    ],
    vaccinationSchedule: [
      { date: new Date('2026-03-20'), vaccine: 'Vaccine FVRCP (Nhắc)', status: 'completed' },
      { date: new Date('2025-09-20'), vaccine: 'Vaccine dại', status: 'completed' },
    ],
  },
];

export const DEMO_APPOINTMENTS: Appointment[] = [];

export const DEMO_ORDERS: Order[] = [
  {
    id: 'order_1',
    customerId: DEMO_USER.id,
    items: [
      { productId: 'p1', productName: 'Thuốc xổ giun PetCare', quantity: 1, price: 45000, type: 'OTC' },
      { productId: 'p2', productName: 'Thức ăn Royal Canin', quantity: 2, price: 180000, type: 'OTC' },
    ],
    totalAmount: 405000,
    deliveryFee: 25000,
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    deliveryBranch: DEMO_DEFAULTS.branchId,
    deliveryAddress: DEMO_DEFAULTS.address,
    deliveryType: 'delivery',
    status: 'delivered',
    createdAt: new Date('2026-05-28'),
    updatedAt: new Date('2026-05-30'),
  },
  {
    id: 'order_2',
    customerId: DEMO_USER.id,
    items: [
      {
        productId: 'p4',
        productName: 'Kháng sinh Amoxicillin',
        quantity: 1,
        price: 200000,
        type: 'prescription',
        petId: DEMO_DEFAULTS.primaryPetId,
        source: 'consultation',
        conditionId: 'condition_hair_loss',
      },
    ],
    totalAmount: 225000,
    deliveryFee: 25000,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    deliveryBranch: DEMO_DEFAULTS.branchId,
    deliveryAddress: DEMO_DEFAULTS.address,
    deliveryType: 'delivery',
    status: 'shipped',
    createdAt: new Date('2026-06-03'),
    updatedAt: new Date('2026-06-05'),
  },
  {
    id: 'order_3',
    customerId: DEMO_USER.id,
    items: [
      {
        productId: 'p6',
        productName: 'Nhỏ tai Oridermyl',
        quantity: 1,
        price: 50000,
        type: 'prescription',
        petId: DEMO_DEFAULTS.secondaryPetId,
        source: 'consultation',
        conditionId: 'condition_ear_mites',
      },
    ],
    totalAmount: 75000,
    deliveryFee: 25000,
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    deliveryBranch: DEMO_DEFAULTS.branchId,
    deliveryAddress: DEMO_DEFAULTS.address,
    deliveryType: 'delivery',
    status: 'delivered',
    createdAt: new Date('2026-05-10'),
    updatedAt: new Date('2026-05-12'),
  },
];
