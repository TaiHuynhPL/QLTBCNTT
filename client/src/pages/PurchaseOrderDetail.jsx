import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, XCircle, Truck, Package, 
  Printer, FileText, AlertTriangle 
} from 'lucide-react';
import { PO_MOCK } from './data/mockPurchaseData';

const POStatusBadge = ({ status }) => {
  /* (Giữ nguyên code Badge như ở List component) */
  const styles = { 'Draft': 'bg-gray-100', 'Pending Approval': 'bg-yellow-100 text-yellow-800', 'Approved': 'bg-blue-100 text-blue-800', 'Completed': 'bg-green-100 text-green-800', 'Cancelled': 'line-through bg-gray-200' };
  return <span className={`px-3 py-1 rounded-full text-sm font-bold ${styles[status]}`}>{status}</span>;
};

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Giả lập lấy data và state
  const [po, setPo] = useState(PO_MOCK.find(p => String(p.purchase_order_id) === String(id)) || PO_MOCK[0]);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // --- ACTIONS WORKFLOW ---
  
  const handleApprove = () => {
    if(window.confirm('Bạn xác nhận DUYỆT đơn hàng này?')) {
      setPo({ ...po, status: 'Approved' });
    }
  };

  const handleReject = () => {
    if(window.confirm('Bạn muốn TỪ CHỐI đơn hàng này?')) {
      setPo({ ...po, status: 'Rejected' });
    }
  };

  // Logic Nhập kho giả lập
  const handleStockIn = () => {
    // Trong thực tế: Đoạn này sẽ insert vào bảng assets (với serial number) và consumable_stocks
    // Đồng thời update trạng thái PO thành Completed
    setPo({ ...po, status: 'Completed' });
    setShowReceiveModal(false);
    alert('Đã nhập kho thành công! Tài sản đã được tạo trong hệ thống.');
  };

  if (!po) return <div>Không tìm thấy đơn hàng</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      {/* Header Navigation */}
      <div className="flex justify-between items-start mb-6">
        <button onClick={() => navigate('/purchase-orders')} className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Danh sách PO
        </button>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-2 rounded text-gray-700 hover:bg-gray-50">
            <Printer size={16}/> In phiếu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Thông tin chính */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{po.order_code}</h1>
                <p className="text-gray-500 text-sm mt-1">Ngày tạo: {po.order_date}</p>
              </div>
              <POStatusBadge status={po.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Nhà cung cấp</p>
                <p className="font-medium text-gray-900">{po.supplier.supplier_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Người tạo</p>
                <p className="font-medium text-gray-900">{po.created_by}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Ghi chú</p>
                <p className="text-gray-700 bg-gray-50 p-2 rounded mt-1 text-sm">{po.notes}</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-800 mb-3">Chi tiết vật tư</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 border-b">Tên sản phẩm</th>
                    <th className="px-4 py-2 border-b text-center">Loại</th>
                    <th className="px-4 py-2 border-b text-center">SL</th>
                    <th className="px-4 py-2 border-b text-right">Đơn giá</th>
                    <th className="px-4 py-2 border-b text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {po.details.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-4 py-2 font-medium">{item.model_name}</td>
                      <td className="px-4 py-2 text-center text-xs text-gray-500">{item.type}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{new Intl.NumberFormat('vi-VN').format(item.unit_price)}</td>
                      <td className="px-4 py-2 text-right font-medium">{new Intl.NumberFormat('vi-VN').format(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-right font-bold text-gray-700">Tổng thanh toán:</td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-600 text-lg">
                      {new Intl.NumberFormat('vi-VN').format(po.total_amount)} ₫
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Cột phải: Workflow Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-indigo-500"/> Quy trình xử lý
            </h3>

            {/* CASE 1: DRAFT */}
            {po.status === 'Draft' && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded border border-blue-100">
                  Đơn hàng đang ở trạng thái Nháp. Vui lòng kiểm tra kỹ trước khi gửi duyệt.
                </div>
                <button 
                  onClick={() => setPo({...po, status: 'Pending Approval'})}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700"
                >
                  Gửi duyệt (Submit)
                </button>
              </div>
            )}

            {/* CASE 2: PENDING APPROVAL (Giả sử User là Manager) */}
            {po.status === 'Pending Approval' && (
              <div className="space-y-3">
                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100 flex gap-2">
                  <AlertTriangle size={16} /> Cần phê duyệt từ Quản lý.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleReject} className="w-full border border-red-300 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50">
                    Từ chối
                  </button>
                  <button onClick={handleApprove} className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700">
                    Phê duyệt
                  </button>
                </div>
              </div>
            )}

            {/* CASE 3: APPROVED (Chờ nhập kho) */}
            {po.status === 'Approved' && (
              <div className="space-y-3">
                 <div className="p-3 bg-green-50 text-green-800 text-sm rounded border border-green-100 flex gap-2">
                  <CheckCircle size={16} /> Đơn hàng đã được duyệt. Sẵn sàng nhập kho.
                </div>
                <button 
                  onClick={() => setShowReceiveModal(true)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-md flex justify-center items-center gap-2"
                >
                  <Truck size={20} /> TIẾN HÀNH NHẬP KHO
                </button>
              </div>
            )}

            {/* CASE 4: COMPLETED */}
            {po.status === 'Completed' && (
              <div className="p-4 bg-gray-100 text-gray-600 text-center rounded-lg border border-gray-200">
                <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                <p className="font-medium">Đơn hàng đã hoàn tất</p>
                <p className="text-xs mt-1">Hàng hóa đã được thêm vào hệ thống kho.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL NHẬP KHO (SIMULATION) --- */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="text-indigo-600"/> Xác nhận Nhập kho
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Hệ thống sẽ tự động tạo bản ghi tài sản vào kho <b>"Kho Tổng"</b> dựa trên số lượng trong đơn hàng.
              <br/><br/>
              <i>Lưu ý: Trong thực tế, bước này bạn sẽ cần nhập/quét Serial Number cho từng thiết bị (Assets).</i>
            </p>
            
            <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
               <h4 className="font-semibold text-sm mb-2">Tóm tắt nhập:</h4>
               <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                 {po.details.map((d, i) => (
                   <li key={i}>
                     <b>{d.quantity}</b> x {d.model_name} 
                     <span className="text-xs bg-gray-200 ml-2 px-1 rounded">{d.type}</span>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowReceiveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleStockIn}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Xác nhận Nhập kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}