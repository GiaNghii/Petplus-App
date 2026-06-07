# Hướng dẫn đẩy code lên GitHub

## Bước 1: Tạo GitHub Repository

1. Truy cập [github.com/new](https://github.com/new)
2. Điền thông tin:
   - **Repository name**: `PetplusApp`
   - **Description**: `Petplus mobile app - React Native + Firebase`
   - **Visibility**: Private (nếu là project cá nhân) hoặc Public
3. Click **Create repository**

## Bước 2: Đẩy code lên GitHub

Chạy các lệnh sau trong terminal:

```bash
cd /Users/gianghii/Documents/Marketing\ Mobile/PetplusApp

# Thêm remote repository
git remote add origin https://github.com/[YOUR_USERNAME]/PetplusApp.git

# Push code lên GitHub
git branch -M main
git push -u origin main
```

**Thay `[YOUR_USERNAME]` bằng username GitHub của bạn.**

## Bước 3: Xác minh

Truy cập `https://github.com/[YOUR_USERNAME]/PetplusApp` để xem code đã được đẩy lên chưa.

## Lưu ý bảo mật

⚠️ **File `.env` chứa Firebase credentials đã được thêm vào `.gitignore`** để không bị push lên GitHub. Đây là thông tin nhạy cảm, không nên chia sẻ công khai.

Nếu bạn cần chia sẻ project với người khác, hãy cung cấp file `.env` riêng hoặc tạo lại credentials mới.

## Cập nhật code sau này

Sau khi đã push lần đầu, mỗi khi thay đổi code:

```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```
