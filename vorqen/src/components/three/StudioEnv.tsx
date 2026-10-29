"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";

/**
 * A dark studio built from strip lights instead of an HDRI file —
 * zero network cost, crisp chrome reflections. On high tier one strip
 * travels across the set every few seconds, producing the light sweep
 * over the metal.
 */
export function StudioEnv({ animated }: { animated: boolean }) {
  const sweep = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!sweep.current) return;
    const t = state.clock.elapsedTime;
    const cycle = (t % 7) / 7; // one pass every 7s
    const k = Math.min(1, cycle / 0.35);
    sweep.current.position.x = -12 + k * 24;
    sweep.current.visible = cycle < 0.35;
  });

  return (
    <Environment resolution={256} frames={animated ? Infinity : 1} background={false}>
      <color attach="background" args={["#0e0f12"]} />
      {/* horizon band — gives the chrome its dark-silver body between highlights */}
      <Lightformer form="ring" intensity={0.5} color="#6b7078" position={[0, 0, -10]} scale={14} />
      {/* key strips */}
      <Lightformer form="rect" intensity={4} color="#e8f0ff" position={[0, 6, -2]} rotation-x={Math.PI / 2} scale={[14, 0.6, 1]} />
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[-6, 1, 3]} rotation-y={Math.PI / 2} scale={[0.35, 10, 1]} />
      <Lightformer form="rect" intensity={2.4} color="#e8f0ff" position={[6, -1, 3]} rotation-y={-Math.PI / 2} scale={[0.25, 10, 1]} />
      <Lightformer form="rect" intensity={1.2} color="#c9cdd3" position={[0, -5, 2]} rotation-x={-Math.PI / 2} scale={[10, 0.4, 1]} />
      {/* front softboxes: graded top-bright → bottom-dark, the classic chrome read */}
      <Lightformer form="rect" intensity={3.2} color="#ffffff" position={[0, 3.5, 8]} rotation-x={0.35} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={1.3} color="#c9cdd3" position={[0, 0.5, 9]} scale={[12, 1.5, 1]} />
      <Lightformer form="rect" intensity={0.12} color="#ffffff" position={[0, -3, 9]} rotation-x={-0.3} scale={[12, 3, 1]} />
      <Lightformer form="rect" intensity={3.5} color="#e8f0ff" position={[-4, 0, 7]} rotation-y={0.5} scale={[0.4, 12, 1]} />
      <Lightformer form="rect" intensity={3} color="#ffffff" position={[4.5, 0, 7]} rotation-y={-0.5} scale={[0.3, 12, 1]} />
      {/* travelling sweep */}
      <Lightformer ref={sweep} form="rect" intensity={animated ? 9 : 0} color="#ffffff" position={[-12, 0, 6]} rotation-z={0.5} scale={[0.5, 16, 1]} />
    </Environment>
  );
}
