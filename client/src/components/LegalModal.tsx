import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

function TermsContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">TERMOS DE USO — MINHA FÉ</h2>
        <p className="text-sm text-muted-foreground">Última atualização: 3 de março de 2026</p>
      </div>

      <p className="text-foreground/80 leading-relaxed">
        Bem-vindo ao Minha Fé.<br />
        Ao acessar ou utilizar a plataforma, você concorda com os presentes Termos de Uso.
      </p>
      <p className="text-foreground/80 leading-relaxed">
        Se você não concordar com qualquer parte destes termos, não utilize o aplicativo.
      </p>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">1. Sobre a Plataforma</h3>
        <p className="text-foreground/80 leading-relaxed">
          O Minha Fé é um ambiente digital cristão destinado ao compartilhamento de:
        </p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Pedidos de oração</li>
          <li>Relatos de graças recebidas</li>
          <li>Confissões pessoais (de forma anônima)</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          A plataforma tem caráter comunitário e espiritual, não substituindo aconselhamento pastoral, psicológico, médico ou jurídico.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">2. Cadastro e Responsabilidade do Usuário</h3>
        <p className="text-foreground/80 leading-relaxed">
          Para utilizar determinadas funcionalidades, o usuário deverá criar uma conta.
        </p>
        <p className="text-foreground/80 leading-relaxed">O usuário declara que:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Fornecerá informações verdadeiras e atualizadas</li>
          <li>É responsável pela confidencialidade de sua conta</li>
          <li>Não utilizará a plataforma para fins ilícitos ou abusivos</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          O usuário é integralmente responsável pelo conteúdo que publicar.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">3. Publicação de Conteúdo</h3>
        <p className="text-foreground/80 leading-relaxed">Ao publicar conteúdo no Minha Fé, o usuário declara que:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Possui direito de compartilhar o conteúdo inserido</li>
          <li>Não publicará conteúdo ofensivo, discriminatório, ilegal ou que viole direitos de terceiros</li>
          <li>Não utilizará a plataforma para ataques pessoais ou discurso de ódio</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          As confissões são exibidas de forma anônima, porém podem ser moderadas conforme estes Termos.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          O Minha Fé reserva-se o direito de remover conteúdos que violem estas regras, sem aviso prévio.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">4. Natureza Espiritual da Plataforma</h3>
        <p className="text-foreground/80 leading-relaxed">
          O Minha Fé é uma iniciativa cristã digital e não possui vínculo institucional com igrejas específicas.
        </p>
        <p className="text-foreground/80 leading-relaxed">A plataforma não garante:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Intervenção divina</li>
          <li>Resultados espirituais específicos</li>
          <li>Aconselhamento religioso formal</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          As interações realizadas pelos usuários têm caráter simbólico e comunitário.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">5. Interações e Reações</h3>
        <p className="text-foreground/80 leading-relaxed">
          As interações como "Amém", "Perdoado" ou similares representam manifestações simbólicas de apoio espiritual.
        </p>
        <p className="text-foreground/80 leading-relaxed">Essas interações:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Não configuram absolvição sacramental</li>
          <li>Não substituem aconselhamento religioso presencial</li>
          <li>Não têm valor jurídico ou religioso formal</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">6. Conteúdo Pago e Contribuições</h3>
        <p className="text-foreground/80 leading-relaxed">
          O aplicativo poderá oferecer funcionalidades opcionais pagas, como:
        </p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Velas digitais especiais</li>
          <li>Recursos adicionais</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Pagamentos são voluntários e não garantem maior visibilidade ou prioridade espiritual.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Valores pagos não são reembolsáveis, salvo disposição legal em contrário.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">7. Moderação e Segurança</h3>
        <p className="text-foreground/80 leading-relaxed">O Minha Fé poderá:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Monitorar conteúdos públicos</li>
          <li>Remover publicações inadequadas</li>
          <li>Suspender ou excluir contas em caso de violação</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          A plataforma não se responsabiliza por conteúdos publicados por terceiros.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">8. Privacidade</h3>
        <p className="text-foreground/80 leading-relaxed">
          O tratamento de dados pessoais ocorre conforme a Política de Privacidade da plataforma.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Confissões são exibidas de forma anônima, mas podem ser armazenadas internamente para fins técnicos e de segurança.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">9. Limitação de Responsabilidade</h3>
        <p className="text-foreground/80 leading-relaxed">O Minha Fé não se responsabiliza por:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Decisões tomadas com base em conteúdos publicados</li>
          <li>Interpretações espirituais individuais</li>
          <li>Danos decorrentes do uso inadequado da plataforma</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          O uso do aplicativo é de inteira responsabilidade do usuário.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">10. Alterações dos Termos</h3>
        <p className="text-foreground/80 leading-relaxed">
          Estes Termos poderão ser alterados a qualquer momento.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          O uso continuado da plataforma após alterações implica concordância com os novos termos.
        </p>
      </section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">POLÍTICA DE PRIVACIDADE — MINHA FÉ</h2>
        <p className="text-sm text-muted-foreground">Última atualização: 3 de março de 2026</p>
      </div>

      <div className="space-y-2">
        <p className="text-foreground/80 leading-relaxed">
          O Minha Fé valoriza a privacidade e o respeito às informações de seus usuários.
          Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei nº 13.709/2018 (Lei Geral de Proteção de Dados – LGPD).
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Ao utilizar o aplicativo, você concorda com esta Política.
        </p>
      </div>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">1. Dados Coletados</h3>
        <p className="text-foreground/80 leading-relaxed">Podemos coletar as seguintes categorias de dados:</p>

        <h4 className="text-base font-semibold text-foreground/90">1.1 Dados fornecidos pelo usuário</h4>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Nome ou apelido</li>
          <li>Endereço de e-mail</li>
          <li>Conteúdo publicado (pedidos de oração, graças, confissões)</li>
          <li>Informações inseridas no perfil</li>
        </ul>

        <h4 className="text-base font-semibold text-foreground/90">1.2 Dados de uso</h4>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Data e horário de acesso</li>
          <li>Interações realizadas (ex: "Amém", "Perdoado")</li>
          <li>Informações técnicas do dispositivo</li>
          <li>Endereço IP</li>
        </ul>

        <h4 className="text-base font-semibold text-foreground/90">1.3 Dados de pagamento (quando aplicável)</h4>
        <p className="text-foreground/80 leading-relaxed">
          Em caso de aquisição de funcionalidades pagas, os dados financeiros são processados por intermediadores de pagamento.
          O Minha Fé não armazena dados completos de cartão de crédito.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">2. Dados Sensíveis</h3>
        <p className="text-foreground/80 leading-relaxed">
          Considerando a natureza da plataforma, podem ser tratados dados relacionados à crença religiosa.
        </p>
        <p className="text-foreground/80 leading-relaxed">Esses dados são tratados com:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Finalidade exclusiva de funcionamento da plataforma</li>
          <li>Acesso restrito</li>
          <li>Medidas de segurança adequadas</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Confissões são exibidas publicamente de forma anônima, sem identificação do autor.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">3. Finalidade do Tratamento</h3>
        <p className="text-foreground/80 leading-relaxed">Utilizamos os dados para:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Permitir o funcionamento do aplicativo</li>
          <li>Exibir conteúdos publicados</li>
          <li>Viabilizar interações entre usuários</li>
          <li>Enviar notificações relacionadas à atividade na plataforma</li>
          <li>Processar pagamentos</li>
          <li>Garantir segurança e prevenir abusos</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Não utilizamos os dados para fins publicitários externos sem consentimento.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">4. Compartilhamento de Dados</h3>
        <p className="text-foreground/80 leading-relaxed">Os dados poderão ser compartilhados com:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Provedores de hospedagem</li>
          <li>Serviços de processamento de pagamento</li>
          <li>Ferramentas de análise técnica</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Sempre observando padrões de segurança e confidencialidade.
        </p>
        <p className="text-foreground/80 leading-relaxed font-medium">
          Não vendemos dados pessoais a terceiros.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">5. Armazenamento e Segurança</h3>
        <p className="text-foreground/80 leading-relaxed">
          Adotamos medidas técnicas e administrativas adequadas para proteger os dados contra:
        </p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Acesso não autorizado</li>
          <li>Perda</li>
          <li>Alteração</li>
          <li>Divulgação indevida</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Os dados são armazenados pelo tempo necessário para cumprir as finalidades descritas nesta Política, salvo obrigação legal em contrário.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">6. Direitos do Titular (LGPD)</h3>
        <p className="text-foreground/80 leading-relaxed">Nos termos da LGPD, o usuário pode solicitar:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Confirmação da existência de tratamento</li>
          <li>Acesso aos dados</li>
          <li>Correção de dados incompletos ou desatualizados</li>
          <li>Exclusão de dados pessoais</li>
          <li>Revogação do consentimento</li>
        </ul>
        <p className="text-foreground/80 leading-relaxed">
          Solicitações podem ser feitas pelo e-mail: <span className="font-medium">contato@minhafe.com.br</span>
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">7. Exclusão de Conta</h3>
        <p className="text-foreground/80 leading-relaxed">
          O usuário pode solicitar a exclusão de sua conta a qualquer momento.
        </p>
        <p className="text-foreground/80 leading-relaxed">Após a exclusão:</p>
        <ul className="list-disc list-inside text-foreground/80 space-y-1 pl-2">
          <li>Dados pessoais identificáveis serão removidos</li>
          <li>Conteúdos públicos poderão ser anonimizados, quando aplicável</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">8. Cookies e Tecnologias de Rastreamento</h3>
        <p className="text-foreground/80 leading-relaxed">
          O aplicativo poderá utilizar tecnologias para melhorar a experiência do usuário e analisar desempenho.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          Essas tecnologias não são utilizadas para rastreamento publicitário externo, salvo consentimento específico.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">9. Alterações desta Política</h3>
        <p className="text-foreground/80 leading-relaxed">
          Esta Política poderá ser atualizada periodicamente.
        </p>
        <p className="text-foreground/80 leading-relaxed">
          O uso contínuo da plataforma após alterações indica concordância com os novos termos.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-display font-bold text-foreground">10. Contato</h3>
        <p className="text-foreground/80 leading-relaxed">
          Para dúvidas, solicitações ou exercício de direitos relacionados à proteção de dados:
        </p>
        <p className="text-foreground/80 leading-relaxed">
          E-mail: <span className="font-medium">contato@minhafe.com.br</span><br />
          Responsável pelo tratamento: Minha Fé
        </p>
      </section>
    </div>
  );
}

interface LegalModalProps {
  type: "terms" | "privacy" | null;
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-black/5 px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="font-display font-bold text-lg text-foreground">
              {type === "terms" ? "Termos de Uso" : "Política de Privacidade"}
            </h2>
            <button
              data-testid="button-close-legal-modal"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <div className="overflow-y-auto overscroll-contain px-6 py-6">
            {type === "terms" ? <TermsContent /> : <PrivacyContent />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
