import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Sparkles, Lightbulb, Undo2 } from "lucide-react";
import type { FaithMessage } from "@/hooks/use-messages";
import { useLikeMessage } from "@/hooks/use-messages";
import { ShareVerseModal } from "./ShareVerseModal";
import { cn } from "@/lib/utils"; // Assuming cn is available, we will recreate it just in case:

// fallback cn since sometimes it's missing in imports
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cnLocal(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VerseFeedCardProps {
  message: FaithMessage;
  index: number;
}

export function VerseFeedCard({ message, index }: VerseFeedCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const likeMutation = useLikeMessage();

  // message.content is expected to be simple text, but wait!
  // In our new schema, `reference` and `reflection` are stored in the DB columns!
  // This means `message.reference` and `message.reflection` are available!
  const text = message.content;
  const reference = (message as any).reference || "Versículo";
  const reflection = (message as any).reflection || "Sem reflexão.";

  const handleAmen = () => {
    likeMutation.mutate(message.id);
  };

  const actionLabel =
    message.likesCount === 0
      ? "Amém"
      : `${message.likesCount} amém${message.likesCount > 1 ? "s" : ""}`;

  return (
    <div className="masonry-item perspective-1000 relative">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.35,
          delay: Math.min(index * 0.05, 0.3),
          ease: "easeOut",
        }}
        className="relative group w-full"
        style={{ transformStyle: "preserve-3d" }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 60, damping: 15 }}
          className="relative w-full grid"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/*******************************************
           * FRONT SIDE (VERSE)
           *******************************************/}
          <motion.div
            animate={{ opacity: flipped ? 0 : 1 }}
            transition={{ duration: 0.1, delay: flipped ? 0 : 0.35 }}
            className="col-start-1 row-start-1 w-full min-h-[280px] rounded-[2rem] p-6 flex flex-col justify-between shadow-md border-0 pointer-events-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              backgroundColor: "#fdfaf4",
              background: "linear-gradient(135deg, #fdfaf4 0%, #f5ecd8 100%)",
            }}
          >
            {/* Celestial Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl pointer-events-none -translate-x-4 translate-y-4" style={{ transform: "translateZ(-1px)" }} />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none translate-x-4 -translate-y-4" style={{ transform: "translateZ(-1px)" }} />
            
            {/* Fine Gold border decoration */}
            <div className="absolute inset-2 border border-amber-500/20 rounded-[1.5rem] pointer-events-none" style={{ transform: "translateZ(-1px)" }} />

            <div className="flex flex-col items-center justify-center flex-1 text-center" style={{ transform: "translateZ(1px)" }}>
              <Sparkles className="w-6 h-6 text-amber-500/50 mb-4" />
              <p className="text-foreground/80 text-xl md:text-2xl font-serif italic leading-relaxed mb-4">
                "{text}"
              </p>
              <span className="text-sm font-bold tracking-widest uppercase text-amber-700/80">
                {reference}
              </span>
            </div>

            {/* Footer Interactions (Front) */}
            <div className="mt-6 pt-4 border-t border-amber-900/10 flex items-center justify-between" style={{ transform: "translateZ(1px)" }}>
              <button
                onClick={handleAmen}
                disabled={likeMutation.isPending}
                className={cnLocal(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95",
                  message.likesCount > 0
                    ? "bg-amber-100 text-amber-700"
                    : "text-amber-700/60 hover:bg-amber-100 hover:text-amber-700"
                )}
              >
                <Heart
                  className={cnLocal(
                    "w-4 h-4 pointer-events-none",
                    message.likesCount > 0 && "fill-current"
                  )}
                />
                <span className="pointer-events-none text-xs">{actionLabel}</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setFlipped(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-amber-700/60 hover:bg-amber-100 hover:text-amber-700 transition-colors text-xs font-medium"
                >
                  <Lightbulb className="w-4 h-4" />
                  Refletir
                </button>
                <button
                  onClick={() => setShowShare(true)}
                  className="p-1.5 rounded-lg text-amber-700/60 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/*******************************************
           * BACK SIDE (REFLECTION)
           *******************************************/}
          <motion.div
            animate={{ opacity: flipped ? 1 : 0 }}
            transition={{ duration: 0.1, delay: flipped ? 0.35 : 0 }}
            className="col-start-1 row-start-1 w-full min-h-[280px] rounded-[2rem] p-6 flex flex-col justify-between shadow-md border-0 pointer-events-auto"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              backgroundColor: "#fefefd",
              background: "linear-gradient(135deg, #fefefd 0%, #f6f7fb 100%)",
            }}
          >
            {/* Back Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-blue-200/30 rounded-full blur-3xl pointer-events-none translate-x-4 translate-y-4" style={{ transform: "translateZ(-1px)" }} />
            <div className="absolute inset-2 border border-slate-900/10 rounded-[1.5rem] pointer-events-none" style={{ transform: "translateZ(-1px)" }} />

            <div className="flex flex-col flex-1" style={{ transform: "translateZ(1px)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
                  Reflexão
                </span>
                <Sparkles className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <p className="text-slate-600/90 text-base leading-relaxed">
                 {reflection}
               </p>
              </div>
            </div>

            {/* Footer Interactions (Back) */}
            <div className="mt-6 pt-4 border-t border-slate-900/10 flex items-center justify-between" style={{ transform: "translateZ(1px)" }}>
               <button
                onClick={handleAmen}
                disabled={likeMutation.isPending}
                className={cnLocal(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95",
                  message.likesCount > 0
                    ? "bg-slate-100 text-slate-700"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                )}
              >
                <Heart
                  className={cnLocal(
                    "w-4 h-4 pointer-events-none",
                    message.likesCount > 0 && "fill-current text-slate-700"
                  )}
                />
                <span className="pointer-events-none text-xs">{actionLabel}</span>
              </button>

              <button
                onClick={() => setFlipped(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors text-xs font-medium"
              >
                <Undo2 className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {showShare && (
        <ShareVerseModal
          verseOfDay={{ text, reference }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
