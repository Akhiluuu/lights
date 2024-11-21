import { Grid, OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import { LightManager } from './LightManager'
import { ModelLoader } from './ModelLoader'
import { useLightStore } from '../stores/lightStore'
import { TransformControls3D } from './TransformControls3D'
import * as THREE from 'three'

export function Scene() {
  const { camera, scene } = useThree()
  const { selectedLight, selectLight } = useLightStore()

  useEffect(() => {
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)
    
    // Set scene background color to match Blender's default
    scene.background = new THREE.Color('#232323')
    scene.fog = new THREE.Fog('#232323', 20, 100)

    // Handle background click for deselection
    const handleBackgroundClick = (event) => {
      if (event.intersections.length === 0) {
        selectLight(null)
      }
    }

    scene.addEventListener('click', handleBackgroundClick)
    return () => scene.removeEventListener('click', handleBackgroundClick)
  }, [camera, scene, selectLight])

  return (
    <>
      <OrbitControls 
        makeDefault 
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />
      
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        cellColor="#404040"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#808080"
        fadeDistance={50}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />
      
      <ambientLight intensity={0.1} />
      
      <LightManager />
      
      {selectedLight && <TransformControls3D />}

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisColors={['#ff3653', '#8adb00', '#2979ff']} />
      </GizmoHelper>

      <Suspense fallback={null}>
        <ModelLoader />
      </Suspense>
    </>
  )
}