import { useState } from "react";
import { motion } from "framer-motion";
import { HandHeart, EyeOff, Heart, CheckCircle2, Trash2, Pencil, X, Check } from "lucide-react";
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

interface FloatingBubbleProps {
  message: FaithMessage;
  index: number;
  isAdmin?: boolean;
}

export function FloatingBubble({ message, index, isAdmin }: FloatingBubbleProps) {
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

  const handleAction = () => {
    if (isPrayer || isGrace) {
      likeMutation.mutate(message.id);
    } else if (isSin && !message.isPardoned) {
      pardonMutation.mutate(message.id);
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
                  <HandsPrayerIcon className="w-6 h-6" />
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
                  {isPrayer ? <HandsPrayerIcon className="w-3 h-3" /> : <HandHeart className="w-3 h-3" />}
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground/90">
                {isSin ? "Anônimo" : message.authorName || "Caminhante da Fé"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: ptBR })}
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
              "flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 font-medium select-none touch-manipulation min-h-[44px]",
              (isPrayer || isGrace) && (message.likesCount > 0 ? "bg-primary/10 text-primary" : "hover:bg-primary/10 hover:text-primary active:scale-95 text-muted-foreground"),
              isSin && message.isPardoned 
                ? "bg-green-100 text-green-700 cursor-default" 
                : isSin && "hover:bg-green-50 hover:text-green-600 text-muted-foreground active:scale-95"
            )}
          >
            {isPrayer ? (
              <>
                <HandsPrayerIcon className={cn("w-5 h-5 pointer-events-none", message.likesCount > 0 && "fill-current text-primary")} />
                <span className="pointer-events-none">
                  {message.likesCount > 0 ? `${message.likesCount} orando pela causa` : "Orar"}
                </span>
              </>
            ) : isGrace ? (
              <>
                <Heart className={cn("w-5 h-5 pointer-events-none", message.likesCount > 0 && "fill-current text-primary")} />
                <span className="pointer-events-none">{message.likesCount > 0 ? message.likesCount : "Amém"}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className={cn("w-5 h-5 pointer-events-none", message.isPardoned && "fill-current")} />
                <span className="pointer-events-none">{message.isPardoned ? "Perdoado" : "Perdoar"}</span>
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
