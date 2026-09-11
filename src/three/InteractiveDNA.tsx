import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Fragment } from "../components/Science";
import { getUI } from "../store";

interface Props {
  fragments: Fragment[];
  selected: number | null;
  onSelect: (f: Fragment) => void;
  showErrors: boolean;
  showRedundancy: boolean;
}

const COLORS = {
  A: new THREE.Color("#7fd3e6"),
  C: new THREE.Color("#c9d3dc"),
  G: new THREE.Color("#9b8cf0"),
  T: new THREE.Color("#e6f3f7"),
};

function Strand({ fragments, selected, onSelect, showErrors, showRedundancy }: Props) {
  const n = fragments.length;
  const length = 7, radius = 0.5, pitch = 1.6;
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.06, 12, 12), []);
  const rungGeo = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.02, 0.02, 1, 8);
    g.rotateZ(Math.PI / 2);
    return g;
  }, []);
  const bases = useRef<THREE.InstancedMesh>(null);
  const rungs = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const hover = useRef(-1);

  useFrame(({ clock }) => {
    if (!bases.current || !rungs.current || !group.current) return;
    if (!getUI().reduced) group.current.rotation.x = clock.elapsedTime * 0.15;
    const t = clock.elapsedTime;
    for (let i = 0; i < n; i++) {
      const f = fragments[i];
      const u = i / n;
      const x = (u - 0.5) * length;
      const ang = (x / pitch) * Math.PI * 2;
      const y = Math.cos(ang) * radius, z = Math.sin(ang) * radius;
      const isSel = selected === f.id;
      const isHover = hover.current === i;
      const s = isSel ? 1.6 : isHover ? 1.3 : 1;
      tmp.position.set(x, y, z);
      tmp.scale.setScalar(s);
      tmp.updateMatrix();
      bases.current.setMatrixAt(i * 2, tmp.matrix);
      tmp.position.set(x, -y, -z);
      tmp.updateMatrix();
      bases.current.setMatrixAt(i * 2 + 1, tmp.matrix);

      const b = f.seq[0] as keyof typeof COLORS;
      col.copy(COLORS[b]);
      if (f.status === "ERROR" && showErrors) col.set("#ff5c5c").lerp(new THREE.Color("#ffffff"), 0.3 + 0.3 * Math.sin(t * 6));
      if (f.status === "REDUNDANT" && showRedundancy) col.set("#9b8cf0");
      if (isSel) col.lerp(new THREE.Color("#ffffff"), 0.5);
      bases.current.setColorAt(i * 2, col);
      bases.current.setColorAt(i * 2 + 1, col);

      tmp.position.set(x, 0, 0);
      tmp.scale.set(radius * 2, isSel || isHover ? 1.8 : 1, isSel || isHover ? 1.8 : 1);
      tmp.rotation.set(ang, 0, 0);
      tmp.updateMatrix();
      rungs.current.setMatrixAt(i, tmp.matrix);
      tmp.rotation.set(0, 0, 0);
      col.set(isSel ? "#ffffff" : f.status === "ERROR" && showErrors ? "#ff8a8a" : f.status === "REDUNDANT" && showRedundancy ? "#b3a7ff" : "#7c8792");
      rungs.current.setColorAt(i, col);
    }
    bases.current.instanceMatrix.needsUpdate = true;
    rungs.current.instanceMatrix.needsUpdate = true;
    if (bases.current.instanceColor) bases.current.instanceColor.needsUpdate = true;
    if (rungs.current.instanceColor) rungs.current.instanceColor.needsUpdate = true;
  });

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id === undefined) return;
    onSelect(fragments[id]);
  };
  const clickBase = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const id = e.instanceId;
    if (id === undefined) return;
    onSelect(fragments[Math.floor(id / 2)]);
  };

  return (
    <group ref={group} rotation={[0, 0, 0.15]}>
      <instancedMesh
        ref={bases}
        args={[sphereGeo, undefined, n * 2]}
        onClick={clickBase}
        onPointerOver={(e) => { hover.current = Math.floor((e.instanceId ?? -2) / 2); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { hover.current = -1; document.body.style.cursor = ""; }}
      >
        <meshStandardMaterial roughness={0.3} metalness={0.1} />
      </instancedMesh>
      <instancedMesh
        ref={rungs}
        args={[rungGeo, undefined, n]}
        onClick={click}
        onPointerOver={(e) => { hover.current = e.instanceId ?? -1; document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { hover.current = -1; document.body.style.cursor = ""; }}
      >
        <meshStandardMaterial roughness={0.5} metalness={0.2} />
      </instancedMesh>
    </group>
  );
}

export default function InteractiveDNA(props: Props) {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 1.2, 5.5], fov: 40 }} gl={{ antialias: true, alpha: true }} style={{ touchAction: "none" }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={2.2} color="#f2f5f8" />
      <pointLight position={[-4, -2, 2]} intensity={6} color="#7fd3e6" />
      <Strand {...props} />
      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={9} dampingFactor={0.08} />
    </Canvas>
  );
}
