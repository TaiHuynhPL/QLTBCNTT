// data/mockPurchaseData.js

export const SUPPLIERS_MOCK = [
  { supplier_id: 1, supplier_name: "FPT Trading", contact_info: "0909123456" },
  { supplier_id: 2, supplier_name: "CMC Telecom", contact_info: "0988777666" },
  { supplier_id: 3, supplier_name: "Phong Vũ", contact_info: "18006868" },
];

// Kết hợp cả Asset Models và Consumable Models để chọn mua
export const MODELS_TO_BUY_MOCK = [
  { id: 1, name: "Dell Latitude 7420", type: 'Asset', price_est: 25000000 },
  { id: 2, name: "Cisco Switch 2960", type: 'Asset', price_est: 12000000 },
  { id: 3, name: "Chuột Logitech B100", type: 'Consumable', price_est: 150000 },
  { id: 4, name: "Dây cáp mạng CAT6 (Thùng)", type: 'Consumable', price_est: 3500000 },
];

export const PO_MOCK = [
  {
    purchase_order_id: 101,
    order_code: "PO-2023-001",
    order_date: "2023-12-01",
    supplier: { supplier_id: 1, supplier_name: "FPT Trading" },
    created_by: "Admin User",
    status: "Draft", // Draft, Pending Approval, Approved, Completed, Cancelled
    total_amount: 62000000,
    notes: "Mua sắm thiết bị cho nhân viên mới tháng 12",
    details: [
      { detail_id: 1, model_name: "Dell Latitude 7420", type: 'Asset', quantity: 2, unit_price: 25000000, total_price: 50000000 },
      { detail_id: 2, model_name: "Cisco Switch 2960", type: 'Asset', quantity: 1, unit_price: 12000000, total_price: 12000000 },
    ]
  },
  {
    purchase_order_id: 102,
    order_code: "PO-2023-002",
    order_date: "2023-12-05",
    supplier: { supplier_id: 3, supplier_name: "Phong Vũ" },
    created_by: "Manager A",
    status: "Approved", // Đã duyệt, chờ nhập kho
    total_amount: 1500000,
    notes: "Mua chuột dự phòng",
    details: [
      { detail_id: 3, model_name: "Chuột Logitech B100", type: 'Consumable', quantity: 10, unit_price: 150000, total_price: 1500000 },
    ]
  }
];