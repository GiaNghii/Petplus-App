# Hướng dẫn Enable Firestore Database

## ⚠️ Lỗi: `Failed to get document because the client is offline`

Lỗi này nghĩa là **Firestore Database chưa được tạo** trong Firebase project.

---

## 🔥 Bước 1: Vào Firebase Console

1. Truy cập [console.firebase.google.com](https://console.firebase.google.com)
2. Chọn project **petplus-af32a**
3. Sidebar → **Build** → **Firestore Database**

---

## 💾 Bước 2: Tạo Database

1. Click nút **"Create database"**
2. Chọn chế độ bảo mật:
   - **"Start in test mode"** ← Chọn cái này (cho phép đọc/ghi trong 30 ngày)
   - ⚠️ KHÔNG chọn "production mode" (sẽ chặn tất cả truy cập)
3. Click **Next**

---

## 🌍 Bước 3: Chọn Location

1. Chọn: **asia-southeast1 (Singapore)**
   - Gần Việt Nam nhất → nhanh nhất
2. Click **Enable**
3. **Chờ 1-2 phút** để Firebase khởi tạo

---

## ✅ Bước 4: Test lại

Quay lại app và:
1. **Đăng ký tài khoản mới**
2. **Thêm thú cưng**
3. Lỗi `client is offline` sẽ biến mất

---

## 🐛 Nếu vẫn lỗi

| Lỗi hiện | Nguyên nhân | Cách fix |
|---------|-------------|----------|
| `client is offline` | Chưa tạo Firestore | Làm theo bước trên |
| `permission-denied` | Chọn sai security mode | Tạo lại với "test mode" |
| `unavailable` | Location sai | Chọn asia-southeast1 |

---

## 📋 Tóm tắt các bước Firebase setup

Bạn cần enable **3 thứ** trong Firebase Console:

1. ✅ **Authentication** (đã làm)
2. 🔥 **Firestore Database** (đang làm)
3. ⬜ **Storage** (optional - cho upload ảnh)

---

## 💡 Tip: Sau khi tạo xong

Vào tab **"Rules"** trong Firestore, bạn sẽ thấy:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if
        request.time < timestamp.date(2026, 7, 6);
    }
  }
}
```

Đây là **test mode** - cho phép đọc/ghi tự do trong 30 ngày. Đủ dùng cho báo cáo cuối kỳ!

Sau 30 ngày nếu cần dùng tiếp, bạn có thể:
- Gia hạn test mode
- Hoặc viết rules chặt chẽ hơn (chỉ user đã login mới đọc/ghi)
