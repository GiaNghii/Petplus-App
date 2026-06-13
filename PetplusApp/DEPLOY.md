# Hướng dẫn Deploy — Petplus App

## Tổng quan kiến trúc deploy

Petplus App là ứng dụng React Native (Expo SDK 56) được build thành web app
và deploy lên Firebase Hosting.

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend framework | React Native (Expo) + TypeScript |
| Build web | `expo export --platform web` → output vào thư mục `dist/` |
| Hosting | Firebase Hosting (CDN toàn cầu, HTTPS mặc định) |
| Database | Cloud Firestore (NoSQL) |
| Authentication | Firebase Auth (Email/Password) |
| File storage | Firebase Storage (upload ảnh thú cưng, thuốc) |
| Push notifications | Firebase Cloud Messaging (FCM) |

App chạy hoàn toàn trên browser sau khi deploy — **không cần native build**
cho iOS/Android. Firebase Hosting phục vụ file tĩnh từ thư mục `dist/` và
rewrite tất cả route về `index.html` để React Navigation xử lý client-side
routing.

---

## Firebase services đã dùng

| Service | Mục đích | Link Console |
|---------|----------|--------------|
| Authentication | Đăng ký, đăng nhập (Email/Password) | [https://console.firebase.google.com/project/petplus-af32a/authentication](https://console.firebase.google.com/project/petplus-af32a/authentication) |
| Firestore Database | Lưu hồ sơ thú cưng, lịch hẹn, tin nhắn chat, đơn thuốc | [https://console.firebase.google.com/project/petplus-af32a/firestore](https://console.firebase.google.com/project/petplus-af32a/firestore) |
| Storage | Lưu file ảnh upload | [https://console.firebase.google.com/project/petplus-af32a/storage](https://console.firebase.google.com/project/petplus-af32a/storage) |
| Hosting | Phục vụ web app | [https://console.firebase.google.com/project/petplus-af32a/hosting](https://console.firebase.google.com/project/petplus-af32a/hosting) |
| Project Dashboard | Tổng quan project | [https://console.firebase.google.com/project/petplus-af32a/overview](https://console.firebase.google.com/project/petplus-af32a/overview) |

---

## Quy trình deploy từng bước

### Bước 1: Đăng nhập Firebase (chỉ cần làm một lần)

```bash
firebase login
```

Trình duyệt sẽ mở ra → chọn tài khoản Google → nhấn **Allow**.

### Bước 2: Build web app

```bash
cd /Users/gianghii/Documents/Marketing Mobile/PetplusApp
npm run build
```

Lệnh này chạy `expo export --platform web`, xuất code ra thư mục `dist/`.

### Bước 3: Deploy lên Firebase Hosting

```bash
firebase deploy --only hosting
```

Firebase sẽ upload nội dung thư mục `dist/` lên hosting.

### Bước 4: Xác nhận thành công

Terminal sẽ hiện:

```
✔ Deploy complete!
Project Console: https://console.firebase.google.com/project/petplus-af32a/overview
Hosting URL: https://petplus-af32a.web.app
```

---

## Kiểm tra sau deploy

- **URL live:** [https://petplus-af32a.web.app](https://petplus-af32a.web.app)
- Mở URL trên browser, kiểm tra:
  - Trang chủ hiển thị đúng
  - Đăng ký / đăng nhập hoạt động
  - Các chức năng chính (lịch hẹn, chat, cửa hàng thuốc) không bị lỗi
- Kiểm tra console browser (F12 → Console) để phát hiện lỗi JavaScript
- Vào Firebase Console → Hosting để xem lịch sử deploy

---

## Cập nhật khi code thay đổi

Chỉ cần **2 lệnh**:

```bash
npm run build
firebase deploy --only hosting
```

Không cần login lại Firebase. Không cần CI/CD.

---

## Lưu ý bảo mật

### Firebase credentials

Credentials được cấu hình trong `app.json` (mục `expo.extra`) và được
Expo đọc khi build. File `.env` chứa các biến môi trường Firebase đã được
thêm vào `.gitignore` — sẽ không bị push lên GitHub.

Credentials hiện tại nằm trong `app.json` thuộc project Git — nếu repo là
public, bất kỳ ai cũng có thể xem được. Các credentials này được Firebase
cấu hình với hạn chế theo domain (nếu đã cài đặt) để giảm thiểu rủi ro.

### Firestore rules

Hiện tại đang ở **test mode** — cho phép đọc/ghi toàn bộ database:

```
allow read, write: if true;
```

**Không deploy lên production public** với rules này. Cần giới hạn quyền
theo auth UID trước khi public.

### Storage rules

Tương tự Firestore — **test mode**, cho phép đọc/ghi tất cả file:

```
allow read, write: if true;
```

### Không có CI/CD

Deploy hoàn toàn thủ công từ máy local. Chưa thiết lập GitHub Actions
hay bất kỳ pipeline tự động nào.

---

## Thông tin quan trọng

| Mục | Giá trị |
|-----|---------|
| Live URL | [https://petplus-af32a.web.app](https://petplus-af32a.web.app) |
| Firebase Project ID | `petplus-af32a` |
| GitHub repo | [https://github.com/GiaNghii/Petplus-App](https://github.com/GiaNghii/Petplus-App) |
| Branch mặc định | `main` |
| Build command | `npm run build` |
| Deploy command | `firebase deploy --only hosting` |
