export interface Doctor {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  bio: string;
  chips: string[];
  imageUrl: string;
  rating: number;
  reviews: number;
  patients: number;
  status: 'online' | 'consulting' | 'examining' | 'offline';
  branches: string[];
}

export type DoctorRecord = Record<string, string>;

const BASE_URL = 'https://petplus.com.vn';

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-a',
    name: 'ThS. BS Nguyễn Thanh Tài',
    role: 'Giám đốc phòng khám',
    specialty: 'Phẫu thuật & Nội soi',
    experience: '10 năm kinh nghiệm',
    bio: 'Bác sĩ phụ trách thăm khám, tư vấn, chẩn đoán và thực hiện các kỹ thuật chuyên môn như phẫu thuật, nội soi, siêu âm, đồng thời hỗ trợ theo dõi, chăm sóc và đáp ứng các nhu cầu cần thiết trong suốt quá trình thú cưng sử dụng dịch vụ.',
    chips: ['Phẫu thuật', 'Nội soi', 'Siêu âm', 'Xquang', 'Điều trị'],
    imageUrl: `${BASE_URL}/uploads/doctor/doctor-20260414-052620-040648be.jpg`,
    rating: 4.9,
    reviews: 156,
    patients: 3,
    status: 'online',
    branches: ['go-vap', 'quan-12', 'quan-11'],
  },
  {
    id: 'dr-b',
    name: 'BS Đỗ Thành Tuấn',
    role: 'BS chính chi nhánh Gò Vấp',
    specialty: 'Phẫu thuật & Nội soi',
    experience: '10 năm kinh nghiệm',
    bio: 'Bác sĩ phụ trách thăm khám, tư vấn, chẩn đoán và thực hiện các kỹ thuật chuyên môn như phẫu thuật, nội soi, siêu âm, đồng thời hỗ trợ theo dõi, chăm sóc và đáp ứng các nhu cầu cần thiết trong suốt quá trình thú cưng sử dụng dịch vụ.',
    chips: ['Phẫu thuật', 'Nội soi', 'Siêu âm', 'Xquang', 'Điều trị'],
    imageUrl: `${BASE_URL}/uploads/doctor/doctor-20260417-141752-bc87caf6.jpg`,
    rating: 4.8,
    reviews: 112,
    patients: 2,
    status: 'online',
    branches: ['go-vap'],
  },
  {
    id: 'dr-c',
    name: 'BS Huỳnh Tấn Thì',
    role: 'BS chính chi nhánh Q12',
    specialty: 'Phẫu thuật & Nội soi',
    experience: 'Theo lịch trực tại cơ sở',
    bio: 'Bác sĩ phụ trách thăm khám, tư vấn, chẩn đoán và thực hiện các kỹ thuật chuyên môn như phẫu thuật, nội soi, siêu âm, đồng thời hỗ trợ theo dõi, chăm sóc và đáp ứng các nhu cầu cần thiết trong suốt quá trình thú cưng sử dụng dịch vụ.',
    chips: ['Phẫu thuật', 'Nội soi', 'Siêu âm', 'Xquang', 'Điều trị'],
    imageUrl: `${BASE_URL}/uploads/doctor/doctor-20260417-141844-e5db3019.jpg`,
    rating: 4.7,
    reviews: 89,
    patients: 1,
    status: 'examining',
    branches: ['quan-12'],
  },
  {
    id: 'dr-d',
    name: 'BS Hà Duy Nguyên',
    role: 'BS chính chi nhánh Gò Vấp',
    specialty: 'Phẫu thuật & Nội soi',
    experience: 'Theo lịch hoạt động từng cơ sở',
    bio: 'Bác sĩ phụ trách thăm khám, tư vấn, chẩn đoán và thực hiện các kỹ thuật chuyên môn như phẫu thuật, nội soi, siêu âm, đồng thời hỗ trợ theo dõi, chăm sóc và đáp ứng các nhu cầu cần thiết trong suốt quá trình thú cưng sử dụng dịch vụ.',
    chips: ['Phẫu thuật', 'Nội soi', 'Siêu âm', 'Xquang', 'Điều trị'],
    imageUrl: `${BASE_URL}/uploads/doctor/doctor-20260419-022750-0f0348e7.jpg`,
    rating: 4.6,
    reviews: 74,
    patients: 0,
    status: 'consulting',
    branches: ['go-vap'],
  },
  {
    id: 'dr-e',
    name: 'BS Lê Phước Sang',
    role: 'BS chính chi nhánh Q11',
    specialty: 'Phẫu thuật & Nội soi',
    experience: '',
    bio: 'Bác sĩ phụ trách thăm khám, tư vấn, chẩn đoán và thực hiện các kỹ thuật chuyên môn như phẫu thuật, nội soi, siêu âm, đồng thời hỗ trợ theo dõi, chăm sóc và đáp ứng các nhu cầu cần thiết trong suốt quá trình thú cưng sử dụng dịch vụ.',
    chips: ['Phẫu thuật', 'Nội soi', 'Siêu âm', 'Xquang', 'Điều trị'],
    imageUrl: `${BASE_URL}/uploads/doctor/doctor-20260419-023031-bfb7a54f.jpg`,
    rating: 4.7,
    reviews: 58,
    patients: 1,
    status: 'online',
    branches: ['quan-11'],
  },
  {
    id: 'dr-f',
    name: 'BS Vũ Văn Quý',
    role: 'BS chính chi nhánh Q12',
    specialty: 'Phẫu thuật & Nội soi',
    experience: '',
    bio: 'Bác sĩ phụ trách thăm khám, tư vấn, chẩn đoán và thực hiện các kỹ thuật chuyên môn như phẫu thuật, nội soi, siêu âm, đồng thời hỗ trợ theo dõi, chăm sóc và đáp ứng các nhu cầu cần thiết trong suốt quá trình thú cưng sử dụng dịch vụ.',
    chips: ['Phẫu thuật', 'Nội soi', 'Siêu âm', 'Xquang', 'Điều trị'],
    imageUrl: `${BASE_URL}/uploads/doctor/doctor-20260419-025831-c60bf09f.jpg`,
    rating: 4.6,
    reviews: 43,
    patients: 0,
    status: 'offline',
    branches: ['quan-12'],
  },
];

export const DOCTOR_NAMES: DoctorRecord = Object.fromEntries(
  DOCTORS.map(d => [d.id, d.name])
);

DOCTOR_NAMES['auto'] = 'Hệ thống tự lựa chọn';
