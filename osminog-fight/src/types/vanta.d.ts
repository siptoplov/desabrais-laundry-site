declare module 'vanta/dist/vanta.fog.min' {
  const FOG: (opts: Record<string, unknown>) => { destroy: () => void; resize: () => void };
  export default FOG;
}
