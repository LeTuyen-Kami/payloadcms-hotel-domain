# HƯỚNG DẪN QUẢN TRỊ HỆ THỐNG CLOUD9 HOTEL

Tài liệu này hướng dẫn chi tiết cách cài đặt và sử dụng các chức năng trong trang quản trị (Admin Panel) của hệ thống Cloud9 Hotel.

## 1. Cài đặt và Chạy dự án

Để chạy hệ thống trên máy cá nhân (Localhost):

1.  **Mở Terminal** tại thư mục dự án.
2.  Chạy lệnh khởi động:
    ```bash
    pnpm dev
    ```
    (Hoặc `npm run dev` / `yarn dev` tùy cấu hình).
3.  Truy cập trang quản trị:
    - URL: `http://localhost:3000/admin`
    - Đăng nhập bằng tài khoản Admin đã được cấp.

---

## 2. Cấu hình Chung (Globals)

Các cài đặt này ảnh hưởng đến toàn bộ website (Header, Footer, Logo, Thông tin liên hệ).

### 2.1. Cài đặt chung (Site Settings)

- **Vị trí**: Menu trái -> **Site Settings** (Cài đặt chung).
- **Chức năng**:
  - **Tab General**: Thay đổi Tiêu đề website, Logo, Favicon.
  - **Tab Contact**: Cập nhật Hotline, Email, Địa chỉ trụ sở, Link mạng xã hội (Facebook, Zalo).
  - **Tab Footer**: Chỉnh sửa nội dung bản quyền, mô tả ở chân trang.
  - **Google Maps**: Cập nhật API Key hoặc link nhúng bản đồ (nếu có).

### 2.2. Menu điều hướng (Header/Footer)

- **Vị trí**: Menu trái -> **Header** hoặc **Footer**.
- **Nav Items**: Thêm/Sửa/Xóa các liên kết trên thanh menu.
  - **Type**: Chọn `Reference` (để liên kết đến Trang/Bài viết nội bộ) hoặc `Custom` (để dán link ngoài).
  - **Label**: Tên hiển thị trên menu.

---

## 3. Quản lý Nội dung Khách sạn

### 3.1. Quản lý Chi nhánh (Branches)

- **Vị trí**: Menu trái -> **Chi nhánh**.
- **Tác dụng**: Tạo ra các địa điểm khách sạn khác nhau.
- **Lưu ý**: Mỗi **Phòng** đều phải thuộc về một **Chi nhánh**.

### 3.2. Quản lý Phòng (Rooms) - QUAN TRỌNG

- **Vị trí**: Menu trái -> **Phòng**.
- **Các trường quan trọng**:
  - **Tên phòng**: Ví dụ "Luxury King Suite".
  - **Chi nhánh**: Chọn chi nhánh chứa phòng này.
  - **Tổng số lượng phòng (Stock)**:
    - Nhập số lượng phòng thực tế có sẵn.
    - **Lưu ý**: Nếu đặt là `0`, hệ thống sẽ hiển thị **HẾT PHÒNG** trên web và chặn khách đặt.
  - **Bảng giá (Pricing)**:
    - **Hourly Price**: Giá theo giờ.
    - **24h Price**: Giá qua đêm/theo ngày (nếu có).
  - **Tiện ích**: Chọn các tiện ích có trong phòng (Wifi, TV, AC...).

### 3.3. Cơ chế "Hết phòng" (Sold Out)

Hệ thống tự động tính toán trạng thái Hết phòng dựa trên 2 yếu tố:

1.  **Số lượng tồn kho (Stock)**: Nếu bạn sửa Stock = 0 -> Hết phòng.
2.  **Đơn đặt phòng (Booking)**:
    - Khi khách tìm kiếm theo giờ/ngày.
    - Hệ thống đếm số booking **Đang chờ (Pending)** hoặc **Đã xác nhận (Confirmed)** trùng với khoảng thời gian khách chọn.
    - Nếu `Số Booking trùng >= Tổng Stock` -> Báo Hết phòng.

---

## 4. Quản lý Đặt phòng (Bookings)

Quy trình xử lý đơn đặt phòng từ Website:

1.  **Khách đặt trên web**: Đơn hàng mới sẽ vào mục **Bookings** với trạng thái `Pending` (Đang chờ xử lý).
2.  **Nhân viên xác nhận**:
    - Vào chi tiết Booking.
    - Kiểm tra thông tin khách, thời gian.
    - Đổi trạng thái (Status) sang `Confirmed` (Đã xác nhận).
    - Việc này giúp giữ phòng, không cho khách khác đặt trùng.
3.  **Hoàn thành**:
    - Khi khách trả phòng, đổi trạng thái sang `Completed` (Hoàn thành).
4.  **Hủy phòng**:
    - Đổi trạng thái sang `Cancelled` (Đã hủy).
    - Phòng sẽ được "nhả" ra ngay lập tức để khách khác có thể đặt.

**Lưu ý**:

- Một **Order** (Đơn hàng Ecommerce) sẽ tự động được tạo kèm theo mỗi Booking để quản lý thanh toán.
- Bạn có thể xem trạng thái thanh toán (Đã thanh toán / Chưa thanh toán) trong mục **Đơn hàng (Orders)**.

---

## 5. Đồng bộ Đánh giá (Testimonials)

- **Vị trí**: Menu trái -> **Đánh giá khách hàng**.
- Dùng để đăng các feedback của khách hàng lên trang chủ.
- Có thể nhập tay hoặc tích hợp tool (nếu có phát triển thêm).

---

## Câu hỏi thường gặp

**Q: Tại sao tôi chỉnh số lượng phòng về 0 mà Web vẫn hiện còn phòng?**
A: Hãy kiểm tra kỹ lại xem bạn đã Lưu (Save) thay đổi chưa. Hệ thống cập nhật tức thời (Real-time). Nếu vẫn bị, hãy thử tải lại trang Web (F5) vì trình duyệt có thể lưu cache cũ.

**Q: booking trực tiếp tại quầy thì nhập vào đâu?**
A: Bạn chỉ cần vào Admin -> **Bookings** -> **Create New**. Nhập thông tin khách và chọn phòng, thời gian, sau đó set trạng thái là `Confirmed`. Hệ thống sẽ tự động trừ kho trên Website.
