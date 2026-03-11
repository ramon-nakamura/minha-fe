import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, ArrowLeft, Trash2, Shield, ShieldCheck, UserPlus, Users, X, Search,
  HandHeart, EyeOff, Flame
} from "lucide-react";
import type { User } from "@shared/models/auth";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatDistanceToNow, format, parseISO, startOfMonth, isAfter, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;
  const [newUser, setNewUser] = useState({ email: "", firstName: "", lastName: "", role: "user" });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    },
    enabled: isAdmin,
  });

  const { data: stats } = useQuery<{
    totalUsers: number;
    totalPrayers: number;
    totalGraces: number;
    totalSins: number;
    totalSpecial: number;
  }>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/stats");
      return res.json();
    },
    enabled: isAdmin,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Papel atualizado", description: "O papel do usuário foi alterado." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao atualizar papel.", variant: "destructive" });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Usuário removido", description: "O usuário foi excluído com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao excluir usuário.", variant: "destructive" });
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: typeof newUser) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowAddModal(false);
      setNewUser({ email: "", firstName: "", lastName: "", role: "user" });
      toast({ title: "Usuário adicionado", description: "Novo usuário criado com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar usuário.", variant: "destructive" });
    },
  });

  const { isLoading: authLoading } = useAuth();

  // Hooks de dados derivados — devem ficar antes dos returns condicionais (regras dos hooks)
  const filteredUsers = useMemo(() => {
    return users?.filter(u => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.email?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
      );
    }) ?? [];
  }, [users, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(start, start + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const acquisitionData = useMemo(() => {
    if (!users) return [];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return { key: format(d, "yyyy-MM"), label: format(d, "MMM", { locale: ptBR }) };
    });
    return months.map(({ key, label }) => ({
      label,
      total: users.filter(u => {
        if (!u.createdAt) return false;
        const d = typeof u.createdAt === "string" ? parseISO(u.createdAt) : new Date(u.createdAt);
        return format(d, "yyyy-MM") === key;
      }).length,
    }));
  }, [users]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-transparent to-blue-100/20 pointer-events-none" />

      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <button data-testid="link-back" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group">
              <div className="p-2 rounded-full group-hover:bg-primary/5">
                <ArrowLeft className="w-5 h-5" />
              </div>
              <span className="font-medium">Voltar</span>
            </button>
          </Link>
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Painel Administrativo
          </h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-4 flex flex-col items-center gap-2" data-testid="stat-users">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">{stats?.totalUsers ?? "–"}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Usuários</span>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-4 flex flex-col items-center gap-2" data-testid="stat-prayers">
            <div className="p-2.5 rounded-xl bg-amber-100">
              <Flame className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">{stats?.totalPrayers ?? "–"}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Orações</span>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-4 flex flex-col items-center gap-2" data-testid="stat-graces">
            <div className="p-2.5 rounded-xl bg-blue-100">
              <HandHeart className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">{stats?.totalGraces ?? "–"}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Graças</span>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-4 flex flex-col items-center gap-2" data-testid="stat-sins">
            <div className="p-2.5 rounded-xl bg-slate-100">
              <EyeOff className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">{stats?.totalSins ?? "–"}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Confissões</span>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-lg p-4 flex flex-col items-center gap-2 col-span-2 sm:col-span-1" data-testid="stat-special">
            <div className="p-2.5 rounded-xl bg-amber-50 ring-2 ring-amber-200">
              <Flame className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-2xl font-display font-bold text-foreground">{stats?.totalSpecial ?? "–"}</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Velas Especiais</span>
          </div>
        </div>

        {/* Gráfico de aquisição de usuários */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-black/5 p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-primary/10">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Aquisição de Usuários</h2>
              <p className="text-xs text-muted-foreground">Novos cadastros por mês (últimos 6 meses)</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={acquisitionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                formatter={(value: number) => [value, "Novos usuários"]}
              />
              <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorTotal)" dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Gerenciar Usuários</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{users?.length || 0}</span>
          </div>
          <button
            data-testid="button-add-user"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Adicionar Usuário
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-testid="input-search-users"
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-black/5 focus:ring-2 ring-primary/10 transition-all outline-none"
          />
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-black/5 overflow-hidden">
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_auto_auto] gap-4 p-4 border-b border-black/5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            <span>Usuário</span>
            <span>Cadastro</span>
            <span>Último acesso</span>
            <span>Papel</span>
            <span>Ações</span>
          </div>
          <div className="grid md:hidden grid-cols-[1fr_auto_auto] gap-4 p-4 border-b border-black/5 text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            <span>Usuário</span>
            <span>Papel</span>
            <span>Ações</span>
          </div>

          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((u) => {
              const createdAt = u.createdAt ? new Date(u.createdAt) : null;
              const lastAccess = u.updatedAt ? new Date(u.updatedAt) : null;
              return (
                <div
                  key={u.id}
                  data-testid={`row-user-${u.id}`}
                  className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_120px_120px_auto_auto] gap-4 items-center p-4 border-b border-black/5 last:border-0 hover:bg-black/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {u.profileImageUrl ? (
                        <img src={u.profileImageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-primary font-bold text-sm">
                          {(u.firstName?.[0] || u.email?.[0] || "?").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                  </div>

                  {/* Datas — visíveis apenas em md+ */}
                  <div className="hidden md:flex flex-col gap-0.5">
                    {createdAt ? (
                      <>
                        <span className="text-xs font-medium text-foreground">{format(createdAt, "dd/MM/yyyy")}</span>
                        <span className="text-[10px] text-muted-foreground">{format(createdAt, "HH:mm")}</span>
                      </>
                    ) : <span className="text-xs text-muted-foreground">–</span>}
                  </div>
                  <div className="hidden md:flex flex-col gap-0.5">
                    {lastAccess ? (
                      <>
                        <span className="text-xs font-medium text-foreground">{format(lastAccess, "dd/MM/yyyy")}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(lastAccess, { addSuffix: true, locale: ptBR })}</span>
                      </>
                    ) : <span className="text-xs text-muted-foreground">–</span>}
                  </div>

                  <select
                    data-testid={`select-role-${u.id}`}
                    value={u.role}
                    onChange={(e) => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                    disabled={u.id === user?.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all outline-none ${
                      u.role === "admin"
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                  </select>

                  <button
                    data-testid={`button-delete-user-${u.id}`}
                    onClick={() => {
                      if (confirm(`Tem certeza que deseja excluir ${u.firstName || u.email}?`)) {
                        deleteUserMutation.mutate(u.id);
                      }
                    }}
                    disabled={u.id === user?.id}
                    className="p-2 rounded-xl text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <p>Nenhum usuário encontrado.</p>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-black/5">
              <span className="text-xs text-muted-foreground">
                {((currentPage - 1) * USERS_PER_PAGE) + 1}–{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuários
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                      page === currentPage
                        ? "bg-primary text-white"
                        : "hover:bg-black/5 text-muted-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold">Adicionar Usuário</h3>
              <button
                data-testid="button-close-modal"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-black/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Email *</label>
                <input
                  data-testid="input-new-email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/10 transition-all outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Nome</label>
                  <input
                    data-testid="input-new-firstname"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/10 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Sobrenome</label>
                  <input
                    data-testid="input-new-lastname"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">Papel</label>
                <select
                  data-testid="select-new-role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/10 transition-all outline-none"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                data-testid="button-submit-new-user"
                onClick={() => addUserMutation.mutate(newUser)}
                disabled={!newUser.email || addUserMutation.isPending}
                className="w-full py-3 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {addUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Criar Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
