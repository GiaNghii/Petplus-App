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
  status: 'waiting' | 'active' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  consultationId: string;
  senderId: string;
  senderRole: 'customer' | 'doctor';
  text: string;
  productLink?: string;
  imageUrl?: string;
  createdAt: Date;
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
  createdAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  type: 'OTC' | 'prescription';
  petId?: string; // for prescription items
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
