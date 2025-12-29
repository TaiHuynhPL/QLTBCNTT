import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Save, X, Calendar, User, Search, 
  AlertCircle, CheckCircle, Package 
} from 'lucide-react';


import axios from '../api/axiosClient';

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

  // State cho dữ liệu từ API
  const [availableAssets, setAvailableAssets] = useState([]);
  const [assetsPage, setAssetsPage] = useState(1);
  const [assetsTotalPages, setAssetsTotalPages] = useState(1);
  const [assetsSearch, setAssetsSearch] = useState("");
  const [debouncedAssetsSearch, setDebouncedAssetsSearch] = useState("");
  const assetsSearchTimeout = useRef();
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [holders, setHolders] = useState([]);
  const [holdersPage, setHoldersPage] = useState(1);
  const [holdersTotalPages, setHoldersTotalPages] = useState(1);
  const [holdersSearch, setHoldersSearch] = useState("");
  const [debouncedHoldersSearch, setDebouncedHoldersSearch] = useState("");
  const holdersSearchTimeout = useRef();
  const [holdersLoading, setHoldersLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  // Debounce holdersSearch
  useEffect(() => {
    if (holdersSearchTimeout.current) clearTimeout(holdersSearchTimeout.current);
    holdersSearchTimeout.current = setTimeout(() => {
      setDebouncedHoldersSearch(holdersSearch);
    }, 300);
    return () => clearTimeout(holdersSearchTimeout.current);
  }, [holdersSearch]);

  // Fetch paginated holders with search, always include selected holder if not in page
  useEffect(() => {
    setHoldersLoading(true);
    axios.get('/holders', {
      params: {
        search: debouncedHoldersSearch || undefined,
        page: holdersPage,
        limit: 10
      }
    })
      .then(async (res) => {
        const { holders, totalPages } = res.data.data;
        let mergedHolders = holders;
        if (formData.asset_holder_id && !holders.find(h => String(h.asset_holder_id) === String(formData.asset_holder_id))) {
          try {
            const detail = await axios.get(`/holders/${formData.asset_holder_id}`);
            if (detail.data.success && detail.data.data) {
              mergedHolders = [detail.data.data, ...holders];
            }
          } catch {}
        }
        setHolders(mergedHolders);
        setHoldersTotalPages(totalPages);
      })
      .catch(err => {
        setHolders([]);
      })
      .finally(() => setHoldersLoading(false));
  }, [formData.asset_holder_id, holdersPage, debouncedHoldersSearch]);

  // Fetch paginated assets with search, always include selected asset if not in page
  // Debounce assetsSearch
  useEffect(() => {
    if (assetsSearchTimeout.current) clearTimeout(assetsSearchTimeout.current);
    assetsSearchTimeout.current = setTimeout(() => {
      setDebouncedAssetsSearch(assetsSearch);
    }, 300);
    return () => clearTimeout(assetsSearchTimeout.current);
  }, [assetsSearch]);

  useEffect(() => {
    setAssetsLoading(true);
    setLoading(true);
    axios.get('/assets', {
      params: {
        status: 'In Stock',
        search: debouncedAssetsSearch || undefined,
        page: assetsPage,
        limit: 10
      }
    })
      .then(async (assetsRes) => {
        const { assets, totalPages } = assetsRes.data.data;
        let mergedAssets = assets;
        if (formData.asset_id && !assets.find(a => String(a.asset_id) === String(formData.asset_id))) {
          try {
            const res = await axios.get(`/assets/${formData.asset_id}`);
            if (res.data.success && res.data.data) {
              mergedAssets = [res.data.data, ...assets];
            }
          } catch {}
        }
        setAvailableAssets(mergedAssets);
        setAssetsTotalPages(totalPages);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Không thể tải dữ liệu tài sản');
      })
      .finally(() => {
        setAssetsLoading(false);
        setLoading(false);
      });
  // eslint-disable-next-line
  }, [formData.asset_id, assetsPage, debouncedAssetsSearch]);

  const handleSubmit = async (e) => {
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

    // 3. Gửi API tạo assignment
    try {
      await axios.post('/assignments', {
        asset_id: parseInt(formData.asset_id),
        asset_holder_id: parseInt(formData.asset_holder_id),
        assignment_date: formData.assignment_date,
        return_date: formData.return_date || null,
        notes: formData.notes
      });
      setSuccess(true);
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi khi cấp phát tài sản!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 drop-shadow">Tạo phiếu cấp phát</h2>
        <p className="mt-2 text-center text-base text-gray-600">Gán tài sản cho nhân viên sử dụng</p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-10 px-6 shadow-md rounded-2xl border border-gray-100">
          {/* Success Message */}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl flex items-center gap-2 text-base">
              <CheckCircle size={22} />
              <span>Cấp phát thành công! Đang chuyển hướng...</span>
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center gap-2 text-base">
              <AlertCircle size={22} />
              <span>{error}</span>
            </div>
          )}
          {assetsLoading || holdersLoading || loading ? (
            <div className="text-center py-8 text-lg text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
          ) : (
          <form className="space-y-8" onSubmit={handleSubmit}>
            
            {/* 1. Chọn Tài sản (Asset) */}
            <div>
              <label htmlFor="asset" className="block text-base font-semibold text-gray-700 mb-1">
                Tài sản (Chỉ hiện thiết bị trong kho) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-cyan-500" />
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="border border-gray-200 px-3 py-2 rounded-lg w-full text-base focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    placeholder="Tìm kiếm thiết bị..."
                    value={assetsSearch}
                    onChange={e => { setAssetsSearch(e.target.value); setAssetsPage(1); }}
                  />
                  <button type="button" className="border border-gray-200 px-3 rounded-lg text-base hover:bg-cyan-50" onClick={() => { setAssetsSearch(""); setAssetsPage(1); }}>
                    <Search size={18} />
                  </button>
                </div>
                <select
                  id="asset"
                  className="focus:ring-cyan-400 focus:border-cyan-400 block w-full pl-10 text-base border-gray-200 rounded-lg py-3 bg-white border"
                  value={formData.asset_id}
                  onChange={(e) => setFormData({...formData, asset_id: e.target.value})}
                  disabled={success}
                >
                  <option value="">-- Chọn thiết bị --</option>
                  {availableAssets.map((asset) => (
                    <option key={asset.asset_id} value={asset.asset_id}>
                      {asset.asset_tag} - {asset.assetModel.model_name}
                    </option>
                  ))}
                </select>
                {/* Pagination for assets */}
                <div className="flex justify-between items-center mt-2 text-sm">
                  <button type="button" disabled={assetsPage <= 1} onClick={() => setAssetsPage(p => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50">Trước</button>
                  <span>Trang {assetsPage} / {assetsTotalPages}</span>
                  <button type="button" disabled={assetsPage >= assetsTotalPages} onClick={() => setAssetsPage(p => Math.min(assetsTotalPages, p + 1))} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50">Sau</button>
                </div>
              </div>
              {/* Hiển thị thông tin nhanh của thiết bị được chọn */}
              {formData.asset_id && (
                <div className="mt-2 text-sm text-gray-500 bg-cyan-50 p-3 rounded-lg">
                  {(() => {
                    const sel = availableAssets.find(a => String(a.asset_id) === String(formData.asset_id));
                    return sel ? `Serial: ${sel.serial_number} | Model: ${sel.assetModel.model_name}` : '';
                  })()}
                </div>
              )}
            </div>

            {/* 2. Chọn Người nhận (Holder) */}
            <div>
              <label htmlFor="holder" className="block text-base font-semibold text-gray-700 mb-1">
                Người nhận (Asset Holder) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-indigo-500" />
                </div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="border border-gray-200 px-3 py-2 rounded-lg w-full text-base focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                    placeholder="Tìm kiếm nhân viên..."
                    value={holdersSearch}
                    onChange={e => { setHoldersSearch(e.target.value); setHoldersPage(1); }}
                  />
                  <button type="button" className="border border-gray-200 px-3 rounded-lg text-base hover:bg-indigo-50" onClick={() => { setHoldersSearch(""); setHoldersPage(1); }}>
                    <Search size={18} />
                  </button>
                </div>
                <select
                  id="holder"
                  className="focus:ring-indigo-400 focus:border-indigo-400 block w-full pl-10 text-base border-gray-200 rounded-lg py-3 bg-white border"
                  value={formData.asset_holder_id}
                  onChange={(e) => setFormData({...formData, asset_holder_id: e.target.value})}
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {holders.map((h) => (
                    <option key={h.asset_holder_id} value={h.asset_holder_id}>
                      {h.full_name} ({h.employee_code}) - {h.department}
                    </option>
                  ))}
                </select>
                {/* Pagination for holders */}
                <div className="flex justify-between items-center mt-2 text-sm">
                  <button type="button" disabled={holdersPage <= 1} onClick={() => setHoldersPage(p => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50">Trước</button>
                  <span>Trang {holdersPage} / {holdersTotalPages}</span>
                  <button type="button" disabled={holdersPage >= holdersTotalPages} onClick={() => setHoldersPage(p => Math.min(holdersTotalPages, p + 1))} className="px-3 py-1 border border-gray-200 rounded-lg disabled:opacity-50">Sau</button>
                </div>
              </div>
            </div>

            {/* 3. Ngày tháng */}
            <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
              <div>
                <label htmlFor="assignment_date" className="block text-base font-semibold text-gray-700 mb-1">
                  Ngày cấp phát <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <input
                    type="date"
                    id="assignment_date"
                    className="focus:ring-indigo-400 focus:border-indigo-400 block w-full pl-10 text-base border-gray-200 rounded-lg py-3"
                    value={formData.assignment_date}
                    onChange={(e) => setFormData({...formData, assignment_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="return_date" className="block text-base font-semibold text-gray-700 mb-1">
                  Ngày trả dự kiến (Tùy chọn)
                </label>
                <div className="mt-1 relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-cyan-500" />
                  </div>
                  <input
                    type="date"
                    id="return_date"
                    className="focus:ring-cyan-400 focus:border-cyan-400 block w-full pl-10 text-base border-gray-200 rounded-lg py-3"
                    value={formData.return_date}
                    onChange={(e) => setFormData({...formData, return_date: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* 4. Ghi chú (Optional - UI only or Map to Activity Logs) */}
            <div>
              <label htmlFor="notes" className="block text-base font-semibold text-gray-700 mb-1">
                Ghi chú / Lý do cấp phát
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  rows={3}
                  className="shadow-sm focus:ring-cyan-400 focus:border-cyan-400 block w-full text-base border border-gray-200 rounded-lg p-3"
                  placeholder="Ví dụ: Cấp phát cho nhân viên mới..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 mt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-white py-2 px-5 border border-gray-200 rounded-lg shadow text-base font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 flex items-center gap-2"
              >
                <X size={20} /> Hủy bỏ
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-5 border border-transparent shadow text-base font-medium rounded-lg text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 flex items-center gap-2"
              >
                <Save size={20} /> Xác nhận cấp phát
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}