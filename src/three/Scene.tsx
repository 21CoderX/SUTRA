import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { SutraRing, type RingControls } from "./SutraRing";
import { DNAHelix, HelixField, Dust, DataStream, type HelixControls, type FieldControls, type DustControls, type StreamControls } from "./Molecular";
import { MemoryFiles, type FilesControls } from "./MemoryFiles";
import { scroll, pointer, ringScreen, getUI, lerp, smooth, range } from "../store";

/**
 * Ring-first choreography. The product stays large and near-center in every
 * scene; molecular visuals appear ONLY where the story requires them:
 * encoding (3), archive (5), error (6) and the micro end of the zoom (15).
 */

type KF = {
  cam: [number, number, number];
  ring: [number, number, number];
  tilt: [number, number];
  scale: number;
  explode: number;
  shell: number;
  glow: number;
  sensor: number;
  dim: number;
  files: number;
  collapse: number;
  stream: number;
  helix: number;
  field: number;
  dust: number;
  pull: number;
  pulses: number;
};

const base: KF = {
  cam: [0, 0, 4.6], ring: [0, 0, 0], tilt: [0.35, -0.5], scale: 1, explode: 0, shell: 1, glow: 0, sensor: 0,
  dim: 0, files: 0, collapse: 0, stream: 0, helix: 0, field: 0, dust: 0.5, pull: 0, pulses: 0,
};
const kf = (p: Partial<KF>): KF => ({ ...base, ...p });

const K: KF[] = [
  /* 0 hero */ kf({ dim: 0.12 }),
  /* 1 question */ kf({ cam: [0, 0, 3.9], ring: [1.0, 0, -0.2], tilt: [0.2, -0.3], scale: 0.95, files: 1 }),
  /* 2 data */ kf({ cam: [0, 0, 3.6], ring: [-1.0, 0, -0.2], tilt: [0, -1.25], scale: 0.95, files: 1, collapse: 1, stream: 1 }),
  /* 3 dna */ kf({ cam: [0, 0, 3.8], ring: [1.0, 0, -0.4], tilt: [0.2, -1.1], scale: 0.8, stream: 1, helix: 1, dim: 0.12 }),
  /* 4 explode */ kf({ cam: [0, 0.2, 4.2], ring: [0, 0.15, 0], tilt: [0.35, 0.95], scale: 0.95, explode: 1, shell: 0.35, glow: 0.35, dust: 0.3 }),
  /* 5 archive */ kf({ cam: [0, 0, 2.7], scale: 1.25, shell: 0.15, glow: 1, field: 1, dust: 0.25, dim: 0.12, tilt: [0.2, 0.4] }),
  /* 6 error */ kf({ cam: [0, 0, 2.8], scale: 1.25, shell: 0.12, glow: 0.8, field: 1, dust: 0.25, dim: 0.18, tilt: [0.2, 0.6] }),
  /* 7 vision */ kf({ cam: [0, 0, 4.2], scale: 0.9, dust: 1.0, pull: 1, dim: 0.3, tilt: [0.3, -0.4] }),
  /* 8 auth */ kf({ cam: [0, 0, 4.2], ring: [1.0, 0.05, -0.2], scale: 0.85, sensor: 1, shell: 0.55, dim: 0.05, tilt: [0.4, -0.5] }),
  /* 9 wireless */ kf({ cam: [0, 0, 4.4], ring: [0, 0.1, 0], scale: 0.6, pulses: 1, tilt: [1.25, 0], dim: 0.05 }),
  /* 10 app */ kf({ ring: [0, 0, -1.2], scale: 0.8, dim: 0.85, tilt: [0.4, -0.6] }),
  /* 11 cache */ kf({ ring: [0, 0, -1.2], scale: 0.8, dim: 0.8, glow: 0.5, shell: 0.5, tilt: [0.4, 0.6] }),
  /* 12 reality */ kf({ ring: [1.0, 0.1, -0.5], scale: 0.78, dim: 0.78, tilt: [0.5, -0.4] }),
  /* 13 why */ kf({ ring: [-1.0, 0, -0.5], scale: 0.78, dim: 0.78, tilt: [0.5, 0.4] }),
  /* 14 visualizer */ kf({ ring: [0, 0, -1.6], scale: 0.7, dim: 0.9, dust: 0.2 }),
  /* 15 zoom */ kf({ cam: [0, 0, 3.4], scale: 1, glow: 1, shell: 0.9, dust: 0.3, tilt: [0.1, -0.15] }),
  /* 16 about */ kf({ cam: [0, 0, 4.2], ring: [1.0, 0, -0.3], scale: 0.88, dim: 0.55, tilt: [0.3, -0.5] }),
  /* 17 roadmap */ kf({ ring: [-1.0, 0, -0.3], scale: 0.82, dim: 0.6, tilt: [0.3, 0.5] }),
  /* 18 final */ kf({ cam: [0, 0, 4.3], dim: 0.1, dust: 0.8, tilt: [0.3, -0.4] }),
];

function mix(a: KF, b: KF, f: number): KF {
  const out = {} as KF;
  (Object.keys(a) as (keyof KF)[]).forEach((k) => {
    const va = a[k], vb = b[k];
    if (Array.isArray(va) && Array.isArray(vb)) {
      (out as unknown as Record<string, number[]>)[k] = va.map((x, i) => lerp(x, vb[i], f));
    } else {
      (out as unknown as Record<string, number>)[k] = lerp(va as number, vb as number, f);
    }
  });
  return out;
}

function Pulses({ ctrl }: { ctrl: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const mats = useMemo(() => [0, 1, 2].map(() => new THREE.MeshBasicMaterial({ color: "#7fd3e6", transparent: true, opacity: 0, side: THREE.DoubleSide })), []);
  const geo = useMemo(() => new THREE.RingGeometry(0.98, 1.0, 96), []);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    group.current.visible = ctrl.current > 0.02;
    group.current.children.forEach((c, i) => {
      const u = (t * 0.35 + i / 3) % 1;
      c.scale.setScalar(1 + u * 2.4);
      mats[i].opacity = ctrl.current * (1 - u) * 0.35;
    });
  });
  return (
    <group ref={group} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
      {mats.map((m, i) => (
        <mesh key={i} geometry={geo} material={m} rotation={[Math.PI / 2, 0, 0]} />
      ))}
    </group>
  );
}

const FOV_TAN = Math.tan(THREE.MathUtils.degToRad(38 / 2));

function Rig({ quality }: { quality: number }) {
  const ringCtrl = useRef<RingControls>(null);
  const helixCtrl = useRef<HelixControls>(null);
  const fieldCtrl = useRef<FieldControls>(null);
  const dustCtrl = useRef<DustControls>(null);
  const streamCtrl = useRef<StreamControls>(null);
  const filesCtrl = useRef<FilesControls>(null);
  const pulses = useRef(0);
  const ringGroup = useRef<THREE.Group>(null);
  const keyLight = useRef<THREE.SpotLight>(null);
  const { camera, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(0, 0, 4.6), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const drag = useRef({ x: 0, vx: 0, down: false, lastX: 0 });
  const spin = useRef(0);

  // Drag-to-rotate (window-level so DOM overlay doesn't block it)
  useEffect(() => {
    const canDrag = () => [0, 4, 18].includes(scroll.scene);
    const down = (e: PointerEvent) => {
      if (!canDrag()) return;
      if ((e.target as HTMLElement)?.closest?.("[data-nodrag]")) return;
      drag.current.down = true;
      drag.current.lastX = e.clientX;
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.down) return;
      const dx = e.clientX - drag.current.lastX;
      drag.current.lastX = e.clientX;
      drag.current.vx = dx * 0.006;
      drag.current.x += drag.current.vx;
    };
    const up = () => (drag.current.down = false);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  useFrame(({ clock }, dt) => {
    const t = scroll.t;
    const i = Math.min(K.length - 1, Math.floor(t));
    const local = t - i;
    const f = smooth(range(local, 0.55, 1));
    const s = mix(K[i], K[Math.min(K.length - 1, i + 1)], f);
    const ui = getUI();
    const reduced = ui.reduced;
    const mobile = size.width < 768;
    const time = clock.elapsedTime;

    // --- Ring transform
    const rx = mobile ? s.ring[0] * 0.25 : s.ring[0];
    const ry = mobile ? s.ring[1] + (Math.abs(s.ring[0]) > 0.5 ? 0.9 : 0) : s.ring[1];
    let scale = mobile ? s.scale * 0.8 : s.scale;

    // zoom scene: continuous macro → micro push
    if (i === 15) {
      const z = smooth(range(local, 0, 0.55));
      scale *= lerp(1, 14, z);
      s.shell = lerp(0.9, 0.05, z);
      s.dim = lerp(0, 0.6, z);
      s.field = z * 0.9;
      s.helix = smooth(range(local, 0.35, 0.6)) * (1 - smooth(range(local, 0.85, 1)));
    }
    // final scene: slow orbit
    let camX = s.cam[0], camZ = s.cam[2];
    if (i === 18) {
      const a = local * Math.PI * 0.9 + (reduced ? 0 : time * 0.05);
      camX = Math.sin(a) * 4.3;
      camZ = Math.cos(a) * 4.3;
    }
    if (mobile) camZ *= 1.45; // keep the product fully in frame on narrow screens

    if (ringGroup.current) {
      const g = ringGroup.current;
      g.position.lerp(target.set(rx, ry, s.ring[2]), 0.08);
      g.scale.lerp(target.set(scale, scale, scale), 0.08);
      // rotation: slow idle spin + scroll coupling + drag
      const spinSpeed = i === 4 ? 0.02 : reduced ? 0.03 : 0.12;
      spin.current += dt * spinSpeed;
      if (!drag.current.down) {
        drag.current.vx *= 0.94;
        drag.current.x += drag.current.vx;
      }
      const yaw = s.tilt[1] + spin.current + drag.current.x + (reduced ? 0 : scroll.velocity * 0.15);
      const pitch = s.tilt[0] + (reduced ? 0 : Math.sin(time * 0.4) * 0.04) + pointer.y * 0.05;
      g.rotation.x += (pitch - g.rotation.x) * 0.06;
      g.rotation.y += (yaw - g.rotation.y) * 0.08;

      // project ring center → screen for the HUD orbit
      proj.copy(g.position);
      const dist = camera.position.distanceTo(g.position);
      proj.project(camera);
      ringScreen.x = (proj.x * 0.5 + 0.5) * size.width;
      ringScreen.y = (-proj.y * 0.5 + 0.5) * size.height;
      ringScreen.r = (g.scale.x / (2 * dist * FOV_TAN)) * size.height;

      // memory files orbit the product, wherever it is
      if (filesCtrl.current) {
        filesCtrl.current.cx = g.position.x;
        filesCtrl.current.cy = g.position.y;
        filesCtrl.current.cz = g.position.z;
      }
    }

    // --- Camera
    const px = reduced ? 0 : pointer.x * 0.12;
    const py = reduced ? 0 : -pointer.y * 0.08;
    camPos.lerp(target.set(camX + px, s.cam[1] + py, camZ), 0.06);
    camera.position.copy(camPos);
    camera.lookAt(mobile ? 0 : rx * (i === 18 ? 0 : 0.35), ry * 0.4, 0);

    // --- Controls
    const rc = ringCtrl.current;
    if (rc) {
      rc.explode = s.explode;
      rc.shellOpacity = s.shell;
      rc.glow = s.glow;
      rc.sensorGlow = s.sensor;
      rc.dim = s.dim;
      if (i === 4 && ui.selected) rc.explode = 1;
    }
    if (helixCtrl.current) {
      helixCtrl.current.opacity = s.helix;
      helixCtrl.current.build = i === 3 ? smooth(range(local, 0.05, 0.6)) : 1;
      helixCtrl.current.errorIndex = -1;
    }
    if (fieldCtrl.current) {
      fieldCtrl.current.opacity = s.field;
      fieldCtrl.current.highlight = i === 5 ? 7 : -1;
      fieldCtrl.current.errorIndex = i === 6 && local > 0.25 && local < 0.7 ? 12 : -1;
    }
    if (dustCtrl.current) {
      dustCtrl.current.intensity = s.dust * (mobile ? 0.7 : 1);
      dustCtrl.current.pull = i === 7 ? smooth(range(local, 0.1, 0.8)) : s.pull * 0.2;
    }
    if (streamCtrl.current) {
      streamCtrl.current.opacity = s.stream;
      streamCtrl.current.mode = t > 2.75 ? "acgt" : "binary";
    }
    if (filesCtrl.current) {
      filesCtrl.current.opacity = s.files;
      filesCtrl.current.collapse = i === 2 ? smooth(range(local, 0.05, 0.6)) : s.collapse;
    }
    pulses.current = s.pulses;
    if (keyLight.current) keyLight.current.intensity = lerp(60, 25, s.dim);
  });

  return (
    <>
      <group ref={ringGroup}>
        <SutraRing ref={ringCtrl} quality={quality} />
      </group>
      <DNAHelix ref={helixCtrl} count={quality > 0.6 ? 90 : 60} rotation={[0, 0, 0.2]} position={[0.1, 0, -0.2]} />
      <HelixField ref={fieldCtrl} helices={quality > 0.6 ? 36 : 18} perHelix={quality > 0.6 ? 40 : 28} />
      <DataStream ref={streamCtrl} count={quality > 0.6 ? 220 : 120} />
      <MemoryFiles ref={filesCtrl} />
      <Dust ref={dustCtrl} count={quality > 0.6 ? 900 : 320} />
      <Pulses ctrl={pulses} />

      <spotLight ref={keyLight} position={[3, 4, 4]} angle={0.5} penumbra={1} intensity={60} color="#f2f5f8" />
      <spotLight position={[-4, -2, 3]} angle={0.6} penumbra={1} intensity={18} color="#7fd3e6" />
      <pointLight position={[0, -3, -2]} intensity={6} color="#9b8cf0" />
      <ambientLight intensity={0.12} />

      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.5} position={[-5, 0, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 1.2, 1]} color="#a9e4f1" />
        <Lightformer form="rect" intensity={1.2} position={[5, 1, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 0.8, 1]} color="#d8dde3" />
        <Lightformer form="ring" intensity={0.8} position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={4} color="#4a5560" />
        <mesh scale={40}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="#07090b" side={THREE.BackSide} />
        </mesh>
      </Environment>
    </>
  );
}

export default function Scene() {
  const quality = useMemo(() => {
    if (typeof window === "undefined") return 1;
    const small = window.innerWidth < 768;
    const lowCores = (navigator.hardwareConcurrency || 8) <= 4;
    return small || lowCores ? 0.5 : 1;
  }, []);
  const maxDpr = quality > 0.6 ? 1.75 : 1.25;
  const [dpr, setDpr] = useState<[number, number]>([1, maxDpr]);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 4.6], fov: 38, near: 0.1, far: 60 }}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#050607", 1);
          // signal the intro veil after the first real frame is presented
          requestAnimationFrame(() => requestAnimationFrame(() => import("../store").then((m) => m.setUI({ ready: true }))));
        }}
        style={{ touchAction: "pan-y" }}
      >
        <fog attach="fog" args={["#050607", 6, 14]} />
        {/* FPS governor: silently trade resolution for a locked-smooth frame rate */}
        <PerformanceMonitor
          onDecline={() => setDpr([0.85, 1.1])}
          onIncline={() => setDpr([1, maxDpr])}
          flipflops={3}
          onFallback={() => setDpr([0.75, 1])}
        />
        <Suspense fallback={null}>
          <Rig quality={quality} />
        </Suspense>
        <AdaptiveDpr pixelated />
      </Canvas>
      {/* vignette */}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(5,6,7,0.75) 100%)" }} />
    </div>
  );
}
