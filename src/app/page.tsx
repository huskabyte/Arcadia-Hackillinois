'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh, Texture, TextureLoader } from 'three';
import * as THREE from 'three';
import mergeImages from 'merge-images';
import { io } from "socket.io-client";
import { FBXModel } from './render/creature';

const tilescale = 70;
const cardScale = 70;
const x = 3
const y = 4

const socket = io('http://localhost:8080');

export default function App() {

  const [field, setField] = useState<any>([]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("connected!")
    }

    function onDisconnect() {
      console.log("disconnected!")
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("creatureUpdate", async (gamestate) => {
      let jsoncontent = await JSON.parse(gamestate);
      console.log(jsoncontent)
      setField(jsoncontent);
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const tile = useLoader(TextureLoader, '/textures/tile.jpg')
  const textures: Texture[] = []
  textures.push(tile);
  const board = genGameField(x, y);
  const [cards, setCards] = useState(['f0003']);
  const [select, setSelect] = useState<string | null>(null);

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
          return(<InternalTile map={textures[arr[3]]} onClick={() => {
            socket.emit("action", {
              card: select,
              x: arr[4],
              y: arr[5]
            })
            console.log("action emitted!")
          }} position={[arr[0], arr[1], arr[2]]} key={`${arr[4]} ${arr[5]}`}></InternalTile>)
        })}
        {board[1].map(arr => {
          return(<Tile map={textures[arr[3]]} onClick={() => {
            socket.emit("action", {
              card: select,
              x: arr[4],
              y: arr[5]
            })
            console.log("action emitted!")
          }} position={[arr[0], arr[1], arr[2]]} key={`${arr[4]} ${arr[5]}`}></Tile>)
        })}

        {field.length != 0 && field.map((arr: any, i: any) => {
          return(
            <>
              {arr.map((obj: any, j: any) => {
                  let xval = i-6;
                  let yval = j;
                  
                  
                  return(<DrawCreature creature={obj} position={[xval*tilescale + yval*tilescale - Math.ceil(xval/2)*tilescale, 0, yval*tilescale - Math.ceil(xval/2)*tilescale]}></DrawCreature>)
              })}
            </>
          )
        })}

        <Card name="f0004" selected={select == "f0004"} onClick={() => {
          if(select == "f0004"){
            setSelect(null)
          }else{
            setSelect("f0004")
          }
        }} x={10} open={true}></Card>
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
        lastrow.push([i*tilescale, 0, i*tilescale, 0, 0+x*2, i]);
      }else{
        ret.push([i*tilescale, 0, i*tilescale, 0, 0+x*2, i]);
      }
    }
    
    x*=2;

    for(let i = 1; i < x+1; i++){
      for(let j = 0 - i%2; j < y - i%2; j++){
        if(j == y-1){
          lastrow.push([i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0, j*tilescale - (Math.floor(i/2))*tilescale, 0, i + x, j + i%2]);
          lastrow.push([j*tilescale - (Math.floor(i/2))*tilescale, 0, i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0, -i + x, j + i%2]);
        }else{
          ret.push([i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0, j*tilescale - (Math.floor(i/2))*tilescale, 0, i + x, j + i%2]);
          ret.push([j*tilescale - (Math.floor(i/2))*tilescale, 0, i*tilescale + j*tilescale - (Math.floor(i/2))*tilescale, 0, -i + x, j + i%2]);
        }
      }
    }

  return [ret, lastrow];
}

function Card(props: any){
  const meshRef = useRef<Mesh>(null)
  const matRef = useRef<THREE.Material>(null)
  const [hovered, setHover] = useState(false)
  const [texture, setTexture] = useState(useLoader(TextureLoader, `/textures/cards/${props.name.charAt(0)}/base.png`))
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function getTexture() {
      await mergeImages([`/textures/cards/${props.name.charAt(0)}/base.png`, `/textures/cards/${props.name.charAt(0)}/cardart/${props.name.substring(1)}.png`, `/textures/cards/${props.name.charAt(0)}/overlay.png`]).then((b64) => {
        setTexture(useLoader(TextureLoader, b64))
        if(matRef.current != null){
          matRef.current.needsUpdate = true;
        }
        setLoaded(true);
      }).catch(() => {
        setLoaded(false);
        getTexture();
      })
    }
    if(!loaded){
      getTexture();
    }
  }, [])

  const back = useLoader(TextureLoader, `/textures/cards/${props.name.charAt(0)}.png`)

  const euler = new THREE.Euler(Math.atan( - 1 / Math.sqrt( 2 ) ), Math.PI/4, 0, 'YXZ');
  const quaternion = new THREE.Quaternion(0, 0, 0, 0);
  quaternion.setFromEuler(euler);
  euler.setFromQuaternion(quaternion, 'XZY');

  const moveLeft = (steps:number) => {
    if(meshRef.current == null)return;
    meshRef.current.position.x-=steps;
    meshRef.current.position.z+=steps;
  }

  const moveRight = (steps:number) => {
    if(meshRef.current == null)return;
    meshRef.current.position.z-=steps;
    meshRef.current.position.x+=steps;
  }

  const rotateRight = (steps:number) => {
    if(meshRef.current == null)return;
    meshRef.current.rotation.y+=steps
  }

  const rotateLeft = (steps:number) => {
    if(meshRef.current == null)return;
    meshRef.current.rotation.y-=steps
  }

  useFrame((state, delta) => {
    if(meshRef.current == null)return;
    if(props.x != null && props.x > meshRef.current.position.x)moveRight(1);
    if(props.x != null && props.x < meshRef.current.position.x)moveLeft(1);
    if(props.open != null && props.open){
      meshRef.current.rotation.y = euler.y
    }else{
      meshRef.current.rotation.y = euler.y + Math.PI
    }
  })

  return(
    <mesh
      {...props}
      ref={meshRef}
      rotation={[euler.x, euler.y, euler.z, 'XZY']}
      position={[tilescale * y, -cardScale * 3 ,tilescale * y]}
      scale={hovered || props.selected ? 1.2 : 1}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[2 * cardScale, 3 * cardScale, 0]}/>
      <meshStandardMaterial map={back} attach="material-0"/>
      <meshStandardMaterial map={back} attach="material-1"/>
      <meshStandardMaterial map={back} attach="material-2"/>
      <meshStandardMaterial map={back} attach="material-3"/>
      <meshStandardMaterial ref={matRef} map={texture} attach="material-4" color={props.selected ? "rgb(100%, 100%, 70%)" : "rgb(100%, 100%, 100%)"}/>
      <meshStandardMaterial map={back} attach="material-5" color={props.selected ? "rgb(100%, 100%, 70%)" : "rgb(100%, 100%, 100%)"} />
    </mesh>
  )
}

function DrawCreature(props: any){
  if(props.creature == null){
    return null;
  }
  return (
    <FBXModel position={[props.position[0], props.position[1], props.position[2]]}>
    </FBXModel>
  )
}
