import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, HandHeart, EyeOff, Eye, EyeOff as EyeOffIcon, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LegalModal } from "@/components/LegalModal";

export default function LandingPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

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
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-multiply"
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
              <Flame className="w-4 h-4" />
              Bem-vindo ao Minha Fé
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
              Sua jornada de fé,<br />agora digital.
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto md:mx-0">
              Um espaço celestial para compartilhar pedidos de oração, celebrar graças alcançadas e desabafar em total segurança e anonimato.
            </p>

            <div className="hidden md:flex flex-col gap-4 mt-8">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-600" />
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
          </motion.div>
        </div>

        <div className="flex-1 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/70 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl shadow-black/10 p-8">
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
    </div>
  );
}
