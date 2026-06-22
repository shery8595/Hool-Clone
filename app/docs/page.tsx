import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowRight, BookOpen, Rocket, Database, Server, FlaskConical, Scale } from "lucide-react";
import { DocsMarkdown } from "@/components/docs/docs-markdown";
import { DocsPageActions } from "@/components/docs/docs-page-actions";
import { rewriteDocLinks } from "@/lib/docs/load-doc";
import { docSections } from "@/lib/docs/navigation";

const README_PATH = path.join(process.cwd(), "docs", "README.md");

export default function DocsIndexPage() {
  const raw = fs.readFileSync(README_PATH, "utf-8");
  const content = rewriteDocLinks(raw);

  return (
    <>
      <DocsPageActions markdown={raw} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/docs/judges"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40"
        >
          <Scale className="mb-2 h-5 w-5 text-hoolclone-green-700" />
          <p className="font-semibold text-hoolclone-gray-900">Judges Guide</p>
          <p className="mt-1 text-xs text-muted-foreground">
            15-min tour & criteria
          </p>
        </Link>
        <Link
          href="/docs/getting-started"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40"
        >
          <Rocket className="mb-2 h-5 w-5 text-hoolclone-green-700" />
          <p className="font-semibold text-hoolclone-gray-900">Getting Started</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Install and run locally
          </p>
        </Link>
        <Link
          href="/docs/walrus-memory"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40"
        >
          <Database className="mb-2 h-5 w-5 text-hoolclone-green-700" />
          <p className="font-semibold text-hoolclone-gray-900">Walrus Memory</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Namespaces, recall, receipts
          </p>
        </Link>
        <Link
          href="/docs/deployment"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40"
        >
          <Server className="mb-2 h-5 w-5 text-hoolclone-green-700" />
          <p className="font-semibold text-hoolclone-gray-900">Deployment</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Vercel + Mainnet setup
          </p>
        </Link>
        <Link
          href="/docs/how-memory-improves-agent"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40"
        >
          <BookOpen className="mb-2 h-5 w-5 text-hoolclone-green-700" />
          <p className="font-semibold text-hoolclone-gray-900">Memory & Agent</p>
          <p className="mt-1 text-xs text-muted-foreground">
            How behavior improves
          </p>
        </Link>
        <Link
          href="/docs/testing"
          className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-hoolclone-green-200 hover:bg-hoolclone-green-50/40"
        >
          <FlaskConical className="mb-2 h-5 w-5 text-hoolclone-green-700" />
          <p className="font-semibold text-hoolclone-gray-900">Testing</p>
          <p className="mt-1 text-xs text-muted-foreground">
            151 unit tests · coverage map
          </p>
        </Link>
      </div>

      <DocsMarkdown content={content} />

      <section className="mt-12 border-t border-border pt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-hoolclone-gray-900">
          <BookOpen className="h-5 w-5 text-hoolclone-green-700" />
          All documentation
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {docSections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.pages.map((page) => (
                  <li key={page.slug}>
                    <Link
                      href={`/docs/${page.slug}`}
                      className="group flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span>{page.title}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
