import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function LoginSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('ziji-token', token);
      window.location.href = '/#/dashboard';
      window.location.reload();
    } else {
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-discord border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-zinc-400 font-bold uppercase tracking-widest">Logging you in...</p>
      </div>
    </div>
  );
}
