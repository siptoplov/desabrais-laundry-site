"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vH;

  float wave(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.x * 0.42 + t * 0.32 + sin(p.y * 0.35 + t * 0.18) * 1.8) * 0.62;
    h += sin(p.x * 0.9 - p.y * 0.55 + t * 0.45) * 0.3;
    h += sin(p.x * 1.7 + sin(p.y * 0.45 + t * 0.25) * 2.2 + t * 0.4) * 0.16;
    h += sin(p.y * 1.3 + p.x * 0.25 - t * 0.38) * 0.12;
    return h;
  }

  void main() {
    vec3 p = position;
    float t = uTime + uScroll * 4.0;
    float e = 0.02;
    float h = wave(p.xy, t);
    float hx = (wave(p.xy + vec2(e, 0.0), t) - h) / e;
    float hy = (wave(p.xy + vec2(0.0, e), t) - h) / e;
    p.z += h;
    vNormal = normalize(mat3(modelMatrix) * normalize(vec3(-hx, -hy, 1.0)));
    vPos = (modelMatrix * vec4(p, 1.0)).xyz;
    vH = h;
    gl_Position = projectionMatrix * viewMatrix * vec4(vPos, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uLight;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vH;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(cameraPosition - vPos);
    vec3 l = normalize(uLight);
    vec3 h = normalize(l + v);
    float ndh = max(dot(n, h), 0.0);
    // silk: razor highlight on the crests, faint broad sheen, near-black body
    vec3 h2 = normalize(normalize(vec3(0.85, 0.45, 0.1)) + v);
    float spec = pow(ndh, 220.0) * 2.2 + pow(ndh, 40.0) * 0.08
               + pow(max(dot(n, h2), 0.0), 180.0) * 1.4 + pow(max(dot(n, h2), 0.0), 30.0) * 0.05;
    float rim = pow(1.0 - max(dot(n, v), 0.0), 5.0) * 0.015;
    vec3 col = vec3(0.0025 + max(vH, 0.0) * 0.003) + vec3(0.91, 0.94, 1.0) * (spec + rim);
    float fade = smoothstep(15.0, 5.0, abs(vPos.x)) * smoothstep(10.0, 3.0, abs(vPos.y + 1.0));
    gl_FragColor = vec4(col * fade, 1.0);
    #include <colorspace_fragment>
  }
`;

function Silk({ progress }: { progress: React.RefObject<number> }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uScroll: { value: 0 }, uLight: { value: new THREE.Vector3(-0.12, 0.6, 0.8) } }),
    [],
  );
  useFrame((state, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime!.value = state.clock.elapsedTime;
    const u = mat.current.uniforms.uScroll!;
    u.value = THREE.MathUtils.damp(u.value, progress.current ?? 0, 4, dt);
  });
  return (
    <mesh rotation={[-1.05, 0, 0.18]} position={[0, -0.5, 0]} scale={[Math.max(1, viewport.width / 10), 1, 1]}>
      <planeGeometry args={[30, 18, 260, 160]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
    </mesh>
  );
}

export default function WavesCanvas({ active, progress, dpr }: { active: boolean; progress: React.RefObject<number>; dpr: number }) {
  return (
    <Canvas
      dpr={dpr}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 35, position: [0, 0, 9] }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      onCreated={({ scene }) => {
        scene.background = new THREE.Color("#050506");
      }}
      aria-hidden
    >
      <Silk progress={progress} />
    </Canvas>
  );
}
