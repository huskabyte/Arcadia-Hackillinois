import { useRef, useState } from "react"
import { Mesh } from "three"
import { tilescale, x, y } from "../page"
import { useFrame } from "@react-three/fiber"

export function Tile(props: any) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHover] = useState(false)

  return (
    <mesh
      {...props}
      ref={meshRef}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxGeometry args={[tilescale, tilescale, tilescale]} />
      <meshStandardMaterial map={props.map} color={props.valid ? `${hovered ? "rgb(100%, 50%, 50%)" : 'rgb(100%, 50%, 100%)'}` : "rgb(90%, 90%, 90%)"} />
    </mesh>
  )
}

export function InternalTile(props: any){
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
      <meshStandardMaterial map={props.map} color={props.valid ? `${hovered ? "rgb(100%, 50%, 50%)" : 'rgb(100%, 50%, 100%)'}` : "rgb(90%, 90%, 90%)"} />
    </mesh>
  )
}

export function DrawGameField(props: any){
    const board = genGameField(x, y);
    return(
        <>
        {board[0].map(arr => {
          return(<InternalTile valid={props.moves.includes(`${arr[4]} ${arr[5]}`)} map={props.textures[arr[3]]} onClick={() => {
            if(!props.moves.includes(`${arr[4]} ${arr[5]}`))return;
            props.socket.emit("action", {
              index: props.select,
              card: (props.cards.hand != null && props.select >= 0) ? props.cards.hand[props.select] : null,
              x: arr[4],
              y: arr[5]
            })
            console.log("action emitted!")
          }} position={[arr[0], arr[1], arr[2]]} key={`${arr[4]} ${arr[5]}`}></InternalTile>)
        })}
        {board[1].map(arr => {
          return(<Tile valid={props.moves.includes(`${arr[4]} ${arr[5]}`)} map={props.textures[arr[3]]} onClick={() => {
            if(!props.moves.includes(`${arr[4]} ${arr[5]}`))return;
            props.socket.emit("action", {
              index: props.select,
              card: (props.cards.hand != null && props.select >= 0) ? props.cards.hand[props.select] : null,
              x: arr[4],
              y: arr[5]
            })
            console.log("action emitted!")
          }} position={[arr[0], arr[1], arr[2]]} key={`${arr[4]} ${arr[5]}`}></Tile>)
        })}
        </>
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