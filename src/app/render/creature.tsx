'use client'

import { useEffect, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

export function FBXModel(props: any) {
    const fbx = useLoader(FBXLoader, '/models/sittingLaughing.fbx')
    const mixerRef = useRef<THREE.AnimationMixer | null>(null)

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
            // console.log("Animation updated:", delta);
        }
    });
    

    // Adjust the model's scale and position
    fbx.scale.set(1, 1, 1) // Make sure it's a reasonable scale
    fbx.position.set(props.position[0], props.position[1], props.position[2]) // Make sure it's visible

    return <primitive object={fbx} />
}