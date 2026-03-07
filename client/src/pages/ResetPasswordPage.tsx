import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, KeyRound, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ResetPasswordPage() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      setError("Link inválido. Solicite um novo link de redefinição.");
    } else {
      setToken(t);
    }
  }, []);

  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erro ao redefinir senha");
      return data;
    },
    onSuccess: () => {
      setDone(true);
      setTimeout(() => navigate("/"), 3000);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSubmit = () => {
    setError("");
    if (!newPassword || newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    resetMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-amber-300 flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-4">
            <span className="font-bold text-white text-2xl" style={{ fontFamily: "var(--font-display)" }}>Fé</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>Minha Fé</h1>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-8 shadow-2xl shadow-black/5 border border-white/80">
          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Senha redefinida!</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login em instantes.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Criar nova senha</h2>
                <p className="text-sm text-muted-foreground">Escolha uma senha segura com pelo menos 6 caracteres.</p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none pr-11"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirmar senha</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={resetMutation.isPending || !token || !newPassword || !confirmPassword}
                className="w-full py-3.5 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
              >
                {resetMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <KeyRound className="w-5 h-5" />
                )}
                Salvar nova senha
              </button>

              <div className="text-center">
                <Link href="/">
                  <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 mx-auto">
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar para o login
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
