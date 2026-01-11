import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Package, Zap,
  AlertCircle, Save, Send, Check, X, Truck, Lock
} from 'lucide-react';
import axios from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { PermissionGate } from '../components/RoleGate';
import { successToast, errorToast } from '../utils/toast';

const POStatusBadge = ({ status }) => {
  const styles = {
    'Draft': 'bg-gray-100 text-gray-800',
    'Pending Approval': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-blue-100 text-blue-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-gray-200 text-gray-500 line-through',
  };
  const labels = {
    'Draft': 'Nháp',
    'Pending Approval': 'Chờ duyệt',
    'Approved': 'Đã duyệt',
    'Rejected': 'Từ chối',
    'Completed': 'Hoàn thành',
    'Cancelled': 'Hủy',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
      {labels[status] || status}
    </span>
  );
};

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [stockInResult, setStockInResult] = useState(null);

  useEffect(() => {
    const fetchPO = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/purchase-orders/${id}`);
        setPo(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Không thể tải đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchPO();
    // eslint-disable-next-line
  }, [id]);

  const handleQuickAction = async (newStatus) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await axios.put(`/purchase-orders/${id}`, {
        status: newStatus,
        notes: ''
      });

      setPo(res.data.data);
      
      if (res.data.stockInResult) {
        setStockInResult(res.data.stockInResult);
      }
      successToast('Cập nhật thành công!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Không thể cập nhật trạng thái';
      setError(errorMsg);
      errorToast(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Đang tải dữ liệu...</p>
    </div>
  );

  if (error || !po) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error || 'Không tìm thấy đơn hàng'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate('/purchase-orders')}
            className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={22} className="mr-2" /> Quay lại
          </button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-gray-900">{po.order_code}</h1>
            <p className="text-gray-500 text-sm mt-1">Mã đơn hàng</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-6 border-b pb-3 text-lg">Thông tin chung</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Mã đơn hàng</p>
                  <p className="text-lg font-bold text-indigo-600">{po.order_code}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nhà cung cấp</p>
                  <p className="text-lg font-semibold text-gray-800">{po.supplier?.supplier_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt hàng</p>
                  <p className="text-lg font-semibold text-gray-800">{po.order_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người tạo</p>
                  <p className="text-lg font-semibold text-gray-800">{po.createdBy?.username}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                  <p className="text-gray-700">{po.notes || '(Không có ghi chú)'}</p>
                </div>
              </div>
            </div>

            {/* Detail Orders */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-6 border-b pb-3 text-lg">Chi tiết sản phẩm</h3>
              <div className="space-y-4">
                {po.detailOrders && po.detailOrders.map((detail, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:border-indigo-200 transition">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-lg">
                        {detail.assetModel ? (
                          <Package className="text-indigo-600" size={24} />
                        ) : (
                          <Zap className="text-amber-600" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {detail.assetModel?.model_name || detail.consumableModel?.consumable_model_name}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {detail.assetModel ? 'Tài sản' : 'Vật tư tiêu hao'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-indigo-600 text-lg">
                              {new Intl.NumberFormat('vi-VN').format(detail.total_price)} ₫
                            </p>
                            <p className="text-sm text-gray-500">Thành tiền</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Số lượng</p>
                            <p className="text-lg font-semibold text-gray-900">{detail.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Đơn giá</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {new Intl.NumberFormat('vi-VN').format(detail.unit_price)} ₫
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock-In Result */}
            {stockInResult && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-600" size={28} />
                  <h3 className="font-semibold text-green-900 text-lg">Nhập kho thành công</h3>
                </div>
                
                {stockInResult.assetsCreated && stockInResult.assetsCreated.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">Tài sản được tạo:</h4>
                    <div className="space-y-2">
                      {stockInResult.assetsCreated.map((asset, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-green-100">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{asset.assetTag}</span> - {asset.assetModel}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {stockInResult.consumablesUpdated && stockInResult.consumablesUpdated.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-800 mb-3">Vật tư được cập nhật:</h4>
                    <div className="space-y-2">
                      {stockInResult.consumablesUpdated.map((consumable, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-green-100">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">{consumable.consumableModelName}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Tồn kho: {consumable.oldQuantity} → {consumable.newQuantity} (+ {consumable.addedQuantity})
                            {consumable.isNew && <span className="ml-2 text-green-600 font-semibold">(Mới)</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Status Update */}
          <div className="lg:col-span-2">
            {/* Total Amount */}
            <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white p-8 rounded-2xl shadow-md mb-6">
              <p className="text-sm opacity-90 mb-2">Tổng giá trị đơn hàng</p>
              <p className="text-3xl font-bold">{new Intl.NumberFormat('vi-VN').format(po.total_amount)} ₫</p>
            </div>

            {/* Status Section */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Trạng thái hiện tại</p>
                <POStatusBadge status={po.status} />
              </div>

              {/* Quick Action Buttons based on status */}
              <div className="border-t pt-6 space-y-3">
                {po.status === 'Draft' && (
                  <>
                    {hasPermission('submitPO') ? (
                      <button
                        onClick={() => handleQuickAction('Pending Approval')}
                        disabled={updating}
                        className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition"
                      >
                        <Send size={18} /> Gửi duyệt
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Lock size={18} /> Bạn không có quyền gửi duyệt
                      </div>
                    )}
                  </>
                )}

                {po.status === 'Pending Approval' && (
                  <div className="space-y-3">
                    {hasPermission('approvePO') ? (
                      <>
                        <button
                          onClick={() => handleQuickAction('Approved')}
                          disabled={updating}
                          className="w-full bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition"
                        >
                          <Check size={18} /> Phê duyệt
                        </button>
                        <button
                          onClick={() => handleQuickAction('Rejected')}
                          disabled={updating}
                          className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition"
                        >
                          <X size={18} /> Từ chối
                        </button>
                      </>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Lock size={18} /> Bạn không có quyền phê duyệt / từ chối
                      </div>
                    )}
                  </div>
                )}

                {po.status === 'Approved' && (
                  <>
                    {hasPermission('stockInPO') ? (
                      <button
                        onClick={() => handleQuickAction('Completed')}
                        disabled={updating}
                        className="w-full bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition"
                      >
                        <Truck size={18} /> Nhập kho
                      </button>
                    ) : (
                      <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                        <Lock size={18} /> Bạn không có quyền nhập kho
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    <ul className="text-xs space-y-1 list-disc list-inside">
                      <li>Mỗi tài sản sẽ được gán mã tag duy nhất</li>
                      <li>Vật tư sẽ được thêm vào kho hàng</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
