import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { LegalModal } from "@/components/LegalModal";

const COOKIE_CONSENT_KEY = "minhafe_cookie_consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  };

  return (
    <>
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[100] p-4"
        >
          <div className="max-w-2xl mx-auto bg-white/95 backdrop-blur-xl border border-white shadow-2xl shadow-black/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 rounded-xl bg-amber-50 shrink-0 mt-0.5">
                <Cookie className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Utilizamos cookies e tecnologias semelhantes para manter sua sessão ativa e melhorar sua experiência.
                Ao continuar, você concorda com nossa{" "}
                <button type="button" data-testid="link-cookie-privacy" onClick={() => setShowPrivacy(true)} className="text-primary font-semibold hover:underline">
                  Política de Privacidade
                </button>.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                data-testid="button-accept-cookies"
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-primary text-primary-foreground font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Aceitar
              </button>
              <button
                onClick={handleAccept}
                className="p-2 rounded-xl text-muted-foreground hover:bg-black/5 transition-colors sm:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    <LegalModal type={showPrivacy ? "privacy" : null} onClose={() => setShowPrivacy(false)} />
    </>
  );
}
