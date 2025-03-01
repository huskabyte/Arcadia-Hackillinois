'use client'

import { useEffect, useRef, useState } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export function FBXModel(props: any) {
    const fbx = useLoader(FBXLoader, '/models/sittingLaughing.fbx')
    const mixerRef = useRef<THREE.AnimationMixer | null>(null)
    const motionRef = useRef<any>(null)

    useEffect(() => {
        console.log("FBX Animations:", fbx.animations);

        if (fbx.animations.length > 0) {
            mixerRef.current = new THREE.AnimationMixer(fbx)

            // Use the valid animation (index 1) instead of the first one
            const animationClip = fbx.animations.find(anim => anim.duration > 0) || fbx.animations[0];
            console.log("Playing animation:", animationClip.name);

            const action = mixerRef.current.clipAction(animationClip)
            action.setLoop(THREE.LoopRepeat, Infinity)
            action.clampWhenFinished = false
            action.play()
        }
    }, [fbx])
    
    useFrame((_, delta) => {
        if (mixerRef.current) {
            mixerRef.current.update(delta);
        }
        if(fbx.position.x - props.position[0] > 5 || fbx.position.x - props.position[0] < -5){
            if(fbx.position.x < props.position[0]){
                fbx.position.x += 1
            }else{
                fbx.position.x -= 1
            }
        }
        if(fbx.position.z - props.position[2] > 5 || fbx.position.z - props.position[2] < -5){
            if(fbx.position.z < props.position[2]){
                fbx.position.z += 1
            }else{
                fbx.position.z -= 1
            }
        }
    });

    fbx.scale.set(1, 1, 1)
    return <primitive ref={motionRef} position={[0, 0, 0]} object={fbx} />
}

export function DrawCreature(props: any){
    if(props.creature == null){
      return null;
    }
    return (
      <FBXModel position={[props.position[0], props.position[1], props.position[2]]}>
      </FBXModel>
    )
}