"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Float,
  Sparkles,
  Stars,
  Cloud,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  GROUND                                                             */
/* ------------------------------------------------------------------ */

function Ground({
  color = "#2f8a4d",
}: {
  color?: string;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 200]} />

      <meshStandardMaterial
        color={color}
        roughness={0.85}
        metalness={0}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  FARM FIELD                                                         */
/* ------------------------------------------------------------------ */

function FieldPlane({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number];
  color: string;
}) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      receiveShadow
    >
      <planeGeometry args={size} />

      <meshStandardMaterial
        color={color}
        roughness={0.78}
        metalness={0}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  CROP ROW                                                           */
/* ------------------------------------------------------------------ */

function CropRow({
  position,
  count = 8,
  color = "#54e873",
}: {
  position: [number, number, number];
  count?: number;
  color?: string;
}) {
  const cropRotations = useMemo(
    () =>
      Array.from(
        { length: count },
        () => Math.random() * Math.PI
      ),
    [count]
  );

  const offset = (count - 1) / 2;

  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.22, (i - offset) * 0.42]}
          rotation={[0, cropRotations[i], 0]}
          castShadow
        >
          <coneGeometry args={[0.11, 0.42, 5]} />

          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.25}
            roughness={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  TREE                                                               */
/* ------------------------------------------------------------------ */

function Tree({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.18, 0.8, 6]} />

        <meshStandardMaterial
          color="#6b3f25"
          roughness={0.9}
        />
      </mesh>

      <mesh position={[0, 1.15, 0]} castShadow>
        <coneGeometry args={[0.6, 1, 7]} />

        <meshStandardMaterial
          color="#1f9b4d"
          emissive="#0b3d20"
          emissiveIntensity={0.18}
          roughness={0.7}
        />
      </mesh>

      <mesh position={[0, 1.9, 0]} castShadow>
        <coneGeometry args={[0.44, 0.8, 7]} />

        <meshStandardMaterial
          color="#48c96d"
          emissive="#104d27"
          emissiveIntensity={0.12}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  MOUNTAIN                                                           */
/* ------------------------------------------------------------------ */

function Mountain({
  position,
  scale = 1,
  color = "#2d7850",
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  return (
    <mesh
      position={position}
      scale={scale}
      castShadow
    >
      <coneGeometry args={[4, 4.2, 5]} />

      <meshStandardMaterial
        color={color}
        flatShading
        roughness={0.75}
        metalness={0}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/*  AI SENSOR                                                          */
/* ------------------------------------------------------------------ */

function Sensor({
  position,
  color = "#22ff88",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <group
      position={[
        position[0],
        0,
        position[2],
      ]}
    >
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry
          args={[0.03, 0.05, 0.7, 6]}
        />

        <meshStandardMaterial
          color="#5e7f6b"
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>

      <mesh position={[0, 0.8, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2.5}
        />
      </mesh>

      <mesh
        position={[0, 0.8, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[0.16, 0.21, 24]} />

        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.75}
        />
      </mesh>

      <pointLight
        position={[0, 0.8, 0]}
        color={color}
        intensity={1.8}
        distance={4}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  ANIMATED CROP GROWTH                                               */
/* ------------------------------------------------------------------ */

function GrowthVisual() {
  const growRefs = useRef<(THREE.Mesh | null)[]>(
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    growRefs.current.forEach((bar, i) => {
      if (!bar) return;

      const s =
        0.4 +
        (Math.sin(t * 1.2 + i * 0.9) + 1) *
          0.3;

      bar.scale.y = THREE.MathUtils.clamp(
        s,
        0.3,
        1.4
      );
    });
  });

  return (
    <group position={[0, 0, -4]}>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            growRefs.current[i] = el;
          }}
          position={[(i - 4) * 0.7, 0.3, 0]}
        >
          <boxGeometry args={[0.28, 0.6, 0.28]} />

          <meshStandardMaterial
            color="#36ff96"
            emissive="#22ff88"
            emissiveIntensity={1}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  FLYING DRONE                                                       */
/* ------------------------------------------------------------------ */

function FramerDrone({
  position,
}: {
  position: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null!);

  const rotors = useRef<(THREE.Mesh | null)[]>(
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (!group.current) return;

    group.current.position.x =
      Math.sin(t * 0.3) * 3 + position[0];

    group.current.position.z =
      Math.cos(t * 0.3) * 3 + position[2];

    group.current.position.y =
      position[1] +
      Math.sin(t * 1.2) * 0.3;

    group.current.rotation.y = t * 0.5;

    rotors.current.forEach((r) => {
      if (r) {
        r.rotation.y = t * 10;
      }
    });
  });

  const rotorPositions: Array<
    [number, number, number]
  > = [
    [-0.42, 0.22, -0.42],
    [0.42, 0.22, -0.42],
    [-0.42, 0.22, 0.42],
    [0.42, 0.22, 0.42],
  ];

  return (
    <group
      ref={group}
      position={position}
      scale={0.9}
    >
      <mesh>
        <boxGeometry args={[0.6, 0.22, 0.6]} />

        <meshStandardMaterial
          color="#2b4f3a"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, -0.18, 0]}>
        <sphereGeometry args={[0.14, 12, 12]} />

        <meshStandardMaterial
          color="#22ff88"
          emissive="#22ff88"
          emissiveIntensity={3}
        />
      </mesh>

      <pointLight
        position={[0, -0.18, 0]}
        color="#22ff88"
        intensity={2}
        distance={5}
      />

      {rotorPositions.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <cylinderGeometry
              args={[0.035, 0.035, 0.07, 6]}
            />

            <meshStandardMaterial
              color="#5d806a"
              metalness={0.5}
              roughness={0.35}
            />
          </mesh>

          <mesh
            ref={(el) => {
              rotors.current[i] = el;
            }}
          >
            <boxGeometry
              args={[0.36, 0.02, 0.07]}
            />

            <meshStandardMaterial
              color="#9fcfb0"
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  FLOATING HOLOGRAM PANEL                                            */
/* ------------------------------------------------------------------ */

function HaloPanel({
  position,
  title,
  value,
  color = "#22ff88",
}: {
  position: [number, number, number];
  title: string;
  value: string;
  color?: string;
}) {
  return (
    <Float
      speed={2}
      rotationIntensity={0.3}
      floatIntensity={1.2}
    >
      <Html
        position={position}
        center
        distanceFactor={14}
        zIndexRange={[10, 0]}
      >
        <div
          className="pointer-events-none select-none rounded-xl border px-3 py-2 text-left backdrop-blur-xl sm:px-4"
          style={{
            borderColor: `${color}aa`,
            background: "rgba(6, 35, 22, 0.72)",
            boxShadow: `0 0 28px ${color}66, inset 0 0 14px ${color}22`,
          }}
        >
          <div
            className="text-[9px] uppercase tracking-widest sm:text-[10px]"
            style={{ color }}
          >
            {title}
          </div>

          <div className="text-sm font-bold text-white sm:text-base">
            {value}
          </div>
        </div>
      </Html>

      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.6, 0.34, 0.02]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/*  WEATHER HOLOGRAM                                                   */
/* ------------------------------------------------------------------ */

function WeatherHologram({
  position,
}: {
  position: [number, number, number];
}) {
  const sunRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!sunRef.current) return;

    sunRef.current.rotation.z =
      state.clock.elapsedTime * 0.2;
  });

  return (
    <group position={position}>
      <Cloud
        position={[0, 0.4, 0]}
        speed={0.2}
        opacity={0.5}
      />

      <mesh
        ref={sunRef}
        position={[-0.6, 0.5, 0]}
      >
        <torusGeometry
          args={[0.22, 0.02, 8, 32]}
        />

        <meshBasicMaterial
          color="#ffe08a"
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[-0.6, 0.5, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />

        <meshBasicMaterial color="#ffe08a" />
      </mesh>

      <pointLight
        position={[-0.6, 0.5, 0]}
        color="#ffd27d"
        intensity={1.2}
        distance={4}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  AI CROP NETWORK                                                    */
/* ------------------------------------------------------------------ */

function CropNetwork() {
  const nodes = useMemo(() => {
    const pts: [number, number, number][] = [];

    for (let i = 0; i < 18; i++) {
      pts.push([
        (Math.random() - 0.5) * 22,
        0.12 + Math.random() * 0.18,
        -2 - Math.random() * 10,
      ]);
    }

    return pts;
  }, []);

  const lines = useMemo(() => {
    const pts: number[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (
        let j = i + 1;
        j < nodes.length;
        j++
      ) {
        const d = Math.hypot(
          nodes[i][0] - nodes[j][0],
          nodes[i][2] - nodes[j][2]
        );

        if (d < 5.5) {
          pts.push(
            ...nodes[i],
            ...nodes[j]
          );
        }
      }
    }

    return new Float32Array(pts);
  }, [nodes]);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[lines, 3]}
          />
        </bufferGeometry>

        <lineBasicMaterial
          color="#38ff9c"
          transparent
          opacity={0.65}
        />
      </lineSegments>

      {nodes.map((p, i) => (
        <Float
          key={i}
          speed={1.5}
          floatIntensity={0.8}
        >
          <mesh position={p}>
            <sphereGeometry
              args={[0.07, 8, 8]}
            />

            <meshBasicMaterial color="#4cffaa" />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  VISIBLE MIST / FOG                                                 */
/* ------------------------------------------------------------------ */

function MistLayer({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  return (
    <group
      position={position}
      scale={scale}
    >
      <Cloud
        position={[0, 0, 0]}
        seed={12}
        segments={25}
        bounds={[5, 1.2, 2]}
        volume={4}
        color="#e8fff6"
        opacity={0.42}
        speed={0.05}
      />

      <Cloud
        position={[4, 0.2, 1]}
        seed={24}
        segments={20}
        bounds={[4, 1, 2]}
        volume={3}
        color="#d9f8e9"
        opacity={0.3}
        speed={0.04}
      />

      <Cloud
        position={[-4, 0.1, -1]}
        seed={36}
        segments={20}
        bounds={[4, 0.9, 2]}
        volume={3}
        color="#ffffff"
        opacity={0.28}
        speed={0.04}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  RESPONSIVE CAMERA                                                  */
/* ------------------------------------------------------------------ */

function ResponsiveCamera() {
  const { camera, size } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;

    const width = size.width;

    if (width < 480) {
      /* Small phones */
      cam.position.set(0, 3.4, 19);
      cam.fov = 68;
    } else if (width < 768) {
      /* Large phones / small tablets */
      cam.position.set(0, 3.3, 16.5);
      cam.fov = 63;
    } else if (width < 1100) {
      /* Tablets / small laptops */
      cam.position.set(0, 3.2, 13.5);
      cam.fov = 57;
    } else {
      /* Desktop */
      cam.position.set(0, 3.2, 12);
      cam.fov = 52;
    }

    cam.aspect =
      size.width / Math.max(size.height, 1);

    cam.updateProjectionMatrix();
  }, [camera, size.width, size.height]);

  return null;
}

/* ------------------------------------------------------------------ */
/*  CAMERA ANIMATION                                                   */
/* ------------------------------------------------------------------ */

function CameraRig({
  children,
}: {
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null!);
  const { size } = useThree();

  const pointer = useRef({
    x: 0,
    y: 0,
  });

  const target = useRef({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handlePointerMove = (
      event: PointerEvent
    ) => {
      pointer.current.x =
        (event.clientX / window.innerWidth - 0.5) *
        2;

      pointer.current.y =
        (event.clientY / window.innerHeight - 0.5) *
        2;
    };

    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );
    };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    const isMobile = size.width < 768;

    const parallaxStrength = isMobile
      ? 0.35
      : 0.75;

    target.current.x +=
      (pointer.current.x - target.current.x) *
      0.025;

    target.current.y +=
      (pointer.current.y - target.current.y) *
      0.025;

    group.current.position.x =
      Math.sin(t * 0.06) *
        (isMobile ? 0.45 : 0.8) +
      target.current.x * parallaxStrength;

    group.current.position.y =
      -0.1 +
      Math.sin(t * 0.1) * 0.15 -
      target.current.y *
        (isMobile ? 0.08 : 0.15);

    state.camera.lookAt(
      0,
      0.8,
      -5
    );
  });

  return (
    <group ref={group}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  RESPONSIVE SCENE                                                   */
/* ------------------------------------------------------------------ */

function ResponsiveScene() {
  const { size } = useThree();

  const scale =
    size.width < 480
      ? 0.68
      : size.width < 768
      ? 0.78
      : size.width < 1100
      ? 0.9
      : 1;

  return (
    <group scale={scale}>
      <CameraRig>
        {/* ========================================================== */}
        {/* MOUNTAINS                                                   */}
        {/* ========================================================== */}

        <Mountain
          position={[-16, 1, -22]}
          scale={1.9}
          color="#2d7850"
        />

        <Mountain
          position={[-8, 0.7, -24]}
          scale={1.5}
          color="#3c8b5d"
        />

        <Mountain
          position={[2, 1, -25]}
          scale={2.4}
          color="#286f49"
        />

        <Mountain
          position={[12, 0.8, -23]}
          scale={1.7}
          color="#438c61"
        />

        <Mountain
          position={[19, 1, -21]}
          scale={2}
          color="#337950"
        />

        {/* ========================================================== */}
        {/* GROUND                                                      */}
        {/* ========================================================== */}

        <Ground color="#2f8a4d" />

        {/* ========================================================== */}
        {/* FARM FIELDS                                                  */}
        {/* ========================================================== */}

        <FieldPlane
          position={[-6.5, 0, -5]}
          size={[9, 8]}
          color="#3e9c50"
        />

        <FieldPlane
          position={[5.5, 0, -6]}
          size={[9, 8]}
          color="#4ba856"
        />

        <FieldPlane
          position={[0, 0, -11]}
          size={[20, 7]}
          color="#378a47"
        />

        {/* ========================================================== */}
        {/* CROPS                                                        */}
        {/* ========================================================== */}

        <CropRow
          position={[-7, 0, -4.5]}
          count={8}
          color="#54e873"
        />

        <CropRow
          position={[-6, 0, -4.5]}
          count={8}
          color="#8dffad"
        />

        <CropRow
          position={[-6.5, 0, -6.5]}
          count={8}
          color="#39c95b"
        />

        <CropRow
          position={[-5, 0, -6.5]}
          count={8}
          color="#a8ffc4"
        />

        <CropRow
          position={[4.5, 0, -5.5]}
          count={8}
          color="#54e873"
        />

        <CropRow
          position={[5.5, 0, -5.5]}
          count={8}
          color="#8dffad"
        />

        <CropRow
          position={[5, 0, -7.5]}
          count={8}
          color="#39c95b"
        />

        <CropRow
          position={[6.5, 0, -7.5]}
          count={8}
          color="#a8ffc4"
        />

        {/* ========================================================== */}
        {/* TREES                                                        */}
        {/* ========================================================== */}

        <Tree
          position={[-11, 0, -3]}
          scale={1.4}
        />

        <Tree
          position={[-12.5, 0, -5]}
          scale={1.1}
        />

        <Tree
          position={[-10, 0, -7]}
          scale={1.5}
        />

        <Tree
          position={[11, 0, -4]}
          scale={1.4}
        />

        <Tree
          position={[12.5, 0, -6]}
          scale={1.2}
        />

        <Tree
          position={[10, 0, -8]}
          scale={1.6}
        />

        {/* ========================================================== */}
        {/* AI SENSORS                                                   */}
        {/* ========================================================== */}

        <Sensor
          position={[-6, 0, -4]}
        />

        <Sensor
          position={[5, 0, -6]}
          color="#00eaff"
        />

        <Sensor
          position={[-3.5, 0, -7]}
          color="#7dffd4"
        />

        <Sensor
          position={[7, 0, -4]}
        />

        <Sensor
          position={[0, 0, -8]}
          color="#00eaff"
        />

        {/* ========================================================== */}
        {/* AI NETWORK                                                   */}
        {/* ========================================================== */}

        <CropNetwork />

        {/* ========================================================== */}
        {/* GROWTH DATA                                                  */}
        {/* ========================================================== */}

        <GrowthVisual />

        {/* ========================================================== */}
        {/* HOLOGRAM PANELS                                               */}
        {/* ========================================================== */}

        <HaloPanel
          position={[-9, 2.2, -7]}
          title="Soil Health"
          value="87% · Optimal"
        />

        <HaloPanel
          position={[9, 2.4, -8]}
          title="Crop Yield"
          value="+12.4%"
          color="#7dffd4"
        />

        <HaloPanel
          position={[-10, 2.8, -10]}
          title="Irrigation"
          value="Auto · On"
          color="#00eaff"
        />

        {/* ========================================================== */}
        {/* WEATHER                                                      */}
        {/* ========================================================== */}

        <WeatherHologram
          position={[-12, 4, -12]}
        />

        {/* ========================================================== */}
        {/* DRONE                                                        */}
        {/* ========================================================== */}

        <FramerDrone
          position={[-6, 4.2, -6]}
        />

        {/* ========================================================== */}
        {/* VISIBLE MIST / FOG                                            */}
        {/* ========================================================== */}

        <MistLayer
          position={[-8, 2.2, -11]}
          scale={1.3}
        />

        <MistLayer
          position={[6, 2.5, -14]}
          scale={1.5}
        />

        <MistLayer
          position={[0, 2, -18]}
          scale={1.8}
        />

        {/* ========================================================== */}
        {/* PARTICLES                                                     */}
        {/* ========================================================== */}

        <Sparkles
          count={320}
          scale={[25, 14, 25]}
          size={2.8}
          speed={0.35}
          color="#d4ffe2"
          opacity={0.9}
        />

        {/* ========================================================== */}
        {/* SKY PARTICLES                                                */}
        {/* ========================================================== */}

        <Stars
          radius={60}
          depth={30}
          count={500}
          factor={2}
          fade
          speed={0.2}
        />

        {/* ========================================================== */}
        {/* HIGH CLOUDS                                                  */}
        {/* ========================================================== */}

        <Cloud
          position={[-8, 7, -15]}
          seed={10}
          segments={20}
          bounds={[5, 1, 2]}
          volume={3}
          color="#ffffff"
          opacity={0.32}
          speed={0.05}
        />

        <Cloud
          position={[8, 8, -18]}
          seed={20}
          segments={20}
          bounds={[5, 1, 2]}
          volume={3}
          color="#ffffff"
          opacity={0.28}
          speed={0.05}
        />

        {/* ========================================================== */}
        {/* SHADOWS                                                      */}
        {/* ========================================================== */}

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.28}
          scale={30}
          blur={3}
          far={8}
        />
      </CameraRig>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN FARMLAND COMPONENT                                            */
/* ------------------------------------------------------------------ */

export default function Farmland3D() {
  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 1.6,
        ease: "easeOut",
      }}
    >
      {/* Soft overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/5 via-transparent to-black/20" />

      {/* Very soft vignette */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,10,5,0.18)_100%)]" />

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: [0, 3.2, 12],
          fov: 52,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        {/* BRIGHT SKY */}
        <color
          attach="background"
          args={["#4c94b8"]}
        />

        {/* ATMOSPHERIC FOG */}
        <fog
          attach="fog"
          args={["#78b5c8", 20, 55]}
        />

        {/* ========================================================== */}
        {/* LIGHTING                                                     */}
        {/* ========================================================== */}

        <ambientLight intensity={1.5} />

        <hemisphereLight
          args={[
            "#c9efff",
            "#245a35",
            2.4,
          ]}
        />

        <directionalLight
          position={[-12, 16, 8]}
          intensity={4}
          color="#ffe6ad"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        <pointLight
          position={[0, 6, 0]}
          intensity={3}
          distance={30}
          color="#6dffb0"
        />

        <pointLight
          position={[-10, 5, -6]}
          intensity={2.5}
          distance={25}
          color="#56eaff"
        />

        <pointLight
          position={[12, 8, 5]}
          intensity={3.5}
          distance={30}
          color="#ffd27d"
        />

        <Suspense fallback={null}>
          <ResponsiveCamera />
          <ResponsiveScene />
        </Suspense>
      </Canvas>
    </motion.div>
  );
}