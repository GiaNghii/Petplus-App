# Hướng dẫn Enable Firebase Services

## ⚠️ Lỗi: `auth/configuration-not-found`

Lỗi này nghĩa là **Firebase Authentication chưa được bật** trong project của bạn. Cần vào Firebase Console để enable.

---

## 🔐 Bước 1: Enable Authentication

1. Truy cập [console.firebase.google.com](https://console.firebase.google.com)
2. Chọn project **petplus-af32a** của bạn
3. Sidebar → **Build** → **Authentication**
4. Click **"Get started"** (nếu chưa enable)
5. Tab **Sign-in method**
6. Click vào **"Email/Password"**
7. Bật **Enable** (toggle ON)
8. Click **Save**

---

## 💾 Bước 2: Enable Firestore Database

1. Sidebar → **Build** → **Firestore Database**
2. Click **"Create database"**
3. Chọn **"Start in test mode"** (cho demo, không cần bảo mật cao)
4. Click **Next**
5. Chọn location: **asia-southeast1 (Singapore)** - gần Việt Nam nhất
6. Click **Enable**

Chờ 1-2 phút để Firebase khởi tạo...

---

## 📦 Bước 3: Enable Storage (Optional - cho upload ảnh)

1. Sidebar → **Build** → **Storage**
2. Click **"Get started"**
3. Chọn **"Start in test mode"** → Next
4. Location: **asia-southeast1**
5. Click **Done**

---

## ✅ Bước 4: Test lại

1. Quay lại app
2. Thử đăng ký tài khoản mới
3. Lỗi `auth/configuration-not-found` sẽ biến mất

---

## 🐛 Nếu vẫn lỗi

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `auth/configuration-not-found` | Chưa bật Authentication | Làm Bước 1 |
| `permission-denied` | Firestore rules chặn | Chọn "test mode" ở Bước 2 |
| `network-request-failed` | Mất mạng | Kiểm tra internet |
| `email-already-in-use` | Email đã đăng ký | Dùng email khác |

---

## 🎯 Sau khi enable xong

App sẽ hoạt động đầy đủ:
- ✅ Đăng ký / Đăng nhập
- ✅ Lưu hồ sơ thú cưng
- ✅ Đặt lịch khám
- ✅ Chat tư vấn
- ✅ Mua thuốc
