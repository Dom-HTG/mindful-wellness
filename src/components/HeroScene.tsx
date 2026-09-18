import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function makeBlobGeometry(detail: number) {
  const geo = new THREE.IcosahedronGeometry(1.55, detail);
  const position = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i);
    const n =
      Math.sin(v.x * 2.1 + v.y * 1.7) * 0.11 +
      Math.sin(v.y * 2.6 + v.z * 1.9) * 0.09 +
      Math.sin(v.z * 2.2 + v.x * 1.5) * 0.07;
    v.multiplyScalar(1 + n);
    position.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

function Rings() {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (a.current) a.current.rotation.z += delta * 0.08;
    if (b.current) b.current.rotation.z -= delta * 0.05;
  });
  return (
    <>
      <mesh ref={a} rotation={[1.3, 0.2, 0]}>
        <torusGeometry args={[2.6, 0.012, 16, 128]} />
        <meshBasicMaterial color="#8a6b41" transparent opacity={0.55} />
      </mesh>
      <mesh ref={b} rotation={[1.05, -0.4, 0.4]}>
        <torusGeometry args={[3.1, 0.008, 16, 128]} />
        <meshBasicMaterial color="#9f5a2a" transparent opacity={0.35} />
      </mesh>
    </>
  );
}

function Scene({ detail }: { detail: number }) {
  const geometry = useMemo(() => makeBlobGeometry(detail), [detail]);
  const parallax = useRef<THREE.Group>(null);
  const blob = useRef<THREE.Mesh>(null);
  const floatGroup = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (parallax.current) {
      parallax.current.rotation.y +=
        (state.pointer.x * 0.45 - parallax.current.rotation.y) * 0.045;
      parallax.current.rotation.x +=
        (-state.pointer.y * 0.3 - parallax.current.rotation.x) * 0.045;
    }
    if (blob.current) {
      blob.current.rotation.y += delta * 0.22;
      blob.current.rotation.x += delta * 0.06;
    }
    if (floatGroup.current) {
      floatGroup.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 5, 4]} intensity={2.1} color="#fff3e2" />
      <pointLight position={[-4, -2, 3]} intensity={40} color="#9f5a2a" distance={16} />

      <group ref={parallax}>
        <group ref={floatGroup}>
          <mesh ref={blob} geometry={geometry}>
            <meshStandardMaterial color="#8a6b41" roughness={0.38} metalness={0.28} />
          </mesh>
        </group>
        <Rings />
      </group>
    </>
  );
}

export default function HeroScene() {
  const detail = typeof window !== "undefined" && window.innerWidth < 768 ? 1 : 2;
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene detail={detail} />
    </Canvas>
  );
}
