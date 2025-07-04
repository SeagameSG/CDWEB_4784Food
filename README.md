﻿# CDWEB_4784Food

## Mô tả đồ án
Đây là một ứng dụng web bán đồ ăn trực tuyến được phát triển trên nền tảng MERN Stack (MongoDB, Express, React, Node.js). Ứng dụng bao gồm 3 phần chính: giao diện người dùng (frontend), trang quản trị của cửa hàng (admin), và backend.

## Cấu trúc dự án
Dự án được chia thành 3 phần chính:
- **Frontend**: Giao diện người dùng cuối
- **Admin**: Giao diện quản trị hệ thống
- **Backend**: API và logic xử lý dữ liệu

## Tính năng chính

### Frontend
1. **Đăng ký và đăng nhập tài khoản** - Sử dụng JWT để xác thực
2. **Quản lý địa chỉ giao hàng** - Lưu trữ và quản lý nhiều địa chỉ giao hàng
3. **Xem bản đồ địa điểm, đường đi giao hàng** - Dùng API map và route
4. **Giỏ hàng** - Giỏ hàng thức ăn
5. **Lọc** - Lọc theo thể loại thức ăn
6. **Áp dụng mã giảm giá** - Hỗ trợ mã khuyến mãi cho đơn hàng
7. **Đa ngôn ngữ** - Hỗ trợ đa ngôn ngữ (i18next)
8. **Lấy vị trí hiện tại** - Tự động xác định vị trí người dùng qua Geolocation API
9. **Thêm đánh giá** - Tìm kiếm đánh giá.
10. **Bảo vệ truy cập trên thanh địa chỉ** - Ở mức độ frontend. 

### Admin
1. **Quản lý sản phẩm** - Thêm, sửa, xóa sản phẩm và danh mục
2. **Quản lý đơn hàng** - Xem, duyệt và cập nhật trạng thái đơn hàng
3. **Quản lý mã giảm giá** - Tạo và quản lý các chương trình khuyến mãi
4. **Quản lý đánh giá của khách hàng** - Xem, xóa các đánh giá

### Backend
1. **Xác thực và phân quyền** - JWT, middleware bảo vệ route
2. **Quản lý phiên đăng nhập** - Theo dõi và quản lý phiên người dùng
3. **Xử lý thanh toán** - Tích hợp phương thức thanh toán VNPay
4. **RESTful API** - Thiết kế API theo chuẩn REST
5. **Lưu trữ hình ảnh** - Quản lý và lưu trữ hình ảnh sản phẩm
6. **Gửi mail** - kiểm tra OTP

## Công nghệ sử dụng

### Frontend
- **React**: Thư viện JavaScript để xây dựng giao diện người dùng
- **React Router**: Định tuyến trong ứng dụng React
- **Axios**: Thực hiện các yêu cầu HTTP
- **i18next**: Hỗ trợ đa ngôn ngữ
- **React Toastify**: Hiển thị thông báo
- **Framer Motion**: Hiệu ứng animation
- **MapLibre GL**: Hiển thị và tương tác với bản đồ
- **HTML5 Validation**: Kiểm tra tính hợp lệ của dữ liệu form trực tiếp trên trình duyệt
- **CSS3**: Tùy chỉnh giao diện, hiệu ứng và responsive design

### Backend
- **Node.js**: Môi trường chạy JavaScript
- **Express**: Framework web cho Node.js
- **MongoDB**: Cơ sở dữ liệu NoSQL
- **Mongoose**: ODM (Object Data Modeling) cho MongoDB
- **JWT (JSON Web Tokens)**: Xác thực người dùng
- **bcrypt**: Mã hóa mật khẩu
- **Multer**: Xử lý tải lên file
- **Cors**: Xử lý Cross-Origin Resource Sharing

## Hướng dẫn nhập MongoDB

### Cài đặt và cấu hình MongoDB Database Tools

1. **Tải MongoDB Server & Database Tools**:
    - Truy cập https://www.mongodb.com/try/download/community
    - Tải xuống MongoDB Community Server Download và MongoDB Shell Download
    - Sau đó cài đặt cả 2.

2. **Thêm thư mục bin của MongoDB Tools vào biến môi trường PATH của Windows**:

   **Cách 1 - Thủ công:**
    - Xác định đường dẫn chính xác đến thư mục bin (ví dụ: `C:\Program Files\MongoDB\Tools\100\bin`)
    - Mở "Control Panel" > "System and Security" > "System"
    - Nhấp vào "Advanced system settings"
    - Trong tab "Advanced", nhấp vào nút "Environment Variables"
    - Trong phần "System variables", tìm và chọn biến "Path", sau đó nhấp vào "Edit"
    - Nhấp vào "New" và thêm đường dẫn đến thư mục bin
    - Nhấp "OK" để lưu các thay đổi
    - **Khởi động lại Command Prompt/PowerShell/Terminal IDE** để nhận biến môi trường mới

   **Cách 2 - Dùng PowerShell:**
    - Mở PowerShell với quyền Administrator
    - Chạy lệnh:
      ```powershell
      [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\MongoDB\Tools\100\bin", [EnvironmentVariableTarget]::Machine)
      ```
    - Đóng và mở lại PowerShell hoặc Command Prompt/Terminal IDE

3. **Kiểm tra cài đặt**:
    - Mở Command Prompt mới
    - Gõ lệnh `mongoexport --version` và nhấn Enter
    - Nếu thấy thông tin phiên bản, là đã cài đặt thành công

# Import Data
    
```bash
mongosh "mongodb://localhost:27017/4784food"

mongoimport --uri="mongodb://localhost:27017/4784food" --collection=users --file=./databaseData/users.json --jsonArray

mongoimport --uri="mongodb://localhost:27017/4784food" --collection=foods --file=./databaseData/foods.json --jsonArray

mongoimport --uri="mongodb://localhost:27017/4784food" --collection=orders --file=./databaseData/orders.json --jsonArray

mongoimport --uri="mongodb://localhost:27017/4784food" --collection=coupons --file=./databaseData/coupons.json --jsonArray
```

# Chạy Project
   Sau khi Clone về mở 3 tab Terminal:
   - cd vào từng folder 
   - **"cd .\frontend\"**
   - **"cd .\admin\"**
   - **"cd .\backend\"**
   Sau khi vào dùng:
   - **"npm install"** để cài đặt package
   - **"npm run dev"** để chạy 3 project.
