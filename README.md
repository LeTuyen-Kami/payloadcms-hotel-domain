# Cloud9 Hotel Management System

Hệ thống quản lý đặt phòng khách sạn và quản trị nội dung (CMS) được xây dựng trên nền tảng **Payload CMS 3.0** và **Next.js 15 (App Router)**.

## Yêu cầu hệ thống (Prerequisites)

Trước khi cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js**: Phiên bản 18.20.2 trở lên (Khuyến nghị 20.x).
- **Package Manager**: pnpm (Khuyến nghị), npm, hoặc yarn.
- **MongoDB**: Bạn cần có một cơ sở dữ liệu MongoDB (có thể chạy local hoặc dùng MongoDB Atlas miễn phí). phiên bản MongoDB = 7.0.28

## Hướng dẫn Cài đặt & Chạy dự án

### 1. Clone dự án

```bash
git clone <đường-dẫn-repo-của-bạn>
cd payloadcms
```

### 2. Cài đặt thư viện (Dependencies)

Sử dụng `pnpm` (hoặc `npm` / `yarn`):

```bash
pnpm install
```

### 3. Cấu hình biến môi trường (.env)

Tạo file `.env` tại thư mục gốc của dự án và điền các thông tin sau:

```env
# 1. Cấu hình Database (Bắt buộc)
# Thay đổi đường dẫn kết nối tới MongoDB của bạn
DATABASE_URL=mongodb://127.0.0.1/payloadcms

# 2. Payload Secret (Bắt buộc)
# Một chuỗi ký tự ngẫu nhiên bất kỳ để mã hóa session
PAYLOAD_SECRET=YOUR_SECRET_KEY_HERE

# 3. Server URL
# URL của trang web (Localhost là http://localhost:3000)
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# 4. Cấu hình thanh toán SePay (Bắt buộc để chạy chức năng thanh toán)
SEPAY_API_KEY=your_sepay_webhook_token   # Mã bí mật bảo vệ Webhook
SEPAY_ACCOUNT_NUMBER=0123456789          # Số tài khoản nhận tiền
SEPAY_BANK_BIN=970422                    # Mã BIN ngân hàng (VD: MBBank là 970422)
SEPAY_ACCOUNT_NAME=NGUYEN VAN A          # Tên chủ tài khoản
```

### 4. Chạy dự án

#### Chạy môi trường phát triển (Development)

Lệnh này sẽ chạy cả Payload Admin và Next.js Frontend:

```bash
pnpm dev
# Hoặc: npm run dev
```

- **Frontend**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

#### Chạy môi trường sản xuất (Production)

```bash
pnpm build
pnpm start
```

## Sao lưu & Khôi phục dữ liệu (Backup & Restore)

Để chuyển toàn bộ dữ liệu (Database) sang máy mới nhanh chóng:

**1. Sao lưu (Tại máy cũ):**

```bash
mongodump --uri="mongodb://127.0.0.1/payloadcms" --out=./backup
```

**2. Khôi phục (Tại máy mới):**
Copy thư mục `backup` sang máy mới rồi chạy:

```bash
mongorestore --uri="mongodb://127.0.0.1/payloadcms" ./backup/payloadcms
```

## Chức năng chính

- **Quản lý Phòng & Chi nhánh**: Tạo phòng, set giá theo giờ/ngày, quản lý tồn kho.
- **Booking System**:
  - Khách đặt phòng Online.
  - Tích hợp thanh toán QR Code (SePay).
  - Tự động xác nhận đơn khi nhận tiền (Webhook).
  - Kiểm tra tính khả dụng (Availability) thời gian thực.
- **Admin Dashboard**: Giao diện quản trị trực quan.
- **Import/Export**: Dễ dàng sao lưu và di chuyển dữ liệu giữa các môi trường.

## Tài liệu hướng dẫn sử dụng

Xem chi tiết hướng dẫn sử dụng các chức năng quản trị tại file: [ADMIN_MANUAL.md](./ADMIN_MANUAL.md)
