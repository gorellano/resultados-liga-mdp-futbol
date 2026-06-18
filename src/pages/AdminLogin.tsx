import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, AlertCircle } from 'lucide-react';

export function AdminLogin() {
  const [email, setEmail] = useState('superadmin@ligamdp.com');
  const [password, setPassword] = useState('supersecret123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock auth logic
    setTimeout(() => {
      if ((email === 'superadmin@ligamdp.com' && password === 'supersecret123') ||
          (email === 'editor@ligamdp.com' && password === 'editor123')) {
        const role = email.includes('superadmin') ? 'super_admin' : 'editor';
        localStorage.setItem('admin_auth', JSON.stringify({ email, role }));
        navigate('/admin/dashboard');
      } else {
        setError('Credenciales inválidas');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Panel de Administración</h2>
          <p className="text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-600 text-sm font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Correo Electrónico</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="admin@ligamdp.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-lg shadow-primary/25"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Cuentas de prueba:</p>
          <div className="mt-2 space-y-1">
            <p><span className="font-semibold text-foreground">Super Admin:</span> superadmin@ligamdp.com / supersecret123</p>
            <p><span className="font-semibold text-foreground">Editor:</span> editor@ligamdp.com / editor123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
