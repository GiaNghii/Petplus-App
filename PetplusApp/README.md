# Petplus Mobile App

Ứng dụng di động cho chuỗi phòng khám thú y Petplus - Kết nối khách hàng và bác sĩ thú y 24/7.

## Tính năng chính

- 📅 **Đặt lịch khám** - Chọn chi nhánh, bác sĩ và khung giờ
- 💬 **Tư vấn online** - Chat trực tiếp với bác sĩ 24/7
- 💊 **Mua thuốc** - Thuốc OTC và kê đơn, giao hàng tận nơi
- 🐕 **Hồ sơ thú cưng** - Quản lý nhiều pet, theo dõi sức khỏe
- 📱 **Nhắc lịch thông minh** - Push notification, Zalo, SMS

## Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Firebase
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Notifications**: Firebase Cloud Messaging

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn
- Expo CLI

### Bước 1: Clone project
```bash
git clone https://github.com/[YOUR_USERNAME]/PetplusApp.git
cd PetplusApp
```

### Bước 2: Cài dependencies
```bash
npm install
```

### Bước 3: Setup Firebase
1. Copy file `.env.example` thành `.env`
2. Điền Firebase credentials vào file `.env`

```bash
cp .env.example .env
```

### Bước 4: Chạy app
```bash
# Chạy trên iOS (cần Mac + Xcode)
npm run ios

# Chạy trên Android (cần Android Studio)
npm run android

# Chạy trên web
npm run web

# Hoặc dùng Expo Go app
npx expo start
```

## Cấu trúc project

```
PetplusApp/
├── src/
│   ├── components/       # Reusable UI components
│   ├── screens/         # App screens
│   │   ├── customer/    # Customer app screens
│   │   └── doctor/      # Doctor app screens
│   ├── navigation/      # Navigation setup
│   ├── services/        # Firebase services
│   │   └── firebaseConfig.ts
│   ├── context/         # React Context (Auth, etc.)
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Helper functions
├── assets/             # Images, fonts
├── App.tsx             # Entry point
├── app.json            # Expo config
└── package.json
```

## Chi nhánh Petplus

- **Gò Vấp** - 123 Nguyễn Trãi, P.5, Q. Gò Vấp
- **Quận 11** - 456 Lê Đại Hành, P.11, Q. 11
- **Quận 12** - 789 Tô Ký, P. Tân Hưng Thuận, Q. 12

## Giờ hoạt động

24/7 - Tất cả các ngày trong tuần

## Hỗ trợ

Liên hệ: [petplus.com.vn](https://petplus.com.vn/)

## License

Private - Petplus Internal Project
