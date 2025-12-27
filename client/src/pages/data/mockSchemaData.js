// file: data/mockSchemaData.js

// Giả lập dữ liệu trả về từ: SELECT * FROM assets JOIN asset_models ...
export const ASSETS_MOCK = [
  {
    asset_id: 101,
    asset_tag: "AST-2023-001", // Unique Key
    serial_number: "SN-DELL-74921",
    purchase_date: "2023-01-15",
    purchase_cost: 25000000.00,
    current_status: "Deployed", // Enum: 'Deployed','In Stock','In Repair','Retired'
    warranty_months: 24,
    
    // Relation: asset_models
    asset_model: {
      asset_model_id: 1,
      model_name: "Dell Latitude 7420",
      manufacturer: "Dell",
      asset_type: "Laptop",
      specifications: { // JSONB field
        cpu: "i7-1185G7",
        ram: "16GB",
        storage: "512GB SSD",
        screen: "14 inch FHD"
      }
    },

    // Relation: locations
    location: {
      location_id: 5,
      location_name: "Phòng Kỹ Thuật - Tầng 2",
      location_type: "Office"
    },

    // Relation: suppliers
    supplier: {
      supplier_id: 20,
      supplier_name: "FPT Trading",
      contact_info: "support@fpt.com.vn - 19001234"
    },

    // Logic tính toán từ bảng 'assignments' (Lấy record mới nhất chưa có return_date)
    current_assignment: {
      assignment_id: 501,
      assignment_date: "2023-02-01",
      asset_holder: {
        asset_holder_id: 88,
        full_name: "Nguyễn Văn A",
        department: "IT Software",
        employee_code: "EMP-001"
      }
    }
  },
  {
    asset_id: 102,
    asset_tag: "AST-2023-005",
    serial_number: "SN-CISCO-2960",
    purchase_date: "2023-03-10",
    purchase_cost: 12500000.00,
    current_status: "In Stock",
    warranty_months: 12,
    asset_model: {
      asset_model_id: 2,
      model_name: "Cisco Catalyst 2960",
      manufacturer: "Cisco",
      asset_type: "Network Switch",
      specifications: {
        ports: "24 GigE",
        poe: "Yes",
        uplink: "2x 10G SFP+"
      }
    },
    location: {
      location_id: 1,
      location_name: "Kho Tổng (Hà Nội)",
      location_type: "Warehouse"
    },
    supplier: {
      supplier_id: 22,
      supplier_name: "Cisco VN Distributor",
      contact_info: "sales@cisco-dist.vn"
    },
    current_assignment: null // Chưa gán cho ai
  }
];

// Giả lập lịch sử bảo trì (maintenance_logs)
export const MAINTENANCE_LOGS_MOCK = [
  {
    maintenance_log_id: 1,
    asset_id: 101,
    maintenance_date: "2023-06-15",
    description: "Thay thế bàn phím bị kẹt phím Space",
    maintenance_cost: 1500000.00,
    technician: { // Join asset_holders (technician_id)
      full_name: "Trần Kỹ Thuật",
      employee_code: "TECH-01"
    }
  }
];

// Giả lập lịch sử cấp phát (assignments)
export const ASSIGNMENT_HISTORY_MOCK = [
  {
    assignment_id: 501,
    assignment_date: "2023-02-01",
    return_date: null, // Đang sử dụng
    asset_holder: { full_name: "Nguyễn Văn A", department: "IT Software" },
    parent_asset: null
  },
  {
    assignment_id: 400,
    assignment_date: "2023-01-20",
    return_date: "2023-01-30", // Đã trả
    asset_holder: { full_name: "Cài đặt hệ thống (IT Admin)", department: "IT Infra" },
    parent_asset: null
  }
];