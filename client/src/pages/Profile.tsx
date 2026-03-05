import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useDeleteMessage, useDeleteMessages } from "@/hooks/use-messages";
import { Lock, Unlock, KeyRound, Eye, EyeOff as EyeOffIcon, AlertTriangle, Quote, Share2, Sparkles, X } from "lucide-react";
import { Loader2, ArrowLeft, Trash2, CheckSquare, Square, CheckCircle2, Heart, Camera, Save, User, HandHeart, EyeOff, Star, HandHelping } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Custom Hands Prayer Icon
function HandsPrayerIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 20c-2 0-4-1-4-3V7c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v10c0 2-2 3-4 3Z" />
      <path d="M8 10h1" />
      <path d="M15 10h1" />
      <path d="M10 14h4" />
      <path d="M12 5V3" />
    </svg>
  );
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useMessages({ authorId: user?.id });
  const deleteMutation = useDeleteMessage();
  const deleteBulkMutation = useDeleteMessages();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isEditing, setIsSpecial] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [profileImage, setProfileImage] = useState(user?.profileImageUrl || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReflection, setShowReflection] = useState(false);

  const verseOfDay = {
    text: "O Senhor é o meu pastor, nada me faltará.",
    reference: "Salmos 23:1",
    reflection: "Este versículo lembra que Deus é aquele que guia, protege e supre. Mesmo em momentos de incerteza, confiar no cuidado divino traz paz ao coração."
  };

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

  const handleChangePassword = () => {
    setPasswordError("");
    if (newPassword.length < 6) {
      setPasswordError("Nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("As senhas não coincidem");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao excluir conta");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      window.location.href = "/";
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Erro", description: err.message });
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/auth/user", data);
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/auth/user"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsSpecial(false);
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas." });
    }
  });

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

  const handleSave = () => {
    updateProfileMutation.mutate({ firstName, lastName, profileImageUrl: profileImage });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (!messages) return;
    if (selectedIds.length === messages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(messages.map(m => m.id));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta mensagem?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast({ title: "Excluído", description: "Mensagem removida com sucesso." });
      }
    });
  };

  const handleDeleteBulk = async () => {
    if (!confirm(`Tem certeza que deseja excluir as ${selectedIds.length} mensagens selecionadas?`)) return;
    deleteBulkMutation.mutate(selectedIds, {
      onSuccess: () => {
        toast({ title: "Excluído", description: "Mensagens removidas com sucesso." });
        setSelectedIds([]);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-divine">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-blue-100/20 pointer-events-none" />
      
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group">
              <div className="p-2 rounded-full group-hover:bg-primary/5">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Voltar</span>
            </button>
          </Link>
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">Minha Jornada</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 relative z-10 space-y-8">
        {/* Horizontal Profile Card */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/60">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0 group">
              <div className="w-full h-full rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-primary/5 to-amber-50 flex items-center justify-center">
                {profileImage ? (
                  <img src={profileImage} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary/30" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>

            <div className="flex-1 space-y-4 text-center md:text-left">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Nome</label>
                    <input 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Sobrenome</label>
                    <input 
                      value={lastName} 
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="md:col-span-2 py-3 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Alterações
                  </button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-3xl font-display font-bold text-foreground leading-tight">{user?.firstName} {user?.lastName}</h2>
                    <p className="text-muted-foreground font-medium">{user?.email}</p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-6">
                      <div className="text-center md:text-left">
                        <p className="text-xl font-bold text-primary">{messages?.length || 0}</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mensagens</p>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-xl font-bold text-amber-600">
                          {messages?.reduce((acc, m) => acc + m.likesCount, 0)}
                        </p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Gratidão</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSpecial(true)}
                    className="px-8 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all whitespace-nowrap"
                  >
                    Editar Perfil
                  </button>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="mt-8 pt-8 border-t border-black/5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  Alterar Senha
                </h4>

                {passwordError && (
                  <div data-testid="text-password-error" className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-medium">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Senha Atual</label>
                    <div className="relative">
                      <input
                        data-testid="input-current-password"
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none text-sm pr-10"
                        placeholder="••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showCurrentPw ? <EyeOffIcon className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Nova Senha</label>
                      <input
                        data-testid="input-new-password"
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none text-sm"
                        placeholder="Mín. 6 chars"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Confirmar</label>
                      <input
                        data-testid="input-confirm-password"
                        type={showNewPw ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none text-sm"
                        placeholder="Confirme"
                      />
                    </div>
                  </div>
                  <button
                    data-testid="button-change-password"
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    Alterar Senha
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Zona de Perigo
                </h4>
                {!showDeleteConfirm ? (
                  <button
                    data-testid="button-delete-account"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 transition-all"
                  >
                    Excluir Minha Conta
                  </button>
                ) : (
                  <div className="space-y-3 p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600 leading-relaxed font-medium">
                      Tem certeza? Esta ação é irreversível. Seus dados pessoais serão removidos e suas mensagens serão anonimizadas.
                    </p>
                    <div className="flex gap-2">
                      <button
                        data-testid="button-confirm-delete-account"
                        onClick={() => deleteAccountMutation.mutate()}
                        disabled={deleteAccountMutation.isPending}
                        className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all"
                      >
                        {deleteAccountMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Sim, Excluir
                      </button>
                      <button
                        data-testid="button-cancel-delete-account"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-2 rounded-xl bg-white border border-black/10 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Versículo do Dia */}
        <section className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 text-center space-y-6">
          <div className="flex justify-center">
            <Quote className="w-8 h-8 text-primary/20" />
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            <p className="text-3xl md:text-5xl text-foreground leading-snug tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              "{verseOfDay.text}"
            </p>
            <p className="text-sm font-bold uppercase tracking-widest text-primary/60">
              {verseOfDay.reference}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setShowReflection(true)}
              className="px-6 py-2.5 rounded-full bg-white border border-black/5 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Refletir
            </button>
            <button 
              className="px-6 py-2.5 rounded-full bg-white border border-black/5 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-primary/5 hover:border-primary/20 transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-primary" />
              Compartilhar
            </button>
          </div>
        </section>

        {/* Reflection Modal */}
        {showReflection && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => setShowReflection(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900">Reflexão</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {verseOfDay.reflection}
                </p>
                <button 
                  onClick={() => setShowReflection(false)}
                  className="w-full mt-4 py-3 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                >
                  Amém
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Contributions */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-widest flex items-center gap-2 font-sans">
              Minhas Contribuições
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-sans">{messages?.length}</span>
            </h3>
            
            {messages && messages.length > 0 && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={selectAll}
                  className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
                >
                  {selectedIds.length === messages.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  {selectedIds.length === messages.length ? "Nenhum" : "Todos"}
                </button>
                {selectedIds.length > 0 && (
                  <button 
                    onClick={handleDeleteBulk}
                    className="bg-destructive text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-destructive/90 shadow-lg shadow-destructive/20 transition-all active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir ({selectedIds.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map(msg => (
                <div 
                  key={msg.id}
                  className={cn(
                    "group p-6 rounded-[2rem] border transition-all duration-500 flex gap-5 cursor-pointer relative overflow-hidden",
                    selectedIds.includes(msg.id) 
                      ? "bg-primary/5 border-primary/30 ring-4 ring-primary/5 translate-x-2" 
                      : "bg-white/80 border-white hover:border-primary/20 hover:shadow-lg hover:shadow-black/5"
                  )}
                  onClick={() => toggleSelect(msg.id)}
                >
                  <div className="pt-1 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
                     <button onClick={() => toggleSelect(msg.id)} className="transition-transform active:scale-90">
                      {selectedIds.includes(msg.id) 
                        ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><CheckSquare className="w-4 h-4 text-white" /></div>
                        : <div className="w-6 h-6 rounded-full border-2 border-slate-200 bg-white" />
                      }
                     </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                          msg.type === 'prayer' ? 'bg-amber-100 text-amber-600' :
                          msg.type === 'grace' ? 'bg-blue-100 text-blue-600' :
                          'bg-slate-200 text-slate-600'
                        }`}>
                          {msg.type === 'prayer' ? <HandsPrayerIcon className="w-5 h-5" /> :
                           msg.type === 'grace' ? <HandHeart className="w-5 h-5" /> :
                           <EyeOff className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground/80">
                            {msg.type === 'prayer' ? 'Oração' : msg.type === 'grace' ? 'Graça' : 'Confissão'}
                          </span>
                          <p className="text-[10px] text-muted-foreground/60">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {msg.isSpecial && (
                          <div className="px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Especial</span>
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-foreground leading-relaxed font-medium mb-4">
                      {msg.content}
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/50 text-slate-600 font-bold text-[10px]">
                        <Heart className="w-3 h-3 fill-current" />
                        <span>{msg.likesCount} {msg.likesCount === 1 ? 'interação' : 'interações'}</span>
                      </div>
                      {msg.type === 'sin' && (
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border",
                          msg.isPardoned ? "bg-green-50 text-green-600 border-green-100" : "bg-slate-50 text-muted-foreground border-black/5"
                        )}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{msg.isPardoned ? 'Perdoado' : 'Aguardando'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl shadow-black/5">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-primary/20" />
              </div>
              <h4 className="text-xl font-display font-bold text-foreground/40">Silêncio Sagrado</h4>
              <p className="text-muted-foreground/60 max-w-xs mx-auto mt-2">Você ainda não compartilhou nenhuma mensagem em sua jornada.</p>
              <Link href="/">
                <button className="mt-8 px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  Começar Jornada
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* Guia da Comunidade — conteúdo original preservado */}
        <section className="space-y-6">
          <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-widest flex items-center gap-2 font-sans px-2">
            Guia da Comunidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                <HandHelping className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Orações</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compartilhe seus pedidos e intenções. A comunidade pode se unir a você em oração clicando no ícone de mãos postas.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Star className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Orações Especiais</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Destaque sua intenção com uma Vela Especial. Elas aparecem com um brilho dourado e permanecem em evidência no topo.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Graças Alcançadas</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Testemunhe as vitórias e bênçãos recebidas para inspirar e fortalecer a fé de todos os irmãos.
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-foreground mb-2">Confissões</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Um espaço anônimo para aliviar o coração. Suas confissões são privadas e outros podem oferecer o perdão simbólico.
              </p>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-4 py-6">
          <Link href="/termos">
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer underline underline-offset-4" data-testid="link-terms">
              Termos de Uso
            </span>
          </Link>
          <span className="text-muted-foreground/40">·</span>
          <Link href="/privacidade">
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer underline underline-offset-4" data-testid="link-privacy">
              Política de Privacidade
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
