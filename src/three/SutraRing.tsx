import { useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RING_COMPONENTS, getUI } from "../store";

/** Public per-frame controls (mutated from the Scene, never via React state) */
export interface RingControls {
  explode: number; // 0..1
  shellOpacity: number; // 1 solid, lower = translucent
  glow: number; // internal archive illumination 0..1
  sensorGlow: number; // authentication sensors 0..1
  dim: number; // 0 normal, 1 dimmed
}

function latheProfile(rIn: number, rOut: number, halfW: number, bevel: number) {
  const pts: THREE.Vector2[] = [];
  const b = bevel;
  // outer surface with rounded corners (counter-clockwise)
  const corner = (cx: number, cy: number, a0: number, a1: number, n = 5) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      pts.push(new THREE.Vector2(cx + Math.cos(a) * b, cy + Math.sin(a) * b));
    }
  };
  corner(rIn + b, -halfW + b, Math.PI, Math.PI * 1.5);
  corner(rOut - b, -halfW + b, Math.PI * 1.5, Math.PI * 2);
  corner(rOut - b, halfW - b, 0, Math.PI * 0.5);
  corner(rIn + b, halfW - b, Math.PI * 0.5, Math.PI);
  pts.push(pts[0].clone());
  return pts;
}

function arc(radius: number, tube: number, a0: number, a1: number, radial = 8) {
  const g = new THREE.TorusGeometry(radius, tube, radial, 48, a1 - a0);
  g.rotateZ(a0);
  return g;
}

const ORDER = RING_COMPONENTS.map((c) => c.id);

export const SutraRing = forwardRef<RingControls, { quality: number }>(function SutraRing({ quality }, ref) {
  const controls = useRef<RingControls>({ explode: 0, shellOpacity: 1, glow: 0, sensorGlow: 0, dim: 0 });
  useImperativeHandle(ref, () => controls.current, []);

  const segs = quality > 0.6 ? 160 : 96;

  const shellGeo = useMemo(() => {
    const g = new THREE.LatheGeometry(latheProfile(0.84, 1.0, 0.27, 0.05), segs);
    g.computeVertexNormals();
    return g;
  }, [segs]);
  const innerBandGeo = useMemo(() => {
    const g = new THREE.LatheGeometry(latheProfile(0.86, 0.90, 0.2, 0.012), segs);
    g.computeVertexNormals();
    return g;
  }, [segs]);
  const structureGeo = useMemo(() => {
    const g = new THREE.LatheGeometry(latheProfile(0.905, 0.955, 0.22, 0.01), segs);
    g.computeVertexNormals();
    return g;
  }, [segs]);

  const materials = useMemo(() => {
    const titanium = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#c9ced4"),
      metalness: 1,
      roughness: 0.18,
      clearcoat: 0.8,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.7,
      transparent: true,
    });
    const ceramic = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1a1d21"),
      metalness: 0.2,
      roughness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1,
      transparent: true,
    });
    const carbon = new THREE.MeshStandardMaterial({
      color: "#2a2e34",
      metalness: 0.6,
      roughness: 0.6,
      transparent: true,
    });
    const chip = new THREE.MeshStandardMaterial({
      color: "#3a3f47",
      metalness: 0.7,
      roughness: 0.4,
      emissive: new THREE.Color("#7fd3e6"),
      emissiveIntensity: 0,
      transparent: true,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#9fd9e6"),
      metalness: 0,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 0.4,
      ior: 1.45,
      transparent: true,
      opacity: 0.85,
      emissive: new THREE.Color("#7fd3e6"),
      emissiveIntensity: 0.05,
    });
    const battery = new THREE.MeshStandardMaterial({ color: "#23272c", metalness: 0.5, roughness: 0.5, transparent: true });
    const copper = new THREE.MeshStandardMaterial({ color: "#8c7a5b", metalness: 1, roughness: 0.35, transparent: true });
    const sensor = new THREE.MeshStandardMaterial({
      color: "#1b1f24",
      metalness: 0.3,
      roughness: 0.4,
      emissive: new THREE.Color("#7fd3e6"),
      emissiveIntensity: 0,
      transparent: true,
    });
    const chip2 = chip.clone();
    const copper2 = copper.clone();
    return { titanium, ceramic, carbon, chip, chip2, glass, battery, copper, copper2, sensor };
  }, []);

  const sensorGeo = useMemo(() => new THREE.BoxGeometry(0.06, 0.16, 0.012), []);
  const coreGeo = useMemo(() => new THREE.BoxGeometry(0.16, 0.16, 0.06), []);
  const cacheGeo = useMemo(() => new THREE.BoxGeometry(0.2, 0.14, 0.05), []);
  const archiveGeo = useMemo(() => arc(0.925, 0.045, Math.PI * 1.55, Math.PI * 1.95, 12), []);
  const wirelessGeo = useMemo(() => arc(0.925, 0.02, Math.PI * 0.55, Math.PI * 0.95, 8), []);
  const powerGeo = useMemo(() => arc(0.925, 0.035, Math.PI * 1.05, Math.PI * 1.45, 8), []);
  const strandGeo = useMemo(() => new THREE.SphereGeometry(0.008, 6, 6), []);

  // tiny DNA hint inside archive capsule
  const strandCount = 60;
  const strandRef = useRef<THREE.InstancedMesh>(null);
  const strandMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#a9e4f1", transparent: true, opacity: 0 }),
    [],
  );

  const groups = useRef<Record<string, THREE.Group | null>>({});
  const tmp = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const c = controls.current;
    const sel = getUI().selected;
    const e = c.explode;
    const dimF = 1 - c.dim * 0.75;

    ORDER.forEach((id, i) => {
      const g = groups.current[id];
      if (!g) return;
      // axial explode: layers stack along ring axis (local Y)
      const target = (i - (ORDER.length - 1) / 2) * 0.34 * e;
      g.position.z += (target - g.position.z) * 0.08;
      const selectedDim = sel && sel !== id ? 0.35 : 1;
      g.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          const mat = m.material as THREE.MeshStandardMaterial;
          const base = id === "shell" ? c.shellOpacity : 1;
          const targetOp = base * dimF * selectedDim;
          mat.opacity += (targetOp - mat.opacity) * 0.1;
          mat.depthWrite = mat.opacity > 0.5;
        }
      });
    });

    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 2);
    materials.sensor.emissiveIntensity = c.sensorGlow * (0.6 + pulse * 0.6);
    materials.glass.emissiveIntensity = 0.05 + c.glow * 0.7 + (sel === "archive" ? 0.4 : 0);
    materials.chip.emissiveIntensity = sel === "core" ? 0.5 : 0;
    materials.chip2.emissiveIntensity = sel === "cache" ? 0.5 : 0;
    strandMat.opacity += ((c.glow > 0.2 || sel === "archive" ? 0.9 : 0) - strandMat.opacity) * 0.08;

    if (strandRef.current) {
      const a0 = Math.PI * 1.55, a1 = Math.PI * 1.95;
      for (let i = 0; i < strandCount; i++) {
        const t = i / strandCount;
        const a = a0 + (a1 - a0) * t;
        const phase = t * Math.PI * 10 + clock.elapsedTime * 1.5;
        const r = 0.925 + Math.cos(phase) * 0.022 * ((i % 2) * 2 - 1);
        tmp.position.set(Math.cos(a) * r, Math.sin(a) * r, Math.sin(phase) * 0.022 * ((i % 2) * 2 - 1));
        tmp.updateMatrix();
        strandRef.current.setMatrixAt(i, tmp.matrix);
      }
      strandRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  const sensors = useMemo(() => Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2), []);
  const setG = (id: string) => (el: THREE.Group | null) => {
    groups.current[id] = el;
  };
  const place = (angle: number, r: number): [number, number, number] => [Math.cos(angle) * r, Math.sin(angle) * r, 0];

  return (
    <group>
      {/* All internals are built in XY plane (ring axis = Z), then the group is rotated so lathe Y-axis aligns */}
      <group ref={setG("shell")} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={shellGeo} material={materials.titanium} castShadow />
        <mesh geometry={innerBandGeo} material={materials.ceramic} />
      </group>

      <group ref={setG("structure")} rotation={[Math.PI / 2, 0, 0]}>
        <mesh geometry={structureGeo} material={materials.carbon} />
      </group>

      <group ref={setG("sensors")}>
        {sensors.map((a, i) => (
          <mesh key={i} geometry={sensorGeo} material={materials.sensor} position={place(a, 0.875)} rotation={[0, 0, a]} />
        ))}
      </group>

      <group ref={setG("core")}>
        <mesh geometry={coreGeo} material={materials.chip} position={place(0.2, 0.925)} rotation={[0, 0, 0.2]} />
        <mesh geometry={arc(0.925, 0.01, 0.05, 0.35, 6)} material={materials.copper} />
      </group>

      <group ref={setG("wireless")}>
        <mesh geometry={wirelessGeo} material={materials.copper2} />
        <mesh geometry={arc(0.945, 0.008, Math.PI * 0.58, Math.PI * 0.92, 6)} material={materials.copper2} />
      </group>

      <group ref={setG("cache")}>
        <mesh geometry={cacheGeo} material={materials.chip2} position={place(Math.PI * 1.0, 0.925)} rotation={[0, 0, Math.PI]} />
      </group>

      <group ref={setG("archive")}>
        <mesh geometry={archiveGeo} material={materials.glass} />
        <instancedMesh ref={strandRef} args={[strandGeo, strandMat, strandCount]} />
      </group>

      <group ref={setG("power")}>
        <mesh geometry={powerGeo} material={materials.battery} />
      </group>
    </group>
  );
});
