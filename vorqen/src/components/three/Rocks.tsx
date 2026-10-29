"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { fbm3 } from "./noise";

/**
 * Dark volcanic slabs in opposing corners. Faceted geometry + a fresnel rim
 * term injected into MeshStandardMaterial gives the razor-thin cold edge light
 * from the reference, which Bloom then lifts into a glow.
 */
function makeRockGeometry(seed: number, detail: number) {
  const ico = new THREE.IcosahedronGeometry(1, detail);
  ico.deleteAttribute("normal");
  ico.deleteAttribute("uv");
  const g = mergeVertices(ico);
  ico.dispose();
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = fbm3(v.x * 1.4 + seed, v.y * 1.4, v.z * 1.4 - seed, 5);
    // stratified, slab-like: strong squash on z, sharp ridges
    const ridge = 1 - Math.abs(fbm3(v.x * 3.1 - seed, v.y * 3.1 + seed, v.z * 3.1, 3));
    v.multiplyScalar(1 + n * 0.42 + ridge * 0.08);
    v.set(v.x * 2.6, v.y * 1.0, v.z * 0.9);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  // smooth normals drive the razor rim; faceted normals drive the surface
  g.computeVertexNormals();
  const flat = g.toNonIndexed();
  g.dispose();
  flat.setAttribute("aSmoothNormal", (flat.attributes.normal as THREE.BufferAttribute).clone());
  flat.computeVertexNormals();
  // subtle grit: darken random facets
  const count = flat.attributes.position!.count;
  const col = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 3) {
    const k = 0.55 + Math.abs(Math.sin(i * 12.9898 + seed) * 43758.5453 % 1) * 0.45;
    for (let j = 0; j < 3; j++) col.set([k, k, k], (i + j) * 3);
  }
  flat.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return flat;
}

function makeRockMaterial() {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#121317"),
    roughness: 0.9,
    metalness: 0.15,
    flatShading: true,
    vertexColors: true,
    envMapIntensity: 0.12,
  });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: new THREE.Color("#e8f0ff") };
    shader.uniforms.uRimDir = { value: new THREE.Vector3(0, 0, 1) };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
         attribute vec3 aSmoothNormal;
         varying vec3 vSmoothN;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vSmoothN = normalize(normalMatrix * aSmoothNormal);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         uniform vec3 uRimColor;
         uniform vec3 uRimDir;
         varying vec3 vSmoothN;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
         {
           vec3 vdir = normalize(vViewPosition);
           vec3 sn = normalize(vSmoothN);
           float fres = pow(1.0 - clamp(abs(dot(sn, vdir)), 0.0, 1.0), 9.0);
           float facing = smoothstep(0.2, 0.85, dot(sn, normalize(uRimDir)));
           // faint facet catch-light so the stone texture reads
           float catchL = pow(max(dot(normal, normalize(uRimDir)), 0.0), 6.0) * 0.08;
           totalEmissiveRadiance += uRimColor * (fres * facing * 5.0 + catchL);
         }`,
      );
    m.userData.shader = shader;
  };
  return m;
}

export function Rocks({ tier }: { tier: "high" | "low" }) {
  const { viewport } = useThree();
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  const glint = useRef<THREE.Mesh>(null);
  const detail = tier === "high" ? 5 : 4;

  const geoA = useMemo(() => makeRockGeometry(3.7, detail), [detail]);
  const geoB = useMemo(() => makeRockGeometry(11.2, detail), [detail]);
  const matA = useMemo(makeRockMaterial, []);
  const matB = useMemo(makeRockMaterial, []);

  const glintMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uOpacity: { value: 1 } },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uOpacity; varying vec2 vUv;
          void main(){
            vec2 p = vUv - 0.5;
            float d = length(p);
            float core = exp(-d * 38.0) * 1.6 + exp(-d * 9.0) * 0.25;
            float sx = exp(-abs(p.y) * 260.0) * exp(-abs(p.x) * 5.0);
            float sy = exp(-abs(p.x) * 320.0) * exp(-abs(p.y) * 9.0) * 0.5;
            float a = (core + sx + sy) * uOpacity;
            gl_FragColor = vec4(vec3(0.91, 0.94, 1.0) * a, a);
          }`,
      }),
    [],
  );

  useEffect(
    () => () => {
      geoA.dispose();
      geoB.dispose();
      matA.dispose();
      matB.dispose();
      glintMat.dispose();
    },
    [geoA, geoB, matA, matB, glintMat],
  );

  const w = viewport.width;
  const h = viewport.height;
  const portrait = w < h;
  const s = Math.max(1.1, Math.min(w, h) * 0.32);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = scrollStore.hero;
    // rim direction in view space points toward the frame centre for each slab
    const sa = matA.userData.shader as { uniforms: Record<string, { value: THREE.Vector3 }> } | undefined;
    const sb = matB.userData.shader as { uniforms: Record<string, { value: THREE.Vector3 }> } | undefined;
    sa?.uniforms.uRimDir!.value.set(-0.75, -0.55, 0.35).normalize();
    sb?.uniforms.uRimDir!.value.set(0.75, 0.6, 0.35).normalize();

    if (a.current) {
      a.current.position.x = THREE.MathUtils.damp(a.current.position.x, w * 0.5 + (portrait ? 0.7 : 0.75) + p * 2.2 - scrollStore.pointer.x * 0.12, 4, dt);
      a.current.position.y = THREE.MathUtils.damp(a.current.position.y, h * 0.5 + 0.55 + p * 1.6 - scrollStore.pointer.y * 0.08, 4, dt);
      a.current.rotation.z = -0.62 + Math.sin(t * 0.08) * 0.015;
    }
    if (b.current) {
      b.current.position.x = THREE.MathUtils.damp(b.current.position.x, -w * 0.5 - (portrait ? 0.7 : 0.8) - p * 2.2 - scrollStore.pointer.x * 0.18, 4, dt);
      b.current.position.y = THREE.MathUtils.damp(b.current.position.y, -h * 0.5 - 0.6 - p * 1.6 - scrollStore.pointer.y * 0.1, 4, dt);
      b.current.rotation.z = -0.55 + Math.sin(t * 0.07 + 1) * 0.015;
    }
    if (glint.current && a.current) {
      const pulse = 0.75 + Math.sin(t * 1.3) * 0.15 + Math.sin(t * 3.1) * 0.06;
      glint.current.scale.setScalar(pulse);
      glint.current.position.set(a.current.position.x - s * 1.55, a.current.position.y - s * 0.95, 2.5);
      glintMat.uniforms.uOpacity!.value = 1 - p;
    }
  });

  return (
    <group>
      <mesh ref={a} geometry={geoA} material={matA} scale={[s, s, s]} position={[w * 0.6, h * 0.6, -0.8]} rotation={[0.25, 0.35, -0.62]} />
      <mesh ref={b} geometry={geoB} material={matB} scale={[s * 1.1, s * 1.05, s]} position={[-w * 0.6, -h * 0.6, -0.4]} rotation={[-0.2, -0.3, -0.55]} />
      <mesh ref={glint} material={glintMat} renderOrder={10}>
        <planeGeometry args={[1.6, 1.6]} />
      </mesh>
    </group>
  );
}
