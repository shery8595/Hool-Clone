"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DocsSidebar } from "./docs-sidebar";

export function DocsMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="outline" size="icon" className="shrink-0" />
          }
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open docs menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <DocsSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <span className="text-sm font-semibold text-hoolclone-gray-900">
        HoolClone Docs
      </span>
    </div>
  );
}
