'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh } from 'three';

const tilescale = 50;

export default function App() {
  

  // camera.position.set( 20, 20, 20 );
  // camera.rotation.order = 'YXZ';
  // camera.rotation.y = - Math.PI / 4;
  // camera.rotation.x = Math.atan( - 1 / Math.sqrt( 2 ) );

  return (
    <div id="canvas-container" className="w-screen h-screen">
      <Canvas 
        orthographic={true} 
        camera={{position: [100, 100, 100], rotation: [Math.atan( - 1 / Math.sqrt( 2 ) ), Math.PI/4, 0, 'YXZ']}}
      >
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[500, 1000, 0]} decay={0} intensity={Math.PI} />

        <InternalTile position={[0, 50, 0]}></InternalTile>
        <Tile position={[tilescale, 0, 0]}></Tile>
        <Tile position={[0, 0, tilescale]}></Tile>
        
      </Canvas>
    </div>
  )
}

function Tile(props: any) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)

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

function InternalTile(props: any){
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)
  const [finpos, setFinpos] = useState(false);

  useFrame((state, delta) => {
    if(meshRef.current == null)return;
    meshRef.current.rotation.x = -Math.PI/2
    if(!finpos){
      meshRef.current.position.y -= tilescale/2;
      setFinpos(true);
    }
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <planeGeometry args={[tilescale, tilescale]} />
      <meshStandardMaterial color={hovered ? "rgb(100%, 50%, 50%)" : 'rgb(90%, 90%, 90%)'} />
    </mesh>
  )
}