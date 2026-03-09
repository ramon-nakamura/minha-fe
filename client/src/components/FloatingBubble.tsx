import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { HandHeart, EyeOff, Heart, HeartHandshake, Trash2, Pencil, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FaithMessage } from "@/hooks/use-messages";
import { useLikeMessage, usePardonMessage, useDeleteMessage } from "@/hooks/use-messages";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function CandleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C11 3.5 9.5 5.5 9.5 7.2C9.5 8.8 10.6 9.8 12 9.8C13.4 9.8 14.5 8.8 14.5 7.2C14.5 5.5 13 3.5 12 2Z" fill="currentColor" stroke="none" />
      <line x1="12" y1="9.8" x2="12" y2="11.5" />
      <rect x="8.5" y="11.5" width="7" height="10" rx="1" />
      <line x1="5" y1="21.5" x2="19" y2="21.5" />
    </svg>
  );
}

// ── Partículas ─────────────────────────────────────────────────────────────
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  color: string;
  size: number;
}

function ParticleBurst({ particles }: { particles: Particle[] }) {
  if (particles.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            left: "50%",
            top: "50%",
            x: "-50%",
            y: "-50%",
          }}
          initial={{ x: "-50%", y: "-50%", opacity: 1, scale: 1 }}
          animate={{
            x: `calc(-50% + ${Math.cos(p.angle) * 28}px)`,
            y: `calc(-50% + ${Math.sin(p.angle) * 28}px)`,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function useParticles(colors: string[]) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const counterRef = useRef(0);

  const burst = useCallback(() => {
    const count = 8;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: counterRef.current++,
      x: 0,
      y: 0,
      angle: (i / count) * Math.PI * 2 + Math.random() * 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 4 + 3,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);
  }, [colors]);

  return { particles, burst };
}

interface FloatingBubbleProps {
  message: FaithMessage;
  index: number;
  isAdmin?: boolean;
  currentUserId?: string;
}

export function FloatingBubble({ message, index, isAdmin, currentUserId }: FloatingBubbleProps) {
  const likeMutation = useLikeMessage();
  const pardonMutation = usePardonMessage();
  const deleteMutation = useDeleteMessage();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const editMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("PATCH", `/api/admin/messages/${message.id}`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      setIsEditing(false);
    },
  });

  const isPrayer = message.type === 'prayer';
  const isGrace = message.type === 'grace';
  const isSin = message.type === 'sin';
  const isSpecial = message.isSpecial;
  const isOwnCard = !!currentUserId && message.authorId === currentUserId;

  const prayerColors = isSpecial
    ? ["#f5c842", "#f0a020", "#fde68a", "#d97706", "#fff8a0"]
    : ["#d97706", "#fbbf24", "#fde68a", "#f59e0b", "#fcd34d"];
  const graceColors = ["#3b82f6", "#93c5fd", "#60a5fa", "#bfdbfe", "#2563eb"];
  const sinColors = ["#22c55e", "#86efac", "#4ade80", "#bbf7d0", "#16a34a"];

  const particleColors = isPrayer ? prayerColors : isGrace ? graceColors : sinColors;
  const { particles, burst } = useParticles(particleColors);

  const handleAction = () => {
    if (isPrayer || isGrace) {
      likeMutation.mutate(message.id);
      burst();
    } else if (isSin && !message.isPardoned) {
      pardonMutation.mutate(message.id);
      burst();
    }
  };

  const handleAdminDelete = () => {
    if (confirm("Tem certeza que deseja excluir esta mensagem?")) {
      deleteMutation.mutate(message.id);
    }
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMutation.mutate(editContent.trim());
    } else {
      setIsEditing(false);
    }
  };

  // Labels dos botões de interação
  const actionLabel = (() => {
    if (isPrayer) {
      if (message.likesCount === 0) return "Orar";
      return isOwnCard
        ? `${message.likesCount} orando com você`
        : `${message.likesCount} orando pela causa`;
    }
    if (isGrace) {
      if (message.likesCount === 0) return "Amém";
      return isOwnCard
        ? `${message.likesCount} comemorando com você`
        : `${message.likesCount} comemorando a graça recebida`;
    }
    // sin
    if (message.isPardoned) {
      return isOwnCard
        ? `${message.likesCount} perdoaram você`
        : `${message.likesCount} perdoaram`;
    }
    return "Perdoar";
  })();

  return (
    <div className="masonry-item">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
        className={cn(
          "rounded-[2rem] p-6 relative group overflow-hidden transition-all duration-500 shadow-sm",
          isSpecial
            ? "border-0"
            : "glass-panel glass-panel-hover border border-white/60"
        )}
      >
        {/* Borda animada dourada para cards especiais */}
        {isSpecial && (
          <>
            <div
              className="absolute inset-0 rounded-[2rem] z-0 pointer-events-none"
              style={{
                padding: "1.5px",
                background: "linear-gradient(var(--angle, 0deg), #f5e27a, #c8973a, #f0d060, #a87830, #f5e27a)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
                animation: "spin-border 3s linear infinite",
              }}
            />
            <div
              className="absolute inset-[1.5px] rounded-[calc(2rem-1.5px)] z-0 pointer-events-none"
              style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fdf8e8 50%, #fffef7 100%)" }}
            />
            <style>{`
              @property --angle {
                syntax: '<angle>';
                initial-value: 0deg;
                inherits: false;
              }
              @keyframes spin-border {
                to { --angle: 360deg; }
              }
            `}</style>
          </>
        )}

        <div className={cn(
          "absolute -top-10 -right-10 w-32 h-32 blur-3xl rounded-full pointer-events-none",
          isPrayer && !isSpecial && "opacity-25 bg-amber-400",
          isPrayer && isSpecial && "opacity-35 bg-yellow-300",
          isGrace && "opacity-25 bg-blue-400",
          isSin && "opacity-20 bg-slate-400"
        )} />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden",
                isPrayer && "bg-amber-100/80 text-amber-600",
                isGrace && "bg-blue-100/80 text-blue-600",
                isSin && "bg-slate-200/80 text-slate-600"
              )}>
                {isSin ? (
                  <EyeOff className="w-6 h-6" />
                ) : message.authorImage ? (
                  <img src={message.authorImage} alt="" className="w-full h-full object-cover" />
                ) : isPrayer ? (
                  <CandleIcon className="w-6 h-6" />
                ) : (
                  <HandHeart className="w-6 h-6" />
                )}
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
              <p className="text-xs text-muted-foreground capitalize">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ptBR })}
                {!isSin && (message as any).authorCity && (
                  <span className="before:content-['·'] before:mx-1">{(message as any).authorCity}</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all bg-white/50 border-white text-muted-foreground">
              {isPrayer && (isSpecial ? "Oração Especial" : "Oração")}
              {isGrace && "Graça"}
              {isSin && "Confissão"}
            </div>
          </div>
        </div>

        {isEditing ? (
          <div className="relative z-10 mb-6">
            <textarea
              data-testid={`textarea-edit-${message.id}`}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-black/10 focus:ring-2 ring-primary/10 transition-all outline-none resize-none text-foreground/80"
              rows={3}
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                data-testid={`button-save-edit-${message.id}`}
                onClick={handleSaveEdit}
                disabled={editMutation.isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                Salvar
              </button>
              <button
                data-testid={`button-cancel-edit-${message.id}`}
                onClick={() => { setIsEditing(false); setEditContent(message.content); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="text-foreground/80 text-lg leading-relaxed mb-6 font-medium relative z-10">
            {message.content}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 relative z-10">
          <button
            onClick={handleAction}
            disabled={likeMutation.isPending || pardonMutation.isPending || (isSin && message.isPardoned)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium select-none touch-manipulation transition-all duration-150 active:scale-95",
              (isPrayer || isGrace) && (message.likesCount > 0
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground/60 [@media(hover:hover)]:hover:bg-primary/10 [@media(hover:hover)]:hover:text-primary"),
              isSin && message.isPardoned
                ? "bg-green-100 text-green-700 cursor-default"
                : isSin && "text-muted-foreground/60 [@media(hover:hover)]:hover:bg-green-50 [@media(hover:hover)]:hover:text-green-600"
            )}
          >
            <ParticleBurst particles={particles} />
            {isPrayer ? (
              <>
                <CandleIcon className={cn("w-4 h-4 pointer-events-none", message.likesCount > 0 && "fill-current")} />
                <span className="pointer-events-none text-xs">{actionLabel}</span>
              </>
            ) : isGrace ? (
              <>
                <Heart className={cn("w-4 h-4 pointer-events-none", message.likesCount > 0 && "fill-current")} />
                <span className="pointer-events-none text-xs">{actionLabel}</span>
              </>
            ) : (
              <>
                <HeartHandshake className={cn("w-4 h-4 pointer-events-none", message.isPardoned && "fill-current")} />
                <span className="pointer-events-none text-xs">{actionLabel}</span>
              </>
            )}
          </button>

          {isAdmin && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                data-testid={`button-admin-edit-${message.id}`}
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-xl text-muted-foreground/50 hover:text-primary hover:bg-primary/5 transition-all"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                data-testid={`button-admin-delete-${message.id}`}
                onClick={handleAdminDelete}
                disabled={deleteMutation.isPending}
                className="p-2 rounded-xl text-muted-foreground/50 hover:text-destructive hover:bg-destructive/5 transition-all"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
