/**
 * Build an X (Twitter) web intent URL. Uses a single `text` param with the
 * profile URL inline — separate `url` params often hang or fail to compose.
 */
export function buildShareOnXIntentUrl(message: string, profileUrl: string): string {
  const text = `${message.trim()}\n\n${profileUrl.trim()}`;
  return `https://x.com/intent/tweet?${new URLSearchParams({ text }).toString()}`;
}

/** Open X compose in a new tab; fall back to same-tab navigation if blocked. */
export function openShareOnX(intentUrl: string): void {
  const anchor = document.createElement("a");
  anchor.href = intentUrl;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}
