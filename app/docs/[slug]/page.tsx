import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsMarkdown } from "@/components/docs/docs-markdown";
import { DocsPageActions } from "@/components/docs/docs-page-actions";
import { DocsPager } from "@/components/docs/docs-pager";
import {
  getAdjacentDocs,
  getAllDocSlugs,
  getDocPage,
} from "@/lib/docs/navigation";
import { loadDocContent, rewriteDocLinks } from "@/lib/docs/load-doc";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = loadDocContent(slug);
  const page = getDocPage(slug);

  if (!doc || !page) {
    return { title: "Not Found — HoolClone Docs" };
  }

  return {
    title: `${doc.title} — HoolClone Docs`,
    description: page.description ?? `${doc.title} documentation for HoolClone.`,
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = loadDocContent(slug);

  if (!doc) {
    notFound();
  }

  const content = rewriteDocLinks(doc.content);
  const { prev, next } = getAdjacentDocs(slug);

  return (
    <>
      <DocsPageActions markdown={doc.content} />
      <DocsMarkdown content={content} />
      <DocsPager prev={prev} next={next} />
    </>
  );
}
