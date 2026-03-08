import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api/client';
import { useAuthStore } from '../store/authStore';

interface LoginResponse {
  accessToken: string;
  customer: { id: number; name: string; homeNo: string | null; shopId: number };
}

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [shopId, setShopId] = useState('');
  const [homeNo, setHomeNo] = useState('');
  const [telNo, setTelNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiPost<LoginResponse>(
        `/shops/${shopId}/verisiye/portal/login`,
        { homeNo, telNo },
      );
      setAuth(res.accessToken, res.customer, Number(shopId));
      navigate('/account');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Giriş başarısız. Bilgileri kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">Verisiye Takip</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Hesabınıza giriş yapın</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dükkan No</label>
            <input
              type="number"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              required
              placeholder="Dükkan numaranızı girin"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ev No (Kullanıcı Adı)</label>
            <input
              type="text"
              value={homeNo}
              onChange={(e) => setHomeNo(e.target.value)}
              required
              placeholder="Ev numaranızı girin"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon No (Şifre)</label>
            <input
              type="tel"
              value={telNo}
              onChange={(e) => setTelNo(e.target.value)}
              required
              placeholder="Telefon numaranızı girin"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
