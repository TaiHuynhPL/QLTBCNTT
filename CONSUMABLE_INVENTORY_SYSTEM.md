# Quản lý Vật tư Tiêu hao - Tài liệu Chi tiết

## Tổng quan
Hệ thống quản lý vật tư tiêu hao được phát triển theo quy trình 3 bước:
1. **Quản lý Tồn kho (ConsumableStock)** - Theo dõi số lượng vật tư tại các vị trí
2. **Xuất kho cho Người dùng (ConsumableCheckouts)** - Cấp phát vật tư cho nhân viên
3. **Cập nhật Tồn kho và Cảnh báo** - Tự động cập nhật số lượng và phát cảnh báo khi thiếu

---

## Kiến trúc Database

### 1. Bảng ConsumableStock (Tồn kho)
```
- stock_id (PRIMARY KEY)
- consumable_model_id (FK → ConsumableModel)
- location_id (FK → Location)
- quantity (số lượng tồn kho)
- min_quantity (ngưỡng cảnh báo tối thiểu)
- created_at, updated_at
```

**Mục đích:** Lưu trữ số lượng từng loại vật tư tại từng vị trí (kho)

### 2. Bảng ConsumableCheckout (Xuất kho)
```
- checkout_id (PRIMARY KEY)
- consumable_model_id (FK → ConsumableModel)
- asset_holder_id (FK → AssetHolder - Nhân viên nhận)
- quantity_checked_out (số lượng xuất)
- checkout_date (ngày xuất)
- created_at, updated_at
```

**Mục đích:** Ghi nhận lịch sử xuất kho cho mỗi nhân viên

---

## Server API

### 1. API Tồn kho - `/api/consumable-stock`

#### GET /api/consumable-stock
Lấy danh sách tồn kho với phân trang
```json
{
  "success": true,
  "data": {
    "stocks": [
      {
        "stock_id": 1,
        "quantity": 50,
        "min_quantity": 10,
        "ConsumableModel": { "consumable_model_name": "Giấy A4" },
        "Location": { "location_name": "Kho 1" }
      }
    ],
    "total": 15,
    "page": 1,
    "totalPages": 2
  }
}
```

#### POST /api/consumable-stock
Nhập kho - Thêm mới hoặc cộng thêm số lượng
```json
{
  "consumable_model_id": 1,
  "location_id": 1,
  "quantity": 100,
  "min_quantity": 10
}
```

**Quy trình:**
- Nếu chưa có tồn kho → Tạo mới
- Nếu đã có → Cộng thêm số lượng

#### PUT /api/consumable-stock/:id
Cập nhật số lượng hoặc ngưỡng cảnh báo
```json
{
  "quantity": 45,
  "min_quantity": 15
}
```

#### GET /api/consumable-stock/alert/low-stock
Lấy danh sách cảnh báo (các item dưới ngưỡng tối thiểu)
```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "stock_id": 2,
        "quantity": 5,
        "min_quantity": 10,
        "ConsumableModel": { "consumable_model_name": "Bút" },
        "Location": { "location_name": "Kho 2" }
      }
    ],
    "total": 2
  }
}
```

---

### 2. API Xuất kho - `/api/consumable-checkouts`

#### GET /api/consumable-checkouts
Lấy lịch sử xuất kho
```json
{
  "success": true,
  "data": {
    "checkouts": [
      {
        "checkout_id": 1,
        "quantity_checked_out": 10,
        "checkout_date": "2026-01-11",
        "ConsumableModel": { "consumable_model_name": "Giấy A4" },
        "AssetHolder": { "full_name": "Nguyễn Văn A" }
      }
    ],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```

#### POST /api/consumable-checkouts
Xuất kho cho người dùng
```json
{
  "consumable_model_id": 1,
  "location_id": 1,
  "asset_holder_id": 5,
  "quantity_checked_out": 10,
  "checkout_date": "2026-01-11"
}
```

**Quy trình tự động:**
1. Kiểm tra tồn kho tại vị trí đã chọn
2. Nếu số lượng không đủ → Trả lỗi
3. Nếu đủ → Tạo bản ghi xuất kho
4. **Tự động trừ đi** số lượng trong ConsumableStock
5. Kiểm tra xem có vào ngưỡng cảnh báo không (quantity <= min_quantity)

#### GET /api/consumable-checkouts/:id
Lấy chi tiết một bản ghi xuất kho

---

## Client UI - Trang Quản lý Vật tư Tiêu hao

### Đường dẫn
`/consumable-inventory`

### Menu Sidebar
- Icon: Package (📦)
- Tên: "Quản lý Tồn kho"

### Tabs
1. **Tồn kho** - Hiển thị danh sách tồn kho
2. **Xuất kho** - Hiển thị lịch sử và cấp phát
3. **Cảnh báo** - Hiển thị danh sách cảnh báo (dự kiến)

---

## Quy trình Chi tiết

### Bước 1: Nhập Kho (Thêm Tồn kho)

**Ai làm:** Warehouse, Manager, Admin
**Ở đâu:** Tab "Tồn kho" → Nút "Thêm mới"

**Form nhập:**
```
- Loại vật tư: [Dropdown] *
- Vị trí: [Dropdown] *
- Số lượng: [Input Number] *
- Số lượng tối thiểu: [Input Number]
```

**Quy trình backend:**
```
1. Kiểm tra (consumable_model_id, location_id) đã tồn tại chưa
2. Nếu chưa → INSERT tồn kho mới
3. Nếu rồi → UPDATE quantity += input_quantity
4. Lưu min_quantity nếu được cung cấp
```

**Kết quả:**
- ✅ Toast "Thêm tồn kho thành công"
- Refresh danh sách
- Ngóng log hoạt động

---

### Bước 2: Xuất Kho cho Người dùng

**Ai làm:** Warehouse, Manager, Admin
**Ở đâu:** Tab "Xuất kho" → Nút "Thêm mới"

**Form xuất:**
```
- Loại vật tư: [Dropdown] *
- Vị trí kho: [Dropdown] *
- Người nhận: [Dropdown - AssetHolder] *
- Số lượng xuất: [Input Number] *
- Ngày xuất: [Date Input]
```

**Quy trình backend (Transaction):**
```
1. START TRANSACTION
2. Validate dữ liệu đầu vào
3. Kiểm tra tồn kho tại vị trí
   - Nếu không tìm thấy → ROLLBACK, trả lỗi
   - Nếu quantity < yêu cầu → ROLLBACK, trả lỗi
4. INSERT bản ghi ConsumableCheckout
5. UPDATE ConsumableStock: quantity -= quantity_checked_out
6. Kiểm tra: nếu quantity <= min_quantity → Ghi log cảnh báo
7. COMMIT
```

**Kết quả thành công:**
```json
{
  "success": true,
  "message": "Xuất kho thành công",
  "data": {
    "checkout": { ... },
    "updatedStock": { ... }
  }
}
```

**Kết quả lỗi (các trường hợp):**
- "Không tìm thấy tồn kho cho loại vật tư này tại vị trí đã chọn"
- "Số lượng tồn kho không đủ. Hiện có: 5, yêu cầu: 10"

---

### Bước 3: Cập nhật Tồn kho và Cảnh báo

**Tự động (via Transaction):**
- Khi xuất kho → Tồn kho tự động giảm
- Nếu quantity ≤ min_quantity → Ghi log cảnh báo

**Thủ công (Edit Tồn kho):**
**Ở đâu:** Tab "Tồn kho" → Click nút "Sửa" trên hàng

**Form sửa:**
```
- Số lượng: [Input]
- Số lượng tối thiểu: [Input]
```

**Trạng thái Tồn kho:**
- 🟢 Bình thường: quantity > min_quantity
- 🔴 Cảnh báo: quantity ≤ min_quantity
  - Hiển thị icon ⚠️ + text "Cảnh báo"
  - Dòng bảng nền đỏ nhạt

---

## Giao diện Chi tiết

### Tab 1: Tồn kho

**Bảng:**
| Loại vật tư | Vị trí | Số lượng | Min | Trạng thái | Thao tác |
|--|--|--|--|--|--|
| Giấy A4 | Kho 1 | 50 | 10 | ✓ Bình thường | Sửa |
| Bút | Kho 2 | 5 | 10 | ⚠️ Cảnh báo | Sửa |

**Features:**
- Tìm kiếm (search)
- Phân trang
- Hiển thị "Tổng số: X"
- Edit inline (Số lượng, Min)
- Highlight dòng nếu cảnh báo (bg-red-50)

**Modal Thêm:**
- Dropdown: Loại vật tư
- Dropdown: Vị trí
- Input: Số lượng *
- Input: Số lượng tối thiểu

---

### Tab 2: Xuất kho

**Bảng:**
| Loại vật tư | Người nhận | Số lượng | Ngày xuất | Trạng thái |
|--|--|--|--|--|
| Giấy A4 | Nguyễn Văn A | 10 | 11/01/2026 | ✓ Đã xuất |
| Bút | Trần Thị B | 5 | 10/01/2026 | ✓ Đã xuất |

**Features:**
- Tìm kiếm (search)
- Phân trang
- Hiển thị "Tổng số: X"
- Trạng thái: "✓ Đã xuất" (xanh)

**Modal Xuất:**
- Dropdown: Loại vật tư *
- Dropdown: Vị trí kho *
- Dropdown: Người nhận *
- Input: Số lượng xuất *
- Date Input: Ngày xuất (default: hôm nay)

**Lỗi có thể gặp:**
- ❌ "Không tìm thấy tồn kho..."
- ❌ "Số lượng tồn kho không đủ. Hiện có: X, yêu cầu: Y"

---

### Tab 3: Cảnh báo (Dự kiến)

Hiển thị danh sách tất cả các item có quantity ≤ min_quantity

---

## Quyền truy cập

| Hành động | Admin | Manager | Warehouse | User |
|--|--|--|--|--|
| Xem danh sách | ✓ | ✓ | ✓ | ✗ |
| Nhập kho | ✓ | ✓ | ✓ | ✗ |
| Xuất kho | ✓ | ✓ | ✓ | ✗ |
| Sửa tồn kho | ✓ | ✓ | ✓ | ✗ |

---

## Liên kết với các Module Khác

### Đơn đặt hàng (PurchaseOrder)
Khi tồn kho vào ngưỡng cảnh báo → Kích hoạt tạo PurchaseOrder mới
- Hiện tại: Ghi log cảnh báo
- Tương lai: Tự động tạo PO hoặc gửi notification

---

## Các file được tạo/cập nhật

### Server
- ✨ `/server/src/routes/consumableStock.js` - API tồn kho
- ✨ `/server/src/routes/consumableCheckout.js` - API xuất kho
- ✏️ `/server/src/index.js` - Đăng ký routes

### Client
- ✨ `/client/src/pages/ConsumableInventory.jsx` - Trang chính
- ✨ `/client/src/components/ConsumableStockList.jsx` - Component tồn kho
- ✨ `/client/src/components/ConsumableCheckoutList.jsx` - Component xuất kho
- ✏️ `/client/src/App.jsx` - Thêm route
- ✏️ `/client/src/components/Sidebar.jsx` - Thêm menu

---

## Lưu ý Quan trọng

### Transaction & Consistency
- **POST /consumable-checkouts** sử dụng Database Transaction
- Đảm bảo tồn kho luôn đúng (không mất dữ liệu)
- Nếu lỗi ở bất kỳ bước nào → Rollback toàn bộ

### Validation
- Số lượng xuất phải > 0
- Số lượng tồn kho không thể âm
- Phải có vị trí và loại vật tư hợp lệ

### Logging
- Mỗi hành động được ghi log (CREATE, UPDATE)
- ActivityLog ghi nhận ai làm gì lúc nào

---

## Hướng phát triển trong tương lai

1. **Auto PO Creation** - Tự động tạo đơn đặt hàng khi thiếu
2. **Alerts Dashboard** - Dashboard cảnh báo riêng
3. **Report** - Báo cáo tiêu thụ vật tư
4. **Barcode Scanning** - Quét mã vạch khi xuất kho
5. **Expiry Date** - Quản lý hạn sử dụng
