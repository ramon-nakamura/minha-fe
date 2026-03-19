import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { HandHeart, EyeOff, Eye, EyeOff as EyeOffIcon, Loader2, Heart, HeartHandshake } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LegalModal } from "@/components/LegalModal";


function CandleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 2C11 3.5 9.5 5.5 9.5 7.2C9.5 8.8 10.6 9.8 12 9.8C13.4 9.8 14.5 8.8 14.5 7.2C14.5 5.5 13 3.5 12 2Z" fill="currentColor" stroke="none" />
      <line x1="12" y1="9.8" x2="12" y2="11.5" />
      <rect x="8.5" y="11.5" width="7" height="10" rx="1" />
      <line x1="5" y1="21.5" x2="19" y2="21.5" />
    </svg>
  );
}

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export default function LandingPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleForgotPassword = async () => {
    setForgotError("");
    if (!forgotEmail) { setForgotError("Informe seu email"); return; }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setForgotSent(true);
    } catch (err: any) {
      setForgotError(err.message || "Erro ao enviar email");
    } finally {
      setForgotLoading(false);
    }
  };
  const queryClient = useQueryClient();

  const { data: previewMessages = [] } = useQuery<any[]>({
    queryKey: ["/api/messages/preview"],
    queryFn: async () => {
      const res = await fetch("/api/messages/preview");
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao fazer login");
      }
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName, email, password, consent: acceptedTerms }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar conta");
      }
      return res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      loginMutation.mutate();
    } else {
      registerMutation.mutate();
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <main className="min-h-screen flex flex-col" role="main">

      {/* Bloco hero: introdução + formulário */}
      <div className="relative flex-1 flex items-center justify-center min-h-screen overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-multiply"
          role="img"
          aria-label="Imagem de fundo decorativa"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80)' }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-50/80 via-white/60 to-white/90 backdrop-blur-md" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-16">
        
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-white/80 shadow-sm mb-8 text-sm font-medium text-primary">
              <CandleIcon className="w-4 h-4" />
              Bem-vindo ao Minha Fé
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Sua jornada de fé,<br />agora digital.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
              Um espaço celestial para compartilhar pedidos de oração, celebrar graças alcançadas e desabafar em total segurança e anonimato.
            </p>

            <div className="hidden md:flex flex-col gap-4 mt-8" aria-label="Recursos da plataforma">
              <h2 className="sr-only">O que você pode compartilhar</h2>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <CandleIcon className="w-5 h-5 text-amber-600" />
                </div>
                <span>Pedidos de Oração</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <HandHeart className="w-5 h-5 text-blue-600" />
                </div>
                <span>Graças Recebidas</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                  <EyeOff className="w-5 h-5 text-slate-600" />
                </div>
                <span>Confissões Anônimas</span>
              </div>
            </div>

            <div className="mt-6">
              <a
                href="/sobre"
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                Saiba mais sobre o Minha Fé →
              </a>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl shadow-black/10 p-8" role="region" aria-label="Acesso à plataforma">
              <div className="flex rounded-2xl bg-slate-100 p-1 mb-8">
                <button
                  data-testid="tab-login"
                  onClick={() => { setMode("login"); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === "login" 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entrar
                </button>
                <button
                  data-testid="tab-register"
                  onClick={() => { setMode("register"); setError(""); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    mode === "register" 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Cadastrar
                </button>
              </div>

              {error && (
                <div data-testid="text-error" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nome Completo</label>
                    <input
                      data-testid="input-fullname"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/20 transition-all outline-none text-sm"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
                  <input
                    data-testid="input-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/20 transition-all outline-none text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Senha</label>
                  <div className="relative">
                    <input
                      data-testid="input-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "register" ? "Mínimo 6 caracteres" : "Sua senha"}
                      required
                      minLength={mode === "register" ? 6 : 1}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/20 transition-all outline-none text-sm pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mode === "login" && (
                  <div className="text-right -mt-2">
                    <button
                      type="button"
                      onClick={() => { setShowForgot(true); setForgotEmail(email); setForgotSent(false); setForgotError(""); }}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                )}

                {mode === "register" && (
                  <label className="flex items-start gap-2.5 cursor-pointer select-none" data-testid="label-consent">
                    <input
                      data-testid="checkbox-consent"
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-black/20 text-primary focus:ring-primary/30 accent-primary"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      Li e aceito os{" "}
                      <button type="button" data-testid="link-terms" onClick={(e) => { e.preventDefault(); setLegalModal("terms"); }} className="text-primary font-semibold hover:underline">Termos de Uso</button>
                      {" "}e a{" "}
                      <button type="button" data-testid="link-privacy" onClick={(e) => { e.preventDefault(); setLegalModal("privacy"); }} className="text-primary font-semibold hover:underline">Política de Privacidade</button>.
                    </span>
                  </label>
                )}

                <button
                  data-testid="button-submit-auth"
                  type="submit"
                  disabled={isLoading || (mode === "register" && !acceptedTerms)}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {mode === "login" ? "Entrar" : "Criar Conta"}
                </button>

                {/* Divisor */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-xs text-slate-400 font-medium">ou</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Botão Google */}
                <a
                  href="/api/auth/google"
                  className="w-full py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </a>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                {mode === "login" ? (
                  <>Não tem conta? <button data-testid="link-switch-register" onClick={() => { setMode("register"); setError(""); }} className="text-primary font-bold hover:underline">Cadastre-se</button></>
                ) : (
                  <>Já tem conta? <button data-testid="link-switch-login" onClick={() => { setMode("login"); setError(""); }} className="text-primary font-bold hover:underline">Faça login</button></>
                )}
              </p>
            </div>
          </motion.div>
        </div>

      </div>
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />

      {/* Modal Esqueci Senha */}
      {showForgot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowForgot(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-50 text-slate-400"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>

            {forgotSent ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Email enviado!</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha em breve. Verifique também sua caixa de spam.
                </p>
                <button
                  onClick={() => setShowForgot(false)}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm mt-2"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Esqueceu sua senha?</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                    Informe seu email e enviaremos um link para você criar uma nova senha.
                  </p>
                </div>

                {forgotError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                    {forgotError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none text-sm"
                  />
                </div>

                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 transition-all"
                >
                  {forgotLoading ? (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/><path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  )}
                  Enviar instruções
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Preview de mensagens reais da comunidade */}
      {previewMessages.length > 0 && (
        <section className="w-full py-16 px-6" aria-label="Mensagens da comunidade">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-10"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Da nossa comunidade</p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Intenções que estão sendo levadas ao céu agora
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {previewMessages.map((message: any, idx: number) => {
                const isPrayer = message.type === "prayer";
                const isGrace = message.type === "grace";
                const isSin = message.type === "sin";
                const isSpecial = message.isSpecial;

                const actionLabel = (() => {
                  if (isPrayer) return message.likesCount === 0 ? "Orar" : `${message.likesCount} orando pela causa`;
                  if (isGrace) return message.likesCount === 0 ? "Amém" : `${message.likesCount} comemorando a graça`;
                  if (message.likesCount === 0) return "Perdoar";
                  return `${message.likesCount} ${message.likesCount === 1 ? "perdão recebido" : "perdões recebidos"}`;
                })();

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.5 + idx * 0.08 }}
                    className={cn(
                      "rounded-[2rem] p-6 relative overflow-hidden shadow-sm",
                      isSpecial ? "border-0" : "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                    )}
                  >
                    {/* Borda animada para especiais */}
                    {isSpecial && (
                      <>
                        <div className="absolute inset-0 rounded-[2rem] z-0 pointer-events-none"
                          style={{
                            padding: "1.5px",
                            background: "linear-gradient(var(--angle, 0deg), #f5e27a, #c8973a, #f0d060, #a87830, #f5e27a)",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                            animation: "spin-border 3s linear infinite",
                          }}
                        />
                        <div className="absolute inset-[1.5px] rounded-[calc(2rem-1.5px)] z-0 pointer-events-none"
                          style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fdf8e8 50%, #fffef7 100%)" }}
                        />
                        <style>{`@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false;}@keyframes spin-border{to{--angle:360deg;}}`}</style>
                      </>
                    )}

                    {/* Glow de fundo */}
                    <div className={cn(
                      "absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full pointer-events-none",
                      isPrayer && !isSpecial && "opacity-25 bg-amber-400",
                      isPrayer && isSpecial && "opacity-35 bg-yellow-300",
                      isGrace && "opacity-25 bg-blue-400",
                      isSin && "opacity-20 bg-slate-400"
                    )} />

                    {/* Header */}
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shadow-inner",
                            isPrayer && "bg-amber-100/80 text-amber-600",
                            isGrace && "bg-blue-100/80 text-blue-600",
                            isSin && "bg-slate-200/80 text-slate-600"
                          )}>
                            {isSin ? <EyeOff className="w-6 h-6" /> : isPrayer ? <CandleIcon className="w-6 h-6" /> : <HandHeart className="w-6 h-6" />}
                          </div>
                          {!isSin && (
                            <div className={cn(
                              "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm",
                              isPrayer && "bg-amber-100 text-amber-600",
                              isGrace && "bg-blue-100 text-blue-600"
                            )}>
                              {isPrayer ? <CandleIcon className="w-3 h-3" /> : <HandHeart className="w-3 h-3" />}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground/90">
                            {isSin ? "Anônimo" : message.authorName || "Caminhante da Fé"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ptBR })}
                            {!isSin && message.authorCity && (
                              <span className="before:content-['·'] before:mx-1">{message.authorCity}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border bg-white/50 border-white text-muted-foreground">
                        {isPrayer && (isSpecial ? "Oração Especial" : "Oração")}
                        {isGrace && "Graça"}
                        {isSin && "Confissão"}
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <p className="text-foreground/80 text-lg leading-relaxed mb-6 font-medium relative z-10">
                      {message.content}
                    </p>

                    {/* Contador de interações — só exibe, sem ação */}
                    <div className="flex items-center relative z-10">
                      <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
                        (isPrayer || isGrace) && message.likesCount > 0 && "bg-primary/10 text-primary",
                        (isPrayer || isGrace) && message.likesCount === 0 && "text-muted-foreground/60",
                        isSin && message.likesCount > 0 && "bg-green-100 text-green-700",
                        isSin && message.likesCount === 0 && "text-muted-foreground/60"
                      )}>
                        {isPrayer && <CandleIcon className={cn("w-4 h-4", message.likesCount > 0 && "fill-current")} />}
                        {isGrace && <Heart className={cn("w-4 h-4", message.likesCount > 0 && "fill-current")} />}
                        {isSin && <HeartHandshake className={cn("w-4 h-4", message.likesCount > 0 && "fill-current")} />}
                        <span className="text-xs">{actionLabel}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
