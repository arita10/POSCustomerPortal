import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface SaleItem {
  productName: string;
  unitName: string;
  quantity: string;
  priceAtSale: string;
  lineTotal: string;
}

interface Sale {
  id: number;
  totalAmount: string;
  createdAt: string;
  recordedBy: string;
  items: SaleItem[];
}

interface Payment {
  id: number;
  amount: string;
  note: string | null;
  paymentDate: string;
  recordedBy: string;
}

interface PortalData {
  customer: {
    id: number;
    name: string;
    balance: string;
  };
  sales: Sale[];
  payments: Payment[];
}

export function MyAccountPage() {
  const navigate = useNavigate();
  const { customer, shopId, logout } = useAuthStore();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSale, setExpandedSale] = useState<number | null>(null);

  useEffect(() => {
    if (!shopId) { navigate('/login'); return; }
    apiGet<PortalData>(`/shops/${shopId}/verisiye/portal/me`)
      .then(setData)
      .catch((err) => {
        if (err?.response?.status === 401) { logout(); navigate('/login'); }
        else setError('Veriler yüklenemedi.');
      })
      .finally(() => setLoading(false));
  }, [shopId, navigate, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3">{error}</div>
      </div>
    );
  }

  const balance = parseFloat(data?.customer.balance ?? '0');
  const isOpen = balance > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-800">{customer?.name}</h1>
          <p className="text-xs text-gray-500">Ev No: {customer?.homeNo}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Çıkış
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Balance card */}
        <div className={`rounded-2xl p-5 text-white ${isOpen ? 'bg-red-500' : 'bg-green-500'}`}>
          <p className="text-sm opacity-80 mb-1">Açık Bakiye</p>
          <p className="text-3xl font-bold">{balance.toFixed(2)} ₺</p>
          <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${isOpen ? 'bg-red-400' : 'bg-green-400'}`}>
            {isOpen ? 'Açık Hesap' : 'Kapalı'}
          </span>
        </div>

        {/* Verisiye sales */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-700">Alışverişlerim</h2>
          </div>
          {data?.sales.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Henüz verisiye alışveriş yok.</p>
          ) : (
            <div className="divide-y">
              {data?.sales.map((sale) => (
                <div key={sale.id}>
                  <button
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                    onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(sale.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">{sale.items.length} kalem</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{parseFloat(sale.totalAmount).toFixed(2)} ₺</p>
                      <p className="text-xs text-gray-400">{expandedSale === sale.id ? '▲' : '▼'}</p>
                    </div>
                  </button>
                  {expandedSale === sale.id && (
                    <div className="bg-gray-50 px-4 pb-3">
                      <table className="w-full text-xs text-gray-600">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-1">Ürün</th>
                            <th className="text-right py-1">Miktar</th>
                            <th className="text-right py-1">Fiyat</th>
                            <th className="text-right py-1">Tutar</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sale.items.map((item, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-1">{item.productName}</td>
                              <td className="text-right">{item.quantity} {item.unitName}</td>
                              <td className="text-right">{parseFloat(item.priceAtSale).toFixed(2)} ₺</td>
                              <td className="text-right font-medium">{parseFloat(item.lineTotal).toFixed(2)} ₺</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-700">Ödemelerim</h2>
          </div>
          {data?.payments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">Henüz ödeme kaydı yok.</p>
          ) : (
            <div className="divide-y">
              {data?.payments.map((p) => (
                <div key={p.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(p.paymentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {p.note && <p className="text-xs text-gray-500">{p.note}</p>}
                  </div>
                  <p className="font-semibold text-green-600">+{parseFloat(p.amount).toFixed(2)} ₺</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
