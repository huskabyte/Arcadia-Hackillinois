'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh, Texture, TextureLoader } from 'three';
import * as THREE from 'three';
import mergeImages from 'merge-images';
import { io } from "socket.io-client";
import { DrawCreature, FBXModel } from './render/creature';
import { DrawGameField, InternalTile, Tile } from './render/board';

export const tilescale = 70;
export const cardScale = 70;
export const x = 3
export const y = 4

const socket = io('http://10.194.169.21:8080');

export default function App() {

  const [field, setField] = useState<any>([]);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("connected!")
      socket.emit("fieldupdate", "")
    }

    function onDisconnect() {
      console.log("disconnected!")
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("creatureUpdate", async (gamestate) => {
      let jsoncontent = await JSON.parse(gamestate);
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

        <DrawGameField select={select} textures={textures} socket={socket}></DrawGameField>

        {field.length != 0 && field.map((obj: any,) => {
          return(<DrawCreature key={obj.uuid} creature={obj} position={[(obj.x-6)*tilescale + obj.y*tilescale - Math.ceil((obj.x-6)/2)*tilescale, 0, obj.y*tilescale - Math.ceil((obj.x-6)/2)*tilescale]}></DrawCreature>)
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
