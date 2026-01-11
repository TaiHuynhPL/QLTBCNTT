import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { showToast } from '../utils/toast';

const ConsumableAlertList = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/consumable-stock/alert/low-stock');
      if (response.data.success) {
        setAlerts(response.data.data.alerts);
      }
    } catch (error) {
      console.error('Fetch alerts error:', error);
      showToast('Lỗi khi tải dữ liệu cảnh báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAlerts();
    showToast('Cập nhật dữ liệu thành công', 'success');
  };

  const getSeverity = (quantity, minQuantity) => {
    if (quantity === 0) return 'critical';
    if (quantity <= minQuantity / 2) return 'high';
    return 'medium';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'critical':
        return 'Nguy hiểm';
      case 'high':
        return 'Cảnh báo';
      default:
        return 'Chú ý';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">
          <RefreshCw size={32} className="animate-spin mx-auto mb-2" />
          <p>Đang tải dữ liệu cảnh báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Cảnh báo tồn kho thấp</h2>
          <p className="text-sm text-gray-600 mt-1">
            Những sản phẩm có số lượng tồn kho thấp hơn mức tối thiểu
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <RefreshCw size={18} /> Làm mới
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-green-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-1">Tất cả đều ổn!</h3>
          <p className="text-green-700">Không có cảnh báo tồn kho thấp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => {
            const severity = getSeverity(alert.quantity, alert.min_quantity);
            const bgColor = getSeverityColor(severity);
            const badgeColor = getSeverityBadgeColor(severity);
            const label = getSeverityLabel(severity);

            return (
              <div key={alert.consumable_stock_id} className={`border rounded-lg p-5 ${bgColor}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-base font-semibold text-gray-900">
                        {alert.consumableModel?.consumable_model_name || 'N/A'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                        {label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Vị trí</p>
                        <p className="font-medium text-gray-900">
                          {alert.location?.location_name || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-white bg-opacity-60 rounded px-3 py-2">
                        <p className="text-xs text-gray-600 mb-1">Tồn kho hiện tại</p>
                        <p className="text-2xl font-bold text-gray-900">{alert.quantity}</p>
                      </div>
                      <div className="bg-white bg-opacity-60 rounded px-3 py-2">
                        <p className="text-xs text-gray-600 mb-1">Mức tối thiểu</p>
                        <p className="text-2xl font-bold text-gray-900">{alert.min_quantity}</p>
                      </div>
                      <div className="bg-white bg-opacity-60 rounded px-3 py-2">
                        <p className="text-xs text-gray-600 mb-1">Thiếu hụt</p>
                        <p className="text-2xl font-bold text-red-600">
                          {Math.max(0, alert.min_quantity - alert.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold">Tổng cộng {alerts.length} cảnh báo</p>
            <p className="mt-1">
              Vui lòng kiểm tra và nhập hàng để duy trì mức tồn kho phù hợp
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumableAlertList;
