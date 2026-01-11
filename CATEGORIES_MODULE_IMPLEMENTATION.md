# Module Danh mục - Tài liệu Triển khai

## Tổng quan
Đã tạo module "Danh mục" (Categories) cho phép quản lý và hiển thị:
- Danh sách Nhà cung cấp (Suppliers)
- Loại Tài sản (Asset Models)
- Loại Vật tư (Consumable Models)

## Các thay đổi trên Server

### 1. Routes - Suppliers (`server/src/routes/suppliers.js`)
**Các endpoint đã cập nhật:**
- `GET /api/suppliers` - Lấy danh sách nhà cung cấp với tìm kiếm và phân trang
- `GET /api/suppliers/:id` - Lấy chi tiết nhà cung cấp
- `POST /api/suppliers` - Tạo nhà cung cấp mới (Admin/Manager)
- `PUT /api/suppliers/:id` - Cập nhật nhà cung cấp (Admin/Manager)
- `DELETE /api/suppliers/:id` - Xóa nhà cung cấp (Admin)

**Tính năng:**
- Kiểm tra ràng buộc (không thể xóa nếu đang sử dụng trong đơn đặt hàng)
- Ghi log hoạt động
- Xác thực token và phân quyền

### 2. Routes - Asset Models (`server/src/routes/assetModels.js`)
**Các endpoint đã cập nhật:**
- `GET /api/asset-models` - Lấy danh sách loại tài sản
- `GET /api/asset-models/:id` - Lấy chi tiết loại tài sản
- `POST /api/asset-models` - Tạo loại tài sản mới (Admin/Manager)
- `PUT /api/asset-models/:id` - Cập nhật loại tài sản (Admin/Manager)
- `DELETE /api/asset-models/:id` - Xóa loại tài sản (Admin)

**Tính năng:**
- Kiểm tra ràng buộc (không thể xóa nếu đang sử dụng)
- Ghi log hoạt động
- Xác thực token và phân quyền

### 3. Routes - Consumable Models (`server/src/routes/consumableModels.js`)
**Các endpoint hiện có (chỉ cần xác nhận):**
- `GET /api/consumable-models` - Lấy danh sách loại vật tư
- `GET /api/consumable-models/:id` - Lấy chi tiết loại vật tư
- `POST /api/consumable-models` - Tạo loại vật tư mới (Admin/Manager)
- `PUT /api/consumable-models/:id` - Cập nhật loại vật tư (Admin/Manager)
- `DELETE /api/consumable-models/:id` - Xóa loại vật tư (Admin)

## Các thay đổi trên Client

### 1. Trang Danh mục (`client/src/pages/Categories.jsx`)
**Chức năng chính:**
- Giao diện tab để chuyển đổi giữa 3 danh mục
- Quản lý trạng thái tab hoạt động
- Tích hợp các component con cho mỗi danh mục

**Tabs:**
1. **Nhà cung cấp** - Hiển thị SupplierList
2. **Loại Tài sản** - Hiển thị AssetModelList
3. **Loại Vật tư** - Hiển thị CategoryConsumableModelList

### 2. Component SupplierList (`client/src/components/SupplierList.jsx`)
**Tính năng:**
- Hiển thị danh sách nhà cung cấp
- Tìm kiếm theo tên và thông tin liên hệ
- Phân trang
- Chỉnh sửa inline
- Xóa với xác nhận

**Cột hiển thị:**
- Tên nhà cung cấp
- Thông tin liên hệ
- Nút thao tác (Sửa/Xóa)

### 3. Component AssetModelList (`client/src/components/AssetModelList.jsx`)
**Tính năng:**
- Hiển thị danh sách loại tài sản
- Tìm kiếm theo tên và nhà sản xuất
- Phân trang
- Chỉnh sửa inline
- Xóa với xác nhận

**Cột hiển thị:**
- Tên loại tài sản
- Nhà sản xuất
- Nút thao tác (Sửa/Xóa)

### 4. Component CategoryConsumableModelList (`client/src/components/CategoryConsumableModelList.jsx`)
**Tính năng:**
- Hiển thị danh sách loại vật tư
- Tìm kiếm theo tên, nhà sản xuất, mã loại
- Phân trang
- Chỉnh sửa inline
- Xóa với xác nhận

**Cột hiển thị:**
- Tên loại vật tư
- Nhà sản xuất
- Mã loại
- Nút thao tác (Sửa/Xóa)

### 5. Cập nhật App.jsx
- Thêm import Categories
- Thêm route `/categories` -> `<Categories />`

### 6. Cập nhật Sidebar.jsx
- Thêm import icon FolderOpen từ lucide-react
- Thêm menu "Danh mục" với link `/categories`

## Tính năng chung cho tất cả các danh mục

### Tìm kiếm
- Tìm kiếm theo từ khóa liên quan đến từng danh mục
- Tự động reset về trang 1 khi tìm kiếm

### Phân trang
- Hiển thị 10 items/trang
- Nút Trước/Sau để điều hướng

### Chỉnh sửa
- Inline edit - dòng được chọn chuyển sang mode chỉnh sửa
- Nút Lưu/Hủy
- Xác thực dữ liệu trước khi lưu

### Xóa
- Dialog xác nhận trước khi xóa
- Ghi log hoạt động
- Kiểm tra ràng buộc (không xóa nếu đang sử dụng)

### Thông báo Toast
- Thông báo thành công/lỗi khi thực hiện các thao tác
- Toast tự động biến mất sau vài giây

## Quyền truy cập
- **Xem danh sách:** Tất cả người dùng đã xác thực
- **Tạo/Cập nhật:** Admin, Manager
- **Xóa:** Admin only

## Cách sử dụng

### Trên Client
1. Đăng nhập vào ứng dụng
2. Click vào "Danh mục" trong Sidebar
3. Chọn tab tương ứng (Nhà cung cấp, Loại Tài sản, Loại Vật tư)
4. Thực hiện các thao tác: tìm kiếm, sửa, xóa

### Các thao tác cụ thể

#### Tìm kiếm
- Nhập từ khóa vào ô tìm kiếm
- Danh sách sẽ tự động lọc

#### Sửa
- Click nút "Sửa" trên hàng cần chỉnh sửa
- Chỉnh sửa dữ liệu trong các ô input
- Click "Lưu" để lưu hoặc "Hủy" để hủy thao tác

#### Xóa
- Click nút "Xóa" trên hàng cần xóa
- Xác nhận trong dialog
- Nếu item đang sử dụng sẽ có thông báo lỗi

## Tệp được thay đổi/tạo mới

### Server
- ✏️ `/server/src/routes/suppliers.js` - Cập nhật (thêm POST, PUT, DELETE)
- ✏️ `/server/src/routes/assetModels.js` - Cập nhật (thêm POST, PUT, DELETE)
- ✓ `/server/src/routes/consumableModels.js` - Đã có đủ CRUD

### Client
- ✨ `/client/src/pages/Categories.jsx` - Tạo mới
- ✨ `/client/src/components/SupplierList.jsx` - Tạo mới
- ✨ `/client/src/components/AssetModelList.jsx` - Tạo mới
- ✨ `/client/src/components/CategoryConsumableModelList.jsx` - Tạo mới
- ✏️ `/client/src/App.jsx` - Cập nhật (thêm import và route)
- ✏️ `/client/src/components/Sidebar.jsx` - Cập nhật (thêm menu)

## Kiểm tra lỗi
- ✅ Không có lỗi syntax trên server routes
- ✅ Tất cả components React được import đúng
- ✅ API endpoints đúng
- ✅ Phân quyền và xác thực đúng

## Lưu ý
1. Cần có quyền Admin/Manager để tạo/sửa/xóa
2. Một số item không thể xóa nếu đang được sử dụng ở nơi khác
3. Tất cả thao tác đều được ghi log
4. Cần làm mới trang khi có lỗi ở phía server
