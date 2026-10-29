"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "expo.out", duration: 1.2 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** Mirrors --ease-expo: cubic-bezier(0.16, 1, 0.3, 1) */
export const EASE = [0.16, 1, 0.3, 1] as const;

export { gsap, ScrollTrigger, SplitText };
