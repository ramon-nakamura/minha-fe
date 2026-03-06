import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useDeleteMessage, useDeleteMessages } from "@/hooks/use-messages";
import { Quote, Share2, Sparkles, X, Loader2, ArrowLeft, Trash2, CheckSquare, Square, HandHelping, MessageSquare, Flame, CheckCircle2, Ghost, Heart } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { FloatingBubble } from "@/components/FloatingBubble";
import { motion, AnimatePresence } from "framer-motion";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useMessages({ authorId: user?.id });
  const deleteMutation = useDeleteMessage();
  const deleteBulkMutation = useDeleteMessages();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showReflection, setShowReflection] = useState(false);

  const verseOfDay = {
    text: "O Senhor é o meu pastor, nada me faltará.",
    reference: "Salmos 23:1",
    reflection: "Este versículo lembra que Deus é aquele que guia, protege e supre. Mesmo em momentos de incerteza, confiar no cuidado divino traz paz ao coração."
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Voltar</span>
            </button>
          </Link>
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">Minha Jornada</h1>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-12">
        {/* Versículo do Dia */}
        <section className="bg-transparent text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/10 to-transparent blur-3xl -z-10" />
          <div className="flex justify-center">
            <Quote className="w-8 h-8 text-primary/20" />
          </div>
          <div className="space-y-2 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <p className="text-3xl md:text-5xl text-foreground leading-snug tracking-tight text-glow" style={{ fontFamily: "var(--font-display)" }}>
                  "{verseOfDay.text}"
                </p>
                <p className="text-sm font-bold uppercase tracking-widest text-primary/60 mt-4">
                  {verseOfDay.reference}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setShowReflection(true)}
              className="px-6 py-2.5 rounded-full bg-white border border-black/5 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-primary/5 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Refletir
            </button>
          </div>
        </section>

        {/* My Contributions - Restored Design */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.map((msg, idx) => (
                <div key={msg.id} className="relative group">
                  <div className="absolute top-4 left-4 z-20">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(msg.id);
                      }}
                      className="p-1 rounded-lg bg-white/80 backdrop-blur-sm border border-black/5 shadow-sm hover:scale-110 transition-all"
                    >
                      {selectedIds.includes(msg.id) ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </button>
                  </div>
                  <FloatingBubble message={msg} index={idx} isAdmin={isAdmin} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/20 rounded-3xl border border-dashed border-slate-200">
              <p className="text-muted-foreground text-sm">Você ainda não compartilhou nenhuma mensagem.</p>
            </div>
          )}
        </section>

        {/* Community Guide - Updated with types */}
        <section className="bg-gradient-to-br from-primary/10 to-amber-100/10 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60">
          <div className="flex items-center gap-4 mb-8 text-center md:text-left justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <HandHelping className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold">Guia da Comunidade</h3>
              <p className="text-sm text-muted-foreground">Entenda como você pode contribuir com a nossa rede de fé</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Oração</p>
              <p className="text-xs text-slate-600 leading-relaxed">Peça intercessão por uma causa pessoal, familiar ou por alguém especial. A comunidade orará por você.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Vela Especial</p>
              <p className="text-xs text-slate-600 leading-relaxed">Destaque sua oração com uma vela virtual. Mensagens especiais recebem mais visibilidade e atenção.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Graça alcançada</p>
              <p className="text-xs text-slate-600 leading-relaxed">Celebre e agradeça por uma benção recebida. Seu testemunho fortalece a fé de todos os irmãos.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/40 border border-white/60 shadow-sm hover:bg-white/60 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center mb-4">
                <Ghost className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Confissão</p>
              <p className="text-xs text-slate-600 leading-relaxed">Compartilhe um peso do coração de forma anônima. Alivie sua alma e receba o perdão simbólico da comunidade.</p>
            </div>
          </div>
        </section>
      </main>

      {showReflection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowReflection(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-slate-400"><X className="w-5 h-5" /></button>
            <div className="space-y-4 text-center">
              <h3 className="text-xl font-display font-bold text-slate-900">Reflexão</h3>
              <p className="text-slate-600 leading-relaxed font-medium">{verseOfDay.reflection}</p>
              <button onClick={() => setShowReflection(false)} className="w-full mt-4 py-3 rounded-2xl bg-primary text-white font-bold">Amém</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
