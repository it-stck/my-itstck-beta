import React, { useState, useEffect } from 'react';
import { Github, ShieldCheck, X, AlertCircle, Loader2, KeyRound, ExternalLink } from 'lucide-react';
import { AuthSession } from '../types';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setIsCheckingStatus(true);
    setErrorMsg('');

    fetch('/api/auth/status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsConfigured(Boolean(data.githubOAuthConfigured));
          setClientId(data.clientId || null);
        } else {
          setIsConfigured(false);
        }
      })
      .catch(() => {
        setIsConfigured(false);
      })
      .finally(() => {
        setIsCheckingStatus(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Build redirect_uri pointing to current origin (without query params)
      const redirectUri = window.location.origin;
      const res = await fetch(`/api/auth/github?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'No se pudo generar la URL de autorización de GitHub.');
      }

      // Redirect user to official GitHub OAuth authorization page
      // GitHub will require the user to sign in with password/2FA and authorize the app
      window.location.href = data.url;
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con GitHub OAuth.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F17]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center">
              <Github className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-display-syne text-base font-bold text-white">
                Iniciar sesión con GitHub
              </h2>
              <p className="text-[11px] text-slate-400">
                1 Cuenta de GitHub = 1 Perfil Verificado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Security Banner */}
          <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-white">Autenticación Oficial & Segura</p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Serás redirigido a <strong>GitHub.com</strong> para autenticarte con tu contraseña o doble factor (2FA). Solo el dueño legítimo de la cuenta de GitHub puede crear o modificar su perfil.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-700/60 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isCheckingStatus ? (
            <div className="py-8 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
              <span className="text-xs font-mono">Verificando configuración de GitHub OAuth...</span>
            </div>
          ) : isConfigured ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 font-mono flex items-center justify-between px-1">
                <span>OAuth Client ID:</span>
                <span className="text-slate-300 truncate max-w-[200px]">{clientId}</span>
              </div>

              <button
                type="button"
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-white/5 active:scale-[0.99] disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Redirigiendo a GitHub...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 text-slate-950" />
                    <span>Continuar a GitHub.com</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Warning if server has not configured GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <KeyRound className="w-4 h-4" />
                  <span>GitHub OAuth no configurado en el servidor</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  Para que nadie pueda suplantar la identidad de otro desarrollador, el inicio de sesión requiere las credenciales oficiales de tu <strong>GitHub OAuth App</strong> en el archivo <code>.env</code>.
                </p>
                <div className="bg-[#0B0F17]/80 p-2.5 rounded-lg border border-amber-800/40 font-mono text-[10px] text-slate-300 space-y-1">
                  <p className="text-slate-400"># Añade a tu archivo .env:</p>
                  <p className="text-emerald-400">GITHUB_CLIENT_ID="tu_client_id"</p>
                  <p className="text-emerald-400">GITHUB_CLIENT_SECRET="tu_client_secret"</p>
                </div>
              </div>

              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 text-center"
              >
                <span>Crear OAuth App en GitHub</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0B0F17] border-t border-slate-800/80 text-[11px] text-slate-500 font-mono text-center">
          Estricto control de propiedad · Criptográficamente verificado
        </div>
      </div>
    </div>
  );
};
