# Hướng dẫn deploy lên Firebase Hosting

## Bước 1: Login (Bạn tự làm)

```bash
firebase login
```

- Chọn tài khoản Google
- Nhấn "Allow"
- Xong!

## Bước 2: Build web app

```bash
cd /Users/gianghii/Documents/Marketing\ Mobile/PetplusApp
npm run build
```

## Bước 3: Deploy

```bash
firebase deploy --only hosting
```

## Kết quả

Sau khi deploy xong, terminal sẽ hiện:

```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/petplus-af32a/overview
Hosting URL: https://petplus-af32a.web.app
```

## 🎉 URL demo của bạn

**https://petplus-af32a.web.app**

Copy URL này:
- Dán vào browser để test
- Tạo QR code để mọi người quét
- Share cho giảng viên/bạn bè

## Cập nhật sau này

Khi code thay đổi:

```bash
npm run build
firebase deploy --only hosting
```

Xong! 🚀
