import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/profile">
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors" data-testid="button-back-profile">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="font-display font-bold text-lg">Política de Privacidade</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6 md:p-10 space-y-8">
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
              Solicitações podem ser feitas pelo e-mail: <span className="font-medium">contato@minhafe.app</span>
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
              E-mail: <span className="font-medium">contato@minhafe.app</span><br />
              Responsável pelo tratamento: Minha Fé
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
