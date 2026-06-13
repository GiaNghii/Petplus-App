export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: 'customer' | 'doctor';
  avatarUrl?: string;
  branchId?: string; // for doctors
  createdAt: Date;
}

export interface WeightRecord {
  date: Date;
  weight: number;
}

export interface MedicalRecord {
  date: Date;
  medication: string;
  notes: string;
}

export interface VaccinationRecord {
  date: Date;
  vaccine: string;
  status: 'completed' | 'upcoming' | 'overdue';
}

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  weight: number;
  birthDate: Date;
  medicalHistory: string;
  drugAllergies: string[];
  vaccinationHistory: { name: string; date: Date }[];
  avatarUrl?: string;
  createdAt: Date;
  weightHistory?: WeightRecord[];
  medicalRecords?: MedicalRecord[];
  vaccinationSchedule?: VaccinationRecord[];
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  activeDoctors: string[];
}

export interface Appointment {
  id: string;
  branchId: string;
  doctorId: string;
  petId: string;
  customerId: string;
  dateTime: Date;
  slot: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  customerId: string;
  doctorId: string;
  petId: string;
  petName?: string;
  customerName?: string;
  doctorName?: string;
  status: 'waiting' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageProductLink {
  id: string;
  name: string;
  price: number;
  description?: string;
  conditionId?: string;
}

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'customer' | 'doctor';
  text: string;
  productLink?: MessageProductLink;
  productLinks?: MessageProductLink[];
  imageUrl?: string;
  createdAt: Date;
  source?: 'user' | 'doctor' | 'ai' | 'fallback' | 'safety';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: 'OTC' | 'prescription';
  category: string;
  stock: Record<string, number>; // branchId -> quantity
  imageLocal?: any;
  bgColor?: string;
  rating?: number;
  reviews?: number;
  sold?: number;
  unit?: string;
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  productName?: string;
  productImageUrl?: string;
  quantity: number;
  price: number;
  type: 'OTC' | 'prescription';
  petId?: string; // for prescription items
  conditionId?: string;
  source?: 'shop' | 'consultation';
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: 'momo' | 'banking' | 'COD';
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryBranch: string;
  deliveryAddress: string;
  deliveryType: 'delivery' | 'pickup';
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  customerId: string;
  petId: string;
  type: 'checkup' | 'medicine' | 'vaccination' | 'deworming' | 'diet';
  title: string;
  description: string;
  dateTime: Date;
  channels: ('push' | 'zalo' | 'sms')[];
  status: 'pending' | 'sent' | 'completed';
  createdAt: Date;
}

export interface TimeSlot {
  start: string;
  end: string;
  currentPatients: number;
  maxPatients: number;
}
