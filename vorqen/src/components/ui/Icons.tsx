import type { SVGProps } from "react";
import type { ServiceIcon } from "@/lib/content";

type P = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconMonitor = (p: P) => (
  <Base {...p}>
    <rect x="2.5" y="3.5" width="19" height="13" rx="1.5" />
    <path d="M8 20.5h8M12 16.5v4" />
    <path d="M10 13l4-6" opacity={0.55} />
  </Base>
);
export const IconBot = (p: P) => (
  <Base {...p}>
    <rect x="4" y="8" width="16" height="11" rx="3" />
    <path d="M12 4.5V8M9 13v1.5M15 13v1.5M2 13v2.5M22 13v2.5" />
    <circle cx="12" cy="3.5" r="1" />
  </Base>
);
export const IconChart = (p: P) => (
  <Base {...p}>
    <path d="M4 20.5v-4M9 20.5v-7M14 20.5v-9M19 20.5v-13" />
    <path d="M3.5 12.5L9 7.5l4 3 7-7" />
    <path d="M16 3.5h4v4" />
  </Base>
);
export const IconCloud = (p: P) => (
  <Base {...p}>
    <path d="M7 18.5a4.5 4.5 0 01-.6-8.96A6 6 0 0118 8.5a4 4 0 01-.5 7.97V16.5H7v2z" />
    <path d="M7 18.5h10.5" />
  </Base>
);
export const IconArrow = (p: P) => (
  <Base {...p}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </Base>
);
export const IconArrowUpRight = (p: P) => (
  <Base {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </Base>
);
export const IconTelegram = (p: P) => (
  <Base {...p}>
    <path d="M21.5 3.5L2.5 11l6.5 2.5M21.5 3.5L18 20.5l-9-7M21.5 3.5L9 13.5v5.5l3-3.5" />
  </Base>
);
export const IconWhatsApp = (p: P) => (
  <Base {...p}>
    <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4.1-1.06L3.5 20.5z" />
    <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 1c-1-.5-2.5-2-3-3l1-1-1-2L9 8.5z" />
  </Base>
);
export const IconMail = (p: P) => (
  <Base {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
    <path d="M3 6l9 7 9-7" />
  </Base>
);
export const IconCheck = (p: P) => (
  <Base {...p}>
    <path d="M4.5 12.5l5 5 10-11" />
  </Base>
);
export const IconSpark = (p: P) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
  </Base>
);
export const IconDatabase = (p: P) => (
  <Base {...p}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" />
    <path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" />
  </Base>
);

export const serviceIcons: Record<ServiceIcon, (p: P) => React.JSX.Element> = {
  monitor: IconMonitor,
  bot: IconBot,
  chart: IconChart,
  cloud: IconCloud,
};
