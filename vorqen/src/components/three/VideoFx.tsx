"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Video treated like glass: cover-fit, a liquid lens that follows the
 * cursor, a ripple on movement, RGB separation driven by scroll and pointer
 * speed, and a camera fly-in toward the emblem as the hero scrolls away.
 */
const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uRes;
  uniform vec2 uTexRes;
  uniform vec2 uMouse;
  uniform vec2 uFocus;
  uniform float uVel;
  uniform float uTime;
  uniform float uScroll;
  uniform float uIntro;
  varying vec2 vUv;

  // cover-fit, except on narrow screens where at least 62% of the frame
  // width stays visible; the overflow above/below fades into the page black
  vec2 cover(vec2 uv) {
    float rs = uRes.x / uRes.y;
    float ri = uTexRes.x / uTexRes.y;
    vec2 s = rs < ri ? vec2(max(rs / ri, 0.62), 1.0) : vec2(1.0, ri / rs);
    if (rs < ri) s.y = s.x * ri / rs;
    return (uv - 0.5) * s + 0.5 + vec2(0.0, (s.y - 1.0) * (uFocus.y - 0.5));
  }

  void main() {
    vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
    vec2 uv = vUv;

    // fly-in toward the emblem (intro settles from 1.22x, scroll pushes in)
    float zoom = 1.0 + (1.0 - uIntro) * 0.22 + uScroll * uScroll * 2.4;
    uv = (uv - uFocus) / zoom + uFocus;

    // parallax
    uv += (uMouse - 0.5) * vec2(-0.014, 0.01);

    // liquid lens around the cursor
    vec2 d = (vUv - uMouse) * aspect;
    float dist = length(d);
    float lens = (1.0 - smoothstep(0.0, 0.34, dist));
    uv -= (d / aspect) * lens * lens * (0.09 + uVel * 0.5);
    // travelling ripple ring
    float ring = sin(dist * 42.0 - uTime * 3.2) * (1.0 - smoothstep(0.06, 0.42, dist)) * 0.0016 * (0.4 + uVel * 6.0);
    uv += normalize(d + 1e-5) / aspect * ring;

    vec2 c = cover(uv);
    vec2 dir = normalize(vUv - 0.5 + 1e-5);
    // channel split grows toward the frame edges only — a lens, not a glitch
    float edge = smoothstep(0.15, 0.75, length((vUv - 0.5) * aspect));
    float split = (0.0006 + uScroll * 0.0045 + uVel * 0.008) * edge + lens * 0.0012;
    vec3 col;
    col.r = texture2D(uTex, c + dir * split).r;
    col.g = texture2D(uTex, c).g;
    col.b = texture2D(uTex, c - dir * split).b;

    // letterbox overflow on portrait screens melts into black
    col *= smoothstep(0.0, 0.1, c.y) * (1.0 - smoothstep(0.9, 1.0, c.y));

    // cold light pooled under the cursor
    col += lens * lens * 0.05 * vec3(0.91, 0.94, 1.0);

    // vignette + intro / exit fades
    float v = (1.0 - smoothstep(0.25, 1.15, length((vUv - 0.5) * aspect * 0.85)));
    col *= mix(0.5, 1.0, v);
    col *= smoothstep(0.0, 1.0, uIntro) * (1.0 - smoothstep(0.45, 0.95, uScroll));

    // video frames are sampled as-is (already display-referred), so no
    // colour-space conversion here — converting again washes out the blacks
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Plane({ video, focus }: { video: HTMLVideoElement; focus: [number, number] }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.size);
  const touch = useMemo(() => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches, []);
  const mouse = useRef(new THREE.Vector2(0.5, 0.45));
  const prev = useRef(new THREE.Vector2(0.5, 0.45));
  const vel = useRef(0);
  const intro = useRef(0);

  const tex = useMemo(() => {
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.NoColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, [video]);
  useEffect(() => () => tex.dispose(), [tex]);

  const uniforms = useMemo(
    () => ({
      uTex: { value: tex },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTexRes: { value: new THREE.Vector2(1920, 1080) },
      uMouse: { value: new THREE.Vector2(0.5, 0.45) },
      uFocus: { value: new THREE.Vector2(focus[0], focus[1]) },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uIntro: { value: 0 },
    }),
    [tex, focus],
  );

  useFrame((state, dt) => {
    const m = mat.current;
    if (!m) return;
    const u = m.uniforms;
    const t = state.clock.elapsedTime;
    u.uRes!.value.set(size.width, size.height);
    if (video.videoWidth) u.uTexRes!.value.set(video.videoWidth, video.videoHeight);

    // pointer target: real mouse, or a slow drifting lens on touch screens
    const tx = touch ? 0.5 + Math.sin(t * 0.35) * 0.22 : scrollStore.pointer.x * 0.5 + 0.5;
    const ty = touch ? 0.45 + Math.cos(t * 0.27) * 0.16 : 1 - (scrollStore.pointer.y * 0.5 + 0.5);
    mouse.current.x = THREE.MathUtils.damp(mouse.current.x, tx, 5, dt);
    mouse.current.y = THREE.MathUtils.damp(mouse.current.y, ty, 5, dt);
    const speed = mouse.current.distanceTo(prev.current) / Math.max(dt, 1e-3);
    prev.current.copy(mouse.current);
    vel.current = THREE.MathUtils.damp(vel.current, Math.min(speed * 0.05, 0.25), 4, dt);

    intro.current = scrollStore.introDone ? THREE.MathUtils.damp(intro.current, 1, 1.4, dt) : 0;

    u.uMouse!.value.copy(mouse.current);
    u.uVel!.value = vel.current;
    u.uTime!.value = t;
    u.uScroll!.value = THREE.MathUtils.damp(u.uScroll!.value, scrollStore.hero, 8, dt);
    u.uIntro!.value = intro.current;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  );
}

export default function VideoFx({
  video,
  active,
  focus = [0.5, 0.45],
  onReady,
}: {
  video: HTMLVideoElement;
  active: boolean;
  focus?: [number, number];
  onReady?: () => void;
}) {
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
      dpr={1}
      frameloop={active ? "always" : "never"}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false, depth: false }}
      onCreated={({ gl }) => {
        gl.setClearColor("#050506");
        onReady?.();
      }}
      aria-hidden
    >
      <Plane video={video} focus={focus} />
    </Canvas>
  );
}
