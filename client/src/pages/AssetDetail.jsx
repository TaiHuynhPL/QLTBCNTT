import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, FileText, Wrench, History, 
  UserCheck, ShieldCheck, MapPin, Box , Server, User
} from 'lucide-react';
import { ASSETS_MOCK, ASSIGNMENT_HISTORY_MOCK, MAINTENANCE_LOGS_MOCK } from './data/mockSchemaData';


export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const asset = ASSETS_MOCK.find(a => String(a.asset_id) === String(id));
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments', 'maintenance'

  if (!asset) {
    return (
      <div className="p-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
          <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
        </button>
        <div className="text-xl text-red-500">Không tìm thấy tài sản.</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
      </button>

      {/* Header Info */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{asset.asset_tag}</h1>
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-semibold border border-green-200">
                {asset.current_status}
              </span>
            </div>
            <p className="text-gray-500 flex items-center gap-2">
              <Box size={16} /> {asset.asset_model.manufacturer} {asset.asset_model.model_name}
              <span className="text-gray-300">|</span>
              <span className="font-mono text-gray-600">{asset.serial_number}</span>
            </p>
          </div>
          <div className="text-right">
             <p className="text-sm text-gray-500">Giá trị tài sản</p>
             <p className="text-2xl font-bold text-indigo-600">{new Intl.NumberFormat('vi-VN').format(asset.purchase_cost)} ₫</p>
          </div>
        {/* Thêm vào bên phải Header hoặc khu vực Actions trong AssetDetail */}
        {asset.current_status === 'In Stock' && (
          <button 
            onClick={() => navigate(`/assignments/new?assetId=${asset.asset_id}`)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <UserCheck size={18} /> Cấp phát ngay
          </button>
        )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Properties & JSONB Specs */}
        <div className="lg:col-span-1 space-y-6">
          {/* General Info Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-500"/> Thông tin chung
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Nhà cung cấp</span>
                <span className="font-medium text-gray-900 text-sm">{asset.supplier.supplier_name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Ngày mua</span>
                <span className="font-medium text-gray-900 text-sm">{asset.purchase_date}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Bảo hành (Tháng)</span>
                <span className="font-medium text-gray-900 text-sm flex items-center gap-1">
                  <ShieldCheck size={14} className="text-green-500"/> {asset.warranty_months}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-gray-500 text-sm">Vị trí hiện tại</span>
                <span className="font-medium text-gray-900 text-sm flex items-center gap-1 text-right">
                  <MapPin size={14} className="text-red-500"/> {asset.location.location_name}
                </span>
              </div>
            </div>
          </div>

          {/* JSONB Specifications Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Server size={20} className="text-indigo-500"/> Cấu hình (JSONB)
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Render dynamic keys from JSONB object */}
              {Object.entries(asset.asset_model.specifications).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2 mb-2 last:mb-0">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide col-span-1">{key}</span>
                  <span className="text-sm text-gray-800 col-span-2 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Logs (Assignments & Maintenance) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-gray-200 min-h-[500px]">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('assignments')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <History size={18}/> Lịch sử luân chuyển (Assignments)
              </button>
              <button 
                onClick={() => setActiveTab('maintenance')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2
                  ${activeTab === 'maintenance' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Wrench size={18}/> Nhật ký bảo trì (Maintenance Logs)
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6">
              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  {ASSIGNMENT_HISTORY_MOCK.map((log) => (
                    <div key={log.assignment_id} className="flex gap-4 relative">
                      {/* Timeline line */}
                      <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-200 last:hidden"></div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10
                        ${log.return_date ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-600'}`}>
                        <UserCheck size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">{log.asset_holder.full_name}</p>
                            <p className="text-xs text-gray-500">{log.asset_holder.department}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded border 
                            ${!log.return_date ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                            {!log.return_date ? 'Đang sử dụng' : 'Đã hoàn trả'}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 grid grid-cols-2 gap-4">
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
                <div className="space-y-4">
                  {MAINTENANCE_LOGS_MOCK.map((log) => (
                    <div key={log.maintenance_log_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <Calendar size={16} className="text-gray-400"/>
                           <span className="font-medium text-gray-900">{log.maintenance_date}</span>
                        </div>
                        <span className="font-bold text-red-600">
                           -{new Intl.NumberFormat('vi-VN').format(log.maintenance_cost)} ₫
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{log.description}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 w-fit px-2 py-1 rounded">
                        <User size={12}/> Kỹ thuật viên: {log.technician.full_name} ({log.technician.employee_code})
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