import { slugifyHeading } from "@/lib/docs/slugify";

export type DocHeading = {
  id: string;
  title: string;
  level: 2 | 3;
};

export function extractHeadingsFromMarkdown(markdown: string): DocHeading[] {
  const headings: DocHeading[] = [];
  const usedIds = new Map<string, number>();

  for (const line of markdown.split("\n")) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    const level = match[1]!.length as 2 | 3;
    const title = match[2]!
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .trim();
    if (!title) continue;

    let id = slugifyHeading(title);
    const count = usedIds.get(id) ?? 0;
    if (count > 0) id = `${id}-${count + 1}`;
    usedIds.set(slugifyHeading(title), count + 1);

    headings.push({ id, title, level });
  }

  return headings;
}
