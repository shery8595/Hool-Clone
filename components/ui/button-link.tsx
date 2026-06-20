import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

type ButtonLinkProps = Omit<ComponentProps<typeof Button>, "render"> & {
  href: string;
};

/** Button styled link — sets nativeButton=false for Base UI accessibility. */
export function ButtonLink({ href, children, ...props }: ButtonLinkProps) {
  return (
    <Button nativeButton={false} render={<Link href={href} />} {...props}>
      {children}
    </Button>
  );
}
