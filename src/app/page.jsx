'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'

const tilescale = 100;

export default function App() {

  return (
    <div id="canvas-container" className="w-screen h-screen">
      <Canvas orthographic={true}>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
        <Tile position={[0, -100, -tilescale*2]} />
        <Tile position={[-tilescale, -100, -tilescale*2]} />
        <Tile position={[tilescale, -100, -tilescale*2]} />
      </Canvas>
    </div>
  )
}

function Tile(props) {
  const meshRef = useRef()
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if(meshRef.current.rotation.x < 0.5){
      if(Math.random() < 0.5){
        meshRef.current.rotation.x+=0.01;
      }
    }
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[tilescale, tilescale, tilescale]} />
      <meshStandardMaterial color={hovered ? "rgb(100%, 50%, 50%)" : 'rgb(90%, 90%, 90%)'} />
    </mesh>
  )
}