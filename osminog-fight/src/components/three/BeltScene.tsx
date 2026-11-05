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
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
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
    grd.addColorStop(0, '#1D1D22');
    grd.addColorStop(1, '#060607');
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

/** Кожа: зерно + красная строчка вдоль обоих краёв */
function useLeatherTextures() {
  return useMemo(() => {
    const W = 2048;
    const H = 256;
    const mk = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      return c;
    };
    const col = mk();
    const bump = mk();
    const g = col.getContext('2d')!;
    const gb = bump.getContext('2d')!;
    g.fillStyle = '#0d0f14';
    g.fillRect(0, 0, W, H);
    gb.fillStyle = '#808080';
    gb.fillRect(0, 0, W, H);
    for (let i = 0; i < 26000; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const r = 1 + Math.random() * 2.2;
      const v = Math.random();
      g.fillStyle = `rgba(${v > 0.5 ? 40 : 0},${v > 0.5 ? 44 : 0},${v > 0.5 ? 52 : 0},${0.25 + Math.random() * 0.35})`;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      gb.fillStyle = `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},0.35)`;
      gb.beginPath();
      gb.arc(x, y, r, 0, Math.PI * 2);
      gb.fill();
    }
    // строчка
    g.strokeStyle = '#ff2b3a';
    g.lineWidth = 5;
    g.setLineDash([22, 14]);
    [26, H - 26].forEach((y) => {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    });
    gb.strokeStyle = '#000';
    gb.lineWidth = 7;
    gb.setLineDash([22, 14]);
    [26, H - 26].forEach((y) => {
      gb.beginPath();
      gb.moveTo(0, y);
      gb.lineTo(W, y);
      gb.stroke();
    });
    // кант по краю
    g.setLineDash([]);
    g.fillStyle = '#050608';
    g.fillRect(0, 0, W, 10);
    g.fillRect(0, H - 10, W, 10);
    const map = new THREE.CanvasTexture(col);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const bumpMap = new THREE.CanvasTexture(bump);
    bumpMap.anisotropy = 8;
    return { map, bumpMap };
  }, []);
}

const octShape = (r: number, rot = Math.PI / 8) => {
  const s = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + rot;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
};

/** Восьмиугольная рамка с фаской (внешний радиус R, внутренний r) */
function useFrameGeometry(R: number, r: number, depth: number, bevel: number) {
  return useMemo(() => {
    const shape = octShape(R);
    shape.holes.push(octShape(r) as unknown as THREE.Path);
    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 1 });
  }, [R, r, depth, bevel]);
}

function useSolidOctGeometry(R: number, depth: number, bevel: number) {
  return useMemo(() => new THREE.ExtrudeGeometry(octShape(R), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 1 }), [R, depth, bevel]);
}

/** Осьминог лиги в рельефе: те же контуры, что на логотипе, выдавлены из чёрной эмали */
function useOctopusRelief() {
  return useMemo(() => {
    const k = 1.88 / 1024; // 1 px эмблемной текстуры в единицах сцены
    const loader = new SVGLoader();
    const geoms: THREE.BufferGeometry[] = [];
    [...logoTentacles, logoCollar, logoHead].forEach((d) => {
      const svg = loader.parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="${d}"/></svg>`);
      svg.paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path);
        const g = new THREE.ExtrudeGeometry(shapes, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.004, bevelSegments: 2, curveSegments: 10 });
        // координаты логотипа → плоскость пластины (как в канвасе: сдвиг 112/96, масштаб 2)
        g.applyMatrix4(new THREE.Matrix4().set(2 * k, 0, 0, -400 * k, 0, -2 * k, 0, 416 * k, 0, 0, 1, 0, 0, 0, 0, 1));
        geoms.push(g);
      });
    });
    return geoms;
  }, []);
}

const A = 2.7; // полуось ремня по ширине
const B = 1.45; // и по глубине: пояс вытянут, как настоящий, а не ровное кольцо

function Belt({ drag }: { drag: React.RefObject<{ vx: number; rot: number; active: boolean }> }) {
  const group = useRef<THREE.Group>(null);
  const emblem = useEmblemTexture();
  const relief = useOctopusRelief();
  const { map, bumpMap } = useLeatherTextures();
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ecc561', metalness: 1, roughness: 0.18, clearcoat: 0.5, clearcoatRoughness: 0.2 }), []);
  const goldDark = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#a8812f', metalness: 1, roughness: 0.32 }), []);
  const leather = useMemo(() => new THREE.MeshStandardMaterial({ map, bumpMap, bumpScale: 1.6, color: '#ffffff', metalness: 0.05, roughness: 0.62, side: THREE.DoubleSide }), [map, bumpMap]);
  const gem = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#9b0a14', emissive: '#4a0007', emissiveIntensity: 0.6, metalness: 0.05, roughness: 0.12, clearcoat: 0.6, flatShading: true }), []);
  const reliefMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f2c14e', emissive: '#7a5200', emissiveIntensity: 0.55, metalness: 0.85, roughness: 0.34, side: THREE.DoubleSide }), []);
  const enamel = useMemo(() => new THREE.MeshStandardMaterial({ map: emblem, metalness: 0.35, roughness: 0.28 }), [emblem]);
  const plateFrame = useFrameGeometry(1.32, 1.0, 0.1, 0.05);
  const plateInner = useFrameGeometry(1.0, 0.93, 0.05, 0.02);
  const sideSolid = useSolidOctGeometry(0.5, 0.06, 0.03);
  const sideRing = useFrameGeometry(0.36, 0.3, 0.04, 0.015);
  const plateBase = useSolidOctGeometry(1.32, 0.04, 0.03);

  useFrame(({ clock }, dt) => {
    const d = drag.current!;
    if (!d.active) d.vx += (0.35 - d.vx) * 0.02;
    d.rot += d.vx * dt;
    const g = group.current!;
    g.rotation.y = d.rot;
    g.position.y = Math.sin(clock.elapsedTime * 0.9) * 0.05;
    g.rotation.x = Math.sin(clock.elapsedTime * 0.5) * 0.04 + 0.07;
  });

  return (
    <group ref={group} scale={0.8}>
      {/* ремень: овальное кольцо */}
      <group scale={[A / 2.1, 1, B / 2.1]}>
        <mesh material={leather}>
          <cylinderGeometry args={[2.1, 2.1, 1.2, 192, 1, true, 0, Math.PI * 2]} />
        </mesh>
        {[-0.6, 0.6].map((y) => (
          <group key={y} position={[0, y, 0]}>
            <mesh material={goldDark} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[2.1, 0.018, 8, 192]} />
            </mesh>
          </group>
        ))}
      </group>
      {/* отверстия для застёжки на задней части */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = Math.PI + (i - 2) * 0.1;
        const psi = Math.atan2(Math.sin(t) / A, Math.cos(t) / B);
        return (
          <mesh key={i} material={goldDark} position={[Math.sin(t) * A, 0, Math.cos(t) * B]} rotation={[0, psi, 0]}>
            <torusGeometry args={[0.05, 0.015, 8, 16]} />
          </mesh>
        );
      })}
      {/* центральная пластина */}
      <group position={[0, 0, B + 0.04]}>
        {/* кожаная подкладка с обратной стороны */}
        <mesh material={leather} position={[0, 0, -0.07]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[1.34, 8, Math.PI / 8]} />
        </mesh>
        {/* подложка пластины */}
        <mesh material={goldDark} position={[0, 0, -0.02]}>
          <primitive object={plateBase} attach="geometry" />
        </mesh>
        <mesh material={gold} position={[0, 0, 0.02]} geometry={plateFrame} />
        <mesh material={goldDark} position={[0, 0, 0.1]} geometry={plateInner} />
        <mesh material={enamel} position={[0, 0, 0.075]}>
          <circleGeometry args={[0.94, 8, Math.PI / 8]} />
        </mesh>
        {/* осьминог в рельефе поверх эмали */}
        <group position={[0, 0, 0.078]}>
          {relief.map((g, i) => (
            <mesh key={i} material={reliefMat} geometry={g} />
          ))}
        </group>
        {/* шесть рубинов по рамке, как на образце: верх, низ и четыре по диагоналям */}
        {[90, 30, 150, 210, 330, 270].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <group key={deg} position={[Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.18]}>
              <mesh material={goldDark} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.1, 0.115, 0.05, 24]} />
              </mesh>
              <mesh material={gem} position={[0, 0, 0.04]} scale={[1, 1, 0.7]}>
                <icosahedronGeometry args={[0.085, 1]} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* боковые пластины */}
      {[-1, 1].map((sgn) => {
        const t = sgn * 1.0;
        const psi = Math.atan2(Math.sin(t) / A, Math.cos(t) / B);
        return (
          <group key={sgn} position={[Math.sin(sgn) * A, 0, Math.cos(sgn) * B + 0.02]} rotation={[0, psi, 0]}>
            <mesh material={gold} geometry={sideSolid} position={[0, 0, 0.0]} />
            <mesh material={goldDark} geometry={sideRing} position={[0, 0, 0.09]} />
            {Array.from({ length: 4 }, (_, i) => {
              const aa = (i / 4) * Math.PI * 2 + Math.PI / 4;
              return (
                <mesh key={i} material={gold} position={[Math.cos(aa) * 0.4, Math.sin(aa) * 0.4, 0.1]}>
                  <sphereGeometry args={[0.035, 14, 10]} />
                </mesh>
              );
            })}
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
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.5, 12], fov: 28 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <Env />
        <ambientLight intensity={0.2} />
        <directionalLight position={[-3, 4, 6]} intensity={3} color="#fff0d0" />
        <directionalLight position={[4, 1, 6]} intensity={1.6} color="#ffd89a" />
        <pointLight position={[3, -1, 3]} intensity={18} color="#ECEEF1" />
        <pointLight position={[-4, 1, -2]} intensity={14} color="#ff2b3a" />
        <Belt drag={drag} />
      </Canvas>
    </div>
  );
}
