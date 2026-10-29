"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollStore, onIntroDone } from "@/lib/scroll-store";
import { SHARDS, buildShardGeometry, shardCentroid } from "./shards";

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

/**
 * The chrome V. Four crystal shards that fly in from depth on intro,
 * float + tilt toward the pointer, and burst apart as the hero scrolls away.
 */
export function Emblem({ reduced, tier }: { reduced: boolean; tier: "high" | "low" }) {
  const group = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const introStart = useRef<number | null>(null);
  const gyro = useRef({ x: 0, y: 0, active: false });
  const { viewport, size } = useThree();

  const shards = useMemo(
    () =>
      SHARDS.map((def, i) => {
        const geo = buildShardGeometry(def);
        const c = shardCentroid(def);
        geo.translate(-c.x, -c.y, 0);
        // intro: each shard starts far behind, offset and spun
        const from = new THREE.Vector3(def.burst[0] * 2.4, def.burst[1] * 2.4, -14 - i * 2);
        return { def, geo, centroid: c, from, delay: [0.08, 0.0, 0.22, 0.14][i] ?? 0 };
      }),
    [],
  );

  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#e4e8ee"),
        metalness: 1,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.35,
        flatShading: true,
        side: THREE.FrontSide,
      }),
    [],
  );

  useEffect(() => () => {
    shards.forEach((s) => s.geo.dispose());
    material.dispose();
  }, [shards, material]);

  useEffect(() => onIntroDone(() => (introStart.current = performance.now())), []);

  // Gyroscope tilt on devices that expose it without a permission prompt
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      gyro.current.active = true;
      gyro.current.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
      gyro.current.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
    };
    window.addEventListener("deviceorientation", onOrient, { passive: true });
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  // Responsive scale: emblem spans ~26% of width on desktop, ~62% on phones
  const portrait = size.width < size.height;
  const scale = Math.min(portrait ? viewport.width * 0.105 : viewport.width * 0.06, viewport.height * 0.11, 0.62);
  const yOffset = portrait ? viewport.height * 0.19 : viewport.height * 0.12;

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const hero = useRef(0);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    const tl = tilt.current;
    if (!g || !tl) return;

    hero.current = THREE.MathUtils.damp(hero.current, scrollStore.hero, 6, dt);
    const p = hero.current;
    const burst = smooth(0.05, 0.85, p);

    // intro progress per shard
    const since = introStart.current == null ? -1 : (performance.now() - introStart.current) / 1000;

    shards.forEach((s, i) => {
      const m = meshes.current[i];
      if (!m) return;
      const k = reduced ? (since >= 0 ? 1 : 0) : since < 0 ? 0 : easeOutExpo(Math.min(1, Math.max(0, (since - s.delay) / 1.7)));
      m.visible = since >= 0;
      // assembled position
      tmp.copy(s.centroid);
      // intro offset
      tmp.lerp(s.from, 1 - k);
      // scroll burst
      tmp.x += s.def.burst[0] * burst * 2.6;
      tmp.y += s.def.burst[1] * burst * 2.6;
      tmp.z += s.def.burst[2] * burst * 4.5;
      m.position.copy(tmp);
      const spinIntro = (1 - k) * 3.2;
      m.rotation.set(
        s.def.spin[0] * (spinIntro + burst * 2.2),
        s.def.spin[1] * (spinIntro + burst * 2.2),
        s.def.spin[2] * (spinIntro + burst * 1.6),
      );
    });

    // float
    const floatY = reduced ? 0 : Math.sin(t * 0.6) * 0.06;
    g.position.set(0, yOffset + floatY + p * 0.6, 0);
    g.scale.setScalar(scale * (1 + p * 0.25));

    // pointer / gyro parallax tilt (max ±15°)
    const max = THREE.MathUtils.degToRad(15);
    let tx = scrollStore.pointer.x;
    let ty = scrollStore.pointer.y;
    if (gyro.current.active) {
      tx = gyro.current.x;
      ty = gyro.current.y;
    }
    const auto = tier === "low" && !gyro.current.active && !reduced ? Math.sin(t * 0.35) * 0.6 : 0;
    const targetY = (tx + auto) * max + p * Math.PI * 0.6;
    const targetX = -ty * max * 0.8 + p * 0.35;
    tl.rotation.y = THREE.MathUtils.damp(tl.rotation.y, reduced ? 0 : targetY, 3.2, dt);
    tl.rotation.x = THREE.MathUtils.damp(tl.rotation.x, reduced ? 0 : targetX, 3.2, dt);
    tl.rotation.z = reduced ? 0 : Math.sin(t * 0.4) * 0.025;
  });

  return (
    <group ref={group}>
      <group ref={tilt}>
        {shards.map((s, i) => (
          <mesh
            key={s.def.id}
            ref={(el) => {
              meshes.current[i] = el;
            }}
            geometry={s.geo}
            material={material}
            visible={false}
          />
        ))}
      </group>
    </group>
  );
}
