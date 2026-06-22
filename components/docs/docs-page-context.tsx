"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DocsPageContextValue = {
  markdown: string;
  setMarkdown: (markdown: string) => void;
};

const DocsPageContext = createContext<DocsPageContextValue | null>(null);

export function DocsPageProvider({ children }: { children: ReactNode }) {
  const [markdown, setMarkdown] = useState("");

  const value = useMemo(
    () => ({
      markdown,
      setMarkdown,
    }),
    [markdown],
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

/** Registers page markdown for the sticky copy button. */
export function DocsPageRegistrar({ markdown }: { markdown: string }) {
  const { setMarkdown } = useDocsPage();

  useEffect(() => {
    setMarkdown(markdown);
    return () => setMarkdown("");
  }, [markdown, setMarkdown]);

  return null;
}
