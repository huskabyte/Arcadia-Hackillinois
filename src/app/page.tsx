'use client'

import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Mesh, Texture, TextureLoader } from 'three';
import * as THREE from 'three';
import mergeImages from 'merge-images';
import { io } from "socket.io-client";
import { DrawCreature, FBXModel } from './render/creature';
import { DrawGameField, InternalTile, Tile } from './render/board';
import {Oswald} from 'next/font/google'
import { getBalance, sendTransaction } from './solana/solanabroker';

export const tilescale = 70;
export const cardScale = 70;
export const x = 3
export const y = 4

const oswald = Oswald({
  subsets: ["latin"],
  weight: '400'
})

const socket = io('http://10.194.169.21:8080');

export default function App() {

  const [field, setField] = useState<any>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("connected!")
      socket.emit("fieldupdate", "")
      socket.emit("movesupdate", {
        index: -1,
        card: select,
        x: 0,
        y: 0
      })
      socket.emit("cardsupdate", {
        index: -1,
        card: select,
        x: 0,
        y: 0
      })
      const delayMessage = async () => {
        setTimeout(() => {
          setTurn(true);
        }, 4000);
      };
      delayMessage();
    }

    function onDisconnect() {
      console.log("disconnected!")
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("creatureUpdate", async (gamestate) => {
      let jsoncontent = await JSON.parse(gamestate);
      setField(jsoncontent);
      setBalance((await getBalance())/1000000000.0)
    })

    socket.on("moves", async (moves) => {
      let possible = await JSON.parse(moves);
      setPossibleMoves(possible);
    })

    socket.on("cards", async (cards) => {
      let crads = await JSON.parse(cards);
      setCards(crads);
      if(crads.hand.length == 0){
        socket.emit("cardsupdate", {
          index: -1,
          card: select,
          x: 0,
          y: 0
        })
      }
      setSelect(-1)
    })

    socket.on("done", () => {
      setTurn(true);
    })

    socket.on("kill", async () => {
      sendTransaction();
      setBalance((await getBalance())/1000000000.0)
    })

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const [select, setSelect] = useState<number>(-1);

  useEffect(() => {
    socket.emit("movesupdate", {
      index: -1,
      card: select >= 0 ? cards?.hand[select].substring(0, 5) : null,
      x: 0,
      y: 0
    });
  }, [select]);

  const tile = useLoader(TextureLoader, '/textures/tile.jpg')
  const textures: Texture[] = []
  textures.push(tile);
  const [cards, setCards] = useState<{hand: string[], deck: string, discard: string[], mana: number} | null>(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [turn, setTurn] = useState(false);

  const action = useState(null);
  return (
    <div id="canvas-container" className="w-screen h-screen text-center items-center justify-center bg-[url(/textures/background.png)] bg-cover">
      <Canvas 
        orthographic={true} 
        camera={{position: [tilescale * y + cardScale, tilescale * (1/4 * y), tilescale * y + cardScale], rotation: [Math.atan( - 1 / Math.sqrt( 2 ) ), Math.PI/4, 0, 'YXZ']}}
      >
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[500, 1000, 0]} decay={0} intensity={Math.PI} />

        <DrawGameField select={select} textures={textures} socket={socket} cards={cards} moves={turn ? possibleMoves : []}></DrawGameField>

        {field.length != 0 && field.map((obj: any,) => {
          return(<DrawCreature key={obj.creatureId} creature={obj} position={[(obj.x-6)*tilescale + obj.y*tilescale - Math.ceil((obj.x-6)/2)*tilescale, 0, obj.y*tilescale - Math.ceil((obj.x-6)/2)*tilescale]}></DrawCreature>)
        })}

        {cards!=null && cards.deck != "null" && <Card name={cards.deck + "0000"} x={- cardScale * 1.7 * 4}></Card>}

        {cards?.hand.map((card: any, index) => {
          console.log(card)
                return(
                  <Card key={card} name={card} selected={select == index} onClick={() => {
                    if(select == index){
                      setSelect(-1)
                    }else{
                      setSelect(index)
                    }
                  }} x={cardScale * 1.7 * index - cardScale * 1.7 * (cards.hand.length-1)/2} open={true}></Card>)
        })}
        {cards!= null && cards.discard.length > 0 && <Card name={cards.discard[cards.discard.length-1].charAt(0)} position={[tilescale * y + cardScale * 1.7 * 4, -cardScale * 3 ,tilescale * y - cardScale * 1.7 * 4]}></Card>}
      </Canvas>
      <a href="#" type="button" className={`w-60 h-12 fixed bottom-4 right-4 bg-black border-2 flex justify-center items-center transition ease-in-out hover:scale-110 hover:text-black hover:bg-white duration-300 rounded-xl ${oswald.className}`}
      onClick={() => {
        setTurn(false);
        socket.emit("turnend", "");
      }}
      >End Turn</a>
      <div className={`w-60 h-12 text-yellow-400 bg-yellow-600 fixed top-4 left-4 bg-black border-2 flex justify-center items-center transition ease-in-out hover:scale-110 duration-300 rounded-xl ${oswald.className}`}>{`Sol: ${balance.toFixed(3)}`}</div>
      <div className={`w-60 h-12 text-yellow-400 bg-yellow-600 fixed bottom-4 left-4 bg-black border-2 flex justify-center items-center transition ease-in-out hover:scale-110 duration-300 rounded-xl ${oswald.className}`}>{`Mana: ${cards?.mana}`}</div>
      <div className={`w-screen h-screen fixed top-0 ${turn ? "hidden" : ""}`}></div>
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
      await mergeImages([`/textures/cards/${props.name.charAt(0)}/base.png`, `/textures/cards/${props.name.charAt(0)}/cardart/${props.name.substring(1,5)}.png`, `/textures/cards/${props.name.charAt(0)}/overlay.png`]).then((b64) => {
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
    if(props.x != null && props.x > meshRef.current.position.x - tilescale * y)moveRight(3);
    if(props.x != null && props.x < meshRef.current.position.x - tilescale * y)moveLeft(3);
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
      position={props.position!=null ? props.position : [tilescale * y - cardScale * 1.7 * 4, -cardScale * 3 ,tilescale * y + cardScale * 1.7 * 4]}
      scale={hovered || props.selected ? 1.2 : 1}
      onPointerOver={(event) => setHover(props.open)}
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
