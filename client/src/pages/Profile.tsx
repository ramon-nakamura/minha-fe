import { useState, useRef, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useMessages, useDeleteMessage, useDeleteMessages, useLikeMessage, usePardonMessage } from "@/hooks/use-messages";
import { Quote, Share2, Sparkles, X, Loader2, ArrowLeft, Trash2, CheckSquare, Square, BookPlus, MessageSquare, HeartHandshake, HandHeart, EyeOff, Heart } from "lucide-react";
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

const FORMAT_META = [
  { key: 0, label: "Story", sublabel: "9:16" },
  { key: 1, label: "Quadrado", sublabel: "1:1" },
  { key: 2, label: "Paisagem", sublabel: "16:9" },
];

function ShareModal({
  shareImages,
  generatingImages,
  verseOfDay,
  onClose,
}: {
  shareImages: { label: string; dataUrl: string; filename: string }[];
  generatingImages: boolean;
  verseOfDay: { text: string; reference: string };
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const current = shareImages[selected];

  const handleShare = async () => {
    if (!current) return;
    const res = await fetch(current.dataUrl);
    const blob = await res.blob();
    const file = new File([blob], current.filename, { type: "image/jpeg" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: "Versículo do Dia",
        text: `"${verseOfDay.text}" — ${verseOfDay.reference} | minhafe.com.br`,
      });
    } else {
      const a = document.createElement("a");
      a.href = current.dataUrl;
      a.download = current.filename;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: "85svh" }}>

        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div>
            <h3 className="text-base font-display font-bold text-slate-900">Compartilhar Versículo</h3>
            <p className="text-xs text-slate-400 mt-0.5">Escolha o formato</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {generatingImages ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm text-slate-400">Gerando imagens...</p>
          </div>
        ) : (
          <>
            {/* Format selector */}
            <div className="flex gap-2 px-6 pb-4 shrink-0">
              {FORMAT_META.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setSelected(f.key)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 transition-all",
                    selected === f.key
                      ? "border-primary bg-primary/5"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "rounded border",
                    selected === f.key ? "border-primary/40 bg-primary/10" : "border-slate-300 bg-white",
                    f.key === 0 ? "w-5 h-9" : f.key === 1 ? "w-7 h-7" : "w-9 h-5"
                  )} />
                  <span className={cn("text-[11px] font-bold", selected === f.key ? "text-primary" : "text-slate-500")}>
                    {f.label}
                  </span>
                  <span className="text-[10px] text-slate-400">{f.sublabel}</span>
                </button>
              ))}
            </div>

            {/* Preview — fixed pixel height, never overflows */}
            {current && (
              <div className="px-6 pb-4 flex items-center justify-center" style={{ height: "200px" }}>
                <img
                  src={current.dataUrl}
                  alt={current.label}
                  style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "1rem", objectFit: "contain" }}
                />
              </div>
            )}

            {/* Share button */}
            <div className="px-6 pb-8 shrink-0">
              <button
                onClick={handleShare}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
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
      reflection: "Somos seres de relação. Nossas escolhas afetam outros, e as escolhas dos outros nos afetam. Esta consciência de interdependência é a base de uma comunidade saudável, onde cada pessoa importa, onde o bem de um contribui para o bem de todos."
    },
    {
      text: "Amarás o teu próximo como a ti mesmo.",
      reference: "Marcos 12:31",
      reflection: "Em 2026, o próximo não é apenas quem mora ao lado. É a pessoa que você encontra no transporte público, a família que chegou de outro país em busca de dignidade, quem pensa diferente de você nas redes sociais. Amar o próximo começa por enxergá-lo como alguém com uma história tão complexa quanto a sua."
    },
    {
      text: "Não há judeu nem grego, não há escravo nem livre, não há homem nem mulher, pois todos vós sois um em Cristo Jesus.",
      reference: "Gálatas 3:28",
      reflection: "Este versículo foi escrito há dois mil anos e ainda provoca desconforto em muitos contextos, porque aponta para uma igualdade que nossas estruturas sociais ainda não alcançaram. Origem, gênero, classe social, cor da pele: nenhuma dessas categorias define o valor de uma pessoa diante do sagrado. O desafio é viver essa convicção no cotidiano."
    },
    {
      text: "Aprendi a contentar-me em qualquer estado em que me encontre.",
      reference: "Filipenses 4:11",
      reflection: "Num mundo que mede o valor das pessoas pelo que elas possuem, essa frase é um ato de resistência. Contentamento não é resignação com a injustiça, mas é a capacidade de encontrar paz interior mesmo enquanto se luta por condições mais dignas. São duas coisas que podem coexistir."
    },
    {
      text: "O coração do homem planeja o seu caminho, mas o Senhor lhe dirige os passos.",
      reference: "Provérbios 16:9",
      reflection: "Planejar é necessário e saudável. Mas há algo libertador em reconhecer que nem tudo está sob nosso controle. As melhores histórias de vida raramente seguiram o roteiro original. Às vezes o desvio inesperado é exatamente onde a transformação acontece."
    },
    {
      text: "Cria em mim, ó Deus, um coração puro, e renova em mim um espírito inabalável.",
      reference: "Salmos 51:10",
      reflection: "Pedido de renovação interior é talvez o mais honesto que alguém pode fazer. Reconhecer que carregamos padrões que precisam ser transformados, que às vezes agimos por medo ou ego em vez de amor, é o começo de qualquer mudança real. Esse versículo é uma oração de quem quer ser melhor do que foi ontem."
    },
    {
      text: "Porque eu estava com fome e me destes de comer; estava com sede e me destes de beber; era estrangeiro e me acolhestes.",
      reference: "Mateus 25:35",
      reflection: "A pessoa em situação de rua, o refugiado que chegou sem documentos, o migrante que fala outro idioma: este versículo fala exatamente deles. Fé que não se traduz em acolhimento concreto às pessoas mais vulneráveis permanece no campo das ideias. A prática do sagrado acontece no encontro com quem precisa."
    },
    {
      text: "Não te vires para trás, nem te detenhas em toda esta planície; foge para o monte, para que não pereças.",
      reference: "Gênesis 19:17",
      reflection: "Existem momentos em que olhar para trás nos prende ao que já acabou. Relações que terminaram, versões de nós mesmos que já não servem, situações que não têm mais retorno. A coragem de seguir em frente, sem se fixar no que ficou para trás, é um dos movimentos mais difíceis e necessários da vida."
    },
    {
      text: "Tudo posso naquele que me fortalece, mas tenho aprendido a viver com pouco e com muito.",
      reference: "Filipenses 4:12-13",
      reflection: "O versículo mais famoso sobre força costuma ser lido fora do contexto desta passagem, que fala de aprender a lidar tanto com a escassez quanto com a abundância. A verdadeira resiliência não é só suportar a dificuldade: é também não se perder quando as coisas vão bem."
    },
    {
      text: "Sede misericordiosos, como também vosso Pai é misericordioso.",
      reference: "Lucas 6:36",
      reflection: "Misericórdia é diferente de pena. Ela não olha para baixo: olha nos olhos. Reconhece a humanidade comum, a fragilidade compartilhada. Numa era de polarização intensa, de cancelamentos e tribunais nas redes sociais, a misericórdia é um gesto contracultural que pode começar dentro de cada um."
    },
    {
      text: "Guardai-vos de toda avareza, porque a vida do homem não consiste na abundância dos bens que possui.",
      reference: "Lucas 12:15",
      reflection: "Em sociedades onde o consumo é apresentado como sinônimo de felicidade, esse aviso ressoa com urgência. A vida tem dimensões que nenhum bem material pode preencher: pertencimento, propósito, conexão genuína, paz interior. Acumular não é o mesmo que viver bem."
    },
    {
      text: "Bem-aventurados os que têm fome e sede de justiça, porque serão fartos.",
      reference: "Mateus 5:6",
      reflection: "Justiça não é só o que acontece nos tribunais. É o acesso digno à educação, à saúde, à moradia. É uma sociedade onde ninguém precisa escolher entre comer e se tratar. Ter fome de justiça é reconhecer que o mundo pode ser mais justo do que é, e se recusar a aceitar o sofrimento alheio como algo normal."
    },
    {
      text: "Bem-aventurados os pacificadores, porque serão chamados filhos de Deus.",
      reference: "Mateus 5:9",
      reflection: "Pacificar não é calar conflitos importantes ou pedir que minorias aceitem o inaceitável em nome da paz. É trabalhar ativamente pela construção de pontes onde há divisão, por diálogos onde há hostilidade. O pacificador suporta o desconforto do meio-termo porque acredita que o encontro é possível."
    },
    {
      text: "Dai a César o que é de César, e a Deus o que é de Deus.",
      reference: "Marcos 12:17",
      reflection: "Esta frase atravessou séculos e continua sendo citada em debates sobre religião e política. Ela sugere que o sagrado e o civil têm esferas distintas, e que confundi-los pode ser problemático para ambos. Uma fé que não precisa do poder do Estado para existir é, paradoxalmente, muito mais livre."
    },
    {
      text: "Não se esqueçam da hospitalidade, pois por ela alguns, sem o saber, hospedaram anjos.",
      reference: "Hebreus 13:2",
      reflection: "Há algo transformador na ideia de que o estranho pode ser portador de algo sagrado. Em tempos onde o diferente é frequentemente visto como ameaça, este versículo propõe o oposto: abrir a porta, oferecer um espaço, tratar o desconhecido com dignidade. Muitas vezes somos nós que saímos transformados desse encontro."
    },
    {
      text: "Portanto, tudo o que vós quereis que os homens vos façam, fazei-o vós também a eles.",
      reference: "Mateus 7:12",
      reflection: "A Regra de Ouro aparece em quase todas as tradições espirituais do mundo, o que talvez seja o sinal mais claro de que ela toca algo universal na experiência humana. Antes de agir, perguntar como você gostaria de ser tratado naquela situação não é fraqueza: é uma das formas mais práticas de sabedoria."
    },
    {
      text: "O fraco diga: Sou forte.",
      reference: "Joel 3:10",
      reflection: "Há um tipo de força que não nasce da ausência de vulnerabilidade, mas de falar mesmo com a voz tremendo, de continuar mesmo sem certeza, de se levantar sem garantia de que não vai cair de novo. Este versículo convida quem está se sentindo pequeno a declarar uma verdade que ainda não consegue sentir, mas que pode começar a acreditar."
    },
    {
      text: "O Senhor teu Deus está no meio de ti, poderoso para salvar; ele se deleitará em ti com alegria.",
      reference: "Sofonias 3:17",
      reflection: "A ideia de ser fonte de alegria para o sagrado é profundamente reconfortante, especialmente para quem cresceu com uma visão de Deus como juiz severo. Este versículo fala de deleite, de amor que celebra a existência de cada pessoa, independente de suas imperfeições."
    },
    {
      text: "Respondeu Jesus: Amarás o Senhor teu Deus de todo o teu coração, de toda a tua alma e de todo o teu entendimento.",
      reference: "Mateus 22:37",
      reflection: "Amar com o entendimento é uma dimensão frequentemente esquecida. Fé que desliga o pensamento crítico pode se tornar manipulável. Fé que também passa pelo intelecto, que questiona, que aprende, que se reconstrói diante de novas realidades, é uma fé adulta e viva."
    },
    {
      text: "Não façais distinção de pessoas no julgamento; ouvi tanto o pequeno como o grande.",
      reference: "Deuteronômio 1:17",
      reflection: "A justiça que trata diferente quem tem dinheiro, conexões ou prestígio não é justiça: é privilégio institucionalizado. Este versículo de milhares de anos atrás já identificava uma das distorções mais persistentes de todas as sociedades. Ouvir o pequeno com a mesma atenção dedicada ao grande continua sendo um ideal a construir."
    },
    {
      text: "Porque o Senhor vosso Deus é Deus dos deuses e Senhor dos senhores, o Deus grande, poderoso e temível, que não faz acepção de pessoas.",
      reference: "Deuteronômio 10:17",
      reflection: "Não fazer acepção de pessoas significa não ter favoritos com base em origem, aparência, riqueza ou status. Essa característica atribuída ao sagrado é também um modelo para nossas relações humanas. Tratar cada pessoa com dignidade igual, independente de quem ela seja, é uma das práticas mais exigentes e necessárias da vida em comunidade."
    },
    {
      text: "Não oprimas o estrangeiro; vós conheceis o coração do estrangeiro, pois fostes estrangeiros na terra do Egito.",
      reference: "Êxodo 23:9",
      reflection: "A memória do sofrimento como fonte de empatia. Quem já foi excluído, marginalizado, tratado como estranho em algum lugar sabe o peso disso. E é exatamente por isso que está em posição de escolher não reproduzir o que viveu. A experiência da dor pode gerar dureza ou compaixão: este versículo pede a segunda."
    },
    {
      text: "Toda a Escritura é inspirada por Deus e útil para o ensino, para a repreensão, para a correção e para a instrução na justiça.",
      reference: "2 Timóteo 3:16",
      reflection: "A ideia de que textos sagrados são úteis para corrigir e instruir implica que a leitura da Bíblia não é passiva. Ela convida ao questionamento, à revisão de comportamentos, ao crescimento contínuo. Uma leitura que nunca desafia é uma leitura incompleta."
    },
    {
      text: "Porque eu, o Senhor teu Deus, te tomo pela tua mão direita e te digo: Não temas, eu te ajudo.",
      reference: "Isaías 41:13",
      reflection: "A imagem de ser tomado pela mão é uma das mais íntimas e humanas que existem. É o gesto de alguém que não deixa você atravessar sozinho. Para quem está num momento de medo real, seja por saúde, por trabalho, por família, por qualquer crise que 2026 trouxe, essa promessa de companhia pode ser o suficiente para dar o próximo passo."
    },
    {
      text: "Não ensinará mais cada um ao seu próximo, nem cada um ao seu irmão, dizendo: Conhecei ao Senhor; porque todos me conhecerão, desde o menor deles até ao maior.",
      reference: "Jeremias 31:34",
      reflection: "Uma visão de futuro onde o acesso ao sagrado não depende de intermediários, títulos ou hierarquias. Num tempo em que muita gente se afastou de instituições religiosas mas não perdeu a espiritualidade, este versículo fala de uma fé acessível a todos, direta, sem filtros."
    },
    {
      text: "Porque somos feitura dele, criados em Cristo Jesus para boas obras, as quais Deus de antemão preparou para que andássemos nelas.",
      reference: "Efésios 2:10",
      reflection: "Você foi feito para algo. Não necessariamente para ser famoso, rico ou reconhecido, mas para contribuir de um jeito que só você pode contribuir. As boas obras mencionadas aqui são tão diversas quanto as pessoas que as realizam: podem ser no cuidado de uma criança, na dedicação a um trabalho, no suporte silencioso a um amigo."
    },
    {
      text: "Bem-aventurado o homem que suporta a provação, porque depois de aprovado receberá a coroa da vida.",
      reference: "Tiago 1:12",
      reflection: "Suportar não significa sorrir e fingir que está tudo bem. Significa atravessar o difícil sem desistir do que você acredita. A coroa mencionada aqui não é um prêmio material: é a integridade preservada, a pessoa que você se tornou ao passar pela dificuldade sem se perder no caminho."
    },
    {
      text: "Respondeu-lhe Jesus: Se tu soubesses o dom de Deus e quem é o que te diz: Dá-me de beber, tu lhe pedirias, e ele te daria água viva.",
      reference: "João 4:10",
      reflection: "Este diálogo aconteceu com uma mulher samaritana, considerada duplamente marginalizada na sociedade da época: por ser mulher e por ser de um povo discriminado. Jesus não apenas a abordou como um igual: foi a ela que revelou uma das mais profundas verdades espirituais do Evangelho. O sagrado tem um padrão de encontrar quem a sociedade ignora."
    },
    {
      text: "Não julgues, e não serás julgado; não condenes, e não serás condenado; perdoa, e serás perdoado.",
      reference: "Lucas 6:37",
      reflection: "Vivemos num tempo de opiniões imediatas e veredictos definitivos sobre a vida alheia. Este versículo não pede que abramos mão do discernimento, mas que reconheçamos os limites do nosso olhar. Sabemos muito pouco sobre a história de cada pessoa para sermos seus juízes. O perdão, por outro lado, nos liberta tanto quanto liberta quem é perdoado."
    },
    {
      text: "Se eu falar as línguas dos homens e dos anjos, mas não tiver amor, serei como o bronze que soa ou como o címbalo que retine.",
      reference: "1 Coríntios 13:1",
      reflection: "Eloquência sem empatia é só barulho. Argumentos teológicos que não se traduzem em cuidado com as pessoas são discursos vazios. Este versículo coloca o amor como critério de autenticidade de tudo o mais, inclusive das práticas religiosas. A pergunta não é só o que você acredita, mas como você trata as pessoas ao seu redor."
    },
    {
      text: "E disse Deus: Façamos o homem à nossa imagem, conforme a nossa semelhança.",
      reference: "Gênesis 1:26",
      reflection: "Cada ser humano carrega a imagem do sagrado. Não apenas os que pensam como você, que nasceram onde você nasceu, que amam como você ama. Cada rosto que você encontra é um reflexo dessa imagem. Reconhecer isso transforma a forma como você olha para o outro, especialmente para quem é diferente de você."
    },
    {
      text: "Não te canses de fazer o bem, pois no tempo certo colherás, se não desanimares.",
      reference: "Gálatas 6:9",
      reflection: "O esgotamento de quem tenta fazer a diferença num mundo que parece resistente à mudança é real. Ativistas, cuidadores, professores, profissionais de saúde em contextos difíceis conhecem bem esse cansaço. Este versículo não ignora a exaustão: ele a valida e ao mesmo tempo lembra que o resultado de ações boas nem sempre aparece no prazo que esperamos."
    },
    {
      text: "Cada um dê conforme propôs no seu coração, não com tristeza ou por necessidade; porque Deus ama o que dá com alegria.",
      reference: "2 Coríntios 9:7",
      reflection: "Dar sob pressão ou por culpa não é generosidade: é transação. A doação que nasce de dentro, do genuíno desejo de contribuir, tem uma qualidade completamente diferente. Isso vale para dinheiro, mas também para tempo, atenção e presença. Oferecer o que você tem com alegria muda tanto quem recebe quanto quem dá."
    },
    {
      text: "Quem é minha mãe e quem são meus irmãos? Todo aquele que fizer a vontade de meu Pai celestial, esse é meu irmão, minha irmã e minha mãe.",
      reference: "Mateus 12:49-50",
      reflection: "Família, nesta perspectiva, é uma escolha tanto quanto um nascimento. Num tempo em que muitas pessoas foram rejeitadas pela família biológica por causa de quem são, de quem amam, de que caminho escolheram, esta fala de Jesus é um reconhecimento poderoso de que vínculos de cuidado e pertencimento podem ser construídos além do sangue."
    },
    {
      text: "E conhecereis a verdade, e a verdade vos libertará.",
      reference: "João 8:32",
      reflection: "A verdade que liberta nem sempre é confortável. Às vezes é perceber um padrão prejudicial em si mesmo. Às vezes é admitir que uma crença que você carregou a vida toda precisa ser revisitada. O processo de buscar honestidade, com o mundo e consigo mesmo, pode ser doloroso no começo e libertador no fim."
    },
    {
      text: "Não te afastes da sabedoria, ela te guardará; ama-a e ela te conservará.",
      reference: "Provérbios 4:6",
      reflection: "Sabedoria não é o mesmo que acumulação de informação. Num mundo saturado de dados e opiniões em 2026, sabedoria é a capacidade de discernir o que importa, de agir com ponderação, de aprender com a experiência própria e alheia. Cultivar sabedoria exige pausa, reflexão e humildade para reconhecer o que ainda não se sabe."
    },
    {
      text: "Justo é o Senhor em todos os seus caminhos, e benigno em todas as suas obras.",
      reference: "Salmos 145:17",
      reflection: "Benignidade é uma palavra que quase saiu do uso, mas o que ela descreve é algo muito necessário: uma gentileza ativa, que cuida sem esperar retorno. Atribuir essa qualidade ao sagrado é também reconhecê-la como um valor a ser cultivado nas relações humanas, especialmente com quem está em posição de vulnerabilidade."
    },
    {
      text: "Não vos lembreis das coisas passadas, nem considereis as antigas. Eis que faço coisa nova.",
      reference: "Isaías 43:18-19",
      reflection: "Há identidades que se constroem inteiramente em torno do passado, seja para glorificá-lo ou para ser definido por suas feridas. Este versículo não pede que se apague a história, mas que ela não seja a única narrativa possível. O novo pode coexistir com a memória sem ser engolido por ela."
    },
    {
      text: "Antes de formá-lo no ventre, eu o conheci; antes de ele sair da madre, o consagrei.",
      reference: "Jeremias 1:5",
      reflection: "Ser conhecido antes de nascer é uma afirmação radical de valor incondicional. Não um valor baseado em produtividade, aparência, orientação sexual, origem étnica ou capacidade. Apenas a existência já é suficiente para ser reconhecido. Para quem passou a vida inteira precisando provar que merece espaço, essa ideia pode ser profundamente restauradora."
    },
    {
      text: "Melhor é o fim das coisas do que o seu princípio; melhor é o paciente de espírito do que o altivo de espírito.",
      reference: "Eclesiastes 7:8",
      reflection: "Paciência de espírito não é passividade. É a capacidade de sustentar um processo sem precisar de resolução imediata. Numa cultura que valoriza resultados instantâneos e recompensas rápidas, a paciência se tornou uma habilidade rara e valiosa. Os projetos mais significativos da vida raramente se completam em prazos curtos."
    },
    {
      text: "E ele me disse: A minha graça te basta, porque o meu poder se aperfeiçoa na fraqueza.",
      reference: "2 Coríntios 12:9",
      reflection: "Em vez de esconder a fragilidade, o convite aqui é reconhecê-la como lugar de encontro com algo maior. Pessoas que passaram por doenças graves, perdas devastadoras ou colapsos inesperados frequentemente relatam que foi exatamente nesses momentos que experimentaram uma força que não veio delas mesmas. A vulnerabilidade não é o oposto da fé: às vezes é a sua porta de entrada."
    },
    {
      text: "Melhor é um punhado com descanso, do que dois punhados com trabalho e aflição do espírito.",
      reference: "Eclesiastes 4:6",
      reflection: "Burnout é uma das crises de saúde mais prevalentes de 2026. O ritmo de trabalho que a sociedade contemporânea normaliza frequentemente ultrapassa o que os seres humanos foram feitos para suportar. Este versículo diz que menos com paz vale mais do que muito com sofrimento. É uma afirmação que precisa de coragem para ser levada a sério."
    },
    {
      text: "O Senhor não tarda em cumprir a sua promessa, como julgam alguns; antes, é longânimo para convosco, não querendo que nenhum pereça.",
      reference: "2 Pedro 3:9",
      reflection: "Longanimidade é uma paciência que inclui misericórdia. A ideia de que ninguém está descartado, de que há espaço para mudança e recomeço para qualquer pessoa, é um dos conceitos mais radicais do pensamento cristão. Isso não significa que consequências não existam, mas que nenhum ser humano é definido definitivamente pelo pior que já fez."
    },
    {
      text: "Pois onde estiverem dois ou três reunidos em meu nome, aí estou no meio deles.",
      reference: "Mateus 18:20",
      reflection: "Comunidade não precisa ser grande para ser real. Dois amigos que oram juntos, uma família pequena que se senta à mesa com intenção, um grupo de pessoas que se reúne para apoiar umas às outras: o sagrado habita esses encontros simples. Em tempos de solidão crescente e conexões cada vez mais superficiais, essa promessa de presença no pequeno tem peso especial."
    },
    {
      text: "A língua tem poder sobre a vida e a morte, e os que a amam comerão do seu fruto.",
      reference: "Provérbios 18:21",
      reflection: "Palavras moldam realidades. Uma crítica dita no momento errado pode marcar alguém por anos. Um elogio genuíno pode abrir uma porta que a pessoa não sabia que existia. Nas redes sociais de 2026, onde as palavras chegam instantaneamente a milhares de pessoas, essa sabedoria antiga se torna ainda mais urgente. O que você diz tem peso, mesmo quando parece efêmero."
    },
    {
      text: "Não me envergonho do evangelho de Cristo, porque é o poder de Deus para a salvação de todo aquele que crê, primeiro do judeu, depois do grego.",
      reference: "Romanos 1:16",
      reflection: "O evangelho, neste versículo, é apresentado como algo que não exclui: alcança a todos, independente de origem. O judeu e o grego representavam mundos culturais completamente distintos no contexto da época. Hoje poderíamos traduzir como: a mensagem de amor e transformação não tem fronteiras culturais, raciais ou geográficas."
    },
    {
      text: "Bem-aventurados os misericordiosos, porque eles alcançarão misericórdia.",
      reference: "Mateus 5:7",
      reflection: "Misericórdia é uma prática que muda quem a exerce tanto quanto quem a recebe. Quando você escolhe enxergar a humanidade por trás dos erros de alguém, quando decide não reduzir uma pessoa ao seu pior momento, você está também expandindo sua própria capacidade de aceitar a própria imperfeição com menos crueldade."
    },
    {
      text: "Tudo tem o seu tempo determinado, e há tempo para todo propósito debaixo do céu.",
      reference: "Eclesiastes 3:1",
      reflection: "Esta é uma das passagens mais citadas em momentos de perda e de espera. Reconhecer que há um ritmo nas coisas, que nem tudo pode ser forçado ou controlado, pode ser libertador. O tempo de plantar é diferente do tempo de colher. O tempo de lamentar tem seu lugar tanto quanto o tempo de celebrar."
    },
    {
      text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.",
      reference: "Isaías 41:10",
      reflection: "Este versículo foi escrito para um povo em exílio, longe de tudo que conhecia. Ressoa com imigrantes, com pessoas deslocadas por conflitos ou por necessidade econômica, com quem se sente completamente fora do lugar. A promessa de sustentação não elimina a dificuldade, mas oferece companhia dentro dela."
    },
    {
      text: "Portanto, meus amados irmãos, sede firmes, inabaláveis, sempre abundantes na obra do Senhor.",
      reference: "1 Coríntios 15:58",
      reflection: "Ser inabalável não significa não sentir. Significa que o que você acredita e o que você faz não dependem do humor do dia, da aprovação alheia ou das circunstâncias externas. A consistência, especialmente quando ninguém está olhando, é uma das formas mais silenciosas e poderosas de integridade."
    },
    {
      text: "Levanta-te, resplandece, porque vem a tua luz, e a glória do Senhor nasce sobre ti.",
      reference: "Isaías 60:1",
      reflection: "Este chamado à luz foi feito a uma cidade destruída, a um povo que havia perdido quase tudo. Às vezes as pessoas que mais precisam ouvir que ainda há luz nelas são exatamente as que vivem nos contextos mais árduos: nas periferias esquecidas, nos corpos que carregam doenças, nas histórias marcadas por rejeição. A luz não é prometida aos que já estão bem."
    },
    {
      text: "Mas eu vos digo: amai os vossos inimigos e orai pelos que vos perseguem.",
      reference: "Mateus 5:44",
      reflection: "Este pode ser o ensinamento mais difícil de toda a tradição cristã. Amar quem te machuca não significa aceitar o abuso ou fingir que a dor não existe. Significa recusar-se a deixar que o ódio ocupe permanentemente o coração. Orar pelo outro não o transforma necessariamente, mas pode transformar quem ora."
    },
    {
      text: "Bem-aventurados os puros de coração, porque eles verão a Deus.",
      reference: "Mateus 5:8",
      reflection: "Pureza de coração não é a ausência de dúvida, de tentação ou de imperfeição. É a intencionalidade, a coerência entre o que se acredita e o que se vive. É agir sem segundas intenções, cuidar sem calcular o retorno. Num mundo onde a autenticidade é frequentemente encenada para audiências online, a pureza de intenção se tornou algo raro e precioso."
    },
    {
      text: "O homem olha para o exterior, mas o Senhor olha para o coração.",
      reference: "1 Samuel 16:7",
      reflection: "Aparência, currículo, número de seguidores, status social: são os critérios que o mundo usa para avaliar quem importa. Este versículo propõe um olhar completamente diferente, que enxerga o que não aparece nas fotos nem nos títulos. Aprender a olhar para as pessoas desta forma, valorizando o que está dentro antes do que se vê fora, é uma prática de humanidade."
    },
    {
      text: "Ensinai-nos a contar os nossos dias, para que alcancemos coração sábio.",
      reference: "Salmos 90:12",
      reflection: "Consciência da finitude não é mórbida: é uma das maiores fontes de clareza sobre o que realmente importa. Quando você lembra que o tempo é limitado, fica mais difícil desperdiçá-lo em rancores, em comparações, em aprovações que não sustentam. Contar os dias é uma prática de presença e prioridade."
    },
    {
      text: "Mas aquele que beber da água que eu lhe der nunca mais terá sede.",
      reference: "João 4:14",
      reflection: "A promessa de uma sede que se sacia definitivamente fala de algo que vai além da espiritualidade convencional. Há uma busca profunda em cada ser humano, que se manifesta de formas diversas: na criatividade, no amor, na contemplação, na conexão genuína. Quando essa busca encontra o que realmente a nutre, algo em nós descansa."
    },
    {
      text: "Toda boa dádiva e todo dom perfeito vêm do alto, descendo do Pai das luzes.",
      reference: "Tiago 1:17",
      reflection: "Reconhecer a origem das coisas boas que você tem é uma prática de gratidão que muda a perspectiva. Seus talentos, as pessoas que te amam, as oportunidades que apareceram: nada disso surgiu do nada. Gratidão não diminui o esforço que você empregou. Ela apenas acrescenta humildade ao reconhecimento de que você não chegou até aqui sozinho."
    },
    {
      text: "Não temas, porque não serás envergonhado; não te envergonhes, porque não serás humilhada.",
      reference: "Isaías 54:4",
      reflection: "Vergonha é uma das emoções mais paralisantes que existem. Ela se apega à identidade, não apenas ao comportamento, e convence a pessoa de que ela mesma é o problema. Este versículo fala diretamente para quem carrega vergonha de quem é, de onde veio, do que viveu. O convite é soltar esse peso e seguir sem ele."
    },
    {
      text: "Como é bom e agradável que os irmãos vivam em união.",
      reference: "Salmos 133:1",
      reflection: "União não significa ausência de diferenças ou de conflitos. Significa a escolha de permanecer em relação apesar deles. Em comunidades de fé diversas, em famílias com visões distintas, em sociedades fragmentadas, cultivar a unidade exige trabalho ativo e disposição para priorizar o vínculo acima da necessidade de ter razão."
    },
    {
      text: "Sede imitadores de Deus como filhos amados, e andai em amor.",
      reference: "Efésios 5:1-2",
      reflection: "Imitar o sagrado é uma aspiração enorme, mas este versículo a resume em algo concreto: andar em amor. No cotidiano isso significa escolher a paciência quando você está irritado, a generosidade quando poderia reter, a presença quando poderia escapar. Pequenos gestos de amor praticados com consistência constroem um modo de ser."
    },
    {
      text: "Porque para Deus nada é impossível.",
      reference: "Lucas 1:37",
      reflection: "Esta frase foi dita a uma mulher que recebeu uma notícia impossível e precisou decidir se acreditava ou não. O impossível que você enfrenta hoje pode ser uma reconciliação que parece inviável, uma recuperação que a medicina não garante, uma mudança de vida que você mesmo duvida que consegue fazer. Há algo em acreditar no impossível que já começa a mover as coisas."
    },
    {
      text: "Melhor é a sabedoria do que as armas de guerra; mas um só pecador destrói muito bem.",
      reference: "Eclesiastes 9:18",
      reflection: "Sabedoria constrói com mais eficácia do que força. Uma pessoa com discernimento, que sabe ouvir, que age com ponderação, que escolhe o momento certo para falar, produz mais do que várias que agem impulsivamente. E o contrário também é verdade: a irresponsabilidade de um pode desfazer o que muitos levaram anos para construir."
    },
    {
      text: "Sede sóbrios e vigilantes. O diabo, vosso adversário, anda em derredor, como leão que ruge, procurando alguém para devorar.",
      reference: "1 Pedro 5:8",
      reflection: "Independente da leitura que se faz da imagem do adversário, a exortação à vigilância é muito concreta. Há forças que corroem silenciosamente: o ressentimento que cresce sem ser nomeado, a comparação constante que mina a autoestima, o cansaço que vai se acumulando até o colapso. Estar atento ao que está acontecendo dentro de você é uma prática de saúde mental e espiritual."
    },
    {
      text: "Porque eu estava nu e me vestistes; estive enfermo e me visitastes; estava no cárcere e fostes a mim.",
      reference: "Mateus 25:36",
      reflection: "Jesus se identifica com quem está nas margens: os que não têm o suficiente, os que estão doentes, os que estão presos. Em 2026, visitar quem está no cárcere ainda é um dos gestos de humanidade mais raros e necessários. A pessoa encarcerada não deixa de ser pessoa. A fé que consegue enxergar o sagrado nos contextos mais esquecidos é uma fé que age onde mais importa."
    },
    {
      text: "Dá ao sábio e ele ficará ainda mais sábio; ensina ao justo e ele aumentará em instrução.",
      reference: "Provérbios 9:9",
      reflection: "Humildade intelectual é a capacidade de continuar aprendendo mesmo depois de já ter chegado a algum lugar. Quem acha que já sabe o suficiente fecha as portas para o crescimento. Quem permanece curioso, aberto a ser ensinado por qualquer pessoa independente de sua posição, acumula uma riqueza que não envelhece."
    },
    {
      text: "Bem-aventurado o homem que não anda segundo o conselho dos ímpios, nem se detém no caminho dos pecadores, nem se assenta na roda dos escarnecedores.",
      reference: "Salmos 1:1",
      reflection: "O ambiente em que você vive e as vozes que você escolhe ouvir moldam quem você se torna. Isso não é julgamento sobre as pessoas ao redor: é reconhecimento de que influências existem. Em tempos de algoritmos que amplificam o cinismo e a crueldade, escolher conscientemente as vozes que alimentam sua vida é um ato de cuidado com si mesmo."
    },
    {
      text: "O coração alegre é bom remédio, mas o espírito abatido seca os ossos.",
      reference: "Provérbios 17:22",
      reflection: "A ciência contemporânea confirma o que este versículo afirma há milênios: estados emocionais afetam diretamente a saúde física. Alegria genuína não é a ausência de problemas, mas uma postura diante deles. Cultivar pequenas alegrias no cotidiano, praticar gratidão, cercar-se de relações que nutrem: são cuidados de saúde tanto quanto qualquer medicamento."
    }
  ];

  const verseOfDay = useMemo(() => {
    const idx = Math.floor(Math.random() * verses.length);
    return verses[idx];
  }, []);

  const generateShareImage = useCallback((
    width: number,
    height: number,
    label: string,
    filename: string,
    verse: { text: string; reference: string }
  ): { label: string; dataUrl: string; filename: string } => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Background gradient
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, "#f5f0e8");
    bg.addColorStop(0.5, "#fdfaf4");
    bg.addColorStop(1, "#f0ebe0");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Soft glow corners
    const drawGlow = (x: number, y: number, r: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(255, 240, 180, 0.55)");
      g.addColorStop(0.5, "rgba(255, 230, 150, 0.18)");
      g.addColorStop(1, "rgba(255, 240, 180, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };
    const glowR = Math.min(width, height) * 0.55;
    drawGlow(0, 0, glowR);
    drawGlow(width, 0, glowR);
    drawGlow(0, height, glowR);
    drawGlow(width, height, glowR);

    // Thin gold border lines
    ctx.strokeStyle = "rgba(200, 170, 90, 0.25)";
    ctx.lineWidth = 1.5;
    const m = width * 0.06;
    ctx.strokeRect(m, m, width - m * 2, height - m * 2);

    // Decorative corner accents
    const accentLen = Math.min(width, height) * 0.06;
    const corners = [[m, m], [width - m, m], [m, height - m], [width - m, height - m]] as [number, number][];
    ctx.strokeStyle = "rgba(200, 160, 70, 0.5)";
    ctx.lineWidth = 2;
    corners.forEach(([cx, cy]) => {
      const sx = cx === m ? 1 : -1;
      const sy = cy === m ? 1 : -1;
      ctx.beginPath(); ctx.moveTo(cx, cy + sy * accentLen); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * accentLen, cy); ctx.stroke();
    });

    // Text layout
    const padding = width * 0.12;
    const maxTextWidth = width - padding * 2;
    const isWide = width > height;
    const isStory = height > width;
    const baseFontSize = isWide ? Math.floor(width * 0.034) : isStory ? Math.floor(width * 0.068) : Math.floor(width * 0.054);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Opening quote mark
    ctx.font = `italic ${baseFontSize * 3}px Georgia, serif`;
    ctx.fillStyle = "rgba(190, 155, 70, 0.22)";
    ctx.fillText("\u201C", width / 2, height * 0.30);

    // Verse text with word wrap
    ctx.font = `italic ${baseFontSize}px Georgia, 'Times New Roman', serif`;
    ctx.fillStyle = "rgba(55, 42, 20, 0.85)";

    const words = verse.text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(testLine).width > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    const lineHeight = baseFontSize * 1.6;
    const totalTextHeight = lines.length * lineHeight;
    let startY = height / 2 - totalTextHeight / 2 - baseFontSize * 0.5;
    if (startY < height * 0.30) startY = height * 0.30;

    lines.forEach((line, i) => ctx.fillText(line, width / 2, startY + i * lineHeight));

    // Reference
    const refY = startY + lines.length * lineHeight + baseFontSize * 1.1;
    ctx.font = `bold ${Math.floor(baseFontSize * 0.65)}px Arial, sans-serif`;
    ctx.fillStyle = "rgba(170, 130, 45, 0.9)";
    ctx.fillText(verse.reference.toUpperCase(), width / 2, refY);

    // Divider
    const divW = Math.min(120, width * 0.15);
    const divY = refY + baseFontSize * 1.3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - divW, divY);
    ctx.lineTo(width / 2 + divW, divY);
    ctx.strokeStyle = "rgba(190, 155, 70, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Site watermark
    ctx.font = `${Math.floor(baseFontSize * 0.58)}px Arial, sans-serif`;
    ctx.fillStyle = "rgba(140, 110, 50, 0.65)";
    ctx.fillText("minhafe.com.br", width / 2, divY + baseFontSize * 1.1);

    return { label, dataUrl: canvas.toDataURL("image/jpeg", 0.95), filename };
  }, []);

  const handleOpenShare = useCallback(() => {
    setShowShare(true);
    setGeneratingImages(true);
    setShareImages([]);

    // Use setTimeout to allow the modal/loader to render before the canvas work
    setTimeout(() => {
      const formats = [
        { width: 1080, height: 1920, label: "Story (9:16)", filename: "versiculo-story.jpg" },
        { width: 1080, height: 1080, label: "Quadrado (1:1)", filename: "versiculo-quadrado.jpg" },
        { width: 1920, height: 1080, label: "Paisagem (16:9)", filename: "versiculo-paisagem.jpg" },
      ];

      const results = formats.map(f =>
        generateShareImage(f.width, f.height, f.label, f.filename, verseOfDay)
      );

      setShareImages(results);
      setGeneratingImages(false);
    }, 50);
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
        <ShareModal
          shareImages={shareImages}
          generatingImages={generatingImages}
          verseOfDay={verseOfDay}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
