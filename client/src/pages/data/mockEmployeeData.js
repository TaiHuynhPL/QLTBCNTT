// data/mockEmployeeData.js

// 1. Danh sách nhân viên (asset_holders)
export const EMPLOYEES_MOCK = [
  {
    asset_holder_id: 88,
    employee_code: "EMP-001",
    full_name: "Nguyễn Văn A",
    email: "nguyenvana@company.com",
    department: "IT Software",
    job_title: "Senior Developer",
    is_active: true,
    // Giả lập join với bảng system_users để biết đã có tk chưa
    system_user: {
      system_user_id: 1,
      username: "nguyenvana",
      user_role: "Staff",
      last_login: "2023-12-25 08:30:00"
    }
  },
  {
    asset_holder_id: 89,
    employee_code: "EMP-002",
    full_name: "Trần Thị B",
    email: "tranthib@company.com",
    department: "Human Resources",
    job_title: "HR Manager",
    is_active: true,
    system_user: null // Chưa có tài khoản hệ thống
  },
  {
    asset_holder_id: 91,
    employee_code: "TECH-01",
    full_name: "Phạm Kỹ Thuật",
    email: "phamkt@company.com",
    department: "IT Infra",
    job_title: "IT Technician",
    is_active: true,
    system_user: {
      system_user_id: 2,
      username: "admin_infra",
      user_role: "Admin",
      last_login: "2023-12-27 09:00:00"
    }
  }
];

// 2. Tài sản đang giữ (Mock cho phần Detail)
export const ASSETS_HELD_MOCK = [
  { asset_id: 101, asset_name: "Dell Latitude 7420", tag: "AST-2023-001", date_assigned: "2023-02-01" },
  { asset_id: 205, asset_name: "Màn hình Dell U2422H", tag: "AST-MON-05", date_assigned: "2023-02-01" }
];