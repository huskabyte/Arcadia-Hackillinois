'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh, Texture, TextureLoader } from 'three';
import * as THREE from 'three';
import Image from 'next/image'

const tilescale = 70;
const cardScale = 70;
const x = 3
const y = 4

export default function App() {

  const tile = useLoader(TextureLoader, '/textures/tile.jpg')
  const textures: Texture[] = []
  textures.push(tile);
  const board = genGameField(x, y);

  const [cards, setCards] = useState(['f0003']);

  const action = useState(null);
  return (
    <div id="canvas-container" className="w-screen h-screen text-center items-center justify-center">
      <Canvas 
        orthographic={true} 
        camera={{position: [tilescale * y + cardScale, tilescale * (1/4 * y), tilescale * y + cardScale], rotation: [Math.atan( - 1 / Math.sqrt( 2 ) ), Math.PI/4, 0, 'YXZ']}}
      >
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[500, 1000, 0]} decay={0} intensity={Math.PI} />

        {board[0].map(arr => {
          return(<InternalTile map={textures[arr[3]]} position={[arr[0], arr[1], arr[2]]} key={`${arr[0]} ${arr[1]} ${arr[2]}`}></InternalTile>)
        })}
        {board[1].map(arr => {
          return(<Tile map={textures[arr[3]]} position={[arr[0], arr[1], arr[2]]} key={`${arr[0]} ${arr[1]} ${arr[2]}`}></Tile>)
        })}

        <Card></Card>
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
      <meshStandardMaterial map={props.map} color={hovered ? "rgb(100%, 50%, 50%)" : 'rgb(90%, 90%, 90%)'} />
    </mesh>
  )
}

function InternalTile(props: any){
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if(meshRef.current == null)return;
    meshRef.current.rotation.x = -Math.PI/2
    if(meshRef.current.position.y < props.position[1] + tilescale/2){
      if(Math.random() < 0.5){
        meshRef.current.position.y += 1;
      }
    }
  })

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <planeGeometry args={[tilescale, tilescale]} />
      <meshStandardMaterial map={props.map} color={hovered ? "rgb(100%, 50%, 50%)" : 'rgb(90%, 90%, 90%)'} />
    </mesh>
  )
}

function genGameField(x: number, y: number){
  let ret: number[][] = [];
  let lastrow: number[][] = [];
    for(let i = 0; i < y; i++){
      if(i == y-1){
        lastrow.push([i*tilescale, 0, i*tilescale, 0]);
      }else{
        ret.push([i*tilescale, 0, i*tilescale, 0]);
      }
    }
    
    x*=2;

    for(let i = 1; i < x+1; i++){
      for(let j = 0 - i%2; j < y - i%2; j++){
        if(j == y-1){
          lastrow.push([i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0, j*tilescale - (Math.floor(i/2))*tilescale, 0]);
          lastrow.push([j*tilescale - (Math.floor(i/2))*tilescale, 0, i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0]);
        }else{
          ret.push([i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0, j*tilescale - (Math.floor(i/2))*tilescale, 0]);
          ret.push([j*tilescale - (Math.floor(i/2))*tilescale, 0, i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0]);
        }
      }
    }

  console.log(ret)
  console.log(lastrow);

  return [ret, lastrow];
}

function Card(props: any){
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)

  const texture = useLoader(TextureLoader, '/textures/cards/f/base.png')

  useFrame((state, delta) => {
    if(meshRef.current == null)return;
    
  })

  return(
    <mesh
      {...props}
      ref={meshRef}
      rotation={[Math.atan( - 1 / Math.sqrt( 2 ) ), Math.PI/4, 0, 'XYZ']}
      position={[tilescale * y, -cardScale * 2 ,tilescale * y]}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[2 * cardScale, 3 * cardScale, 0]}/>
      <meshStandardMaterial map={texture} color={hovered ? "rgb(100%, 50%, 50%)" : 'rgb(90%, 90%, 90%)'} />
    </mesh>
  )
}

// function hudmaybe(){
//   return(
//     <div>
//     <div className="fixed w-1/4 h-1/4 bottom-0 left-1/6">
//     <img className="h-full" src="/textures/cards/f.png"/>
//   </div>
//   <div className="fixed w-1/2 h-1/6 bg-[url(/textures/scroll.webp)] bg-cover bottom-0 right-1/4">
//   </div>
//   <div className="fixed w-1/4 h-1/4 bottom-0 left-3/4">
//     <img className="h-full" src="/textures/cards/f.png"/>
//   </div>
//   </div>
//   )
// }