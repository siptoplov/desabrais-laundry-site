'use client';

/**
 * 3D-сцена hero (React Three Fiber): процедурный осьминог поднимается из бездны.
 *  • 8 щупалец — трубки, которые каждый кадр перестраиваются по «позвоночнику»
 *    (накопление углов → спираль-завиток, бегущая волна, присоски на внутренней стороне);
 *  • щупальца тянутся к курсору, по клику ближайшее делает выпад;
 *  • глаза с горизонтальными зрачками следят за курсором;
 *  • частицы «морского снега» и лучи света сквозь воду.
 * Когда появится GLB-модель (например, из Higgsfield) — положите её в public/models/octopus.glb
 * и передайте modelUrl: процедурная модель заменится на загруженную (см. GlbOctopus).
 */
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GlbOctopus } from './GlbOctopus';

const N_T = 8;
const SEG = 48;
const RAD = 9;

/* ---------------- шейдеры ---------------- */
const skinVert = /* glsl */ `
  attribute float aT;
  attribute float aRing;
  uniform float uIsTent;
  varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vT; varying float vRing;
  void main(){
    vT = aT; vRing = aRing;
    vec4 wp = modelMatrix * vec4(position,1.0);
    vW = wp.xyz;
    vec4 mv = viewMatrix * wp;
    vV = mv.xyz;
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }`;

const skinFrag = /* glsl */ `
  uniform float uTime; uniform float uIsTent; uniform vec3 uRim; uniform vec3 uKey;
  varying vec3 vN; varying vec3 vV; varying vec3 vW; varying float vT; varying float vRing;
  void main(){
    vec3 n = normalize(vN); vec3 v = normalize(-vV);
    float fres = pow(1.0 - max(dot(n, v), 0.0), 2.2);
    vec3 base = mix(vec3(0.018,0.035,0.06), vec3(0.07,0.14,0.24), smoothstep(-0.8, 1.0, n.y));
    vec3 L1 = normalize(vec3(-0.3, 0.8, 0.6));
    vec3 Lr = normalize(vec3(-1.0, 0.15, -0.25));
    vec3 Lc = normalize(vec3(1.0, 0.25, -0.3));
    float d1 = max(dot(n, L1), 0.0);
    float dr = pow(max(dot(n, Lr), 0.0), 2.5);
    float dc = pow(max(dot(n, Lc), 0.0), 2.5);
    // мягкий холодный ключ + контровой свет: красный угол слева, синий справа
    vec3 col = base + vec3(0.42, 0.5, 0.6) * d1 * 0.16 + uKey * dr * 0.55 + uRim * (dc * 0.55 + fres * 0.55);
    float m = sin(vW.x*13.0 + vW.y*8.0) * sin(vW.z*11.0 - vW.y*6.0);
    col *= 0.88 + 0.12 * m;
    if (uIsTent > 0.5) {
      float under = smoothstep(0.45, 0.95, cos(vRing));
      float row = abs(fract(vT * 30.0) - 0.5);
      float sucker = under * smoothstep(0.34, 0.16, row) * step(0.05, vT) * (1.0 - vT * 0.8);
      col = mix(col, vec3(0.62, 0.78, 0.86), sucker * 0.5);
      float pulse = pow(max(0.0, sin(vT * 7.0 - uTime * 2.2)), 30.0);
      col += uRim * pulse * (0.25 + fres * 0.6);
    }
    float fog = smoothstep(7.0, 15.0, -vV.z);
    col = mix(col, vec3(0.015, 0.025, 0.04), fog);
    gl_FragColor = vec4(col, 1.0);
  }`;

function makeSkin(isTent: boolean, rim: THREE.Color, key: THREE.Color) {
  return new THREE.ShaderMaterial({
    vertexShader: skinVert,
    fragmentShader: skinFrag,
    uniforms: { uTime: { value: 0 }, uIsTent: { value: isTent ? 1 : 0 }, uRim: { value: rim }, uKey: { value: key } },
  });
}

/* ---------------- геометрия щупальца ---------------- */
function tentacleGeometry() {
  const g = new THREE.BufferGeometry();
  const verts = (SEG + 1) * (RAD + 1);
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts * 3), 3).setUsage(THREE.DynamicDrawUsage));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(verts * 3), 3).setUsage(THREE.DynamicDrawUsage));
  const aT = new Float32Array(verts);
  const aRing = new Float32Array(verts);
  for (let j = 0; j <= SEG; j++)
    for (let r = 0; r <= RAD; r++) {
      aT[j * (RAD + 1) + r] = j / SEG;
      aRing[j * (RAD + 1) + r] = (r / RAD) * Math.PI * 2;
    }
  g.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
  g.setAttribute('aRing', new THREE.BufferAttribute(aRing, 1));
  const idx: number[] = [];
  for (let j = 0; j < SEG; j++)
    for (let r = 0; r < RAD; r++) {
      const a = j * (RAD + 1) + r;
      const b = a + RAD + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, -1, 0), 5);
  return g;
}

/** p — курсор в мировых координатах, local — в координатах осьминога */
type Input = { p: THREE.Vector3; local: THREE.Vector3; active: boolean; strike: number; strikeIdx: number; scroll: number };

const _v = new THREE.Vector3();
const _T = new THREE.Vector3();
const _N = new THREE.Vector3();
const _B = new THREE.Vector3();
const _R = new THREE.Vector3();
const _S = new THREE.Vector3();
const _D = new THREE.Vector3(0, -1, 0);
const _P = new THREE.Vector3();
const _to = new THREE.Vector3();

function Tentacle({ k, input, mat }: { k: number; input: React.RefObject<Input>; mat: THREE.ShaderMaterial }) {
  const geo = useMemo(tentacleGeometry, []);
  const a = (k / N_T) * Math.PI * 2 + 0.2;
  const len = 2.5 * (0.86 + 0.14 * Math.sin(k * 1.7 + 0.4));
  const curlDir = k % 2 ? 1 : 1;

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const inp = input.current!;
    const pos = geo.attributes.position.array as Float32Array;
    const nor = geo.attributes.normal.array as Float32Array;
    _R.set(Math.cos(a), 0, Math.sin(a));
    _S.set(-Math.sin(a), 0, Math.cos(a));
    _P.set(Math.cos(a) * 0.36, -0.42, Math.sin(a) * 0.36);

    // насколько это щупальце «смотрит» на курсор
    _to.copy(inp.local).sub(_P);
    const facing = Math.max(0, _to.clone().setY(0).normalize().dot(_R));
    const reach = inp.active ? Math.pow(facing, 3) * 0.75 : 0;
    const strike = inp.strikeIdx === k ? inp.strike : 0;
    const seg = (len * (1 + strike * 0.35 + reach * 0.15)) / SEG;

    let theta = 0.5 + Math.sin(time * 0.5 + k) * 0.08;
    for (let j = 0; j <= SEG; j++) {
      const t = j / SEG;
      const wave = Math.sin(time * 1.4 - t * 5.5 + k * 0.9) * 0.05 * (0.3 + t);
      const curl = (3.6 + Math.sin(time * 0.35 + k * 2.1) * 0.6) * curlDir;
      const thetaJ = theta + curl * Math.pow(t, 2.3) * (1 - reach * 0.85 - strike * 0.9) + wave;
      const phi = Math.sin(time * 0.8 + k * 1.3 + t * 3) * 0.32 * t;
      // направление сегмента
      _T.copy(_R).multiplyScalar(Math.sin(thetaJ) * Math.cos(phi)).addScaledVector(_D, Math.cos(thetaJ) * Math.cos(phi)).addScaledVector(_S, Math.sin(phi));
      if (reach > 0 || strike > 0) {
        _to.copy(inp.local).sub(_P).normalize();
        _T.lerp(_to, Math.min(1, (reach + strike) * t * 1.4)).normalize();
      }
      // внутренняя сторона завитка → там присоски
      _N.copy(_R).multiplyScalar(Math.cos(thetaJ)).addScaledVector(_D, -Math.sin(thetaJ));
      _N.addScaledVector(_T, -_N.dot(_T)).normalize();
      _B.crossVectors(_T, _N);
      const rad = 0.17 * Math.pow(1 - t, 0.9) + 0.012;
      for (let r = 0; r <= RAD; r++) {
        const ang = (r / RAD) * Math.PI * 2;
        const c = Math.cos(ang);
        const s = Math.sin(ang);
        _v.copy(_N).multiplyScalar(c).addScaledVector(_B, s);
        const i3 = (j * (RAD + 1) + r) * 3;
        nor[i3] = _v.x;
        nor[i3 + 1] = _v.y;
        nor[i3 + 2] = _v.z;
        pos[i3] = _P.x + _v.x * rad;
        pos[i3 + 1] = _P.y + _v.y * rad;
        pos[i3 + 2] = _P.z + _v.z * rad;
      }
      _P.addScaledVector(_T, seg);
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.normal.needsUpdate = true;
  });

  return <mesh geometry={geo} material={mat} frustumCulled={false} />;
}

function Eye({ x, input }: { x: number; input: React.RefObject<Input> }) {
  const tilt = x < 0 ? -0.5 : 0.5;
  const group = useRef<THREE.Group>(null);
  const pupil = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const p = input.current!.local;
    if (group.current) {
      const tx = THREE.MathUtils.clamp((p.x - x) * 0.18, -0.45, 0.45);
      const ty = THREE.MathUtils.clamp((p.y - 0.1) * 0.18, -0.35, 0.35);
      group.current.rotation.y += (tx - group.current.rotation.y) * 0.08;
      group.current.rotation.x += (-ty - group.current.rotation.x) * 0.08;
    }
    // моргание
    if (pupil.current) {
      const blink = Math.sin(clock.elapsedTime * 0.7 + x) > 0.995 ? 0.1 : 1;
      pupil.current.scale.y += (blink - pupil.current.scale.y) * 0.4;
    }
  });
  return (
    <group position={[x, 0.12, 0.6]}>
      <group ref={group}>
        <mesh rotation={[0, 0, tilt]} scale={[1.5, 0.62, 0.8]}>
          <sphereGeometry args={[0.07, 24, 16]} />
          <meshBasicMaterial color="#ff2b3a" />
        </mesh>
        <mesh ref={pupil} position={[0, 0, 0.05]} rotation={[0, 0, tilt]}>
          <boxGeometry args={[0.1, 0.012, 0.02]} />
          <meshBasicMaterial color="#05070a" />
        </mesh>
      </group>
      <sprite scale={[0.42, 0.42, 1]}>
        <spriteMaterial map={glowTexture()} color="#ff2b3a" transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

let _glow: THREE.Texture | null = null;
function glowTexture() {
  if (_glow) return _glow;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

function Mantle({ mat }: { mat: THREE.ShaderMaterial }) {
  const geo = useMemo(() => {
    const prof = [
      [0.0, -0.52],
      [0.34, -0.48],
      [0.5, -0.3],
      [0.56, 0.0],
      [0.64, 0.38],
      [0.72, 0.8],
      [0.7, 1.18],
      [0.56, 1.52],
      [0.32, 1.76],
      [0.0, 1.84],
    ]
      .reverse() // сверху вниз — так грани смотрят наружу
      .map(([x, y]) => new THREE.Vector2(x, y));
    const curve = new THREE.SplineCurve(prof);
    const g = new THREE.LatheGeometry(curve.getPoints(40), 48);
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={mat} rotation={[-0.38, 0, 0]} />;
}

function Octopus({ input }: { input: React.RefObject<Input> }) {
  const group = useRef<THREE.Group>(null);
  const rim = useMemo(() => new THREE.Color('#00e5ff'), []);
  const key = useMemo(() => new THREE.Color('#ff2b3a'), []);
  const tentMat = useMemo(() => makeSkin(true, rim, key), [rim, key]);
  const bodyMat = useMemo(() => makeSkin(false, rim, key), [rim, key]);
  const { viewport } = useThree();

  useEffect(() => {
    // Fight Night — щупальца светятся красным
    const apply = () => {
      const fn = document.documentElement.dataset.mode === 'fight-night';
      rim.set(fn ? '#ff2b3a' : '#00e5ff');
      key.set(fn ? '#ff7a2b' : '#ff2b3a');
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => mo.disconnect();
  }, [rim, key]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    tentMat.uniforms.uTime.value = t;
    bodyMat.uniforms.uTime.value = t;
    const g = group.current!;
    const sc = input.current!.scroll;
    const wide = viewport.aspect > 1.1;
    const baseX = wide ? Math.min(2.5, viewport.width * 0.22) : 0;
    g.position.x = baseX + Math.sin(t * 0.3) * 0.08;
    g.position.y = (wide ? 0.55 : 0.7) + Math.sin(t * 0.8) * 0.12 - sc * 2.4;
    g.rotation.y = Math.sin(t * 0.25) * 0.25 + (input.current!.p.x - baseX) * 0.04;
    g.rotation.z = Math.sin(t * 0.4) * 0.04;
    const breathe = 1 + Math.sin(t * 1.1) * 0.025;
    g.scale.setScalar((wide ? 1.15 : 0.95) * breathe);
    g.updateMatrixWorld();
    input.current!.local.copy(input.current!.p);
    g.worldToLocal(input.current!.local);
  });

  return (
    <group ref={group}>
      <Mantle mat={bodyMat} />
      <Eye x={-0.34} input={input} />
      <Eye x={0.34} input={input} />
      {Array.from({ length: N_T }, (_, k) => (
        <Tentacle key={k} k={k} input={input} mat={tentMat} />
      ))}
    </group>
  );
}

/* ---------- морской снег ---------- */
function Snow({ count = 700 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { geo, mat } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 18;
      p[i * 3 + 1] = (Math.random() - 0.5) * 12;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
      s[i] = Math.random();
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(s, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: Math.min(window.devicePixelRatio, 1.75) } },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA;
        void main(){ vec3 p = position; p.y = mod(p.y + uTime*(0.08+aSeed*0.12) + 6.0, 12.0) - 6.0; p.x += sin(uTime*0.3 + aSeed*30.0)*0.25;
        vec4 mv = modelViewMatrix*vec4(p,1.0); gl_Position = projectionMatrix*mv; gl_PointSize = (1.0+aSeed*2.6)*uPx*(9.0/-mv.z);
        vA = (0.25 + 0.75*aSeed) * (0.6 + 0.4*sin(uTime*2.0 + aSeed*50.0)) * smoothstep(16.0, 4.0, -mv.z); }`,
      fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord-0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(0.75,0.95,1.0, a*vA*0.75); }`,
    });
    return { geo: g, mat: m };
  }, [count]);
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime;
  });
  return <points ref={ref} geometry={geo} material={mat} />;
}

/* ---------- лучи света ---------- */
function Rays() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform float uTime;
          void main(){ float edge = smoothstep(0.0,0.5,vUv.x)*smoothstep(1.0,0.5,vUv.x); float fall = pow(vUv.y, 1.6);
          float flick = 0.75 + 0.25*sin(uTime*0.7 + vUv.x*8.0);
          gl_FragColor = vec4(0.55,0.9,1.0, edge*fall*flick*0.07); }`,
      }),
    [],
  );
  useFrame(({ clock }) => (mat.uniforms.uTime.value = clock.elapsedTime));
  return (
    <group position={[0, 3.5, -4]}>
      {[-3.2, -0.8, 1.6, 4.2].map((x, i) => (
        <mesh key={i} material={mat} position={[x, -2, 0]} rotation={[0, 0, 0.18 - i * 0.07]}>
          <planeGeometry args={[1.2 + i * 0.3, 12]} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ input }: { input: React.RefObject<Input> }) {
  const { camera, size } = useThree();
  const ndc = useRef({ x: 0, y: 0 });
  const ray = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      ndc.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
      input.current!.active = true;
    };
    const onDown = (e: PointerEvent) => {
      if (e.clientY > window.innerHeight) return;
      // ближайшее к курсору щупальце делает выпад
      const p = input.current!.local;
      const ang = Math.atan2(p.z || 0.5, p.x);
      let best = 0;
      let bd = 9;
      for (let k = 0; k < N_T; k++) {
        const a = (k / N_T) * Math.PI * 2 + 0.2;
        const d = Math.abs(Math.atan2(Math.sin(a - ang), Math.cos(a - ang)));
        if (d < bd) {
          bd = d;
          best = k;
        }
      }
      input.current!.strikeIdx = best;
      input.current!.strike = 1;
    };
    const onScroll = () => {
      input.current!.scroll = Math.min(1, window.scrollY / window.innerHeight);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('scroll', onScroll);
    };
  }, [input]);

  useFrame((_, dt) => {
    // курсор → точка на плоскости z = 0.6 (перед осьминогом)
    ray.set(ndc.current.x, ndc.current.y, 0.5).unproject(camera).sub(camera.position).normalize();
    const dist = (0.6 - camera.position.z) / ray.z;
    const target = camera.position.clone().addScaledVector(ray, dist);
    input.current!.p.lerp(target, 0.12);
    input.current!.strike = Math.max(0, input.current!.strike - dt * 2.2);
    // параллакс камеры
    camera.position.x += (ndc.current.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (ndc.current.y * 0.2 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  void size;
  return null;
}

export default function HeroScene({ className = '', modelUrl }: { className?: string; modelUrl?: string }) {
  const ndcRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const on = (e: PointerEvent) => {
      ndcRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndcRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('pointermove', on, { passive: true });
    return () => window.removeEventListener('pointermove', on);
  }, []);
  const input = useRef<Input>({ p: new THREE.Vector3(2, 0, 0.6), local: new THREE.Vector3(), active: false, strike: 0, strikeIdx: -1, scroll: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className}>
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8.5], fov: 34 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <Rays />
          <Snow />
          {modelUrl ? <GlbOctopus url={modelUrl} pointer={ndcRef} /> : <Octopus input={input} />}
          <Rig input={input} />
        </Suspense>
      </Canvas>
    </div>
  );
}
