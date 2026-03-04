import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/50 backdrop-blur-xl border-b border-white/20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/profile">
            <button className="p-2 rounded-full hover:bg-black/5 transition-colors" data-testid="button-back-profile">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <h1 className="font-display font-bold text-lg">Termos de Uso</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl rounded-3xl p-6 md:p-10 space-y-8">
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
      </main>
    </div>
  );
}
