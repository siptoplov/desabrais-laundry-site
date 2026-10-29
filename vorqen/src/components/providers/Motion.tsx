"use client";

import { domAnimation, LazyMotion } from "framer-motion";

/** Ships only the DOM animation feature set (~half of framer-motion). */
export function Motion({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
