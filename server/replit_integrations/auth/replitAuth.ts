import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { authStorage } from "./storage";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl,
    },
  });
}

const registerSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  consent: z.literal(true, { errorMap: () => ({ message: "Você deve aceitar os Termos de Uso e Política de Privacidade" }) }),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token inválido"),
  newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
});

async function sendResetEmail(email: string, firstName: string | null, resetUrl: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    throw new Error("Serviço de email não configurado");
  }

  const name = firstName || "Caminhante";

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f8f7f4;font-family:'Helvetica Neue',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f7f4;padding:40px 20px;">
        <tr><td align="center">
          <table width="100%" style="max-width:480px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:0;line-height:0;">
                <img src="https://minhafe.com.br/og-image.jpg" alt="Minha Fé" width="480" style="width:100%;max-width:480px;height:auto;display:block;border-radius:24px 24px 0 0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px;">
                <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px;font-weight:700;">Redefinir sua senha</h2>
                <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
                  Olá, ${name}. Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                </p>
                <div style="text-align:center;margin:32px 0;">
                  <a href="${resetUrl}" style="display:inline-block;background:#d97706;color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;">
                    Redefinir minha senha
                  </a>
                </div>
                <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;line-height:1.6;">
                  Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição, pode ignorar este email com segurança.
                </p>
                <hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;">
                <p style="margin:0;color:#cbd5e1;font-size:12px;text-align:center;">
                  Minha Fé · <a href="https://minhafe.com.br" style="color:#d97706;text-decoration:none;">minhafe.com.br</a>
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Minha Fé <contato@minhafe.com.br>",
      to: email,
      subject: "Redefinir senha — Minha Fé",
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("Resend error:", err);
    throw new Error("Erro ao enviar email");
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, password, consent } = registerSchema.parse(req.body);

      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Este email já está cadastrado" });
      }

      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await authStorage.upsertUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        consentAcceptedAt: new Date(),
      });

      (req.session as any).userId = user.id;

      const { password: _, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Register error:", err);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      (req.session as any).userId = user.id;

      // Registra último acesso
      await authStorage.updateUser(user.id, { updatedAt: new Date() });

      const { password: _, ...safeUser } = user;
      res.json(safeUser);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Login error:", err);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao sair" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logout realizado" });
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await authStorage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "Se este email estiver cadastrado, você receberá as instruções em breve." });
      }

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await authStorage.createPasswordResetToken({ userId: user.id, token, expiresAt });

      const origin = process.env.APP_URL || "https://minhafe.com.br";
      const resetUrl = `${origin}/redefinir-senha?token=${token}`;

      await sendResetEmail(user.email, user.firstName ?? null, resetUrl);

      res.json({ message: "Se este email estiver cadastrado, você receberá as instruções em breve." });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Erro ao processar solicitação" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      const resetToken = await authStorage.getPasswordResetToken(token);

      if (!resetToken) {
        return res.status(400).json({ message: "Link inválido ou expirado" });
      }
      if (resetToken.usedAt) {
        return res.status(400).json({ message: "Este link já foi utilizado" });
      }
      if (new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Este link expirou. Solicite um novo." });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await authStorage.updateUser(resetToken.userId, { password: hashedPassword });
      await authStorage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ message: "Senha redefinida com sucesso" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Erro ao redefinir senha" });
    }
  });

  app.patch("/api/auth/password", isAuthenticated, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      const userId = req.session.userId;

      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(400).json({ message: "Senha atual incorreta" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await authStorage.updateUser(userId, { password: hashedPassword });

      res.json({ message: "Senha alterada com sucesso" });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Change password error:", err);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.delete("/api/auth/account", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await authStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const { storage } = await import("../../storage");
      await storage.anonymizeUserMessages(userId);

      await authStorage.deleteUser(userId);

      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Conta excluída com sucesso" });
      });
    } catch (err) {
      console.error("Delete account error:", err);
      res.status(500).json({ message: "Erro ao excluir conta" });
    }
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req.session as any)?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await authStorage.getUser(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};
