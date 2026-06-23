import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { slugifyHeading } from "@/lib/docs/slugify";
import { cn } from "@/lib/utils";

function headingText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map((child) => headingText(child)).join("");
  }
  if (children && typeof children === "object" && "props" in children) {
    return headingText((children as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

const usedHeadingIds = new Map<string, number>();

function nextHeadingId(title: string): string {
  const base = slugifyHeading(title);
  const count = usedHeadingIds.get(base) ?? 0;
  usedHeadingIds.set(base, count + 1);
  return count > 0 ? `${base}-${count + 1}` : base;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-6 font-serif text-3xl font-normal tracking-tight text-hoolclone-gray-900 sm:text-4xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const id = nextHeadingId(headingText(children));
    return (
      <h2
        id={id}
        className="mb-4 mt-10 scroll-mt-28 border-b border-border pb-2 text-xl font-bold text-hoolclone-gray-900 first:mt-0"
      >
        {children}
      </h2>
    );
  },
  h3: ({ children }) => {
    const id = nextHeadingId(headingText(children));
    return (
      <h3
        id={id}
        className="mb-3 mt-8 scroll-mt-28 text-lg font-semibold text-hoolclone-gray-900"
      >
        {children}
      </h3>
    );
  },
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-muted-foreground">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2 text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2 text-muted-foreground">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-hoolclone-yellow-500 bg-hoolclone-green-50/60 py-2 pl-4 pr-3 text-sm italic text-hoolclone-green-900">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  a: ({ href, children }) => {
    const isExternal = href?.startsWith("http");
    const isDocs = href?.startsWith("/docs");

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-hoolclone-green-700 underline decoration-hoolclone-green-700/30 underline-offset-2 hover:decoration-hoolclone-green-700"
        >
          {children}
        </a>
      );
    }

    if (isDocs || href?.startsWith("/")) {
      return (
        <Link
          href={href ?? "#"}
          className="font-medium text-hoolclone-green-700 underline decoration-hoolclone-green-700/30 underline-offset-2 hover:decoration-hoolclone-green-700"
        >
          {children}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className="font-medium text-hoolclone-green-700 underline underline-offset-2"
      >
        {children}
      </a>
    );
  },
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");

    if (isBlock) {
      return (
        <code className={cn("font-mono text-[13px] text-emerald-100", className)}>
          {children}
        </code>
      );
    }

    return (
      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px] text-hoolclone-green-900">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl border border-border bg-hoolclone-gray-900 p-4 text-sm leading-relaxed">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[32rem] text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border bg-muted/60">{children}</thead>
  ),
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-hoolclone-gray-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-muted-foreground">{children}</td>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
};

export function DocsMarkdown({ content }: { content: string }) {
  usedHeadingIds.clear();

  return (
    <article className="docs-prose max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </article>
  );
}
