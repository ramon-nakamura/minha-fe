import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { KeyRound, Eye, EyeOff as EyeOffIcon, AlertTriangle, Camera, Save, User, Loader2, MapPin, Search } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AccountPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [city, setCity] = useState(user?.city || "");
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Simple city autocomplete simulation
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (city.length > 2) {
      // In a real app, this would be an API call to a geocoding service
      const mockCities = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Porto Alegre, RS", "Salvador, BA", "Fortaleza, CE", "Brasília, DF", "Manaus, AM", "Recife, PE"];
      setCitySuggestions(mockCities.filter(c => c.toLowerCase().includes(city.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setCitySuggestions([]);
      setShowSuggestions(false);
    }
  }, [city]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/auth/user", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas." });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const res = await apiRequest("PATCH", "/api/auth/password", data);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Erro ao alterar senha");
      }
      return res.json();
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
      toast({ title: "Senha alterada", description: "Sua senha foi atualizada com sucesso." });
    },
    onError: (err: Error) => {
      setPasswordError(err.message);
    }
  });

  const handleSave = () => {
    updateProfileMutation.mutate({ firstName, lastName, city, profileImageUrl: profileImage });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <button className="text-xl font-display font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">Minha Fé</button>
          </Link>
          <h1 className="text-lg font-bold">Minha Conta</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-8">
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-black/5">
          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative w-32 h-32 group">
              <div className="w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary/30" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome</label>
              <input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Sobrenome</label>
              <input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1 relative">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Cidade</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                />
              </div>
              {showSuggestions && citySuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-xl border border-black/5 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {citySuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        setCity(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="w-full px-6 py-3 text-left text-sm hover:bg-primary/5 transition-colors flex items-center gap-3"
                    >
                      <Search className="w-3 h-3 text-muted-foreground" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="md:col-span-2 py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Salvar Alterações
            </button>
          </div>

          <div className="mt-12 pt-12 border-t border-black/5">
             <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-6">
              <KeyRound className="w-4 h-4" />
              Alterar Senha
            </h4>
            <div className="space-y-4">
               {passwordError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                    {passwordError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                    />
                    <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrentPw ? <EyeOffIcon className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Nova Senha</label>
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirmar</label>
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (newPassword !== confirmPassword) {
                      setPasswordError("As senhas não coincidem");
                      return;
                    }
                    changePasswordMutation.mutate({ currentPassword, newPassword });
                  }}
                  disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
                  className="w-full py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Alterar Senha
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}