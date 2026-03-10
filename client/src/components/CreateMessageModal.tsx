import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandHeart, EyeOff, X, Loader2, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
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

import { useCreateMessage } from "@/hooks/use-messages";
import type { MessageType } from "@/hooks/use-messages";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface CreateMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMessageModal({ isOpen, onClose }: CreateMessageModalProps) {
  const [type, setType] = useState<MessageType>("prayer");
  const [content, setContent] = useState("");
  const [wantsSpecial, setWantsSpecial] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const createMutation = useCreateMessage();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createMutation.mutate({ 
      type, 
      content, 
      isSpecial: false,
      isPrivate 
    }, {
      onSuccess: async (newMessage: any) => {
        if (type === 'prayer' && wantsSpecial) {
          setIsRedirecting(true);
          try {
            const res = await fetch("/api/payments/create-checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ messageId: newMessage.id }),
            });
            const data = await res.json();
            if (data.url) {
              window.location.href = data.url;
              return;
            } else {
              toast({
                variant: "destructive",
                title: "Erro no pagamento",
                description: data.message || "Não foi possível iniciar o pagamento.",
              });
            }
          } catch {
            toast({
              variant: "destructive",
              title: "Erro no pagamento",
              description: "Tente novamente em instantes.",
            });
          }
          setIsRedirecting(false);
        } else {
          toast({
            title: "Mensagem enviada",
            description: isPrivate
              ? type === "prayer"
                ? "Sua oração foi salva em Minha Jornada. Ela é visível apenas para você."
                : type === "grace"
                  ? "Sua graça foi salva em Minha Jornada. Ela é visível apenas para você."
                  : "Sua confissão foi salva em Minha Jornada. Ela é visível apenas para você."
              : "Sua mensagem foi compartilhada com a comunidade.",
          });
        }
        setContent("");
        setWantsSpecial(false);
        setIsPrivate(false);
        onClose();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erro ao enviar",
          description: "Tente novamente em instantes.",
        });
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-3xl w-full max-w-lg p-6 md:p-8 pointer-events-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-foreground">Escrever Mensagem</h2>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    data-testid="button-type-prayer"
                    onClick={() => setType("prayer")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                      type === "prayer" 
                        ? "border-amber-400 bg-amber-50 text-amber-700" 
                        : "border-transparent bg-black/5 hover:bg-black/10 text-muted-foreground"
                    }`}
                  >
                    <CandleIcon className="w-6 h-6" />
                    <span className="text-sm font-medium">Oração</span>
                  </button>
                  <button
                    type="button"
                    data-testid="button-type-grace"
                    onClick={() => setType("grace")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                      type === "grace" 
                        ? "border-blue-400 bg-blue-50 text-blue-700" 
                        : "border-transparent bg-black/5 hover:bg-black/10 text-muted-foreground"
                    }`}
                  >
                    <HandHeart className="w-6 h-6" />
                    <span className="text-sm font-medium">Graça</span>
                  </button>
                  <button
                    type="button"
                    data-testid="button-type-sin"
                    onClick={() => setType("sin")}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${
                      type === "sin" 
                        ? "border-slate-400 bg-slate-100 text-slate-700" 
                        : "border-transparent bg-black/5 hover:bg-black/10 text-muted-foreground"
                    }`}
                  >
                    <EyeOff className="w-6 h-6" />
                    <span className="text-sm font-medium">Confissão</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {type === "prayer" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        "p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all duration-300",
                        isPrivate
                          ? "bg-slate-50/50 border-slate-200 opacity-40 pointer-events-none select-none grayscale"
                          : "bg-amber-50/50 border-amber-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${wantsSpecial ? 'bg-amber-400 text-white shadow-lg shadow-amber-200' : 'bg-amber-100 text-amber-600'}`}>
                          <CandleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <Label className="text-sm font-medium text-amber-900">
                            Vela Especial
                          </Label>
                          <span className="text-[10px] text-amber-700/60 uppercase tracking-widest font-bold">
                            {isPrivate ? "Indisponível" : wantsSpecial ? "Será cobrado R$ 1,99" : "Destaque sua oração"}
                          </span>
                        </div>
                      </div>
                      {!wantsSpecial ? (
                        <button
                          type="button"
                          data-testid="button-buy-candle"
                          onClick={() => setWantsSpecial(true)}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-95"
                        >
                          Comprar R$ 1,99
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setWantsSpecial(false)}
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-800 transition-colors"
                        >
                          <span className="text-[10px] font-bold uppercase">Remover</span>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <Label htmlFor="private-message" className="text-sm font-medium text-slate-900 cursor-pointer">
                      Mensagem Privada
                    </Label>
                    <span className="text-[10px] text-muted-foreground">Visível apenas no seu perfil</span>
                  </div>
                  <Switch 
                    id="private-message" 
                    checked={isPrivate} 
                    onCheckedChange={(val) => { setIsPrivate(val); if (val) setWantsSpecial(false); }}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>

                <div className="relative">
                  <textarea
                    data-testid="input-message-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 400))}
                    placeholder="O que está no seu coração?"
                    className="w-full h-40 p-4 rounded-2xl bg-white/50 border border-black/10 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                    required
                  />
                  <div className={cn(
                    "absolute bottom-4 right-4 text-[10px] font-bold uppercase tracking-widest",
                    content.length >= 400 ? "text-destructive" : "text-muted-foreground/40"
                  )}>
                    {content.length}/400
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="button-submit-message"
                  disabled={createMutation.isPending || isRedirecting || !content.trim()}
                  className="w-full py-4 rounded-2xl font-semibold text-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {createMutation.isPending || isRedirecting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isRedirecting ? "Redirecionando para pagamento..." : "Enviando..."}
                    </span>
                  ) : wantsSpecial && type === 'prayer' ? (
                    "Enviar e Pagar R$ 1,99"
                  ) : (
                    "Compartilhar"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
