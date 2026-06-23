export const TELEGRAM_MESSAGE_MAX_LENGTH = 4096;

const RECEIPT_FOOTER_MARKER = "\n\nWalrus receipt\n";

export function splitTelegramMessage(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];
  if (trimmed.length <= TELEGRAM_MESSAGE_MAX_LENGTH) {
    return [trimmed];
  }

  const markerIndex = trimmed.indexOf(RECEIPT_FOOTER_MARKER);
  if (markerIndex > 0) {
    const main = trimmed.slice(0, markerIndex).trim();
    const footer = trimmed.slice(markerIndex).trim();
    const parts: string[] = [];

    if (main.length > 0) {
      parts.push(...chunkText(main, TELEGRAM_MESSAGE_MAX_LENGTH));
    }

    if (footer.length <= TELEGRAM_MESSAGE_MAX_LENGTH) {
      parts.push(footer);
    } else {
      parts.push(...splitReceiptFooter(footer));
    }

    return parts.filter((part) => part.length > 0);
  }

  return chunkText(trimmed, TELEGRAM_MESSAGE_MAX_LENGTH);
}

function splitReceiptFooter(footer: string): string[] {
  const lines = footer.split("\n");
  const header = lines[0] ?? "Walrus receipt";
  const bullets = lines.slice(1).filter((line) => line.trim().length > 0);

  const parts: string[] = [];
  let current = header;

  for (const bullet of bullets) {
    const next = `${current}\n${bullet}`;
    if (next.length > TELEGRAM_MESSAGE_MAX_LENGTH) {
      if (current !== header) {
        parts.push(current);
        current = `${header}\n${bullet}`;
      } else {
        parts.push(...chunkText(next, TELEGRAM_MESSAGE_MAX_LENGTH));
        current = header;
      }
      continue;
    }
    current = next;
  }

  if (current.length > header.length) {
    parts.push(current);
  }

  return parts.length > 0 ? parts : chunkText(footer, TELEGRAM_MESSAGE_MAX_LENGTH);
}

function chunkText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < maxLength * 0.5) {
      splitAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitAt < maxLength * 0.3) {
      splitAt = maxLength;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining.length > 0) {
    chunks.push(remaining);
  }

  return chunks;
}
