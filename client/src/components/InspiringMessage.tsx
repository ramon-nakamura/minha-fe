import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INSPIRING_MESSAGES = [
  "A fé é o firme fundamento das coisas que se esperam.",
  "Onde há fé, há amor; onde há amor, há paz.",
  "Sua atitude determina sua altitude.",
  "Um pequeno ato de bondade pode mudar o dia de alguém.",
  "A gratidão transforma o que temos em suficiente.",
  "Seja a luz que você deseja ver no mundo.",
  "A paciência é a chave para todas as portas.",
  "Tudo o que é feito com amor floresce.",
  "A esperança é a âncora da alma.",
  "Gentileza gera gentileza.",
  "Acredite nos seus sonhos, Deus acredita em você.",
  "O perdão liberta o coração.",
  "Cada novo dia é uma nova oportunidade de recomeçar.",
  "Mantenha seus olhos nas estrelas e seus pés no chão.",
  "A força não vem da capacidade física, mas de uma vontade indomável.",
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Seja corajoso, mesmo quando estiver com medo.",
  "A verdadeira riqueza está no que você dá, não no que você tem.",
  "Ame o próximo como a si mesmo.",
  "A paz começa com um sorriso.",
  "Não espere por circunstâncias ideais, crie-as.",
  "Sua luz brilha mais forte quando você ajuda os outros a brilharem.",
  "A humildade é o primeiro degrau da sabedoria.",
  "Confie no processo, o tempo de Deus é perfeito.",
  "Transforme seus obstáculos em degraus para o sucesso.",
  "A alegria de viver vem de dentro.",
  "Seja grato pelas pequenas coisas, elas são as mais importantes.",
  "O amor é a única força capaz de transformar um inimigo em amigo.",
  "Nunca é tarde demais para ser o que você poderia ter sido.",
  "A oração é a respiração da alma.",
  "Onde quer que você vá, espalhe amor.",
  "A integridade é fazer o certo, mesmo quando ninguém está olhando.",
  "Sua jornada é única, não se compare aos outros.",
  "O bem que você faz hoje será lembrado amanhã.",
  "Mantenha a fé e siga em frente.",
  "A vida é 10% o que acontece com você e 90% como você reage.",
  "Seja a mudança que você quer ver.",
  "O otimismo é a fé em ação.",
  "A bondade é a linguagem que o surdo pode ouvir e o cego pode ver.",
  "Grandes coisas nunca vêm de zonas de conforto.",
  "Cultive o amor, a paz virá como consequência.",
  "A persistência é o caminho do êxito.",
  "Deus não nos dá o que queremos, Ele nos dá o que precisamos para crescer.",
  "O segredo da felicidade é a liberdade, e o segredo da liberdade é a coragem.",
  "Seja fiel no pouco e Deus te colocará sobre o muito.",
  "A compaixão é o coração da humanidade.",
  "Sua voz pode inspirar, suas ações podem transformar.",
  "Mantenha a calma e confie em Deus.",
  "O amanhã pertence àqueles que se preparam hoje.",
  "A beleza da vida está nos detalhes.",
  "A fé remove montanhas, a oração move o coração de Deus.",
  "Seja um incentivador, o mundo já tem críticos demais.",
  "O amor não consiste em olhar um para o outro, mas em olhar juntos na mesma direção.",
  "A esperança é o sonho de quem está acordado.",
  "Dê o seu melhor em tudo o que fizer.",
  "A vida é curta, faça cada momento valer a pena.",
  "O respeito é a base de qualquer relacionamento.",
  "A sabedoria começa no temor ao Senhor.",
  "Não deixe que o barulho das opiniões alheias silencie sua voz interior.",
  "O sorriso é o idioma universal da bondade.",
  "Seja paciente com você mesmo, o crescimento leva tempo.",
  "A fé não torna as coisas fáceis, torna-as possíveis.",
  "O perdão é um presente que você dá a si mesmo.",
  "Onde houver sombra, seja a luz.",
  "A gratidão é a memória do coração.",
  "Confie na bondade que existe nas pessoas.",
  "A coragem é a resistência ao medo, não a ausência dele.",
  "Faça o bem sem olhar a quem.",
  "Sua paz vale mais do que qualquer conflito.",
  "A esperança brilha mais nas horas mais escuras.",
  "Seja a razão de alguém sorrir hoje.",
  "A disciplina é a ponte entre metas e realizações.",
  "O amor é paciente, o amor é bondoso.",
  "Acredite na magia dos novos começos.",
  "Sua força interior é maior do que qualquer desafio.",
  "A oração muda as coisas, a fé muda você.",
  "Seja gentil com todos que encontrar.",
  "A vida retribui o que você planta.",
  "Mantenha o foco no que é bom.",
  "A simplicidade é o último grau da sofisticação.",
  "O segredo de progredir é começar.",
  "Tudo passa, só o amor permanece.",
  "Seja um canal de bênçãos na vida de alguém.",
  "A paz interior é o seu maior tesouro.",
  "Acredite: o melhor ainda está por vir.",
  "O trabalho dignifica o homem.",
  "A união faz a força.",
  "Seja resiliente, as tempestades passam.",
  "A fé é o combustível da alma.",
  "A bondade volta para quem a pratica.",
  "Aproveite cada momento com gratidão.",
  "O amor cura todas as feridas.",
  "Siga seu coração, mas leve seu cérebro com você.",
  "A felicidade é um estado de espírito.",
  "Seja autêntico, seja você mesmo.",
  "A fé nos dá asas para voar sobre os problemas.",
  "Onde há vontade, há um caminho.",
  "A luz de Deus nos guia em cada passo.",
  "Seja forte e corajoso.",
  "A vida é um presente, celebre-a todos os dias."
];

export function InspiringMessage() {
  const [message, setMessage] = useState(INSPIRING_MESSAGES[0]);

  useEffect(() => {
    // Pick a random message on mount
    const randomMsg = INSPIRING_MESSAGES[Math.floor(Math.random() * INSPIRING_MESSAGES.length)];
    setMessage(randomMsg);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto py-16 px-6 text-center relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent blur-3xl -z-10" />
      <AnimatePresence mode="wait">
        <motion.h2
          key={message}
          initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-3xl md:text-5xl font-display text-foreground leading-snug tracking-tight text-glow"
        >
          "{message}"
        </motion.h2>
      </AnimatePresence>
    </div>
  );
}
