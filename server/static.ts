import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function serveStatic(app: Express) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // dist/server/index.js → __dirname is dist/server/, public is one level up at dist/public/
  const distPath = path.resolve(__dirname, "../public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache longo para assets com hash (JS/CSS/imgs gerados pelo Vite)
  app.use("/assets", express.static(path.join(distPath, "assets"), {
    maxAge: "1y",
    immutable: true,
  }));

  // Cache curto para arquivos raiz (index.html, favicon, og-image, etc.)
  app.use(express.static(distPath, {
    maxAge: "1h",
    setHeaders(res, filePath) {
      // HTML nunca deve ser cacheado pelo browser para garantir atualizações
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  }));

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
