import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type ButtonLinkProps = Omit<ComponentProps<typeof Button>, "render"> & {
  href: string;
  target?: string;
  rel?: string;
};

function isExternalHref(href: string, target?: string): boolean {
  return (
    target === "_blank" ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

/** Button styled link — sets nativeButton=false for Base UI accessibility. */
export function ButtonLink({
  href,
  children,
  target,
  rel,
  ...props
}: ButtonLinkProps) {
  if (isExternalHref(href, target)) {
    return (
      <Button
        nativeButton={false}
        render={
          <a
            href={href}
            target={target}
            rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
          />
        }
        {...props}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props}>
      {children}
    </Button>
  );
}
