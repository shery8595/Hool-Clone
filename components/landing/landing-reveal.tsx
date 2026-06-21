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

/**
 * Scopes GSAP scroll + hero animations for the marketing landing page.
 * Elements start hidden via CSS; GSAP only animates to visible (no from/fromTo snap).
 */
export function LandingReveal({ children, className }: LandingRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const revealTo = {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power1.out",
        } as const;

        gsap.to("[data-hero-item]", {
          ...revealTo,
          stagger: 0.18,
          delay: 0.08,
          onComplete: () => {
            gsap.set("[data-hero-item]", { clearProps: "transform" });
          },
        });

        const sections = gsap.utils.toArray<HTMLElement>(
          "[data-reveal-section]",
          containerRef.current,
        );

        for (const section of sections) {
          const items = section.querySelectorAll("[data-reveal-item]");
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
                  gsap.set(items, { clearProps: "transform" });
                },
              });
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-hero-item], [data-reveal-item]", {
          opacity: 1,
          y: 0,
          clearProps: "transform",
        });
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
