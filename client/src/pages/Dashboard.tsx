import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { LogOut, Plus, Loader2, User, Bell, Shield, Filter, ArrowUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { InspiringMessage } from "@/components/InspiringMessage";
import { FloatingBubble } from "@/components/FloatingBubble";
import { CreateMessageModal } from "@/components/CreateMessageModal";
import { Link, useLocation } from "wouter";
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { MessageType } from "@/hooks/use-messages";

const PAGE_SIZE = 12;

type FaithMessage = {
  id: number;
  type: string;
  content: string;
  likesCount: number;
  isPardoned: boolean;
  isSpecial: boolean;
  isPrivate: boolean;
  createdAt: string | Date;
  authorName?: string;
  authorImage?: string;
  authorCity?: string;
};

async function fetchMessages(params: {
  type?: string;
  pageParam: number;
}): Promise<{ items: FaithMessage[]; nextOffset: number | null }> {
  const { type, pageParam } = params;
  const search = new URLSearchParams();
  if (type && type !== "all") search.append("type", type);
  search.append("limit", String(PAGE_SIZE));
  search.append("offset", String(pageParam));
  const res = await fetch(`/api/messages?${search.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  const items: FaithMessage[] = await res.json();
  return {
    items,
    nextOffset: items.length === PAGE_SIZE ? pageParam + PAGE_SIZE : null,
  };
}

export default function Dashboard() {
  const { user, logout, isAdmin } = useAuth();
  const [filter, setFilter] = useState<MessageType | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "popular">("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFirstVisitTip, setShowFirstVisitTip] = useState(() => {
    try { return !localStorage.getItem("mf_wrote_message"); } catch { return false; }
  });

  const dismissTip = () => {
    setShowFirstVisitTip(false);
    try { localStorage.setItem("mf_wrote_message", "1"); } catch {}
  };
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const sentinelRef = useRef<HTMLDivElement>(null);

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

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ["/api/messages", filter],
    queryFn: ({ pageParam }) => fetchMessages({ type: filter, pageParam: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const allMessages = useMemo(() => {
    return data?.pages.flatMap((p) => p.items) ?? [];
  }, [data]);

  const sortedMessages = useMemo(() => {
    if (sortBy === "popular") {
      return [...allMessages].sort((a, b) => {
        if (b.likesCount !== a.likesCount) return b.likesCount - a.likesCount;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }
    return allMessages;
  }, [allMessages, sortBy]);

  // Semente gerada uma vez por sessão — muda no reload, estável no scroll/paginação
  const sessionSeed = useRef(Math.random());

  // Algoritmo de slot com jitter: injeta velas especiais ativas a cada N mensagens comuns,
  // onde N é sorteado entre SLOT_MIN e SLOT_MAX a cada inserção usando PRNG com semente de sessão.
  const feedMessages = useMemo(() => {
    const SPECIAL_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
    const SLOT_MIN = 0;
    const SLOT_MAX = 5;
    const now = Date.now();

    const activeSpecials = sortedMessages.filter(
      (m) => m.isSpecial && now - new Date(m.createdAt).getTime() <= SPECIAL_WINDOW_MS
    );
    const commons = sortedMessages.filter(
      (m) => !m.isSpecial || now - new Date(m.createdAt).getTime() > SPECIAL_WINDOW_MS
    );

    if (activeSpecials.length === 0) return sortedMessages;

    // PRNG mulberry32 — determinístico a partir da semente de sessão
    let s = (sessionSeed.current * 0xffffffff) >>> 0;
    const rand = () => {
      s = (Math.imul(s ^ (s >>> 15), s | 1) ^ ((s ^ (s >>> 7)) * (s | 61))) >>> 0;
      return s / 0x100000000;
    };

    // Embaralha as especiais uma vez por sessão
    const shuffled = [...activeSpecials].sort(() => rand() - 0.5);
    let specialIndex = 0;

    const result: FaithMessage[] = [];
    let commonCount = 0;

    // Primeira especial aparece na posição 1 ou 2 (após 0 ou 1 comum) — sorteado por sessão
    let nextSlot = Math.floor(rand() * 2); // 0 ou 1

    for (const msg of commons) {
      result.push(msg);
      commonCount++;

      if (commonCount >= nextSlot && specialIndex < shuffled.length) {
        result.push(shuffled[specialIndex]);
        specialIndex++;
        commonCount = 0;
        // Sorteia próximo slot
        nextSlot = SLOT_MIN + Math.floor(rand() * (SLOT_MAX - SLOT_MIN + 1));
      }
    }

    // Especiais restantes vão ao final
    while (specialIndex < shuffled.length) {
      result.push(shuffled[specialIndex++]);
    }

    return result;
  }, [sortedMessages]);

  // IntersectionObserver no sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Mostrar "Voltar ao topo" com base no scroll real — some ao chegar no topo
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleNotifClick = (messageId: number) => {
    setHighlightedId(messageId);
    setTimeout(() => {
      const el = document.getElementById(`message-${messageId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setHighlightedId(null), 3000);
    }, 150);
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filters = [
    { id: "all", label: "Todas as mensagens" },
    { id: "prayer", label: "Orações" },
    { id: "grace", label: "Graças alcançadas" },
    { id: "sin", label: "Confissões" },
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
              Que a paz esteja com você, {user?.firstName || "Caminhante"}
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
                <div className="p-4 border-b bg-primary/5 flex items-center justify-between">
                  <h4 className="font-bold text-sm">Notificações</h4>
                  <button
                    onClick={() => navigate("/notificacoes")}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.slice(0, 10).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n.messageId)}
                        className={`w-full text-left p-4 border-b last:border-0 hover:bg-black/5 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                      >
                        <p className="text-sm text-foreground/80">{n.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                      </button>
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 pr-4 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all duration-300 outline-none group">
                  <div className="relative">
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary border-2 border-white shadow-sm">
                        <User className="w-5 h-5" />
                      </div>
                    )}

                  </div>
                  <span className="text-sm font-semibold text-foreground">Minha jornada</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-none" align="end">
                <Link href="/profile">
                  <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Minha Jornada
                  </DropdownMenuItem>
                </Link>
                <Link href="/account">
                  <DropdownMenuItem className="rounded-xl py-3 cursor-pointer">
                    <Shield className="w-4 h-4 mr-2" />
                    Minha conta
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="rounded-xl py-3 cursor-pointer text-red-500 focus:text-red-500">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InspiringMessage />

        {/* Filter & Sort */}
        <div className="max-w-2xl mx-auto mb-12 px-2">
          <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/60 shadow-xl shadow-black/5 flex items-center gap-1">
            <div className="flex-[1.5] flex items-center gap-2 pl-4 pr-1 py-1 min-w-0">
              <Filter className="w-3.5 h-3.5 text-primary/60 shrink-0" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-full bg-transparent border-none shadow-none focus:ring-0 h-7 text-xs font-bold text-slate-700 p-0 truncate">
                  <SelectValue placeholder="Filtrar" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
                  {filters.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="rounded-xl py-2 text-xs">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-px h-5 bg-black/5 shrink-0" />

            <div className="flex-1 flex items-center gap-2 pl-2 pr-1 py-1 min-w-0">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full bg-transparent border-none shadow-none focus:ring-0 h-7 text-xs font-bold text-slate-700 p-0 truncate">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl p-1">
                  <SelectItem value="newest" className="rounded-xl py-2 text-xs">Mais recentes</SelectItem>
                  <SelectItem value="popular" className="rounded-xl py-2 text-xs">Mais interações</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Messages Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p>Recebendo as mensagens...</p>
          </div>
        ) : feedMessages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedMessages.map((message, idx) => (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className={`transition-all duration-700 rounded-[2rem] ${highlightedId === message.id ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : ""}`}
                >
                  <FloatingBubble message={message} index={idx} isAdmin={isAdmin} currentUserId={user?.id} />
                </div>
              ))}
            </div>

            {/* Sentinel */}
            <div ref={sentinelRef} className="flex justify-center py-10">
              {isFetchingNextPage && (
                <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
              )}
              {!hasNextPage && !isFetchingNextPage && feedMessages.length > PAGE_SIZE && (
                <p className="text-xs text-muted-foreground">Você chegou ao fim 🕊️</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl opacity-50">🕊️</span>
            </div>
            <h3 className="text-2xl font-display font-semibold mb-2">O céu está silencioso</h3>
            <p className="text-muted-foreground">Seja o primeiro a compartilhar uma mensagem de fé.</p>
          </div>
        )}
      </main>

      {/* Voltar ao topo */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 right-8 flex items-center gap-1.5 px-3 py-2 bg-white/80 backdrop-blur-md border border-white/60 shadow-lg rounded-full text-xs font-semibold text-muted-foreground hover:text-primary hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 z-40"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          Voltar ao topo
        </button>
      )}

      {/* Balão primeiro acesso */}
      {showFirstVisitTip && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-40 pointer-events-none"
          style={{ bottom: "108px", right: "16px" }}
        >
          {/* Balão */}
          <div className="relative flex items-center gap-2.5 pl-3.5 pr-4 py-3 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(217,119,6,0.08)",
            }}
          >
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            </div>
            <p className="text-[12.5px] font-semibold text-slate-700 leading-snug whitespace-nowrap">
              Escreva sua primeira mensagem!
            </p>
          </div>
          {/* Seta apontando para o FAB */}
          <div className="absolute -bottom-[7px] right-8"
            style={{
              width: 14, height: 8,
              background: "rgba(255,255,255,0.75)",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.04))",
            }}
          />
        </motion.div>
      )}

      {/* FAB */}
      <button
        onClick={() => { setIsModalOpen(true); dismissTip(); }}
        className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:-translate-y-1 hover:shadow-primary/50 transition-all duration-300 z-40 group"
      >
        <Plus className="w-8 h-8 transition-transform group-hover:rotate-90 duration-300" />
      </button>

      <CreateMessageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
