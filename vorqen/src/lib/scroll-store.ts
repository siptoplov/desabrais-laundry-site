/**
 * Tiny mutable store shared between DOM scroll timelines and the WebGL
 * render loop. Read inside useFrame — never triggers React renders.
 */
export const scrollStore = {
  /** 0 → 1 while the hero scrolls out of view */
  hero: 0,
  /** preloader finished and the hero intro may play */
  introDone: false,
  /** pointer in NDC (-1..1) */
  pointer: { x: 0, y: 0 },
};

type Listener = () => void;
const introListeners = new Set<Listener>();

export function onIntroDone(fn: Listener): () => void {
  if (scrollStore.introDone) {
    fn();
    return () => {};
  }
  introListeners.add(fn);
  return () => introListeners.delete(fn);
}

export function markIntroDone() {
  if (scrollStore.introDone) return;
  scrollStore.introDone = true;
  introListeners.forEach((fn) => fn());
  introListeners.clear();
}
