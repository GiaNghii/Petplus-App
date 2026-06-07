// Using mock data service to avoid Firestore billing requirement
// All data is stored locally on device and pre-seeded with sample data
import { mockPetService, mockAppointmentService, mockOrderService, mockProductService } from './mockDataService';

export const petService = mockPetService;
export const appointmentService = mockAppointmentService;
export const orderService = mockOrderService;
export const productService = mockProductService;
