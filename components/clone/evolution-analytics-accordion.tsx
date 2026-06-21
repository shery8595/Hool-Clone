type EvolutionAnalyticsAccordionProps = {
  children: React.ReactNode;
  className?: string;
};

export function EvolutionAnalyticsAccordion({
  children,
  className,
}: EvolutionAnalyticsAccordionProps) {
  return (
    <details className={className}>
      <summary className="cursor-pointer list-none rounded-xl border bg-muted/30 px-4 py-3 text-sm font-semibold text-hoolclone-green-900 hover:bg-muted/50 [&::-webkit-details-marker]:hidden">
        More analytics
      </summary>
      <div className="mt-4 space-y-6">{children}</div>
    </details>
  );
}
