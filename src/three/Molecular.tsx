import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/* ---------- Single large helix (DNA encoding scene) ---------- */
export interface HelixControls {
  opacity: number;
  build: number; // 0..1 how much of the strand is assembled
  errorIndex: number; // -1 none, else base index flashing red
  spin: number;
}

const BASE_COLORS = [
  new THREE.Color("#7fd3e6"), // A
  new THREE.Color("#c9d3dc"), // C
  new THREE.Color("#9b8cf0"), // G
  new THREE.Color("#e6f3f7"), // T
];

export const DNAHelix = forwardRef<
  HelixControls,
  { length?: number; radius?: number; pitch?: number; count?: number; position?: [number, number, number]; rotation?: [number, number, number] }
>(function DNAHelix({ length = 6, radius = 0.35, pitch = 1.1, count = 90, position = [0, 0, 0], rotation = [0, 0, 0] }, ref) {
  const controls = useRef<HelixControls>({ opacity: 0, build: 1, errorIndex: -1, spin: 0 });
  useImperativeHandle(ref, () => controls.current, []);

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.045, 10, 10), []);
  const rungGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.012, 0.012, 1, 6, 1, true);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, roughness: 0.3, metalness: 0.1, emissive: "#3c5a63", emissiveIntensity: 0.4 }), []);
  const rungMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#7c8792", transparent: true, opacity: 0 }), []);
  const bases = useRef<THREE.InstancedMesh>(null);
  const rungs = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const seq = useMemo(() => Array.from({ length: count }, () => Math.floor(Math.random() * 4)), [count]);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const c = controls.current;
    if (!bases.current || !rungs.current) return;
    mat.opacity += (c.opacity - mat.opacity) * 0.08;
    rungMat.opacity += (c.opacity * 0.6 - rungMat.opacity) * 0.08;
    if (group.current) {
      group.current.visible = mat.opacity > 0.01;
      group.current.rotation.x = c.spin + clock.elapsedTime * 0.25;
    }
    const t = clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const u = i / count;
      const x = (u - 0.5) * length;
      const ang = (x / pitch) * Math.PI * 2;
      const built = THREE.MathUtils.clamp((c.build - u) * 8, 0, 1);
      const r = radius * built;
      const y1 = Math.cos(ang) * r, z1 = Math.sin(ang) * r;
      const y2 = -y1, z2 = -z1;
      const scatter = (1 - built) * 0.8;
      const s = 0.6 + built * 0.4;
      tmp.position.set(x + Math.sin(t + i) * scatter * 0.3, y1 + Math.sin(t * 0.7 + i) * scatter, z1 + Math.cos(t * 0.5 + i) * scatter);
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      bases.current.setMatrixAt(i * 2, tmp.matrix);
      tmp.position.set(x - Math.sin(t + i) * scatter * 0.3, y2 - Math.sin(t * 0.7 + i) * scatter, z2 - Math.cos(t * 0.5 + i) * scatter);
      tmp.updateMatrix();
      bases.current.setMatrixAt(i * 2 + 1, tmp.matrix);

      const isErr = c.errorIndex === i;
      const flash = isErr ? 0.5 + 0.5 * Math.sin(t * 8) : 0;
      col.copy(BASE_COLORS[seq[i]]);
      if (isErr) col.lerp(new THREE.Color("#ff5c5c"), flash);
      bases.current.setColorAt(i * 2, col);
      col.copy(BASE_COLORS[3 - seq[i]]);
      if (isErr) col.lerp(new THREE.Color("#ff5c5c"), flash);
      bases.current.setColorAt(i * 2 + 1, col);

      tmp.position.set(x, 0, 0);
      tmp.scale.set(r * 2, built, built);
      tmp.rotation.set(ang, 0, 0);
      tmp.updateMatrix();
      rungs.current.setMatrixAt(i, tmp.matrix);
      tmp.rotation.set(0, 0, 0);
    }
    bases.current.instanceMatrix.needsUpdate = true;
    if (bases.current.instanceColor) bases.current.instanceColor.needsUpdate = true;
    rungs.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      <instancedMesh ref={bases} args={[sphereGeo, mat, count * 2]} frustumCulled={false} />
      <instancedMesh ref={rungs} args={[rungGeo, rungMat, count]} frustumCulled={false} />
    </group>
  );
});

/* ---------- Field of many small helices (archive chamber) ---------- */
export interface FieldControls {
  opacity: number;
  highlight: number; // index of highlighted helix (-1 none)
  errorIndex: number;
}

export const HelixField = forwardRef<FieldControls, { helices?: number; perHelix?: number }>(function HelixField(
  { helices = 36, perHelix = 40 },
  ref,
) {
  const controls = useRef<FieldControls>({ opacity: 0, highlight: -1, errorIndex: -1 });
  useImperativeHandle(ref, () => controls.current, []);
  const geo = useMemo(() => new THREE.SphereGeometry(0.02, 6, 6), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, color: "#ffffff" }), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: helices }, (_, i) => {
        const a = (i / helices) * Math.PI * 2 + (i % 3) * 0.4;
        const r = 1.6 + (i % 5) * 0.45;
        return {
          pos: new THREE.Vector3(Math.cos(a) * r, (Math.sin(i * 1.7) * 1.4), Math.sin(a) * r - 1),
          rot: new THREE.Euler(Math.sin(i) * 1.2, i * 0.6, Math.cos(i * 0.7)),
          phase: i * 0.9,
        };
      }),
    [helices],
  );
  const q = useMemo(() => new THREE.Quaternion(), []);
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const c = controls.current;
    mat.opacity += (c.opacity - mat.opacity) * 0.06;
    mesh.current.visible = mat.opacity > 0.01;
    if (!mesh.current.visible) return;
    const t = clock.elapsedTime;
    let k = 0;
    for (let h = 0; h < helices; h++) {
      const s = seeds[h];
      q.setFromEuler(s.rot);
      const hl = c.highlight === h;
      const err = c.errorIndex === h;
      for (let i = 0; i < perHelix; i++) {
        const u = i / perHelix;
        const x = (u - 0.5) * 1.2;
        const ang = u * Math.PI * 6 + t * 0.6 + s.phase;
        const side = i % 2 === 0 ? 1 : -1;
        v.set(x, Math.cos(ang) * 0.12 * side, Math.sin(ang) * 0.12 * side).applyQuaternion(q).add(s.pos);
        tmp.position.copy(v);
        tmp.scale.setScalar(hl ? 1.8 : 1);
        tmp.updateMatrix();
        mesh.current.setMatrixAt(k, tmp.matrix);
        col.set(hl ? "#a9e4f1" : err ? "#ff6b6b" : i % 4 === 0 ? "#9b8cf0" : "#8a949e");
        if (err) col.lerp(new THREE.Color("#ffffff"), 0.5 + 0.5 * Math.sin(t * 8));
        mesh.current.setColorAt(k, col);
        k++;
      }
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geo, mat, helices * perHelix]} frustumCulled={false} />;
});

/* ---------- Ambient dust ---------- */
export interface DustControls {
  intensity: number;
  pull: number; // 0..1 gather toward origin
}
export const Dust = forwardRef<DustControls, { count: number }>(function Dust({ count }, ref) {
  const controls = useRef<DustControls>({ intensity: 0.6, pull: 0 });
  useImperativeHandle(ref, () => controls.current, []);
  const points = useRef<THREE.Points>(null);
  const { positions, base } = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 6;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(ph) * Math.cos(th);
      p[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.6;
      p[i * 3 + 2] = r * Math.cos(ph) - 1;
    }
    return { positions: p, base: p.slice() };
  }, [count]);
  const mat = useMemo(
    () => new THREE.PointsMaterial({ color: "#c9d3dc", size: 0.018, transparent: true, opacity: 0.5, sizeAttenuation: true, depthWrite: false }),
    [],
  );
  useFrame(({ clock }) => {
    if (!points.current) return;
    const c = controls.current;
    mat.opacity += (c.intensity * 0.6 - mat.opacity) * 0.05;
    const arr = points.current.geometry.attributes.position.array as Float32Array;
    const t = clock.elapsedTime;
    const pull = c.pull;
    for (let i = 0; i < count; i++) {
      const bx = base[i * 3], by = base[i * 3 + 1], bz = base[i * 3 + 2];
      const drift = Math.sin(t * 0.2 + i) * 0.05;
      arr[i * 3] = bx * (1 - pull * 0.85) + drift;
      arr[i * 3 + 1] = by * (1 - pull * 0.85) + Math.cos(t * 0.15 + i * 0.3) * 0.05;
      arr[i * 3 + 2] = bz * (1 - pull * 0.85);
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * 0.01;
  });
  return (
    <points ref={points} material={mat} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
    </points>
  );
});

/* ---------- Data stream particles (files → ring) ---------- */
export interface StreamControls {
  opacity: number;
  mode: "binary" | "acgt";
}
export const DataStream = forwardRef<StreamControls, { count?: number }>(function DataStream({ count = 320 }, ref) {
  const controls = useRef<StreamControls>({ opacity: 0, mode: "binary" });
  useImperativeHandle(ref, () => controls.current, []);
  const geo = useMemo(() => new THREE.BoxGeometry(0.03, 0.03, 0.03), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, color: "#a9e4f1" }), []);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => ({ off: Math.random(), ang: (i / count) * Math.PI * 2, r: 0.2 + Math.random() * 0.5 })), [count]);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const c = controls.current;
    mat.opacity += (c.opacity - mat.opacity) * 0.08;
    mesh.current.visible = mat.opacity > 0.01;
    if (!mesh.current.visible) return;
    const t = clock.elapsedTime * 0.25;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const u = (s.off + t) % 1; // 0 far → 1 at ring center
      const x = (1 - u) * 5 - 2.5; // flows from +x to -x through ring
      const spread = Math.sin(u * Math.PI) * 0.15 + 0.1;
      tmp.position.set(x, Math.cos(s.ang + u * 6) * s.r * spread * 4, Math.sin(s.ang + u * 6) * s.r * spread * 4);
      tmp.scale.setScalar(0.6 + Math.sin(u * Math.PI) * 0.8);
      tmp.updateMatrix();
      mesh.current.setMatrixAt(i, tmp.matrix);
      if (c.mode === "binary") col.set(i % 2 ? "#e6f3f7" : "#7c8792");
      else col.copy(BASE_COLORS[i % 4]);
      mesh.current.setColorAt(i, col);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  });
  return <instancedMesh ref={mesh} args={[geo, mat, count]} frustumCulled={false} />;
});
