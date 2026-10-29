import * as THREE from "three";

/**
 * VORQEN emblem, traced from the supplied artwork into crystal shards.
 * Units: 1 = 100px of the source key visual, origin at the emblem centre.
 * `outline` is the silhouette, `spine` the ridge points raised toward the
 * viewer — together they produce the cut-crystal facets.
 */
export type ShardDef = {
  id: string;
  outline: [number, number][];
  spine: [number, number][];
  /** direction the shard drifts when the emblem breaks apart */
  burst: [number, number, number];
  spin: [number, number, number];
  height: number;
};

const mirror = (pts: [number, number][]): [number, number][] => pts.map(([x, y]) => [-x, y] as [number, number]).reverse();

const leftWing: [number, number][] = [
  [-2.27, 0.93],
  [-1.39, 0.77],
  [-0.36, -0.3],
  [-0.25, -1.52],
  [-0.74, -0.6],
  [-1.76, 0.36],
];
const leftWingSpine: [number, number][] = [
  [-1.95, 0.72],
  [-1.2, 0.2],
  [-0.62, -0.32],
  [-0.42, -1.05],
];

export const SHARDS: ShardDef[] = [
  { id: "wing-l", outline: leftWing, spine: leftWingSpine, burst: [-1.6, 0.6, 0.9], spin: [0.4, -0.9, 0.6], height: 0.32 },
  { id: "wing-r", outline: mirror(leftWing), spine: mirror(leftWingSpine), burst: [1.6, 0.5, 0.7], spin: [0.3, 1.0, -0.5], height: 0.32 },
  {
    id: "blade-facet",
    outline: [
      [-0.04, 1.62],
      [-0.06, 0.1],
      [-0.16, -0.85],
      [-0.62, 0.22],
    ],
    spine: [
      [-0.24, 0.55],
      [-0.2, -0.1],
    ],
    burst: [-0.5, 1.4, 1.4],
    spin: [-1.1, 0.4, 0.5],
    height: 0.3,
  },
  {
    id: "blade-spine",
    outline: [
      [0.02, 1.9],
      [0.2, 0.62],
      [0.12, -1.0],
      [0.0, -1.9],
      [-0.08, -0.95],
      [-0.03, 0.62],
    ],
    spine: [
      [0.07, 1.0],
      [0.05, -0.1],
      [0.02, -1.1],
    ],
    burst: [0.3, -1.6, 1.2],
    spin: [0.9, 0.2, -0.7],
    height: 0.26,
  },
];

/**
 * Builds a double-sided crystal: outline vertices sit at ±edge, spine
 * vertices are lifted to ±height. Spine points are passed to earcut as
 * single-vertex holes, which makes them Steiner points of the triangulation.
 */
export function buildShardGeometry(def: ShardDef, edge = 0.025): THREE.BufferGeometry {
  const outline = def.outline.map(([x, y]) => new THREE.Vector2(x, y));
  if (THREE.ShapeUtils.isClockWise(outline)) outline.reverse();
  const spine = def.spine.map(([x, y]) => new THREE.Vector2(x, y));
  const tris = THREE.ShapeUtils.triangulateShape(outline, spine.map((p) => [p]));
  const all = [...outline, ...spine];
  const n = outline.length;
  const zOf = (i: number) => (i < n ? edge : def.height);

  const pos: number[] = [];
  const push = (v: THREE.Vector2, z: number) => pos.push(v.x, v.y, z);

  for (const tri of tris) {
    const [a, b, c] = tri as [number, number, number];
    let A = all[a]!, B = all[b]!, C = all[c]!;
    let za = zOf(a), zb = zOf(b), zc = zOf(c);
    // enforce CCW so the front face normal points to +z
    if ((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x) < 0) {
      [B, C] = [C, B];
      [zb, zc] = [zc, zb];
    }
    // front (+z), CCW
    push(A, za); push(B, zb); push(C, zc);
    // back (-z), flipped winding
    push(A, -za); push(C, -zc); push(B, -zb);
  }
  // thin side walls
  for (let i = 0; i < n; i++) {
    const A = outline[i]!, B = outline[(i + 1) % n]!;
    push(A, edge); push(A, -edge); push(B, -edge);
    push(A, edge); push(B, -edge); push(B, edge);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

export function shardCentroid(def: ShardDef): THREE.Vector3 {
  const c = new THREE.Vector3();
  def.outline.forEach(([x, y]) => c.add(new THREE.Vector3(x, y, 0)));
  return c.divideScalar(def.outline.length);
}
