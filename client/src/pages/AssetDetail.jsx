import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, FileText, Wrench, History,
  UserCheck, ShieldCheck, MapPin, Box, Server, User
} from 'lucide-react';
import axios from '../api/axiosClient';

// Component hiển thị Badge trạng thái dựa trên enum check trong DB
const StatusBadge = ({ status }) => {
  const styles = {
    'Deployed': 'bg-green-100 text-green-800 border-green-200',
    'In Stock': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Repair': 'bg-orange-100 text-orange-800 border-orange-200',
    'Retired': 'bg-gray-100 text-gray-800 border-gray-200',
  };
  // Mapping tiếng Việt hiển thị
  const labels = {
    'Deployed': 'Đang cấp phát',
    'In Stock': 'Trong kho',
    'In Repair': 'Đang sửa chữa',
    'Retired': 'Thanh lý/Hủy'
  };
  return (
    <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full border ${styles[status]}`}>
      {labels[status] || status}
    </span>
  );
};

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments', 'maintenance'
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      axios.get(`/assets/${id}`),
      axios.get(`/assignments/asset/${id}`),
      axios.get(`/maintenance/asset/${id}`)
    ])
      .then(([assetRes, assignmentRes, maintenanceRes]) => {
        setAsset(assetRes.data.data);
        setAssignmentHistory(assignmentRes.data.data);
        setMaintenanceLogs(maintenanceRes.data.data);
      })
      .catch((err) => {
        setError('Không tìm thấy tài sản.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Example POST/PUT/DELETE handlers (implement UI as needed)
  // Assignment handlers
  const handleAddAssignment = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('/assignments', data);
      // Nếu API trả về assignment mới, thêm vào luôn, tránh GET lại
      if (res.data.data) {
        setAssignmentHistory((prev) => [res.data.data, ...prev]);
      } else {
        // fallback: refresh assignmentHistory
        const getRes = await axios.get(`/assignments/asset/${id}`);
        setAssignmentHistory(getRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi khi thêm cấp phát.');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateAssignment = async (assignmentId, data) => {
    setLoading(true);
    try {
      const res = await axios.put(`/assignments/${assignmentId}`, data);
      if (res.data.data) {
        setAssignmentHistory((prev) => prev.map(a => a.assignment_id === assignmentId ? res.data.data : a));
      } else {
        const getRes = await axios.get(`/assignments/asset/${id}`);
        setAssignmentHistory(getRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi khi cập nhật cấp phát.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAssignment = async (assignmentId) => {
    setLoading(true);
    try {
      await axios.delete(`/assignments/${assignmentId}`);
      setAssignmentHistory((prev) => prev.filter(a => a.assignment_id !== assignmentId));
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi khi xóa cấp phát.');
    } finally {
      setLoading(false);
    }
  };
  // Maintenance log handlers
  const handleAddMaintenanceLog = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post('/maintenance', data);
      if (res.data) {
        setMaintenanceLogs((prev) => [res.data, ...prev]);
      } else {
        const getRes = await axios.get(`/maintenance/asset/${id}`);
        setMaintenanceLogs(getRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi khi thêm bảo trì.');
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateMaintenanceLog = async (logId, data) => {
    setLoading(true);
    try {
      const res = await axios.put(`/maintenance/${logId}`, data);
      if (res.data) {
        setMaintenanceLogs((prev) => prev.map(l => l.maintenance_log_id === logId ? res.data : l));
      } else {
        const getRes = await axios.get(`/maintenance/asset/${id}`);
        setMaintenanceLogs(getRes.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi khi cập nhật bảo trì.');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteMaintenanceLog = async (logId) => {
    setLoading(true);
    try {
      await axios.delete(`/maintenance/${logId}`);
      setMaintenanceLogs((prev) => prev.filter(l => l.maintenance_log_id !== logId));
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi khi xóa bảo trì.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white animate-pulse">
        <span className="text-lg text-gray-500 font-medium">Đang tải dữ liệu...</span>
      </div>
    );
  }
  if (error || !asset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-cyan-50 to-white">
        <div className="text-center">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium mx-auto">
            <ArrowLeft size={22} className="mr-2" /> Quay lại danh sách
          </button>
          <div className="text-2xl text-red-500 font-semibold">{error || 'Không tìm thấy tài sản.'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 md:px-8 font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors font-medium">
        <ArrowLeft size={22} className="mr-2" /> Quay lại danh sách
      </button>
      {/* Header Info */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow">{asset.asset_tag}</h1>
              <StatusBadge status={asset.current_status} />
            </div>
            <p className="text-gray-500 flex items-center gap-2 text-lg">
              <Box size={18} /> {asset.assetModel.manufacturer} {asset.assetModel.model_name}
              <span className="text-gray-300">|</span>
              <span className="font-mono text-gray-600">{asset.serial_number}</span>
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Giá trị tài sản</p>
            <p className="text-3xl font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN').format(asset.purchase_cost)} ₫</p>
          </div>
          {asset.current_status === 'In Stock' && (
            <button
              onClick={() => navigate(`/assignments/new?assetId=${asset.asset_id}`)}
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white px-6 py-2 rounded-xl font-medium hover:from-indigo-600 hover:to-cyan-600 transition flex items-center gap-2 shadow"
            >
              <UserCheck size={20} /> Cấp phát ngay
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Properties & JSONB Specs */}
        <div className="lg:col-span-1 space-y-8">
          {/* General Info Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FileText size={22} className="text-indigo-500" /> Thông tin chung
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-base">Nhà cung cấp</span>
                <span className="font-medium text-gray-900 text-base">
                  {asset.supplier ? asset.supplier.supplier_name : 'Không xác định'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-base">Ngày mua</span>
                <span className="font-medium text-gray-900 text-base">{asset.purchase_date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-base">Bảo hành (Tháng)</span>
                <span className="font-medium text-gray-900 text-base flex items-center gap-1">
                  <ShieldCheck size={16} className="text-green-500" /> {asset.warranty_months}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500 text-base">Vị trí hiện tại</span>
                <span className="font-medium text-gray-900 text-base flex items-center gap-1 text-right">
                  <MapPin size={16} className="text-red-500" /> {asset.location.location_name}
                </span>
              </div>
            </div>
          </div>
          {/* JSONB Specifications Card */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Server size={22} className="text-indigo-500" /> Cấu hình
            </h3>
            <div className="bg-cyan-50 rounded-xl p-5 border border-cyan-100">
              {/* Render dynamic keys from JSONB object */}
              {Object.entries(asset.assetModel.specifications).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2 mb-2 last:mb-0">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide col-span-1">{key}</span>
                  <span className="text-base text-gray-800 col-span-2 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right Column: Logs (Assignments & Maintenance) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('assignments')}
                className={`px-8 py-4 text-base font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <History size={20} /> Lịch sử luân chuyển (Assignments)
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`px-8 py-4 text-base font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === 'maintenance' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Wrench size={20} /> Nhật ký bảo trì (Maintenance Logs)
              </button>
            </div>
            {/* Content Area */}
            <div className="p-8">
              {activeTab === 'assignments' && (
                <div className="space-y-8">
                  {assignmentHistory.map((log) => (
                    <div key={log.assignment_id} className="flex gap-6 relative">
                      {/* Timeline line */}
                      <div className="absolute left-[23px] top-12 bottom-[-32px] w-0.5 bg-gray-200 last:hidden"></div>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10
                        ${log.return_date ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                        <UserCheck size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{log.assetHolder?.full_name || log.asset_holder?.full_name || ''}</p>
                            <p className="text-sm text-gray-500">{log.assetHolder?.department || log.asset_holder?.department || ''}</p>
                          </div>
                          <span className={`text-sm px-3 py-1 rounded border 
                            ${!log.return_date ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            {!log.return_date ? 'Đang sử dụng' : 'Đã hoàn trả'}
                          </span>
                        </div>
                        <div className="mt-3 text-base text-gray-600 bg-cyan-50 p-4 rounded-xl border border-cyan-100 grid grid-cols-2 gap-6">
                          <div>
                            <span className="block text-xs text-gray-400">Ngày nhận</span>
                            <span className="font-medium">{log.assignment_date}</span>
                          </div>
                          {log.return_date && (
                            <div>
                              <span className="block text-xs text-gray-400">Ngày trả</span>
                              <span className="font-medium">{log.return_date}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  {maintenanceLogs.map((log) => (
                    <div key={log.maintenance_log_id} className="border border-cyan-100 rounded-xl p-6 hover:shadow-md transition-shadow bg-cyan-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <Calendar size={18} className="text-cyan-500" />
                          <span className="font-medium text-gray-900 text-lg">{log.maintenance_date}</span>
                        </div>
                        <span className="font-bold text-red-600 text-lg">
                          -{new Intl.NumberFormat('vi-VN').format(log.maintenance_cost)} ₫
                        </span>
                      </div>
                      <p className="text-gray-700 text-base mb-4">{log.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 bg-white w-fit px-3 py-1 rounded-lg border border-cyan-100">
                        <User size={14} /> Kỹ thuật viên: {log.technician?.full_name || ''} {log.technician?.employee_code ? `(${log.technician.employee_code})` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}