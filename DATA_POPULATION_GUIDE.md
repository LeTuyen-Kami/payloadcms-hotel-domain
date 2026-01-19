# Hướng dẫn Nhập Liệu (Data Population Guide)

Bạn có 2 cách để nhập liệu cho website: tự nhập tay thông qua Admin Panel hoặc chạy script tạo dữ liệu mẫu (Seed Script).

## Cách 1: Chạy Script (Khuyên dùng - Nhanh nhất)

Mình đã tạo sẵn một script để tự động tạo dữ liệu mẫu cho các Branch, Rooms và Settings.

1.  Mở terminal tại thư mục gốc dự án.
2.  Chạy lệnh sau:
    ```bash
    bun run seed
    ```
    *(Nếu chưa có lệnh seed, hãy xem phần "Cài đặt Seed Script" bên dưới hướng dẫn này để setup trước)*
3.  Sau khi chạy xong, vào Admin Panel (`/admin`) để kiểm tra dữ liệu.

## Cách 2: Nhập tay (Manual)

Nếu bạn muốn tự nhập từng cái, hãy làm theo các bước sau:

### 1. Đăng nhập
- URL: `http://localhost:3000/admin`
- Tài khoản: `kanekirito1280@gmail.com`
- Mật khẩu: `123456`

### 2. Tạo Chi nhánh (Branches)
Vào Collection **Branches** -> Tạo mới 2 chi nhánh:

**Chi nhánh 1:**
- **Title**: Chi nhánh An Nhơn
- **Slug**: `an-nhon` (nếu không tự sinh)
- **Address**: 123 Đường An Nhơn, Gò Vấp, HCM
- **Phone**: 0901234567

**Chi nhánh 2:**
- **Title**: Chi nhánh Quang Trung
- **Slug**: `quang-trung`
- **Address**: 456 Đường Quang Trung, Gò Vấp, HCM
- **Phone**: 0909888777

### 3. Tạo Phòng (Rooms)
Vào Collection **Rooms** -> Tạo phòng và gán vào các chi nhánh tương ứng.

**Phòng VIP (thuộc An Nhơn):**
- **Title**: VIP Room 101
- **Branch**: Chọn "Chi nhánh An Nhơn"
- **Pricing**:
  - First 2 Hours: 300,000
  - Additional Hour: 50,000
  - Overnight: 700,000
  - Daily: 1,200,000
- **Amenities**: Chọn Smart TV, Wifi, AC...
- **Images**: Upload ảnh đẹp (nên chọn ảnh ngang, tỉ lệ 16:9).

**Phòng Standard (thuộc Quang Trung):**
- **Title**: Standard Room 202
- **Branch**: Chọn "Chi nhánh Quang Trung"
- **Pricing**:
   - First 2 Hours: 200,000
   - Additional Hour: 40,000
   - Overnight: 500,000
   - Daily: 900,000

### 4. Cài đặt Trang (Site Settings)
Vào Global **Site Settings**:
- **Phone**: 1900 1234
- **Email**: contact@hotelcloud9.vn
- **Address**: Ho Chi Minh City
- **Social Links**: Thêm link Facebook/Zalo nếu cần.
