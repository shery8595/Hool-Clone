import fs from "fs";
import path from "path";
import { getDocPage } from "./navigation";

const DOCS_DIR = path.join(process.cwd(), "docs");

export function extractTitleFromMarkdown(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.trim() ?? "Documentation";
}

export function loadDocContent(slug: string): {
  content: string;
  title: string;
  file: string;
} | null {
  const page = getDocPage(slug);
  if (!page) return null;

  const filePath = path.join(DOCS_DIR, page.file);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const title = extractTitleFromMarkdown(content);

  return { content, title, file: page.file };
}

/** Rewrite relative .md links to /docs/<slug> routes */
export function rewriteDocLinks(markdown: string): string {
  return markdown.replace(
    /\]\(\.\/([a-z0-9-]+)\.md\)/gi,
    "](/docs/$1)",
  ).replace(
    /\]\(\.\/([a-z0-9-]+)\)/gi,
    "](/docs/$1)",
  ).replace(
    /\]\(\.\.\/README\.md\)/gi,
    "](/docs)",
  );
}
