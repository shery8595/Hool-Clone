"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type LandingRevealProps = {
  children: ReactNode;
  className?: string;
};

function markRevealedElements(elements: gsap.TweenTarget) {
  const nodes = gsap.utils.toArray<HTMLElement>(elements);
  for (const node of nodes) {
    node.classList.add("landing-revealed");
  }
  // Keep GSAP's final transform in place. Clearing it can cause a last-frame snap.
  gsap.set(nodes, { opacity: 1, y: 0 });
}

/**
 * Scopes GSAP scroll + hero animations for the marketing landing page.
 * Elements start hidden via CSS; GSAP animates to visible, then a revealed
 * class keeps them visible while GSAP holds the final transform.
 */
export function LandingReveal({ children, className }: LandingRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = containerRef.current;
      if (!root) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const heroItems = gsap.utils.toArray<HTMLElement>(
          "[data-hero-item]",
          root,
        );

        const revealTo = {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power1.out",
        } as const;

        gsap.to(heroItems, {
          ...revealTo,
          stagger: 0.18,
          delay: 0.08,
          onComplete: () => {
            markRevealedElements(heroItems);
          },
        });

        const sections = gsap.utils.toArray<HTMLElement>(
          "[data-reveal-section]",
          root,
        );

        for (const section of sections) {
          const items = gsap.utils.toArray<HTMLElement>(
            "[data-reveal-item]",
            section,
          );
          if (!items.length) continue;

          ScrollTrigger.create({
            trigger: section,
            start: "top 84%",
            once: true,
            onEnter: () => {
              gsap.to(items, {
                ...revealTo,
                stagger: 0.07,
                onComplete: () => {
                  markRevealedElements(items);
                },
              });
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const items = gsap.utils.toArray<HTMLElement>(
          "[data-hero-item], [data-reveal-item]",
          root,
        );
        markRevealedElements(items);
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className={`landing-motion${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
