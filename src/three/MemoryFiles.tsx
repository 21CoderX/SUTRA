import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface FilesControls {
  opacity: number;
  collapse: number; // 0 orbit → 1 collapsed into ring center
  cx: number; // orbit center = ring position (written by the rig)
  cy: number;
  cz: number;
}

const FILES = [
  { label: "PHOTO", ext: "vacation.jpg", glyph: "▣" },
  { label: "VIDEO", ext: "birthday.mp4", glyph: "▶" },
  { label: "DOCUMENT", ext: "thesis.pdf", glyph: "≡" },
  { label: "AUDIO", ext: "voice-note.wav", glyph: "∿" },
  { label: "NOTES", ext: "ideas.md", glyph: "✎" },
  { label: "PROJECT", ext: "studio.zip", glyph: "◈" },
];

function makeTexture(f: (typeof FILES)[number]) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0e1114";
  ctx.fillRect(0, 0, 256, 320);
  ctx.strokeStyle = "rgba(200,210,220,0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 254, 318);
  const g = ctx.createLinearGradient(0, 0, 0, 200);
  g.addColorStop(0, "#232a30");
  g.addColorStop(1, "#141a1f");
  ctx.fillStyle = g;
  ctx.fillRect(14, 14, 228, 186);
  ctx.fillStyle = "rgba(169,228,241,0.9)";
  ctx.font = "80px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(f.glyph, 128, 135);
  ctx.fillStyle = "rgba(238,241,244,0.9)";
  ctx.font = "600 20px monospace";
  ctx.textAlign = "left";
  ctx.fillText(f.label, 16, 240);
  ctx.fillStyle = "rgba(185,192,200,0.6)";
  ctx.font = "16px monospace";
  ctx.fillText(f.ext, 16, 270);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export const MemoryFiles = forwardRef<FilesControls>(function MemoryFiles(_, ref) {
  const controls = useRef<FilesControls>({ opacity: 0, collapse: 0, cx: 0, cy: 0, cz: 0 });
  useImperativeHandle(ref, () => controls.current, []);
  const textures = useMemo(() => FILES.map(makeTexture), []);
  const mats = useMemo(
    () => textures.map((map) => new THREE.MeshBasicMaterial({ map, transparent: true, opacity: 0, side: THREE.DoubleSide })),
    [textures],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(0.42, 0.52), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock, camera }) => {
    const c = controls.current;
    const t = clock.elapsedTime;
    if (group.current) group.current.visible = mats[0].opacity > 0.01 || c.opacity > 0.01;
    FILES.forEach((_, i) => {
      const m = meshes.current[i];
      if (!m) return;
      mats[i].opacity += (c.opacity * (1 - c.collapse * 0.9) - mats[i].opacity) * 0.08;
      const a = (i / FILES.length) * Math.PI * 2 + t * 0.25;
      const r = 1.9 * (1 - c.collapse) + 0.05;
      m.position.set(
        c.cx + Math.cos(a) * r,
        c.cy + Math.sin(a * 1.3) * 0.5 * (1 - c.collapse),
        c.cz + Math.sin(a) * r * 0.5 + 0.4,
      );
      const s = 1 - c.collapse * 0.9;
      m.scale.setScalar(s);
      m.quaternion.copy(camera.quaternion);
    });
  });

  return (
    <group ref={group}>
      {FILES.map((_, i) => (
        <mesh key={i} ref={(el) => { meshes.current[i] = el; }} geometry={geo} material={mats[i]} />
      ))}
    </group>
  );
});
