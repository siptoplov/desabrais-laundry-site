'use client';

/**
 * 3D-пояс чемпиона (концепт): кожаный ремень, октагональная золотая пластина
 * с эмалью и знаком лиги, боковые пластины. Вращается сам и от перетаскивания.
 * Металл отражает процедурное окружение (RoomEnvironment) — без загрузки HDR.
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { logoCollar, logoHead, logoTentacles, logoFrame } from '@/components/brand/logoPaths';

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
}

/** Эмблема для центральной пластины: золотой знак на чёрной эмали */
function useEmblemTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 1024;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(512, 440, 60, 512, 512, 560);
    grd.addColorStop(0, '#13233a');
    grd.addColorStop(1, '#05070a');
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 1024);
    g.save();
    g.translate(112, 96);
    g.scale(2, 2);
    g.fillStyle = '#e9c46a';
    g.strokeStyle = '#e9c46a';
    g.lineWidth = 20;
    logoFrame.forEach((d) => g.stroke(new Path2D(d)));
    [...logoTentacles, logoCollar, logoHead].forEach((d) => g.fill(new Path2D(d)));
    g.fillStyle = '#ff2b3a';
    [
      [174, 162, 32],
      [226, 162, -32],
    ].forEach(([x, y, r]) => {
      g.save();
      g.translate(x, y);
      g.rotate((r * Math.PI) / 180);
      g.beginPath();
      g.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });
    g.restore();
    const fam = getComputedStyle(document.documentElement).getPropertyValue('--font-display') || 'sans-serif';
    g.font = `900 italic 64px ${fam}`;
    g.fillStyle = '#e9c46a';
    g.textAlign = 'center';
    g.fillText('ЧЕМПИОН', 512, 940);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, []);
}

function Belt({ drag }: { drag: React.RefObject<{ vx: number; rot: number; active: boolean }> }) {
  const group = useRef<THREE.Group>(null);
  const emblem = useEmblemTexture();
  const gold = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d9b25a', metalness: 1, roughness: 0.22 }), []);
  const goldDark = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a8812f', metalness: 1, roughness: 0.35 }), []);
  const leather = useMemo(() => new THREE.MeshStandardMaterial({ color: '#0c0f14', metalness: 0.1, roughness: 0.55, side: THREE.DoubleSide }), []);
  const red = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ff2b3a', emissive: '#ff2b3a', emissiveIntensity: 0.4, roughness: 0.4 }), []);
  const enamel = useMemo(() => new THREE.MeshStandardMaterial({ map: emblem, metalness: 0.3, roughness: 0.25 }), [emblem]);

  useFrame(({ clock }, dt) => {
    const d = drag.current!;
    if (!d.active) d.vx += (0.35 - d.vx) * 0.02;
    d.rot += d.vx * dt;
    const g = group.current!;
    g.rotation.y = d.rot;
    g.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.06;
    g.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.05 + 0.08;
  });

  return (
    <group ref={group}>
      {/* ремень: открытый цилиндр-сегмент */}
      <mesh material={leather}>
        <cylinderGeometry args={[2.1, 2.1, 0.95, 96, 1, true, -2.3, 4.6]} />
      </mesh>
      {/* красная строчка */}
      {[-0.42, 0.42].map((y) => (
        <mesh key={y} material={red} position={[0, y, 0]}>
          <cylinderGeometry args={[2.115, 2.115, 0.02, 96, 1, true, -2.3, 4.6]} />
        </mesh>
      ))}
      {/* центральная пластина */}
      <group position={[0, 0, 2.18]}>
        <mesh material={goldDark} rotation={[Math.PI / 2, Math.PI / 8, 0]}>
          <cylinderGeometry args={[1.25, 1.25, 0.14, 8]} />
        </mesh>
        <mesh material={gold} position={[0, 0, 0.08]} rotation={[Math.PI / 2, Math.PI / 8, 0]}>
          <cylinderGeometry args={[1.12, 1.18, 0.06, 8]} />
        </mesh>
        <mesh material={enamel} position={[0, 0, 0.115]}>
          <circleGeometry args={[0.92, 8, Math.PI / 8]} />
        </mesh>
        {/* камни по краю */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
          return (
            <mesh key={i} material={red} position={[Math.cos(a) * 1.02, Math.sin(a) * 1.02, 0.13]}>
              <sphereGeometry args={[0.045, 12, 8]} />
            </mesh>
          );
        })}
      </group>
      {/* боковые пластины */}
      {[-1, 1].map((s) => {
        const a = s * 0.95;
        return (
          <group key={s} position={[Math.sin(a) * 2.16, 0, Math.cos(a) * 2.16]} rotation={[0, a, 0]}>
            <mesh material={gold} rotation={[Math.PI / 2, Math.PI / 8, 0]}>
              <cylinderGeometry args={[0.46, 0.46, 0.08, 8]} />
            </mesh>
            <mesh material={leather} position={[0, 0, 0.045]}>
              <circleGeometry args={[0.32, 8, Math.PI / 8]} />
            </mesh>
            <mesh material={gold} position={[0, 0, 0.05]}>
              <torusGeometry args={[0.15, 0.035, 10, 32]} />
            </mesh>
            <mesh material={gold} position={[0, 0.0, 0.05]} scale={[1, 1, 1]}>
              <torusGeometry args={[0.08, 0.03, 8, 24]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function BeltScene({ className = '' }: { className?: string }) {
  const drag = useRef({ vx: 0.35, rot: -0.5, active: false });
  const last = useRef(0);
  return (
    <div
      className={`${className} cursor-grab active:cursor-grabbing`}
      data-cursor="drag"
      data-cursor-label="Крути"
      onPointerDown={(e) => {
        drag.current.active = true;
        last.current = e.clientX;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current.active) return;
        const dx = e.clientX - last.current;
        last.current = e.clientX;
        drag.current.rot += dx * 0.01;
        drag.current.vx = dx * 0.6;
      }}
      onPointerUp={() => (drag.current.active = false)}
      onPointerCancel={() => (drag.current.active = false)}
    >
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.5, 10.5], fov: 30 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <Env />
        <ambientLight intensity={0.2} />
        <directionalLight position={[-3, 4, 5]} intensity={2.2} color="#fff3e0" />
        <pointLight position={[3, -1, 3]} intensity={18} color="#00e5ff" />
        <pointLight position={[-4, 1, -2]} intensity={14} color="#ff2b3a" />
        <Belt drag={drag} />
      </Canvas>
    </div>
  );
}
