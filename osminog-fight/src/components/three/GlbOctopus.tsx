'use client';

/**
 * Загруженная GLB-модель (например, из Higgsfield image→3D) вместо процедурного осьминога.
 * Нормализует размер, добавляет контровой свет и реакцию на курсор; если в модели есть
 * анимации (риг) — проигрывает первую по кругу.
 */
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function GlbOctopus({ url, pointer }: { url: string; pointer: React.RefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const [scene, setScene] = useState<THREE.Object3D | null>(null);
  const mixer = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    let cancelled = false;
    new GLTFLoader().load(url, (gltf) => {
      if (cancelled) return;
      const obj = gltf.scene;
      // вписать модель в куб 3×3×3 и поставить на центр
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3()).length() || 1;
      obj.scale.setScalar(4.2 / size);
      box.setFromObject(obj);
      obj.position.sub(box.getCenter(new THREE.Vector3()));
      if (gltf.animations.length) {
        mixer.current = new THREE.AnimationMixer(obj);
        mixer.current.clipAction(gltf.animations[0]).play();
      }
      setScene(obj);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);

  useFrame(({ clock }, dt) => {
    mixer.current?.update(dt);
    const g = group.current;
    if (!g) return;
    const p = pointer.current ?? { x: 0, y: 0 };
    g.rotation.y += (p.x * 0.5 - g.rotation.y) * 0.05;
    g.rotation.x += (-p.y * 0.2 - g.rotation.x) * 0.05;
    g.position.y = Math.sin(clock.elapsedTime * 0.8) * 0.12;
  });

  return (
    <group ref={group} position={[1.8, 0, 0]}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 2, 2]} intensity={2.4} color="#ff2b3a" />
      <directionalLight position={[4, 2, -1]} intensity={2.8} color="#00e5ff" />
      <directionalLight position={[0, 4, 5]} intensity={0.8} color="#e8f1f8" />
      {scene && <primitive object={scene} />}
    </group>
  );
}
