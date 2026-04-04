import { useState, useCallback, useEffect } from "react";
import { X, Share2, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const FORMAT_META = [
  { key: 0, label: "Story", sublabel: "9:16" },
  { key: 1, label: "Quadrado", sublabel: "1:1" },
  { key: 2, label: "Paisagem", sublabel: "16:9" },
];

function generateShareImage(
  width: number,
  height: number,
  label: string,
  filename: string,
  verse: { text: string; reference: string }
): { label: string; dataUrl: string; filename: string } {
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
  const corners = [
    [m, m],
    [width - m, m],
    [m, height - m],
    [width - m, height - m],
  ] as [number, number][];
  ctx.strokeStyle = "rgba(200, 160, 70, 0.5)";
  ctx.lineWidth = 2;
  corners.forEach(([cx, cy]) => {
    const sx = cx === m ? 1 : -1;
    const sy = cy === m ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * accentLen);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * accentLen, cy);
    ctx.stroke();
  });

  // Text layout
  const padding = width * 0.12;
  const maxTextWidth = width - padding * 2;
  const isWide = width > height;
  const isStory = height > width;
  const baseFontSize = isWide
    ? Math.floor(width * 0.034)
    : isStory
    ? Math.floor(width * 0.068)
    : Math.floor(width * 0.054);

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

  lines.forEach((line, i) =>
    ctx.fillText(line, width / 2, startY + i * lineHeight)
  );

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
}

export function ShareVerseModal({
  verseOfDay,
  onClose,
}: {
  verseOfDay: { text: string; reference: string };
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(0);
  const [generatingImages, setGeneratingImages] = useState(true);
  const [shareImages, setShareImages] = useState<
    { label: string; dataUrl: string; filename: string }[]
  >([]);

  useEffect(() => {
    setGeneratingImages(true);
    setShareImages([]);
    
    // Generate async so we don't block render
    const timeout = setTimeout(() => {
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

    return () => clearTimeout(timeout);
  }, [verseOfDay]);

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
