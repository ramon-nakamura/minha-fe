import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Bell, HandHeart, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

function NotifIcon({ type }: { type: string }) {
  if (type === "like") return (
    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M12 2C11 3.5 9.5 5.5 9.5 7.2C9.5 8.8 10.6 9.8 12 9.8C13.4 9.8 14.5 8.8 14.5 7.2C14.5 5.5 13 3.5 12 2Z" fill="currentColor" stroke="none" />
        <line x1="12" y1="9.8" x2="12" y2="11.5" />
        <rect x="8.5" y="11.5" width="7" height="10" rx="1" />
        <line x1="5" y1="21.5" x2="19" y2="21.5" />
      </svg>
    </div>
  );
  if (type === "pardon") return (
    <div className="w-9 h-9 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
      <CheckCircle2 className="w-4 h-4" />
    </div>
  );
  return (
    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
      <HandHeart className="w-4 h-4" />
    </div>
  );
}

function notifLabel(type: string) {
  if (type === "like") return "Alguém orou pela sua mensagem";
  if (type === "pardon") return "Sua confissão foi perdoada";
  return "Nova interação";
}

export default function NotificationsPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/notifications/all"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/all", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  useEffect(() => {
    markReadMutation.mutate();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="font-display font-bold text-lg">Notificações</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <span className="text-sm">Carregando...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-sm">Nenhuma notificação ainda.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`
                bg-white/50 backdrop-blur-md rounded-2xl border p-4 transition-all
                ${!n.isRead ? "border-primary/20 bg-primary/5" : "border-white/60"}
              `}
            >
              <div className="flex items-start gap-3">
                <NotifIcon type={n.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    {notifLabel(n.type)}
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {n.messageContent || n.content}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}