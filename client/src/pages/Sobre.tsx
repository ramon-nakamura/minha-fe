import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Heart, HandHeart } from "lucide-react";

function CandleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 2C11 3.5 9.5 5.5 9.5 7.2C9.5 8.8 10.6 9.8 12 9.8C13.4 9.8 14.5 8.8 14.5 7.2C14.5 5.5 13 3.5 12 2Z" fill="currentColor" stroke="none" />
      <line x1="12" y1="9.8" x2="12" y2="11.5" />
      <rect x="8.5" y="11.5" width="7" height="10" rx="1" />
      <line x1="5" y1="21.5" x2="19" y2="21.5" />
    </svg>
  );
}

function HandHeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M11 14H9C7.9 14 7 13.1 7 12V5C7 3.9 7.9 3 9 3H15C16.1 3 17 3.9 17 5V9" />
      <path d="M17.5 13C17.5 13 19 14.2 19 15.5C19 16.8 18 17.5 17 17.5C16 17.5 15.5 17 15.5 17C15.5 17 15 17.5 14 17.5C13 17.5 12 16.8 12 15.5C12 14.2 13.5 13 13.5 13H17.5Z" />
      <path d="M9 21H15L15.5 17" />
      <path d="M9 21L7 19" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

const faqItems = [
  {
    q: "Preciso me identificar para participar?",
    a: "Não. O Minha Fé foi construído sobre o princípio do anonimato sagrado. Você pode compartilhar suas confissões e pedidos sem revelar quem você é — apenas a sua alma fala.",
  },
  {
    q: "O que são as Velas Especiais?",
    a: "Uma vela acesa é um gesto de intenção e entrega. As Velas Especiais amplificam a visibilidade do seu pedido dentro da comunidade, para que mais corações possam orar pela sua causa durante 7 dias.",
  },
  {
    q: "Quem pode ver meus pedidos de oração?",
    a: "Toda a comunidade do Minha Fé pode ver e orar pelos pedidos públicos. Pedidos marcados como privados ficam visíveis apenas para você. Confissões são sempre anônimas.",
  },
  {
    q: "Como funciona o 'perdoar' nas confissões?",
    a: "Quando alguém lê uma confissão e escolhe perdoar, está enviando um gesto simbólico de misericórdia e acolhimento. É a comunidade dizendo: você não está sozinho, e nenhuma carga é grande demais.",
  },
  {
    q: "O Minha Fé é de alguma denominação religiosa específica?",
    a: "Não. O Minha Fé é um espaço ecuménico — aberto a todas as pessoas de fé, independentemente da tradição religiosa. O que nos une é a crença no poder da oração e da comunidade.",
  },
  {
    q: "Meu pedido de oração pode expirar?",
    a: "As orações permanecem no feed da comunidade enquanto fizerem parte da jornada coletiva. Você pode excluir ou tornar privado qualquer pedido a qualquer momento.",
  },
];

export default function Sobre() {
  return (
    <main className="min-h-screen" role="main">

      {/* Hero */}
      <section
        className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-white/70 to-white pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-20 mix-blend-multiply bg-cover bg-center"
          role="img"
          aria-label="Céu ao amanhecer — imagem decorativa"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=70)" }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-amber-200/80 shadow-sm mb-8 text-sm font-medium text-amber-700">
              <CandleIcon className="w-4 h-4" />
              Uma chama que nunca se apaga
            </div>
          </motion.div>

          <motion.h1
            id="hero-heading"
            className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6"
            variants={fadeUp} initial="hidden" animate="visible" custom={1}
          >
            Onde a fé encontra<br />
            <span className="italic text-amber-600">a comunidade</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            variants={fadeUp} initial="hidden" animate="visible" custom={2}
          >
            O Minha Fé é um santuário digital — um lugar para depositar o peso das suas
            intenções, celebrar as graças recebidas e encontrar acolhimento em silêncio ou em voz alta.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            variants={fadeUp} initial="hidden" animate="visible" custom={3}
          >
            <Link href="/">
              <a className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                Entrar na comunidade
                <ArrowRight className="w-4 h-4" />
              </a>
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/80 border border-black/10 font-semibold text-foreground hover:bg-white transition-all"
            >
              Como funciona
            </a>
          </motion.div>
        </div>
      </section>

      {/* O que é o Minha Fé */}
      <section
        className="py-24 px-6 bg-white/60 backdrop-blur-sm"
        aria-labelledby="about-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}
          >
            <h2
              id="about-heading"
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6"
            >
              Um altar no seu bolso
            </h2>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto mb-8" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6 text-lg text-muted-foreground leading-relaxed"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
            >
              <p>
                Há uma oração que você carrega há meses. Uma graça que encheu seu coração de gratidão
                mas que você guardou só para si. Um peso que te impede de dormir.
              </p>
              <p>
                O <strong className="text-foreground">Minha Fé</strong> nasceu da convicção de que
                nenhuma intenção precisa ser carregada em silêncio. Que existe uma força singular
                quando almas desconhecidas se unem por uma mesma causa — mesmo sem nunca se verem.
              </p>
              <p>
                Aqui, você não precisa de palavras perfeitas. Não precisa de uma religião específica.
                Precisa apenas de fé — a do tamanho de um grão de mostarda — e da coragem
                de deixar que outros caminhem ao seu lado.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
            >
              {[
                { label: "Orações enviadas", value: "cada dia mais", color: "amber" },
                { label: "Graças celebradas", value: "toda semana", color: "blue" },
                { label: "Comunidade", value: "sempre ativa", color: "violet" },
                { label: "Acolhimento", value: "sempre", color: "emerald" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white/80 border border-white/80 rounded-2xl p-5 shadow-sm"
                >
                  <p className="font-display text-xl font-bold text-foreground mb-1">{item.value}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section
        id="como-funciona"
        className="py-24 px-6"
        aria-labelledby="how-heading"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2
              id="how-heading"
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Três formas de falar com o céu
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Cada mensagem é uma intenção. Cada intenção, uma vela acesa no coração da comunidade.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <CandleIcon className="w-8 h-8" />,
                title: "Pedido de Oração",
                color: "amber",
                bg: "bg-amber-50",
                border: "border-amber-200/60",
                iconBg: "bg-amber-100 text-amber-600",
                description:
                  "Compartilhe o que pesa no seu coração. Uma doença, uma decisão difícil, uma esperança que teima em resistir. A comunidade receberá seu pedido e orará junto com você — anônimos unidos por uma mesma intenção.",
                keyword: "comunidade de oração online",
              },
              {
                icon: <HandHeart className="w-8 h-8" />,
                title: "Graça Recebida",
                color: "blue",
                bg: "bg-blue-50",
                border: "border-blue-200/60",
                iconBg: "bg-blue-100 text-blue-600",
                description:
                  "A gratidão partilhada se multiplica. Quando algo de bom atravessa a sua vida, celebre em voz alta. Sua alegria pode ser exatamente a luz que alguém precisava ver hoje para não desistir.",
                keyword: "gratidão espiritual compartilhada",
              },
              {
                icon: <EyeOffIcon className="w-8 h-8" />,
                title: "Confissão Anônima",
                color: "slate",
                bg: "bg-slate-50",
                border: "border-slate-200/60",
                iconBg: "bg-slate-100 text-slate-600",
                description:
                  "Há falhas que precisam ser ditas antes de serem perdoadas. Em total anonimato, deixe sair o que te aprisiona. A comunidade pode te oferecer o perdão simbólico que talvez você não consiga dar a si mesmo.",
                keyword: "confissão anônima espiritual",
              },
            ].map((item, i) => (
              <motion.article
                key={item.title}
                className={`${item.bg} border ${item.border} rounded-3xl p-8 flex flex-col gap-5`}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                aria-label={item.keyword}
              >
                <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center`}>
                  {item.icon}
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Por que usar — diferenciais */}
      <section
        className="py-24 px-6 bg-gradient-to-b from-white/0 via-amber-50/30 to-white/0"
        aria-labelledby="why-heading"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2
              id="why-heading"
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Por que o Minha Fé?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Não somos uma rede social. Somos um santuário.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Anonimato verdadeiro",
                desc: "Suas confissões e pedidos mais íntimos nunca precisam revelar sua identidade. O que importa aqui é a intenção, não o nome.",
                emoji: "🌫️",
              },
              {
                title: "Comunidade ativa",
                desc: "Não é uma caixa de mensagens que ninguém lê. É uma comunidade viva, que ora, celebra e perdoa em tempo real.",
                emoji: "🕊️",
              },
              {
                title: "Sem algoritmos de ódio",
                desc: "O feed do Minha Fé é curado pela fé, não pelo engajamento. Não há polarização, não há discórdia — apenas intenções.",
                emoji: "✨",
              },
              {
                title: "Ecumênico e inclusivo",
                desc: "Seja qual for a sua tradição espiritual — cristã, espírita, umbandista, ou simplesmente humana — há espaço para você aqui.",
                emoji: "🤲",
              },
              {
                title: "Simples como uma oração",
                desc: "Nenhum tutorial necessário. Você escreve, você ora, você celebra. É tão simples quanto fechar os olhos e respirar.",
                emoji: "🌿",
              },
              {
                title: "Suas intenções, seu controle",
                desc: "Tornar privado, excluir, editar — você tem controle total sobre o que compartilhou e por quanto tempo permanece visível.",
                emoji: "🔐",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="flex gap-5 p-6 bg-white/70 rounded-2xl border border-white/80 shadow-sm"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 3}
              >
                <span className="text-3xl shrink-0 mt-0.5" role="img" aria-hidden="true">{item.emoji}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        className="py-24 px-6"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <h2
              id="faq-heading"
              className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
            >
              Perguntas frequentes
            </h2>
            <p className="text-muted-foreground text-lg">
              Respondemos com o mesmo cuidado com que recebemos uma oração.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <motion.details
                key={item.q}
                className="group bg-white/80 border border-white/80 rounded-2xl shadow-sm overflow-hidden"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i * 0.5}
              >
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none font-semibold text-foreground hover:text-primary transition-colors">
                  <span>{item.q}</span>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold group-open:rotate-45 transition-transform duration-200">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-black/5 pt-4">
                  {item.a}
                </p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section
        className="py-24 px-6"
        aria-labelledby="cta-heading"
      >
        <motion.div
          className="max-w-2xl mx-auto text-center bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] shadow-xl shadow-black/5 p-12 md:p-16"
          variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-8">
            <CandleIcon className="w-7 h-7 text-amber-600" />
          </div>
          <h2
            id="cta-heading"
            className="font-display text-4xl font-bold text-foreground mb-6"
          >
            Sua primeira oração<br />
            <span className="italic text-amber-600">te espera</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
            Junte-se a uma comunidade que acredita no poder invisível das intenções compartilhadas.
            Cadastre-se gratuitamente e acenda sua primeira vela.
          </p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Começar agora
              <ArrowRight className="w-5 h-5" />
            </a>
          </Link>
        </motion.div>
      </section>

      {/* Footer mínimo */}
      <footer className="py-10 px-6 border-t border-black/5 text-center" role="contentinfo">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-display font-semibold text-foreground">
            <CandleIcon className="w-4 h-4 text-amber-600" />
            Minha Fé
          </div>
          <nav aria-label="Links do rodapé" className="flex gap-6">
            <Link href="/termos"><a className="hover:text-primary transition-colors">Termos de Uso</a></Link>
            <Link href="/privacidade"><a className="hover:text-primary transition-colors">Privacidade</a></Link>
            <Link href="/"><a className="hover:text-primary transition-colors">Entrar</a></Link>
          </nav>
          <p>© {new Date().getFullYear()} Minha Fé. Todos os direitos reservados.</p>
        </div>
      </footer>

    </main>
  );
}
