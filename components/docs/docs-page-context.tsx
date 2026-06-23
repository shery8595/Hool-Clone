"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  extractHeadingsFromMarkdown,
  type DocHeading,
} from "@/lib/docs/extract-headings";

type DocsPageContextValue = {
  markdown: string;
  headings: DocHeading[];
  setMarkdown: (markdown: string) => void;
};

const DocsPageContext = createContext<DocsPageContextValue | null>(null);

export function DocsPageProvider({ children }: { children: ReactNode }) {
  const [markdown, setMarkdown] = useState("");
  const headings = useMemo(
    () => extractHeadingsFromMarkdown(markdown),
    [markdown],
  );

  const value = useMemo(
    () => ({
      markdown,
      headings,
      setMarkdown,
    }),
    [markdown, headings],
  );

  return (
    <DocsPageContext.Provider value={value}>{children}</DocsPageContext.Provider>
  );
}

export function useDocsPage() {
  const context = useContext(DocsPageContext);
  if (!context) {
    throw new Error("useDocsPage must be used within DocsPageProvider");
  }
  return context;
}

/** Registers page markdown for copy button and table of contents. */
export function DocsPageRegistrar({ markdown }: { markdown: string }) {
  const { setMarkdown } = useDocsPage();

  useEffect(() => {
    setMarkdown(markdown);
    return () => setMarkdown("");
  }, [markdown, setMarkdown]);

  return null;
}
