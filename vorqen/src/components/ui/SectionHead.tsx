import { SplitReveal } from "./Reveal";

/** Numbered label + headline, the recurring section opener. */
export function SectionHead({
  index,
  label,
  title,
  className,
  align = "left",
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <header className={`${align === "center" ? "text-center" : ""} ${className ?? ""}`}>
      <div className={`mb-10 flex items-center gap-5 ${align === "center" ? "justify-center" : ""}`} data-reveal>
        <span className="t-label text-fg">{index}</span>
        <span className="h-px w-10 bg-line-2" />
        <span className="t-label">{label}</span>
      </div>
      <SplitReveal as="h2" className="t-h2 max-w-[18ch]">
        {title}
      </SplitReveal>
    </header>
  );
}
