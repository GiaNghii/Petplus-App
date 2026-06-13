import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const STORAGE_KEY = 'mock_users';
const CURRENT_USER_KEY = 'mock_current_user';

// Sample users
const SEED_USERS: (User & { password: string })[] = [
  {
    id: 'demo_user',
    name: 'Nguyễn Văn A',
    email: 'demo@petplus.vn',
    phone: '0901234567',
    role: 'customer',
    avatarUrl: '',
    createdAt: new Date('2024-01-01'),
    password: '123456',
  },
  {
    id: 'doctor_user',
    name: 'Bác sĩ tiếp nhận nội khoa',
    email: 'doctor@petplus.vn',
    phone: '0909876543',
    role: 'doctor',
    avatarUrl: '',
    createdAt: new Date('2024-01-01'),
    password: '123456',
  },
];

export const mockAuthService = {
  async register(email: string, password: string, name: string, phone: string, role: 'customer' | 'doctor' = 'customer') {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : SEED_USERS;
      
      // Check if email exists
      if (users.find((u: any) => u.email === email)) {
        return { success: false, error: 'Email đã được sử dụng' };
      }

      const newUser: any = {
        id: `user_${Date.now()}`,
        email,
        name,
        phone,
        role,
        avatarUrl: '',
        createdAt: new Date().toISOString(),
        password,
      };

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(users));
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async login(email: string, password: string) {
    try {
      const usersJson = await AsyncStorage.getItem(STORAGE_KEY);
      const users = usersJson ? JSON.parse(usersJson) : SEED_USERS;
      
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        return { success: false, error: 'Email hoặc mật khẩu không đúng' };
      }

      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async logout() {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    return { success: true };
  },

  async getCurrentUserData(uid: string) {
    try {
      const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user.id === uid) {
          return { success: true, user };
        }
      }
      return { success: false, error: 'User not found' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getCurrentUser() {
    const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  },
};
