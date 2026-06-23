import { PRODUCTION_APP_URL } from "@/lib/landing/content";

export const SHARE_CARD_BG_VERSION = "2";
export const SHARE_CARD_BG_SRC = `/images/share-card-bg.png?v=${SHARE_CARD_BG_VERSION}`;
export const SHARE_CARD_WIDTH = 1672;
export const SHARE_CARD_HEIGHT = 941;

export function getPublicProfileBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base = configured || PRODUCTION_APP_URL;
  return base.replace(/\/$/, "");
}

export function buildPublicProfileUrl(slug: string): string {
  return `${getPublicProfileBaseUrl()}/u/${slug}`;
}

export type ShareCardData = {
  displayName: string;
  handle: string;
  maturityLabel: string;
  displayLevel: number;
  displayMaxLevel: number;
  memoriesCount: number;
  cloneMatchPercent: number;
  profileUrl: string;
};

const COLORS = {
  eyebrow: "#1a6b4a",
  title: "#0a3d2e",
  handle: "#0f4d38",
  muted: "#5f6b66",
  statLabel: "#6b7280",
  statValue: "#0a3d2e",
  pillBg: "rgba(232, 245, 238, 0.92)",
  pillText: "#0f4d38",
  statBg: "rgba(255, 255, 255, 0.88)",
  statBorder: "rgba(26, 107, 74, 0.22)",
};

let backgroundPromise: Promise<HTMLImageElement> | null = null;

export function loadShareCardBackground(): Promise<HTMLImageElement> {
  if (!backgroundPromise) {
    backgroundPromise = new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to load share card background"));
      image.src = SHARE_CARD_BG_SRC;
    });
  }
  return backgroundPromise;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word;
    if (lines.length >= maxLines - 1) break;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    const last = lines[maxLines - 1];
    let trimmed = last;
    while (trimmed.length > 1 && ctx.measureText(`${trimmed}…`).width > maxWidth) {
      trimmed = trimmed.slice(0, -1);
    }
    lines[maxLines - 1] = `${trimmed}…`;
  }

  return lines.length > 0 ? lines : [text];
}

function drawStatCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
) {
  drawRoundedRect(ctx, x, y, width, height, 18);
  ctx.fillStyle = COLORS.statBg;
  ctx.fill();
  ctx.strokeStyle = COLORS.statBorder;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.statLabel;
  ctx.font = '600 20px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(label.toUpperCase(), x + 18, y + 34);

  ctx.fillStyle = COLORS.statValue;
  ctx.font = 'bold 42px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(value, x + 18, y + 78);
}

export async function renderShareCardCanvas(
  data: ShareCardData,
): Promise<HTMLCanvasElement> {
  const background = await loadShareCardBackground();
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create share card canvas");
  }

  ctx.drawImage(background, 0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  const left = SHARE_CARD_WIDTH * 0.06;
  const top = SHARE_CARD_HEIGHT * 0.12;
  const contentWidth = SHARE_CARD_WIDTH * 0.58;
  const maxWidth = contentWidth;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  ctx.fillStyle = COLORS.eyebrow;
  ctx.font = '700 22px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.fillText("PUBLIC CLONE PROFILE", left, top);
  ctx.fillStyle = COLORS.title;
  ctx.font = '800 64px system-ui, -apple-system, "Segoe UI", sans-serif';
  const title = `${data.displayName}'s HoolClone`;
  const titleLines = wrapLines(ctx, title, maxWidth, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, left, top + 42 + index * 72);
  });

  const handleY = top + 42 + titleLines.length * 72 + 8;
  ctx.fillStyle = COLORS.handle;
  ctx.font = '600 30px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText(`@${data.handle}`, left, handleY);

  ctx.fillStyle = COLORS.muted;
  ctx.font = '500 22px system-ui, -apple-system, "Segoe UI", sans-serif';
  ctx.fillText("Walrus-backed · Judge-ready insights", left, handleY + 42);

  const statsTop = handleY + 88;
  const statGap = 14;
  const statWidth = (contentWidth - statGap * 3) / 4;
  const statHeight = 92;
  const stats = [
    { label: "Clone match", value: `${data.cloneMatchPercent}%` },
    { label: "Memories", value: String(data.memoriesCount) },
    { label: "Level", value: `${data.displayLevel}/${data.displayMaxLevel}` },
  ];

  stats.forEach((stat, index) => {
    drawStatCard(
      ctx,
      left + index * (statWidth + statGap),
      statsTop,
      statWidth,
      statHeight,
      stat.label,
      stat.value,
    );
  });

  const pillY = statsTop + statHeight + 24;
  const pillText = `${data.maturityLabel} · Level ${data.displayLevel}`;
  ctx.font = '700 22px system-ui, -apple-system, "Segoe UI", sans-serif';
  const pillWidth = ctx.measureText(pillText).width + 40;
  drawRoundedRect(ctx, left, pillY, pillWidth, 46, 23);
  ctx.fillStyle = COLORS.pillBg;
  ctx.fill();
  ctx.fillStyle = COLORS.pillText;
  ctx.fillText(pillText, left + 20, pillY + 12);

  return canvas;
}

export async function renderShareCardBlob(data: ShareCardData): Promise<Blob> {
  const canvas = await renderShareCardCanvas(data);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) {
    throw new Error("Failed to export share card image");
  }
  return blob;
}

export function buildShareCardTweet(data: ShareCardData): string {
  return `My HoolClone is live — ${data.cloneMatchPercent}% clone match, ${data.memoriesCount} Walrus memories, and judge-ready football insights.`;
}
