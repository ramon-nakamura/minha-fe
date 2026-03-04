import { storage } from "./storage";
import { authStorage } from "./replit_integrations/auth/storage";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const NAMES = [
  "Ana Silva", "Carlos Oliveira", "Maria Santos", "João Pereira", "Beatriz Lima",
  "Ricardo Costa", "Juliana Souza", "Gabriel Ferreira", "Fernanda Alves", "Lucas Rocha"
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop"
];

export async function seedDatabase() {
  try {
    const existing = await storage.getMessages();
    if (existing.length < 10) {
      const seedPassword = await bcrypt.hash("seed123", 10);
      const seedUsers = [];
      for (let i = 0; i < 10; i++) {
        const user = await authStorage.upsertUser({
          id: `user-${i}`,
          email: `user${i}@example.com`,
          password: seedPassword,
          firstName: NAMES[i].split(' ')[0],
          lastName: NAMES[i].split(' ')[1],
          profileImageUrl: PHOTOS[i],
        });
        seedUsers.push(user);
      }

      const prayers = [
        "Pela saúde de minha avó que está no hospital.",
        "Para que eu consiga passar na prova de amanhã.",
        "Pela paz no mundo e fim das guerras.",
        "Pelo meu casamento, que possamos superar as dificuldades.",
        "Para que meu filho encontre um bom caminho.",
        "Pela cura da depressão de um amigo querido.",
        "Agradeço pela vida e peço proteção para minha família.",
        "Para que eu consiga um emprego este mês.",
        "Pela recuperação do meu animal de estimação.",
        "Para que a colheita seja farta este ano.",
        "Pela iluminação dos nossos governantes.",
        "Para que eu tenha mais paciência e sabedoria.",
        "Pelo descanso eterno da alma de meu pai.",
        "Para que as crianças de rua encontrem abrigo.",
        "Pela união da minha comunidade.",
        "Para que eu consiga abandonar vícios antigos.",
        "Pela felicidade de todos os que sofrem em silêncio."
      ];

      const graces = [
        "Recebi a notícia que serei pai! Glória a Deus.",
        "Consegui a casa própria depois de anos de luta.",
        "Meu exame de saúde veio limpo, estou curado.",
        "Reconciliei-me com meu irmão após 5 anos.",
        "Encontrei uma carteira perdida com todos os documentos.",
        "Minha filha foi aprovada na faculdade de medicina.",
        "Sobrevivi a um acidente grave sem um arranhão.",
        "Consegui pagar todas as minhas dívidas este mês.",
        "Uma viagem maravilhosa que correu tudo bem.",
        "Pela chuva que finalmente chegou na minha região.",
        "Agradeço pelo pão de cada dia na minha mesa.",
        "Recebi um bônus inesperado no trabalho.",
        "Sinto uma paz interior que nunca tive antes."
      ];

      const sins = [
        "Sinto inveja do sucesso do meu vizinho.",
        "Menti para minha esposa sobre gastos financeiros.",
        "Fui grosseiro com um estranho no trânsito.",
        "Julguei uma pessoa sem conhecer sua história.",
        "Não ajudei quem me pediu socorro podendo ajudar.",
        "Falei mal de um colega pelas costas.",
        "Fui egoísta com meu tempo e recursos.",
        "Tive pensamentos impuros durante o dia.",
        "Ignorei o sofrimento de um familiar por preguiça."
      ];

      for (let i = 0; i < prayers.length; i++) {
        const p = prayers[i];
        const user = seedUsers[Math.floor(Math.random() * seedUsers.length)];
        await storage.createMessage({ 
          type: 'prayer', 
          content: p,
          isSpecial: i < 3
        });
      }

      for (const g of graces) {
        const user = seedUsers[Math.floor(Math.random() * seedUsers.length)];
        await storage.createMessage({ type: 'grace', content: g});
      }

      for (const s of sins) {
        await storage.createMessage({ type: 'sin', content: s});
      }
      console.log("Database seeded with more realistic data");
    }
  } catch (error) {
    console.error("Failed to seed database:", error);
  }
}
