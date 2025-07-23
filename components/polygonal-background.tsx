"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points } from "@react-three/drei/core/Points"
import { PointMaterial } from "@react-three/drei/core/PointMaterial"
import type * as THREE from "three"

function PolygonalPoints() {
  const ref = useRef<THREE.Points>(null!)
  const mouseRef = useRef({ x: 0, y: 0 })

  // Add mouse move listener
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(2000 * 3)

    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 10
      const y = (Math.random() - 0.5) * 10
      const z = (Math.random() - 0.5) * 10

      positions.set([x, y, z], i * 3)
    }

    return positions
  }, [])

  useFrame((state) => {
    if (ref.current) {
      // Base rotation
      ref.current.rotation.x = state.clock.elapsedTime * 0.05
      ref.current.rotation.y = state.clock.elapsedTime * 0.075

      // Add mouse influence
      ref.current.rotation.x += mouseRef.current.y * 0.1
      ref.current.rotation.y += mouseRef.current.x * 0.1

      // Add subtle position offset based on mouse
      ref.current.position.x = mouseRef.current.x * 0.5
      ref.current.position.y = mouseRef.current.y * 0.3
    }
  })

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#E2773A" size={0.005} sizeAttenuation={true} depthWrite={false} opacity={0.8} />
    </Points>
  )
}

function AnimatedMesh() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1 + mouseRef.current.y * 0.2
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15 + mouseRef.current.x * 0.2
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.5 + mouseRef.current.y * 0.3
      meshRef.current.position.x = mouseRef.current.x * 0.2
    }
  })

  return (
    <mesh ref={meshRef} scale={1.5}>
      <icosahedronGeometry args={[1, 4]} />
      <meshStandardMaterial
        color="#214F5F"
        transparent
        opacity={0.6}
        wireframe
        emissive="#E2773A"
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}

export function PolygonalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 polygonal-bg" />

      {/* Geometric overlay pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 40%, rgba(226, 119, 58, 0.1) 40%, rgba(226, 119, 58, 0.1) 60%, transparent 60%),
            linear-gradient(-30deg, transparent 40%, rgba(255, 203, 104, 0.1) 40%, rgba(255, 203, 104, 0.1) 60%, transparent 60%)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#E2773A" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FFCB68" />

        <PolygonalPoints />
        <AnimatedMesh />
      </Canvas>
    </div>
  )
}
