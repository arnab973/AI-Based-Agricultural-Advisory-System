"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Line,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  Text,
} from "@react-three/drei";
import * as THREE from "three";

/* =========================================================
   RESPONSIVE CAMERA
========================================================= */

function ResponsiveCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ size }) => {
    if (!cameraRef.current) return;

    const isMobile = size.width < 768;

    cameraRef.current.fov = isMobile ? 58 : 48;
    cameraRef.current.position.set(
      isMobile ? 0 : 0,
      isMobile ? 7.8 : 6.5,
      isMobile ? 15 : 16
    );

    cameraRef.current.lookAt(
      0,
      isMobile ? 1.2 : 1.5,
      isMobile ? -3 : -4
    );

    cameraRef.current.updateProjectionMatrix();
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 6.5, 16]}
      fov={48}
      near={0.1}
      far={100}
    />
  );
}

/* =========================================================
   MOUSE CAMERA
========================================================= */

function MouseCamera() {
  const target = useRef(new THREE.Vector3());

  useFrame(({ camera, pointer }) => {
    target.current.set(
      pointer.x * 0.7,
      6.5 + pointer.y * 0.35,
      16
    );

    camera.position.lerp(target.current, 0.025);
    camera.lookAt(0, 1.4, -4);
  });

  return null;
}

/* =========================================================
   GROUND
========================================================= */

function Ground() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.15, -2]}
        receiveShadow
      >
        <planeGeometry args={[34, 30]} />
        <meshStandardMaterial
          color="#071b0e"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      <gridHelper
        args={[30, 30, "#164d2c", "#0b2817"]}
        position={[0, -0.12, -2]}
      />
    </group>
  );
}

/* =========================================================
   FARM FIELD
========================================================= */

function FarmField({
  position,
  width,
  depth,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
}) {
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[width, 0.22, depth]} />
        <meshStandardMaterial
          color="#123d1e"
          roughness={0.85}
        />
      </mesh>

      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[width - 0.15, 0.035, depth - 0.15]} />
        <meshStandardMaterial
          color="#1d5d2d"
          emissive="#0b2d16"
          emissiveIntensity={0.45}
        />
      </mesh>

      {/* Field border */}
      <Line
        points={[
          [-width / 2, 0.17, -depth / 2],
          [width / 2, 0.17, -depth / 2],
          [width / 2, 0.17, depth / 2],
          [-width / 2, 0.17, depth / 2],
          [-width / 2, 0.17, -depth / 2],
        ]}
        color="#39ff88"
        lineWidth={1}
        transparent
        opacity={0.55}
      />
    </group>
  );
}

/* =========================================================
   CROP ROW
========================================================= */

function CropRow({
  x,
  z,
  count = 9,
}: {
  x: number;
  z: number;
  count?: number;
}) {
  return (
    <group position={[x, 0.15, z]}>
      {Array.from({ length: count }).map((_, i) => (
        <Crop key={i} position={[(i - (count - 1) / 2) * 0.55, 0, 0]} />
      ))}
    </group>
  );
}

/* =========================================================
   CROP
========================================================= */

function Crop({
  position,
}: {
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    ref.current.rotation.z =
      Math.sin(clock.elapsedTime * 1.5 + position[0]) * 0.025;
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.55, 6]} />
        <meshStandardMaterial
          color="#5ccf65"
          emissive="#163e1b"
          emissiveIntensity={0.5}
        />
      </mesh>

      <mesh position={[-0.12, 0.48, 0]} rotation={[0, 0, -0.45]}>
        <sphereGeometry args={[0.13, 8, 5]} />
        <meshStandardMaterial
          color="#76e87c"
          emissive="#183f1d"
          emissiveIntensity={0.35}
        />
      </mesh>

      <mesh position={[0.12, 0.56, 0]} rotation={[0, 0, 0.45]}>
        <sphereGeometry args={[0.14, 8, 5]} />
        <meshStandardMaterial
          color="#82ed88"
          emissive="#183f1d"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   MOUNTAIN
========================================================= */

function Mountain({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <coneGeometry args={[3.8, 5.5, 5]} />
        <meshStandardMaterial
          color="#10291b"
          roughness={1}
        />
      </mesh>

      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[1.35, 1.7, 5]} />
        <meshStandardMaterial
          color="#31593a"
          emissive="#0c2113"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   TREE
========================================================= */

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 1.8, 8]} />
        <meshStandardMaterial color="#4b2e19" />
      </mesh>

      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[0.85, 12, 10]} />
        <meshStandardMaterial
          color="#2f8c42"
          emissive="#0e3217"
          emissiveIntensity={0.45}
        />
      </mesh>

      <mesh position={[0.35, 2.45, 0.1]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial
          color="#45a84e"
          emissive="#103719"
          emissiveIntensity={0.35}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   FIELD GRID
========================================================= */

function FieldGrid() {
  return (
    <group>
      {[-5.8, 4.5].map((x) => (
        <Line
          key={x}
          points={[
            [x - 3.2, 0.3, -7],
            [x + 3.2, 0.3, -7],
            [x + 3.2, 0.3, -1],
            [x - 3.2, 0.3, -1],
            [x - 3.2, 0.3, -7],
          ]}
          color="#39ff88"
          lineWidth={0.7}
          transparent
          opacity={0.28}
        />
      ))}
    </group>
  );
}

/* =========================================================
   ENERGY STREAMS
========================================================= */

function EnergyStreams() {
  const points = useMemo(
    () => [
      new THREE.Vector3(-8, 2.5, -5),
      new THREE.Vector3(-4, 4, -5),
      new THREE.Vector3(0, 2.8, -4),
      new THREE.Vector3(4, 4.5, -6),
      new THREE.Vector3(8, 2.7, -5),
    ],
    []
  );

  return (
    <Line
      points={points}
      color="#35ff9b"
      lineWidth={1.2}
      transparent
      opacity={0.45}
    />
  );
}

/* =========================================================
   AI NETWORK
========================================================= */

function AINetwork() {
  const nodes = useMemo(
    () => [
      [-5.5, 2.5, -4],
      [-2.5, 3.2, -6],
      [0, 4, -4],
      [2.8, 3, -7],
      [5.3, 2.5, -4],
    ] as [number, number, number][],
    []
  );

  return (
    <group>
      {nodes.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial
              color="#69ffb0"
              emissive="#24ff91"
              emissiveIntensity={3}
            />
          </mesh>

          <mesh scale={1.8}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial
              color="#36ff99"
              transparent
              opacity={0.12}
            />
          </mesh>
        </group>
      ))}

      <Line
        points={nodes}
        color="#43ff9f"
        lineWidth={0.7}
        transparent
        opacity={0.35}
      />
    </group>
  );
}

/* =========================================================
   HOLOGRAM RING
========================================================= */

function HologramRing() {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.z += delta * 0.3;
    ref.current.rotation.y += delta * 0.15;
  });

  return (
    <group ref={ref} position={[0, 5.4, -9]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.3, 0.025, 12, 80]} />
        <meshBasicMaterial
          color="#42ffad"
          transparent
          opacity={0.65}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.015, 12, 80]} />
        <meshBasicMaterial
          color="#8affc7"
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   HOLOGRAM CUBE
========================================================= */

function HologramCube() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    ref.current.rotation.x += delta * 0.35;
    ref.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={ref} position={[7, 3.8, -8]}>
      <boxGeometry args={[1.1, 1.1, 1.1]} />
      <meshBasicMaterial
        color="#4affaa"
        wireframe
        transparent
        opacity={0.65}
      />
    </mesh>
  );
}

/* =========================================================
   DATA PANEL
========================================================= */

function DataPanel({
  position,
  title,
}: {
  position: [number, number, number];
  title: string;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    ref.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 1.2 + position[0]) * 0.08;
  });

  return (
    <group ref={ref} position={position}>
      <mesh>
        <planeGeometry args={[2.6, 1.25]} />
        <meshBasicMaterial
          color="#082e1a"
          transparent
          opacity={0.72}
          side={THREE.DoubleSide}
        />
      </mesh>

      <Line
        points={[
          [-1.3, -0.625, 0.01],
          [1.3, -0.625, 0.01],
          [1.3, 0.625, 0.01],
          [-1.3, 0.625, 0.01],
          [-1.3, -0.625, 0.01],
        ]}
        color="#54ffad"
        lineWidth={0.8}
      />

      <Text
        position={[-1.05, 0.25, 0.03]}
        fontSize={0.17}
        color="#9affcb"
        anchorX="left"
        anchorY="middle"
      >
        {title}
      </Text>

      <Text
        position={[-1.05, -0.1, 0.03]}
        fontSize={0.13}
        color="#52e994"
        anchorX="left"
        anchorY="middle"
      >
        AI MONITORING
      </Text>

      <Text
        position={[-1.05, -0.35, 0.03]}
        fontSize={0.11}
        color="#b8ffd7"
        anchorX="left"
        anchorY="middle"
      >
        ACTIVE • LIVE DATA
      </Text>
    </group>
  );
}

/* =========================================================
   SIGNAL WAVE
========================================================= */

function SignalWave({
  position,
}: {
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    ref.current.scale.x =
      0.8 + Math.sin(clock.elapsedTime * 2.5) * 0.15;

    ref.current.scale.z =
      0.8 + Math.sin(clock.elapsedTime * 2.5) * 0.15;
  });

  return (
    <group ref={ref} position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.018, 8, 40]} />
        <meshBasicMaterial
          color="#3dff9d"
          transparent
          opacity={0.65}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.85, 0.012, 8, 40]} />
        <meshBasicMaterial
          color="#3dff9d"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   FIELD SENSOR NODE
========================================================= */

function FieldSensor({
  position,
}: {
  position: [number, number, number];
}) {
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!beamRef.current) return;

    const material = beamRef.current.material as THREE.MeshBasicMaterial;

    material.opacity =
      0.16 + Math.sin(clock.elapsedTime * 2.5 + position[0]) * 0.06;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 0.42, 8]} />
        <meshStandardMaterial
          color="#4cff9e"
          emissive="#25ff8d"
          emissiveIntensity={2.5}
        />
      </mesh>

      <mesh position={[0, 0.46, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#b3ffd6" />
      </mesh>

      <mesh
        ref={beamRef}
        position={[0, 1.35, 0]}
      >
        <cylinderGeometry args={[0.025, 0.12, 1.8, 12]} />
        <meshBasicMaterial
          color="#39ff9b"
          transparent
          opacity={0.18}
        />
      </mesh>

      <SignalWave position={[0, 0.06, 0]} />
    </group>
  );
}

/* =========================================================
   IRRIGATION FLOW
========================================================= */

function IrrigationFlow() {
  const drops = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        x: -5.8 + (i % 7) * 1.05,
        z: -4.8 + Math.floor(i / 7) * 1.5,
        delay: i * 0.15,
      })),
    []
  );

  return (
    <group>
      {drops.map((drop, i) => (
        <IrrigationDrop key={i} {...drop} />
      ))}

      <Line
        points={[
          [-8.5, 0.27, -5.1],
          [-5.8, 0.27, -5.1],
          [-2.5, 0.27, -5.1],
        ]}
        color="#3ebfff"
        lineWidth={1}
        transparent
        opacity={0.35}
      />
    </group>
  );
}

function IrrigationDrop({
  x,
  z,
  delay,
}: {
  x: number;
  z: number;
  delay: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = (clock.elapsedTime * 0.6 + delay) % 1;

    ref.current.position.y = 0.28 + t * 0.45;
    ref.current.position.x = x + Math.sin(t * Math.PI) * 0.15;
    ref.current.scale.setScalar(0.65 + t * 0.4);
  });

  return (
    <mesh ref={ref} position={[x, 0.3, z]}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshBasicMaterial
        color="#63d7ff"
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

/* =========================================================
   DRONE SCANNING BEAM
========================================================= */

function DroneScanBeam() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const material = ref.current.material as THREE.MeshBasicMaterial;

    material.opacity =
      0.08 + (Math.sin(clock.elapsedTime * 3) + 1) * 0.035;

    ref.current.scale.x =
      0.9 + Math.sin(clock.elapsedTime * 2) * 0.08;
  });

  return (
    <mesh
      ref={ref}
      position={[0, -0.8, 0]}
      rotation={[Math.PI, 0, 0]}
    >
      <coneGeometry args={[1.15, 1.8, 32, 1, true]} />
      <meshBasicMaterial
        color="#38ff9b"
        transparent
        opacity={0.12}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   FARMING DRONE
========================================================= */

function FarmingDrone({
  position,
  delay = 0,
  scale = 1,
}: {
  position: [number, number, number];
  delay?: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.elapsedTime + delay;

    ref.current.position.x =
      position[0] + Math.sin(t * 0.55) * 0.45;

    ref.current.position.y =
      position[1] + Math.sin(t * 1.3) * 0.22;

    ref.current.position.z =
      position[2] + Math.cos(t * 0.65) * 0.35;

    ref.current.rotation.y =
      Math.sin(t * 0.6) * 0.12;

    ref.current.rotation.z =
      Math.sin(t * 1.2) * 0.025;
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[1.25, 0.28, 0.75]} />
        <meshStandardMaterial
          color="#d7e7df"
          metalness={0.65}
          roughness={0.3}
          emissive="#183b2a"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Center AI core */}
      <mesh position={[0, -0.02, 0]}>
        <sphereGeometry args={[0.19, 16, 16]} />
        <meshStandardMaterial
          color="#5affaa"
          emissive="#22ff88"
          emissiveIntensity={4}
        />
      </mesh>

      {/* Camera */}
      <mesh position={[0, -0.22, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial
          color="#64dfff"
          emissive="#25cfff"
          emissiveIntensity={3}
        />
      </mesh>

      {/* Arms */}
      {[
        [-0.7, 0, 0],
        [0.7, 0, 0],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={[0.65, 0.08, 0.1]} />
          <meshStandardMaterial
            color="#9fb8aa"
            metalness={0.8}
            roughness={0.25}
          />
        </mesh>
      ))}

      {/* Rotors */}
      {[
        [-0.78, 0.15, 0],
        [0.78, 0.15, 0],
        [-0.78, 0.15, 0.38],
        [0.78, 0.15, 0.38],
      ].map((p, i) => (
        <Rotor key={i} position={p as [number, number, number]} />
      ))}

      {/* Scan beam */}
      <DroneScanBeam />

      {/* Drone lights */}
      <pointLight
        position={[0, -0.3, 0]}
        color="#3dff9b"
        intensity={1.2}
        distance={4}
      />
    </group>
  );
}

/* =========================================================
   ROTOR
========================================================= */

function Rotor({
  position,
}: {
  position: [number, number, number];
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 15;
  });

  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.58, 0.025, 0.08]} />
      <meshBasicMaterial
        color="#a9ffe0"
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}

/* =========================================================
   HOLOGRAPHIC EARTH
========================================================= */

function HolographicEarth() {
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={ref} position={[0, 3.5, -10]}>
      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial
          color="#39ff9a"
          wireframe
          transparent
          opacity={0.48}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.15, 24, 24]} />
        <meshBasicMaterial
          color="#2c9e66"
          transparent
          opacity={0.1}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.018, 8, 80]} />
        <meshBasicMaterial
          color="#65ffc0"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   RAIN / PARTICLES
========================================================= */

function Rain() {
  const count = 180;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 28;
      arr[i * 3 + 1] = Math.random() * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 22 - 3;
    }

    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const position =
      ref.current.geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      let y = position.getY(i);

      y -= delta * 2.2;

      if (y < 0) y = 12;

      position.setY(i, y);
    }

    position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>

      <pointsMaterial
        color="#79dfff"
        size={0.025}
        transparent
        opacity={0.28}
        depthWrite={false}
      />
    </points>
  );
}

/* =========================================================
   FLOATING AI DATA
========================================================= */

function FloatingData() {
  return (
    <group>
      <DataPanel
        position={[-8, 4.1, -8]}
        title="CROP HEALTH"
      />

      <DataPanel
        position={[7.4, 4.5, -6.5]}
        title="WEATHER AI"
      />

      <DataPanel
        position={[7.5, 1.8, -4.5]}
        title="MARKET PRICE"
      />
    </group>
  );
}

/* =========================================================
   SCENE
========================================================= */

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.55} />

      <directionalLight
        position={[5, 12, 7]}
        intensity={1.9}
        castShadow
      />

      <directionalLight
        position={[-8, 8, 2]}
        intensity={1.15}
      />

      <pointLight
        position={[0, 6, 1]}
        intensity={2.8}
        distance={22}
        color="#49ff9f"
      />

      <pointLight
        position={[-6, 3, -4]}
        intensity={1.5}
        distance={10}
        color="#39ff87"
      />

      <pointLight
        position={[6, 3, -5]}
        intensity={1.3}
        distance={10}
        color="#50dfff"
      />

      <Ground />

      {/* Background mountains */}
      <Mountain position={[-10, 1.8, -13]} scale={1.3} />
      <Mountain position={[9, 1.6, -14]} scale={1.15} />
      <Mountain position={[0, 1.5, -17]} scale={1.5} />

      {/* Fields */}
      <FarmField
        position={[-5.8, 0, -4]}
        width={7}
        depth={6}
      />

      <FarmField
        position={[4.5, 0, -5]}
        width={7}
        depth={6}
      />

      <FarmField
        position={[0, 0, -9]}
        width={17}
        depth={5}
      />

      {/* Crops - left field */}
      <CropRow x={-5.8} z={-6.0} count={10} />
      <CropRow x={-5.8} z={-4.7} count={10} />
      <CropRow x={-5.8} z={-3.4} count={10} />
      <CropRow x={-5.8} z={-2.1} count={10} />

      {/* Crops - right field */}
      <CropRow x={4.5} z={-6.5} count={10} />
      <CropRow x={4.5} z={-5.2} count={10} />
      <CropRow x={4.5} z={-3.9} count={10} />
      <CropRow x={4.5} z={-2.6} count={10} />

      {/* Back crops */}
      <CropRow x={0} z={-10.5} count={17} />
      <CropRow x={0} z={-9.2} count={17} />

      <FieldGrid />

      {/* AI network */}
      <EnergyStreams />
      <AINetwork />

      {/* Sensors */}
      <FieldSensor position={[-8, 0, -5]} />
      <FieldSensor position={[-5.8, 0, -2.8]} />
      <FieldSensor position={[-3.5, 0, -5.5]} />

      <FieldSensor position={[2.2, 0, -5.8]} />
      <FieldSensor position={[5, 0, -3.2]} />
      <FieldSensor position={[7, 0, -5.2]} />

      {/* Irrigation */}
      <IrrigationFlow />

      {/* Drones */}
      <FarmingDrone
        position={[-5.5, 4.1, -4.5]}
        scale={1}
      />

      <FarmingDrone
        position={[4.6, 5.1, -5]}
        delay={2.8}
        scale={0.78}
      />

      <FarmingDrone
        position={[0, 5.8, -9]}
        delay={5}
        scale={0.62}
      />

      {/* Holograms */}
      <HolographicEarth />
      <HologramRing />
      <HologramCube />

      {/* Floating data */}
      <FloatingData />

      {/* Trees */}
      <Tree position={[-10, 0, -5]} scale={0.8} />
      <Tree position={[10, 0, -5]} scale={0.9} />
      <Tree position={[-9, 0, -9]} scale={0.65} />
      <Tree position={[9, 0, -9]} scale={0.7} />

      {/* Atmospheric particles */}
      <Sparkles
        count={100}
        scale={[25, 10, 22]}
        size={1.3}
        speed={0.25}
        opacity={0.45}
        color="#6affb4"
      />

      <Rain />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
    </>
  );
}

/* =========================================================
   BACKGROUND 3D
========================================================= */

export default function Background3D() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#03140b]">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        camera={{
          position: [0, 6.5, 16],
          fov: 48,
        }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#03140b");

          scene.fog = new THREE.Fog(
            "#03140b",
            18,
            48
          );
        }}
      >
        <ResponsiveCamera />
        <MouseCamera />
        <Scene />
      </Canvas>

      {/* =====================================================
          SOFT VIGNETTE - REDUCED DARKNESS
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.18) 100%)",
        }}
      />

      {/* =====================================================
          BOTTOM FADE - LIGHTER
      ===================================================== */}

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-[22%]"
        style={{
          background:
            "linear-gradient(to bottom, transparent, rgba(1,12,7,0.58))",
        }}
      />

      {/* =====================================================
          TOP SOFT GLOW
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[25%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(4,35,20,0.18), transparent)",
        }}
      />
    </div>
  );
}