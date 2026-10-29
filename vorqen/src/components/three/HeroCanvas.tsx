"use client";

import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Emblem } from "./Emblem";
import { Rocks } from "./Rocks";
import { Dust } from "./Dust";
import { StudioEnv } from "./StudioEnv";
import { scrollStore } from "@/lib/scroll-store";

export default function HeroCanvas({
  tier,
  reduced,
  active,
  onReady,
}: {
  tier: "high" | "low";
  reduced: boolean;
  /** false when the hero is off-screen — the render loop stops entirely */
  active: boolean;
  onReady?: () => void;
}) {
  const [dpr, setDpr] = useState<number>(tier === "high" ? 1.75 : 1.25);
  const high = tier === "high";
  const caOffset = useMemo(() => new THREE.Vector2(0.0007, 0.0005), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      scrollStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      scrollStore.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 32, position: [0, 0, 10], near: 0.1, far: 60 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color("#050506");
        scene.fog = new THREE.Fog("#050506", 9, 22);
        onReady?.();
      }}
      aria-hidden
    >
      <PerformanceMonitor
        bounds={() => [45, 58]}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.35))}
        onIncline={() => setDpr((d) => Math.min(high ? 1.75 : 1.25, d + 0.25))}
      />
      <Suspense fallback={null}>
        <StudioEnv animated={high && !reduced} />
        <Emblem reduced={reduced} tier={tier} />
      </Suspense>
      <Rocks tier={tier} />
      {!reduced && <Dust count={high ? 650 : 220} />}
      {high ? (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.62} luminanceSmoothing={0.18} radius={0.72} />
          <ChromaticAberration offset={caOffset} radialModulation modulationOffset={0.45} blendFunction={BlendFunction.NORMAL} />
          <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.035} />
          <Vignette offset={0.28} darkness={0.78} eskil={false} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.62} luminanceSmoothing={0.18} radius={0.65} />
          <Vignette offset={0.28} darkness={0.78} eskil={false} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
