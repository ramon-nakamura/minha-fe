import { useState, useEffect, useMemo } from "react";
import { LogOut, Plus, Loader2, User, Bell, Shield, Filter } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, type MessageType } from "@/hooks/use-messages";
import { InspiringMessage } from "@/components/InspiringMessage";
import { FloatingBubble } from "@/components/FloatingBubble";
import { CreateMessageModal } from "@/components/CreateMessageModal";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [filter, setFilter] = useState<MessageType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    if (paymentStatus) {
      if (paymentStatus === "success") {
        toast({ title: "Pagamento confirmado!", description: "Sua vela especial foi acesa com sucesso." });
        queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      } else if (paymentStatus === "cancelled") {
        toast({ variant: "destructive", title: "Pagamento cancelado", description: "A oração foi enviada sem a vela especial." });
      } else if (paymentStatus === "error") {
        toast({ variant: "destructive", title: "Erro no pagamento", description: "Houve um problema ao processar o pagamento." });
      }
      window.history.replaceState({}, "", "/");
    }
  }, []);
  
  const { data: messages, isLoading } = useMessages({ type: filter });

  const sortedMessages = useMemo(() => {
    if (!messages) return [];
    
    return [...messages].sort((a, b) => {
      if (sortBy === 'popular') {
        if (b.likesCount !== a.likesCount) {
          return b.likesCount - a.likesCount;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [messages, sortBy]);

  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30s
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const filters = [
    { id: 'all', label: 'Todas as mensagens' },
    { id: 'prayer', label: 'Orações' },
    { id: 'grace', label: 'Graças alcançadas' },
    { id: 'sin', label: 'Confissões' },
  ] as const;

  return (
    <div className="min-h-screen relative pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-amber-300 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="font-display font-bold text-white text-xl">Fé</span>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight hidden sm:block">Minha Fé</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
              Que a paz esteja com você, {user?.firstName || 'Caminhante'}
            </span>

            <Popover onOpenChange={(open) => open && unreadCount > 0 && markReadMutation.mutate()}>
              <PopoverTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl overflow-hidden shadow-2xl" align="end">
                <div className="p-4 border-b bg-primary/5">
                  <h4 className="font-bold text-sm">Notificações</h4>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className={`p-4 border-b last:border-0 hover:bg-black/5 transition-colors ${!n.isRead ? 'bg-primary/5' : ''}`}>
                        <p className="text-sm text-foreground/80">{n.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <p className="text-sm">Nenhuma notificação por enquanto.</p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {isAdmin && (
              <Link href="/admin">
                <button data-testid="link-admin" className="p-2.5 rounded-full hover:bg-amber-50 text-amber-600 transition-colors" title="Painel Admin">
                  <Shield className="w-5 h-5" />
                </button>
              </Link>
            )}

            <Link href="/profile">
              <button className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-black/5 transition-all duration-300">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Profile" className="w-8 h-8 rounded-full border border-white shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <span className="text-sm font-medium hidden md:block">Perfil</span>
              </button>
            </Link>
            <button
              onClick={() => logout()}
              className="p-2.5 rounded-full hover:bg-black/5 text-muted-foreground hover:text-foreground transition-colors"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InspiringMessage />

        {/* Unified Filter & Sort Controls */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="bg-white/40 backdrop-blur-md p-2 rounded-[2rem] border border-white/60 shadow-xl shadow-black/5 flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div className="flex-1 w-full flex items-center gap-3 pl-4 pr-2 py-2">
              <Filter className="w-4 h-4 text-primary/60" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-full bg-transparent border-none shadow-none focus:ring-0 h-8 text-sm font-bold text-slate-700">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
                  {filters.map(f => (
                    <SelectItem key={f.id} value={f.id} className="rounded-xl py-2.5">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="hidden sm:block w-px h-8 bg-black/5" />

            <div className="flex-1 w-full flex items-center gap-3 pl-4 sm:pl-0 pr-2 py-2">
              <div className="sm:hidden flex items-center gap-3">
                <Filter className="w-4 h-4 text-amber-500/60" />
              </div>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full bg-transparent border-none shadow-none focus:ring-0 h-8 text-sm font-bold text-slate-700">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
                  <SelectItem value="newest" className="rounded-xl py-2.5">Mais novos</SelectItem>
                  <SelectItem value="popular" className="rounded-xl py-2.5">Mais interações</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Sintonizando com o divino...</p>
          </div>
        ) : sortedMessages && sortedMessages.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMessages.map((message, idx) => (
              <FloatingBubble key={message.id} message={message} index={idx} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl opacity-50">🕊️</span>
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2">O céu está silencioso</h3>
            <p className="text-muted-foreground">Seja o primeiro a compartilhar uma message de fé.</p>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/50 transition-all duration-300 z-40 group"
      >
        <Plus className="w-8 h-8 transition-transform group-hover:rotate-90 duration-300" />
      </button>

      {/* Create Modal */}
      <CreateMessageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
