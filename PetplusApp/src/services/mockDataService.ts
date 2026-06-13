import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Order, Appointment } from '../types';
import { DEMO_APPOINTMENTS, DEMO_ORDERS, DEMO_PETS, DEMO_USER } from '../data/demoData';

// Mock data storage using AsyncStorage (works offline, no Firestore needed)
// Perfect for demo without billing

const STORAGE_KEYS = {
  PETS: 'mock_pets',
  ORDERS: 'mock_orders',
  APPOINTMENTS: 'mock_appointments_v2',
  CART: 'mock_cart',
};

const SEED_PETS = DEMO_PETS;
const SEED_APPOINTMENTS = DEMO_APPOINTMENTS;
const SEED_ORDERS = DEMO_ORDERS;

export async function resetDemoData() {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.PETS, JSON.stringify(SEED_PETS)],
    [STORAGE_KEYS.ORDERS, JSON.stringify(SEED_ORDERS)],
    [STORAGE_KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS)],
  ]);
  await AsyncStorage.removeItem(STORAGE_KEYS.CART);
}

// Helper to get data
async function getData<T extends { id: string }>(key: string, seed: T[]): Promise<T[]> {
  try {
    const json = await AsyncStorage.getItem(key);
    if (json) {
      const existing = JSON.parse(json) as T[];
      const seedMap = new Map(seed.map(s => [s.id, s]));
      const merged = existing.map(item => {
        const seedItem = seedMap.get(item.id);
        if (seedItem) {
          const merged_item = { ...seedItem, ...item };
          if ((seedItem as any).avatarUrl && !(item as any).avatarUrl) {
            (merged_item as any).avatarUrl = (seedItem as any).avatarUrl;
          }
          return merged_item;
        }
        return item;
      });
      await AsyncStorage.setItem(key, JSON.stringify(merged));
      return merged;
    }
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
    const filtered = pets.filter(p => p.ownerId === ownerId || ownerId === DEMO_USER.id);
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
    return { success: true, appointments: appts.filter(a => a.customerId === customerId || customerId === DEMO_USER.id) };
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

  async updateAppointment(appointmentId: string, updates: Partial<Appointment>) {
    const appts = await getData<Appointment>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    const index = appts.findIndex(a => a.id === appointmentId);
    if (index >= 0) {
      appts[index] = { ...appts[index], ...updates, updatedAt: new Date() };
      await saveData(STORAGE_KEYS.APPOINTMENTS, appts);
      return { success: true, appointment: appts[index] };
    }
    return { success: false };
  },

  async normalizeAppointmentStatuses() {
    const appts = await getData<Appointment>(STORAGE_KEYS.APPOINTMENTS, SEED_APPOINTMENTS);
    const now = new Date();
    let changed = false;
    const normalized = appts.map(apt => {
      if (
        (apt.status === 'pending' || apt.status === 'confirmed') &&
        new Date(apt.dateTime) < now
      ) {
        changed = true;
        return { ...apt, status: 'completed' as const, updatedAt: new Date() };
      }
      return apt;
    });
    if (changed) {
      await saveData(STORAGE_KEYS.APPOINTMENTS, normalized);
    }
    return { success: true, appointments: normalized };
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
    return { success: true, orders: orders.filter(o => o.customerId === customerId || customerId === DEMO_USER.id) };
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
        { id: 'p6', name: 'Nhỏ tai Oridermyl', price: 50000, type: 'prescription' },
      ],
    };
  },
};
