import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { isLockedOut, recordFailedAttempt, resetRateLimit, loadAuth } from '../lib/auth';
import { authenticateUser } from '../lib/db';
export function AdminLogin() {
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [lockStatus, setLockStatus] = useState({ locked: false, secondsLeft: 0 });
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (loadAuth()) navigate('/admin/dashboard');
  }, [navigate]);

  // Countdown timer when locked out
  useEffect(() => {
    if (!lockStatus.locked) return;
    const interval = setInterval(() => {
      const status = isLockedOut();
      setLockStatus(status);
      if (!status.locked) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockStatus.locked]);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const lockCheck = isLockedOut();
    if (lockCheck.locked) {
      setLockStatus(lockCheck);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await authenticateUser(username, password);
      if (user) {
        resetRateLimit();
        navigate('/admin/dashboard');
      } else {
        const newState = recordFailedAttempt();
        if (newState.lockedUntil) {
          setLockStatus({ locked: true, secondsLeft: 30 });
          setError(`Demasiados intentos fallidos. Bloqueado por 30 segundos.`);
        } else {
          const remaining = 5 - newState.attempts;
          setError(`Credenciales inválidas. ${remaining} intento${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''}.`);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md p-8 bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-18 h-18 mx-auto mb-5 relative"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="w-18 h-18 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10 w-16 h-16 mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.div>
          <h2 className="text-2xl font-bold tracking-tight">Panel de Administración</h2>
          <p className="text-muted-foreground mt-1.5 text-sm">Ingresá tus credenciales para continuar</p>
        </div>

        {/* Error / Lockout alert */}
        <AnimatePresence>
          {(error || lockStatus.locked) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-5 overflow-hidden"
            >
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-600 text-sm font-medium">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  {lockStatus.locked
                    ? `Acceso bloqueado. Intentá nuevamente en ${lockStatus.secondsLeft}s.`
                    : error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Nombre de Usuario</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={lockStatus.locked}
                className="w-full pl-11 pr-4 py-3 bg-background border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="ej: superadmin"
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                id="admin-password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={lockStatus.locked}
                className="w-full pl-11 pr-12 py-3 bg-background border border-border/60 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || lockStatus.locked}
            className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block"
                />
                Verificando...
              </>
            ) : lockStatus.locked ? (
              `Bloqueado (${lockStatus.secondsLeft}s)`
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
