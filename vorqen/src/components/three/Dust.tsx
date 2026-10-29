"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { rng } from "./noise";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    float t = uTime * 0.06 + aSeed * 40.0;
    p.y += mod(t * (0.4 + aSeed), 12.0) - 6.0;
    p.x += sin(t * 2.1 + aSeed * 9.0) * 0.25;
    p.z += cos(t * 1.7 + aSeed * 5.0) * 0.25;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (14.0 / -mv.z);
    float twinkle = 0.55 + 0.45 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 30.0);
    float depth = smoothstep(-16.0, -3.0, mv.z) * (1.0 - smoothstep(-2.0, 0.0, mv.z));
    vAlpha = twinkle * depth;
  }
`;

const fragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.91, 0.94, 1.0), core * core * vAlpha * 0.75);
  }
`;

export function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.ShaderMaterial>(null);
  const dpr = useThree((s) => s.viewport.dpr);

  const geo = useMemo(() => {
    const r = rng(7);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 16;
      pos[i * 3 + 1] = (r() - 0.5) * 12;
      pos[i * 3 + 2] = -r() * 12 + 3;
      seed[i] = r();
      size[i] = r() < 0.06 ? 3 + r() * 3 : 0.6 + r() * 1.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: 1 } }), []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.uniforms.uTime!.value = state.clock.elapsedTime;
    ref.current.uniforms.uPixelRatio!.value = dpr;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={ref}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
