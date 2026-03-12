import { useState, useRef, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useDeleteMessage, useDeleteMessages, useLikeMessage, usePardonMessage } from "@/hooks/use-messages";
import { Quote, Share2, Sparkles, X, Loader2, ArrowLeft, Trash2, CheckSquare, Square, BookPlus, MessageSquare, HeartHandshake, HandHeart, EyeOff, Heart, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

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

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const { data: messages, isLoading } = useMessages({ authorId: user?.id });
  const deleteMutation = useDeleteMessage();
  const deleteBulkMutation = useDeleteMessages();
  const likeMutation = useLikeMessage();
  const pardonMutation = usePardonMessage();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showReflection, setShowReflection] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [shareImages, setShareImages] = useState<{ label: string; dataUrl: string; filename: string }[]>([]);

  const verses = [
    {
      text: "O Senhor é o meu pastor, nada me faltará.",
      reference: "Salmos 23:1",
      reflection: "Há momentos em que a vida parece escassa — de tempo, de energia, de esperança. Este versículo não promete ausência de dificuldades, mas presença constante. Seja qual for o caminho que você percorre, há uma força maior que caminha ao seu lado e cuida para que o essencial nunca falte."
    },
    {
      text: "Porque sou eu que conheço os planos que tenho para vocês, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.",
      reference: "Jeremias 29:11",
      reflection: "Quando o presente parece sem saída, é difícil enxergar além dele. Mas este versículo convida a uma perspectiva maior: a de que existe um propósito tecido para cada vida. Não importa a origem, a história ou os tropeços — há um futuro sendo construído para você."
    },
    {
      text: "Posso tudo naquele que me fortalece.",
      reference: "Filipenses 4:13",
      reflection: "Não se trata de invencibilidade, mas de resiliência. Este versículo fala de uma força que não vem de dentro sozinha, mas de uma fonte que nos sustenta quando chegamos ao limite. Cada pessoa que já levantou depois de cair conhece, de alguma forma, esse poder."
    },
    {
      text: "Pois Deus não nos deu um espírito de timidez, mas de poder, de amor e de equilíbrio.",
      reference: "2 Timóteo 1:7",
      reflection: "O medo é parte da experiência humana, mas não precisa ser o condutor da sua vida. Você foi feito para agir com coragem, para amar com profundidade e para tomar decisões com clareza. Esses dons já estão em você — às vezes só precisam ser lembrados."
    },
    {
      text: "Vinde a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.",
      reference: "Mateus 11:28",
      reflection: "Vivemos num mundo que glorifica a produtividade a qualquer custo. Este versículo é um convite radical ao oposto: parar, respirar, receber cuidado. Não há vergonha no cansaço — há humanidade. E nessa humanidade, há espaço para ser acolhido."
    },
    {
      text: "Não se inquietem com nada, mas em tudo, pela oração e súplica, com ação de graças, apresentem seus pedidos a Deus.",
      reference: "Filipenses 4:6",
      reflection: "A ansiedade é uma das experiências mais comuns da vida contemporânea. Este versículo não minimiza o que você sente — ele oferece uma alternativa: transformar a preocupação em conversa. Falar sobre o que pesa, seja com Deus, seja com alguém de confiança, já é um ato de cura."
    },
    {
      text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.",
      reference: "1 Coríntios 13:4",
      reflection: "O amor verdadeiro não precisa competir nem provar nada. Ele simplesmente existe, sustenta e respeita. Esta descrição é um espelho útil para nossas relações — familiares, românticas, de amizade — e nos lembra que amar bem é uma prática diária, não um sentimento que simplesmente acontece."
    },
    {
      text: "Não faças nada por ambição egoísta ou vanglória, mas com humildade considere os outros superiores a si mesmo.",
      reference: "Filipenses 2:3",
      reflection: "Num mundo que incentiva a autopromoção constante, a humildade parece contracultural. Mas ela não é fraqueza — é a capacidade de enxergar o outro como igualmente valioso. Quando paramos de competir e começamos a colaborar, todos crescemos."
    },
    {
      text: "Sede bondosos e compassivos uns para com os outros, perdoando-vos mutuamente, assim como Deus vos perdoou em Cristo.",
      reference: "Efésios 4:32",
      reflection: "Perdoar não significa apagar o que aconteceu ou fingir que não doeu. Significa escolher não carregar o peso do ressentimento como identidade. O perdão, antes de ser um presente ao outro, é uma liberação para si mesmo."
    },
    {
      text: "Antes de te formar no ventre materno, eu te conheci; antes de nasceres, eu te separei.",
      reference: "Jeremias 1:5",
      reflection: "Você não é um acidente. Independente das circunstâncias do seu nascimento, da sua família, da sua trajetória — há um propósito inscrito na sua existência. Este versículo é um convite a acreditar que você foi pensado, desejado e chamado para algo significativo."
    },
    {
      text: "Confia no Senhor de todo o teu coração e não te apoies no teu próprio entendimento.",
      reference: "Provérbios 3:5",
      reflection: "Nossa mente é poderosa, mas limitada. Há momentos em que as respostas não cabem na lógica — e precisamos de algo maior que nos oriente. Confiar não é ignorar a razão, mas reconhecer que existe sabedoria além do que podemos calcular sozinhos."
    },
    {
      text: "Não se amolde ao padrão deste mundo, mas transforme-se pela renovação da sua mente.",
      reference: "Romanos 12:2",
      reflection: "As pressões para ser o que o mundo espera de você são enormes — no corpo, no sucesso, no comportamento. Este versículo convida à resistência gentil: a de construir sua identidade de dentro para fora, renovando continuamente o que você acredita sobre si mesmo e sobre o mundo."
    },
    {
      text: "Mesmo que eu ande pelo vale da sombra da morte, não temerei mal algum, pois tu estás comigo.",
      reference: "Salmos 23:4",
      reflection: "Todos nós passamos por períodos sombrios — perdas, crises, dores que parecem não ter fim. Este versículo não promete que o vale não existirá, mas que você não o atravessa sozinho. Há uma presença que acompanha mesmo quando não conseguimos sentir."
    },
    {
      text: "Portanto, não temais; mais valeis do que muitos pardais.",
      reference: "Mateus 10:31",
      reflection: "Em momentos de insegurança, é fácil se sentir pequeno ou descartável. Este versículo, com toda a sua simplicidade, afirma o contrário: você tem valor imensurável. Não pelo que produz ou aparenta, mas pelo simples fato de existir."
    },
    {
      text: "Mas os que esperam no Senhor renovarão as suas forças. Voarão alto como águias.",
      reference: "Isaías 40:31",
      reflection: "Esperar não é passividade — é confiança ativa. Há um tipo de força que só nasce quando paramos de forçar e permitimos ser renovados. Este versículo fala de voos que ainda estão por vir, de alturas que o cansaço de hoje não pode imaginar."
    },
    {
      text: "Amai-vos uns aos outros como eu vos amei.",
      reference: "João 13:34",
      reflection: "Este é um dos mandamentos mais simples e mais difíceis ao mesmo tempo. Amar como Jesus amou é amar sem distinção de origem, aparência, crença ou história. É um amor que inclui, que serve, que não exige ser perfeito para merecer cuidado."
    },
    {
      text: "Buscai primeiro o Reino de Deus e a sua justiça, e todas essas coisas vos serão acrescentadas.",
      reference: "Mateus 6:33",
      reflection: "Quando colocamos o que realmente importa no centro, o restante encontra seu lugar. Este versículo não é uma promessa de riqueza material — é um convite a reordenar as prioridades, colocando valores como justiça, compaixão e integridade acima da acumulação e da aparência."
    },
    {
      text: "O fruto do Espírito é amor, alegria, paz, paciência, amabilidade, bondade, fidelidade, mansidão e domínio próprio.",
      reference: "Gálatas 5:22-23",
      reflection: "Esses não são objetivos a conquistar — são frutos que crescem naturalmente quando nos conectamos ao que é essencial. Cada um deles é uma forma de presença no mundo: estar inteiro com as pessoas que amamos, ser gentil consigo mesmo, agir com consistência mesmo quando ninguém vê."
    },
    {
      text: "Honra a teu pai e a tua mãe.",
      reference: "Êxodo 20:12",
      reflection: "Honrar não significa concordar com tudo ou silenciar diante do que machuca. Significa reconhecer a humanidade daqueles que nos geraram — com suas falhas, suas histórias e seus limites. É possível honrar e ao mesmo tempo estabelecer limites saudáveis. As duas coisas coexistem."
    },
    {
      text: "Deus é refúgio e fortaleza para nós; socorro bem presente nas tribulações.",
      reference: "Salmos 46:1",
      reflection: "Todos nós precisamos de um lugar seguro. Para alguns é uma pessoa, para outros é um lar, para outros é a fé. Este versículo fala de um refúgio que não fecha as portas — disponível em qualquer momento, especialmente nos mais difíceis."
    },
    {
      text: "Não julgueis, para que não sejais julgados.",
      reference: "Mateus 7:1",
      reflection: "Julgamos o que não entendemos, e geralmente entendemos muito menos do que pensamos sobre a vida do outro. Este versículo nos convida à humildade de reconhecer que cada pessoa carrega uma história que não está visível na superfície. Menos julgamento, mais curiosidade e compaixão."
    },
    {
      text: "Bendito o homem que confia no Senhor, cuja esperança é o Senhor.",
      reference: "Jeremias 17:7",
      reflection: "Esperança não é otimismo ingênuo — é a decisão de acreditar que amanhã pode ser diferente de hoje. Quando ancoramos essa esperança em algo maior que nós mesmos, ela se torna mais resistente às tempestades da vida."
    },
    {
      text: "Alegrai-vos sempre no Senhor; outra vez digo: alegrai-vos.",
      reference: "Filipenses 4:4",
      reflection: "A alegria aqui não é superficialidade ou negação da dor. É uma escolha profunda de encontrar motivos para celebrar mesmo em meio ao imperfeito. Pequenas gratidões, momentos de beleza inesperada, conexões genuínas — a alegria muitas vezes mora nos detalhes."
    },
    {
      text: "Que o Deus da esperança vos encha de todo o gozo e paz no crer.",
      reference: "Romanos 15:13",
      reflection: "Gozo e paz são estados internos que independem das circunstâncias externas. Este versículo fala de um preenchimento que vem de dentro — uma completude que não depende de tudo estar perfeito lá fora. É possível ter paz mesmo quando o mundo ao redor está agitado."
    },
    {
      text: "Assim como quereis que os homens vos façam, fazei-o vós também a eles.",
      reference: "Lucas 6:31",
      reflection: "A Regra de Ouro atravessa culturas e séculos porque fala de algo universal: empatia. Antes de agir, perguntar-se como você gostaria de ser tratado nessa situação é um exercício simples que transforma relacionamentos, comunidades e sociedades inteiras."
    },
    {
      text: "Eu vim para que tenham vida e a tenham em abundância.",
      reference: "João 10:10",
      reflection: "Abundância não é sinônimo de excesso material. É viver com plenitude — com propósito, conexão, saúde, alegria e significado. Este versículo é um convite a questionar o que realmente nos faz sentir vivos e a buscar isso com intenção."
    },
    {
      text: "Onde estiver o vosso tesouro, aí estará também o vosso coração.",
      reference: "Mateus 6:21",
      reflection: "O que você prioriza com seu tempo, sua atenção e sua energia revela o que você realmente valoriza. Este versículo é um convite à auto-observação honesta: o que você está cultivando? O que está recebendo a melhor versão de você?"
    },
    {
      text: "Sede fortes e corajosos. Não temais, nem vos atemorizeis, porque o Senhor, vosso Deus, vai convosco.",
      reference: "Deuteronômio 31:6",
      reflection: "Coragem não é ausência de medo — é agir mesmo com ele. Este versículo foi dito a um povo que enfrentava o desconhecido, e ressoa com todos que hoje enfrentam suas próprias travessias. Você não precisa ser invencível para seguir em frente."
    },
    {
      text: "A fé é a certeza daquilo que esperamos e a prova das coisas que não vemos.",
      reference: "Hebreus 11:1",
      reflection: "A fé não exige respostas antes de dar o próximo passo. Ela é a capacidade de caminhar mesmo quando o caminho não está totalmente visível. É confiar no processo, nas pessoas ao nosso redor e em algo maior — mesmo quando as evidências ainda não chegaram."
    },
    {
      text: "Nenhum de vós vive para si mesmo, e nenhum morre para si mesmo.",
      reference: "Romanos 14:7",
      reflection: "Somos seres de relação. Nossas escolhas afetam outros, e as escolhas dos outros nos afetam. Esta consciência de interdependência é a base de uma comunidade saudável — onde cada pessoa importa, onde o bem de um contribui para o bem de todos."
    }
  ];

  const verseOfDay = useMemo(() => {
    const idx = Math.floor(Math.random() * verses.length);
    return verses[idx];
  }, []);

  const generateShareImage = useCallback(async (
    bgSrc: string,
    width: number,
    height: number,
    label: string,
    filename: string,
    verse: { text: string; reference: string }
  ): Promise<{ label: string; dataUrl: string; filename: string }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);

        const padding = width * 0.1;
        const maxTextWidth = width - padding * 2;

        const isWide = width > height;
        const isStory = height > width;
        const baseFontSize = isWide ? Math.floor(width * 0.034) : isStory ? Math.floor(width * 0.072) : Math.floor(width * 0.058);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = `bold ${baseFontSize * 2.5}px Georgia, serif`;
        ctx.fillStyle = "rgba(180, 140, 60, 0.3)";
        ctx.fillText('"', width / 2 - maxTextWidth / 2 + baseFontSize, height * 0.35);

        ctx.font = `${baseFontSize}px Georgia, 'Times New Roman', serif`;
        ctx.fillStyle = "rgba(60, 50, 30, 0.88)";

        const words = verse.text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxTextWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);

        const lineHeight = baseFontSize * 1.55;
        const totalTextHeight = lines.length * lineHeight;
        let startY = height / 2 - totalTextHeight / 2 - baseFontSize * 1.2;
        if (startY < height * 0.25) startY = height * 0.25;

        lines.forEach((line, i) => {
          ctx.fillText(line, width / 2, startY + i * lineHeight);
        });

        const refY = startY + lines.length * lineHeight + baseFontSize * 1.0;
        ctx.font = `bold ${Math.floor(baseFontSize * 0.7)}px 'Arial', sans-serif`;
        ctx.fillStyle = "rgba(160, 120, 40, 0.85)";
        ctx.fillText(verse.reference.toUpperCase(), width / 2, refY);

        const dividerY = refY + baseFontSize * 1.2;
        ctx.beginPath();
        ctx.moveTo(width / 2 - 60, dividerY);
        ctx.lineTo(width / 2 + 60, dividerY);
        ctx.strokeStyle = "rgba(180, 140, 60, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const siteY = dividerY + baseFontSize * 1.0;
        ctx.font = `${Math.floor(baseFontSize * 0.62)}px 'Arial', sans-serif`;
        ctx.fillStyle = "rgba(120, 100, 60, 0.7)";
        ctx.fillText("minhafe.com.br", width / 2, siteY);

        resolve({ label, dataUrl: canvas.toDataURL("image/jpeg", 0.95), filename });
      };
      img.src = bgSrc;
    });
  }, []);

  const handleOpenShare = useCallback(async () => {
    setShowShare(true);
    setGeneratingImages(true);
    setShareImages([]);

    const formats = [
      { src: "/bg-story.jpg", width: 1080, height: 1920, label: "Story (9:16)", filename: "versiculo-story.jpg" },
      { src: "/bg-square.jpg", width: 1080, height: 1080, label: "Quadrado (1:1)", filename: "versiculo-quadrado.jpg" },
      { src: "/bg-wide.jpg", width: 1920, height: 1080, label: "Paisagem (16:9)", filename: "versiculo-paisagem.jpg" },
    ];

    const results = await Promise.all(
      formats.map(f => generateShareImage(f.src, f.width, f.height, f.label, f.filename, verseOfDay))
    );

    setShareImages(results);
    setGeneratingImages(false);
  }, [verseOfDay, generateShareImage]);

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
            <button 
              onClick={handleOpenShare}
              className="px-6 py-2.5 rounded-full bg-white border border-black/5 text-slate-700 font-bold text-sm flex items-center gap-2 hover:bg-primary/5 transition-all shadow-sm"
            >
              <Share2 className="w-4 h-4 text-primary" />
              Compartilhar
            </button>
          </div>
        </section>

        {/* My Contributions — Timeline */}
        <section className="space-y-8">
          {/* Header */}
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
            <div className="relative">

              {/* ── MOBILE: linha à esquerda ── */}
              <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent md:hidden" />

              {/* ── DESKTOP: linha central ── */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden md:block" />

              <div className="space-y-8">
                {messages.map((msg, idx) => {
                  const isPrayer = msg.type === "prayer";
                  const isGrace = msg.type === "grace";
                  const isSin = msg.type === "sin";

                  // Cores do ponto na linha para cada tipo
                  const dotCfg = {
                    prayer: { dotBg: "bg-amber-400", dotRing: "ring-amber-100", connectorFrom: "from-amber-200/60" },
                    grace:  { dotBg: "bg-blue-400",  dotRing: "ring-blue-100",  connectorFrom: "from-blue-200/60"  },
                    sin:    { dotBg: "bg-slate-300",  dotRing: "ring-slate-100", connectorFrom: "from-slate-200/60" },
                  }[msg.type] ?? { dotBg: "bg-primary", dotRing: "ring-primary/20", connectorFrom: "from-primary/20" };

                  const isLeft = idx % 2 === 0;
                  const date = new Date(msg.createdAt);

                  const CardContent = (
                    <div className="relative group">
                      {/* Checkbox — visível no hover ou quando selecionado */}
                      <div className={`absolute top-3 right-3 z-20 transition-opacity ${selectedIds.includes(msg.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(msg.id); }}
                          className="p-1 rounded-lg bg-white/80 backdrop-blur-sm border border-black/5 shadow-sm hover:scale-110 transition-all"
                        >
                          {selectedIds.includes(msg.id)
                            ? <CheckSquare className="w-3.5 h-3.5 text-primary" />
                            : <Square className="w-3.5 h-3.5 text-slate-300" />}
                        </button>
                      </div>

                      {/* Wrapper com borda animada para especial */}
                      <div className={`relative rounded-[1.5rem] overflow-hidden transition-all duration-500
                        ${msg.isSpecial ? "" : "bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.07)] hover:-translate-y-0.5"}
                        ${selectedIds.includes(msg.id) ? "ring-2 ring-primary/30" : ""}
                      `}>
                        {/* Borda animada dourada para especial */}
                        {msg.isSpecial && (
                          <>
                            <div className="absolute inset-0 rounded-[1.5rem] z-0 pointer-events-none" style={{
                              padding: "1.5px",
                              background: "linear-gradient(var(--angle, 0deg), #f5e27a, #c8973a, #f0d060, #a87830, #f5e27a)",
                              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                              WebkitMaskComposite: "xor",
                              maskComposite: "exclude",
                              animation: "spin-border 3s linear infinite",
                            }} />
                            <div className="absolute inset-[1.5px] rounded-[calc(1.5rem-1.5px)] z-0 pointer-events-none"
                              style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fdf8e8 50%, #fffef7 100%)" }} />
                          </>
                        )}

                        {/* Glow de fundo */}
                        <div className={`absolute -top-8 -right-8 w-24 h-24 blur-3xl rounded-full pointer-events-none
                          ${isPrayer && !msg.isSpecial ? "opacity-25 bg-amber-400" : ""}
                          ${isPrayer && msg.isSpecial ? "opacity-35 bg-yellow-300" : ""}
                          ${isGrace ? "opacity-25 bg-blue-400" : ""}
                          ${isSin ? "opacity-20 bg-slate-400" : ""}
                        `} />

                        <div className="relative z-10 p-4">
                          {/* Header: avatar + nome + badge */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar */}
                              <div className="relative">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-inner overflow-hidden
                                  ${isPrayer ? "bg-amber-100/80 text-amber-600" : ""}
                                  ${isGrace ? "bg-blue-100/80 text-blue-600" : ""}
                                  ${isSin ? "bg-slate-200/80 text-slate-600" : ""}
                                `}>
                                  {isSin ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : msg.authorImage ? (
                                    <img src={msg.authorImage} alt="" className="w-full h-full object-cover" />
                                  ) : isPrayer ? (
                                    <CandleIcon className="w-4 h-4" />
                                  ) : (
                                    <HandHeart className="w-4 h-4" />
                                  )}
                                </div>
                                {/* Badge mini no avatar */}
                                {!isSin && (
                                  <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm
                                    ${isPrayer ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"}
                                  `}>
                                    {isPrayer ? <CandleIcon className="w-2 h-2" /> : <HandHeart className="w-2 h-2" />}
                                  </div>
                                )}
                              </div>
                              {/* Nome e tempo */}
                              <div>
                                <p className="text-xs font-semibold text-foreground/90 leading-tight">
                                  {isSin ? "Anônimo" : (msg as any).authorName || "Caminhante da Fé"}
                                </p>
                                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                            </div>
                            {/* Badge tipo */}
                            <div className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border bg-white/50 border-white text-muted-foreground whitespace-nowrap">
                              {isPrayer && (msg.isSpecial ? "Especial" : "Oração")}
                              {isGrace && "Graça"}
                              {isSin && "Confissão"}
                            </div>
                          </div>

                          {/* Conteúdo */}
                          <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3 font-medium mb-3">
                            {msg.content}
                          </p>

                          {/* Botão de ação */}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => {
                                if (isPrayer || isGrace) likeMutation.mutate(msg.id);
                                else if (isSin) pardonMutation.mutate(msg.id);
                              }}
                              disabled={likeMutation.isPending || pardonMutation.isPending}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95
                                ${(isPrayer || isGrace) && (msg.likesCount > 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/60 hover:bg-primary/10 hover:text-primary")}
                                ${isSin && (msg.likesCount > 0 ? "bg-green-100 text-green-700" : "text-muted-foreground/60 hover:bg-green-50 hover:text-green-600")}
                              `}
                            >
                              {isPrayer ? (
                                <>
                                  <CandleIcon className={`w-3.5 h-3.5 ${msg.likesCount > 0 ? "fill-current" : ""}`} />
                                  <span>
                                    {msg.likesCount === 0
                                      ? "Orar"
                                      : `${msg.likesCount} orando com você`}
                                  </span>
                                </>
                              ) : isGrace ? (
                                <>
                                  <Heart className={`w-3.5 h-3.5 ${msg.likesCount > 0 ? "fill-current" : ""}`} />
                                  <span>
                                    {msg.likesCount === 0
                                      ? "Amém"
                                      : `${msg.likesCount} comemorando com você`}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <HeartHandshake className={`w-3.5 h-3.5 ${msg.likesCount > 0 ? "fill-current" : ""}`} />
                                  <span>
                                    {msg.likesCount === 0
                                      ? "Perdoar"
                                      : `${msg.likesCount} ${msg.likesCount === 1 ? "perdão recebido" : "perdões recebidos"}`}
                                  </span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.055, ease: "easeOut" }}
                    >
                      {/* ── MOBILE layout: linha esquerda, data+card à direita ── */}
                      <div className="flex items-start gap-0 md:hidden">
                        {/* Ponto + linha */}
                        <div className="flex flex-col items-center flex-shrink-0 w-[44px]">
                          <div className={`w-3 h-3 rounded-full ${dotCfg.dotBg} ring-4 ${dotCfg.dotRing} shadow-sm mt-1 z-10`} />
                        </div>
                        {/* Data + card */}
                        <div className="flex-1 pl-2 pb-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                              {format(date, "dd MMM", { locale: ptBR })}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {format(date, "HH:mm")}
                            </span>
                          </div>
                          {CardContent}
                        </div>
                      </div>

                      {/* ── DESKTOP layout: alternado, linha central ── */}
                      <div className="hidden md:grid md:grid-cols-[1fr_56px_1fr] md:items-start md:gap-0">

                        {/* Coluna esquerda */}
                        <div className="pr-6">
                          {isLeft ? (
                            <div className="relative">
                              {CardContent}
                              {/* Conector → ponto */}
                              <div className={`absolute top-6 -right-6 w-6 h-px bg-gradient-to-r ${dotCfg.connectorFrom} to-transparent`} />
                            </div>
                          ) : (
                            /* Data alinhada à direita quando card está na direita */
                            <div className="flex flex-col items-end pt-4 pr-1">
                              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                                {format(date, "dd MMM", { locale: ptBR })}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60">
                                {format(date, "HH:mm")}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Ponto central */}
                        <div className="flex flex-col items-center pt-4 z-10">
                          <div className={`w-3.5 h-3.5 rounded-full ${dotCfg.dotBg} ring-4 ${dotCfg.dotRing} shadow-sm`} />
                        </div>

                        {/* Coluna direita */}
                        <div className="pl-6">
                          {!isLeft ? (
                            <div className="relative">
                              {/* Conector ponto → */}
                              <div className={`absolute top-6 -left-6 w-6 h-px bg-gradient-to-l ${dotCfg.connectorFrom} to-transparent`} />
                              {CardContent}
                            </div>
                          ) : (
                            /* Data alinhada à esquerda quando card está na esquerda */
                            <div className="flex flex-col items-start pt-4 pl-1">
                              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">
                                {format(date, "dd MMM", { locale: ptBR })}
                              </span>
                              <span className="text-[10px] text-muted-foreground/60">
                                {format(date, "HH:mm")}
                              </span>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Fim da linha */}
              <div className="flex md:justify-center justify-start pl-[18px] md:pl-0 mt-8">
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                  <span>início da sua jornada</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                </div>
              </div>
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
              <BookPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-bold">Guia da Comunidade</h3>
              <p className="text-sm text-muted-foreground">Entenda como você pode contribuir com a nossa rede de fé</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(38,146,255,0.12)] hover:bg-white/60 hover:border-white transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <CandleIcon className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Oração</p>
              <p className="text-xs text-slate-600 leading-relaxed">Peça intercessão por uma causa pessoal, familiar ou por alguém especial. A comunidade orará por você.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(38,146,255,0.12)] hover:bg-white/60 hover:border-white transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4 relative">
                <CandleIcon className="w-5 h-5" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Vela Especial</p>
              <p className="text-xs text-slate-600 leading-relaxed">Destaque sua oração com uma vela virtual. Mensagens especiais recebem mais visibilidade e atenção.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(38,146,255,0.12)] hover:bg-white/60 hover:border-white transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-4">
                <HandHeart className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 mb-2">Graça alcançada</p>
              <p className="text-xs text-slate-600 leading-relaxed">Celebre e agradeça por uma benção recebida. Seu testemunho fortalece a fé de todos os irmãos.</p>
            </div>

            <div className="p-5 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(38,146,255,0.12)] hover:bg-white/60 hover:border-white transition-all duration-500">
              <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-600 flex items-center justify-center mb-4">
                <EyeOff className="w-5 h-5" />
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

      {showShare && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowShare(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-50 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-display font-bold text-slate-900">Compartilhar Versículo</h3>
              <p className="text-sm text-slate-500 mt-1">Escolha o formato ideal para compartilhar</p>
            </div>

            {generatingImages ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-slate-500">Gerando imagens...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {shareImages.map((img) => (
                  <div key={img.label} className="flex flex-col gap-3">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                      <img
                        src={img.dataUrl}
                        alt={img.label}
                        className="w-full object-contain"
                      />
                    </div>
                    <p className="text-xs font-bold text-center text-slate-500 uppercase tracking-wider">{img.label}</p>
                    <a
                      href={img.dataUrl}
                      download={img.filename}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all"
                    >
                      <Download className="w-4 h-4" />
                      Baixar
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
