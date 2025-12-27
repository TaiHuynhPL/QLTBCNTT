import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save, X, Calendar, User, Search, 
  AlertCircle, CheckCircle, Package 
} from 'lucide-react';
import { ASSETS_MOCK } from './data/mockSchemaData';

// Mock danh sách nhân viên (Asset Holders)
const HOLDERS_MOCK = [
  { asset_holder_id: 88, full_name: "Nguyễn Văn A", employee_code: "EMP-001", department: "IT Software" },
  { asset_holder_id: 89, full_name: "Trần Thị B", employee_code: "EMP-002", department: "Human Resources" },
  { asset_holder_id: 90, full_name: "Lê Văn C", employee_code: "EMP-003", department: "Sales" },
  { asset_holder_id: 91, full_name: "Phạm Kỹ Thuật", employee_code: "TECH-01", department: "IT Infra" },
];

export default function AssignmentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Lấy asset_id từ URL nếu có (ví dụ: chuyển từ trang Detail sang)
  const preSelectedAssetId = searchParams.get('assetId');

  // State form
  const [formData, setFormData] = useState({
    asset_id: preSelectedAssetId || '',
    asset_holder_id: '',
    assignment_date: new Date().toISOString().split('T')[0], // Default Today
    return_date: '', // Optional
    notes: '' // UI field (có thể lưu vào activity_logs)
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Lọc danh sách tài sản: Chỉ lấy những cái đang "In Stock" HOẶC chính cái đang được chọn (để hiển thị tên)
  const availableAssets = ASSETS_MOCK.filter(a => 
    a.current_status === 'In Stock' || String(a.asset_id) === String(formData.asset_id)
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // 1. Validate required fields
    if (!formData.asset_id || !formData.asset_holder_id || !formData.assignment_date) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    // 2. Validate DB Constraint: return_date >= assignment_date
    if (formData.return_date && new Date(formData.return_date) < new Date(formData.assignment_date)) {
      setError('Ngày trả dự kiến không được nhỏ hơn ngày cấp phát.');
      return;
    }

    // 3. Mock Submit Action
    console.log("Submitting Payload to /api/assignments:", {
      asset_id: parseInt(formData.asset_id),
      asset_holder_id: parseInt(formData.asset_holder_id),
      assignment_date: formData.assignment_date,
      return_date: formData.return_date || null
      // Note: Backend sẽ cần update trạng thái asset thành 'Deployed' trong cùng 1 transaction
    });

    setSuccess(true);
    
    // Giả lập delay sau khi save thành công thì back về trang trước
    setTimeout(() => {
      navigate(-1);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Tạo phiếu cấp phát
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Gán tài sản cho nhân viên sử dụng
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          
          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative flex items-center gap-2">
              <CheckCircle size={20} />
              <span>Cấp phát thành công! Đang chuyển hướng...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* 1. Chọn Tài sản (Asset) */}
            <div>
              <label htmlFor="asset" className="block text-sm font-medium text-gray-700">
                Tài sản (Chỉ hiện thiết bị trong kho) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="asset"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 bg-white border"
                  value={formData.asset_id}
                  onChange={(e) => setFormData({...formData, asset_id: e.target.value})}
                  disabled={success} // Disable khi đang submit thành công
                >
                  <option value="">-- Chọn thiết bị --</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.asset_id} value={asset.asset_id}>
                      {asset.asset_tag} - {asset.asset_model.model_name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Hiển thị thông tin nhanh của thiết bị được chọn */}
              {formData.asset_id && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  {(() => {
                    const sel = availableAssets.find(a => String(a.asset_id) === String(formData.asset_id));
                    return sel ? `Serial: ${sel.serial_number} | Model: ${sel.asset_model.model_name}` : '';
                  })()}
                </div>
              )}
            </div>

            {/* 2. Chọn Người nhận (Holder) */}
            <div>
              <label htmlFor="holder" className="block text-sm font-medium text-gray-700">
                Người nhận (Asset Holder) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="holder"
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 bg-white border"
                  value={formData.asset_holder_id}
                  onChange={(e) => setFormData({...formData, asset_holder_id: e.target.value})}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {HOLDERS_MOCK.map((h) => (
                    <option key={h.asset_holder_id} value={h.asset_holder_id}>
                      {h.full_name} ({h.employee_code}) - {h.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 3. Ngày tháng */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="assignment_date" className="block text-sm font-medium text-gray-700">
                  Ngày cấp phát <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="assignment_date"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                    value={formData.assignment_date}
                    onChange={(e) => setFormData({...formData, assignment_date: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="return_date" className="block text-sm font-medium text-gray-700">
                  Ngày trả dự kiến (Tùy chọn)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="return_date"
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                    value={formData.return_date}
                    onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 4. Ghi chú (Optional - UI only or Map to Activity Logs) */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Ghi chú / Lý do cấp phát
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  rows={3}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                  placeholder="Ví dụ: Cấp phát cho nhân viên mới..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
              >
                <X size={18} /> Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2"
              >
                <Save size={18} /> Xác nhận cấp phát
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}