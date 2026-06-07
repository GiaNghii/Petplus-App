import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Order, Appointment } from '../types';

// Mock data storage using AsyncStorage (works offline, no Firestore needed)
// Perfect for demo without billing

const STORAGE_KEYS = {
  PETS: 'mock_pets',
  ORDERS: 'mock_orders',
  APPOINTMENTS: 'mock_appointments',
  CART: 'mock_cart',
};

// Sample seed data
const SEED_PETS: Pet[] = [
  {
    id: 'pet_1',
    ownerId: 'demo_user',
    name: 'Buddy',
    species: 'dog',
    breed: 'Poodle',
    weight: 5,
    birthDate: new Date('2023-01-15'),
    medicalHistory: 'Viêm da nhẹ (06/2026)',
    drugAllergies: [],
    vaccinationHistory: [
      { name: 'Vaccine dại', date: new Date('2024-06-15') },
      { name: 'Vaccine 5 bệnh', date: new Date('2024-06-15') },
    ],
    avatarUrl: '',
    createdAt: new Date('2024-06-15'),
  },
  {
    id: 'pet_2',
    ownerId: 'demo_user',
    name: 'Mèo',
    species: 'cat',
    breed: 'Mèo Anh lông dài',
    weight: 3,
    birthDate: new Date('2022-03-20'),
    medicalHistory: '',
    drugAllergies: ['Penicillin'],
    vaccinationHistory: [
      { name: 'Vaccine FVRCP', date: new Date('2025-03-20') },
    ],
    avatarUrl: '',
    createdAt: new Date('2024-06-15'),
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt_1',
    branchId: 'go-vap',
    doctorId: 'dr-a',
    petId: 'pet_1',
    customerId: 'demo_user',
    dateTime: new Date('2026-06-06T14:00:00'),
    slot: '14:00-16:00',
    status: 'confirmed',
    createdAt: new Date('2026-06-01'),
    updatedAt: new Date('2026-06-01'),
  },
];

const SEED_ORDERS: Order[] = [
  {
    id: 'order_1',
    customerId: 'demo_user',
    items: [
      { productId: 'p1', quantity: 1, price: 45000, type: 'OTC' },
      { productId: 'p2', quantity: 2, price: 180000, type: 'OTC' },
    ],
    totalAmount: 405000,
    deliveryFee: 25000,
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    deliveryBranch: 'go-vap',
    deliveryAddress: 'TP. Hồ Chí Minh',
    deliveryType: 'delivery',
    status: 'delivered',
    createdAt: new Date('2026-05-28'),
    updatedAt: new Date('2026-05-30'),
  },
  {
    id: 'order_2',
    customerId: 'demo_user',
    items: [
      { productId: 'p4', quantity: 1, price: 200000, type: 'prescription', petId: 'pet_1' },
    ],
    totalAmount: 225000,
    deliveryFee: 25000,
    paymentMethod: 'COD',
    paymentStatus: 'pending',
    deliveryBranch: 'go-vap',
    deliveryAddress: 'TP. Hồ Chí Minh',
    deliveryType: 'delivery',
    status: 'shipped',
    createdAt: new Date('2026-06-03'),
    updatedAt: new Date('2026-06-05'),
  },
];

// Helper to get data
async function getData<T>(key: string, seed: T[]): Promise<T[]> {
  try {
    const json = await AsyncStorage.getItem(key);
    if (json) {
      return JSON.parse(json);
    }
    // First time - save seed
    await AsyncStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch (e) {
    return seed;
  }
}

async function saveData<T>(key: string, data: T[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Save error:', e);
  }
}

export const mockPetService = {
  async getPetsByOwner(ownerId: string) {
    const pets = await getData<Pet>(STORAGE_KEYS.PETS, SEED_PETS);
    const filtered = pets.filter(p => p.ownerId === ownerId || ownerId === 'demo_user');
    return { success: true, pets: filtered };
  },

  async getPet(petId: string) {
    const pets = await getData<Pet>(STORAGE_KEYS.PETS, SEED_PETS);
    const pet = pets.find(p => p.id === petId);
    if (pet) return { success: true, pet };
    return { success: false, error: 'Not found' };
  },

  async createPet(petData: Omit<Pet, 'id' | 'createdAt'>) {
    const pets = await getData<Pet>(STORAGE_KEYS.PETS, SEED_PETS);
    const newPet: Pet = {
      ...petData,
      id: `pet_${Date.now()}`,
      createdAt: new Date(),
    };
    pets.unshift(newPet);
    await saveData(STORAGE_KEYS.PETS, pets);
    return { success: true, id: newPet.id };
  },

  async updatePet(petId: string, petData: Partial<Pet>) {
    const pets = await getData<Pet>(STORAGE_KEYS.PETS, SEED_PETS);
    const index = pets.findIndex(p => p.id === petId);
    if (index >= 0) {
      pets[index] = { ...pets[index], ...petData };
      await saveData(STORAGE_KEYS.PETS, pets);
      return { success: true };
    }
    return { success: false, error: 'Not found' };
  },

  async deletePet(petId: string) {
    const pets = await getData<Pet>(STORAGE_KEYS.PETS, SEED_PETS);
    const filtered = pets.filter(p => p.id !== petId);
    await saveData(STORAGE_KEYS.PETS, filtered);
    return { success: true };
  },
};

export const mockAppointmentService = {
  async createAppointment(aptData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
    const appts = await getData<Appointment>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    const newApt: Appointment = {
      ...aptData,
      id: `apt_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    appts.unshift(newApt);
    await saveData(STORAGE_KEYS.APPOINTMENTS, appts);
    return { success: true, id: newApt.id };
  },

  async getAppointmentsByCustomer(customerId: string) {
    const appts = await getData<Appointment>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    return { success: true, appointments: appts };
  },

  async getAppointmentsByDoctor(doctorId: string) {
    const appts = await getData<Appointment>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    return { success: true, appointments: appts.filter(a => a.doctorId === doctorId) };
  },

  async updateAppointmentStatus(appointmentId: string, status: string) {
    const appts = await getData<Appointment>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    const index = appts.findIndex(a => a.id === appointmentId);
    if (index >= 0) {
      appts[index].status = status as any;
      appts[index].updatedAt = new Date();
      await saveData(STORAGE_KEYS.APPOINTMENTS, appts);
      return { success: true };
    }
    return { success: false };
  },
};

export const mockOrderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    const orders = await getData<Order>(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    orders.unshift(newOrder);
    await saveData(STORAGE_KEYS.ORDERS, orders);
    return { success: true, id: newOrder.id };
  },

  async getOrdersByCustomer(customerId: string) {
    const orders = await getData<Order>(STORAGE_KEYS.ORDERS, SEED_ORDERS);
    return { success: true, orders };
  },
};

export const mockProductService = {
  async getProducts() {
    return {
      success: true,
      products: [
        { id: 'p1', name: 'Thuốc xổ giun PetCare', price: 45000, type: 'OTC' },
        { id: 'p2', name: 'Thức ăn Royal Canin', price: 180000, type: 'OTC' },
        { id: 'p3', name: 'Vitamin cho mèo', price: 85000, type: 'OTC' },
        { id: 'p4', name: 'Kháng sinh Amoxicillin', price: 200000, type: 'prescription' },
        { id: 'p5', name: 'Thuốc bôi viêm da', price: 150000, type: 'prescription' },
      ],
    };
  },
};
