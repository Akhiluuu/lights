import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SpotLightHelper, PointLightHelper, DirectionalLightHelper } from 'three'
import { useLightStore } from '../stores/lightStore'

export function LightHelper({ light }) {
  const lightRef = useRef()
  const helperRef = useRef()
  const { scene } = useThree()
  const { selectedLight, selectLight } = useLightStore()

  // Handle light selection
  const handleClick = (e) => {
    e.stopPropagation()
    selectLight(light.id)
  }

  // Handle scene click for deselection
  useEffect(() => {
    const handleSceneClick = (e) => {
      if (!e.intersections.some(i => i.object.name === light.id)) {
        selectLight(null)
      }
    }
    scene.addEventListener('click', handleSceneClick)
    return () => scene.removeEventListener('click', handleSceneClick)
  }, [scene, light.id, selectLight])

  // Update light position and rotation
  useEffect(() => {
    if (lightRef.current) {
      lightRef.current.position.set(...light.position)
      lightRef.current.rotation.set(...light.rotation)
      lightRef.current.scale.set(...light.scale)
      
      if (lightRef.current.target) {
        const direction = new THREE.Vector3(0, 0, -1)
        direction.applyEuler(new THREE.Euler(...light.rotation))
        lightRef.current.target.position.copy(lightRef.current.position)
        lightRef.current.target.position.add(direction)
        lightRef.current.target.updateMatrixWorld()
      }
    }
  }, [light.position, light.rotation, light.scale])

  // Create and manage light helper
  useEffect(() => {
    if (!lightRef.current) return

    const isSelected = selectedLight === light.id
    if (!isSelected) {
      if (helperRef.current) {
        scene.remove(helperRef.current)
        helperRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
        helperRef.current = null
      }
      return
    }

    let helper
    switch (light.type) {
      case 'point':
        helper = new PointLightHelper(lightRef.current, 0.5, light.color)
        break
      case 'spot':
        helper = new SpotLightHelper(lightRef.current, light.color)
        break
      case 'directional':
        helper = new DirectionalLightHelper(lightRef.current, 0.5, light.color)
        break
      case 'area': {
        const geometry = new THREE.PlaneGeometry(1, 1)
        const material = new THREE.MeshBasicMaterial({
          wireframe: true,
          color: light.color,
          transparent: true,
          opacity: 0.5
        })
        helper = new THREE.Mesh(geometry, material)
        break
      }
    }

    if (helper) {
      helper.name = `helper-${light.id}`
      scene.add(helper)
      helperRef.current = helper

      // Add light visualization
      if (light.type !== 'area') {
        const coneLength = light.radius || 2
        const coneWidth = (light.type === 'spot' ? Math.tan(light.angle) : 0.5) * coneLength
        const rayGeometry = new THREE.ConeGeometry(coneWidth, coneLength, 32)
        const rayMaterial = new THREE.MeshBasicMaterial({
          color: light.color,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide,
          depthWrite: false
        })
        const rays = new THREE.Mesh(rayGeometry, rayMaterial)
        rays.rotation.x = Math.PI / 2
        rays.position.y = -coneLength / 2
        helper.add(rays)
      }
    }

    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current)
        helperRef.current.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }
    }
  }, [light.id, light.type, scene, light.color, light.radius, light.angle, selectedLight])

  // Update helper transform
  useEffect(() => {
    if (helperRef.current && lightRef.current) {
      helperRef.current.position.copy(lightRef.current.position)
      helperRef.current.rotation.copy(lightRef.current.rotation)
      helperRef.current.scale.copy(lightRef.current.scale)
      
      if (helperRef.current.update) {
        helperRef.current.update()
      }
    }
  }, [light.position, light.rotation, light.scale])

  const isSelected = selectedLight === light.id
  const intensity = light.power / 100

  switch (light.type) {
    case 'point':
      return (
        <pointLight
          ref={lightRef}
          name={light.id}
          position={light.position}
          rotation={light.rotation}
          intensity={intensity}
          color={light.color}
          distance={light.radius * 2}
          decay={light.softFalloff ? 2 : 1}
          castShadow={light.shadow}
          shadow-bias={-0.001}
          shadow-mapSize={[2048, 2048]}
          onClick={handleClick}
        >
          {isSelected && (
            <mesh>
              <sphereGeometry args={[0.2]} />
              <meshBasicMaterial color={light.color} />
            </mesh>
          )}
        </pointLight>
      )
    case 'spot':
      return (
        <spotLight
          ref={lightRef}
          name={light.id}
          position={light.position}
          rotation={light.rotation}
          intensity={intensity}
          color={light.color}
          angle={light.angle}
          penumbra={light.penumbra}
          distance={light.radius * 2}
          decay={light.softFalloff ? 2 : 1}
          castShadow={light.shadow}
          shadow-bias={-0.001}
          shadow-mapSize={[2048, 2048]}
          onClick={handleClick}
        >
          {isSelected && (
            <mesh>
              <coneGeometry args={[0.2, 0.4]} />
              <meshBasicMaterial color={light.color} />
            </mesh>
          )}
        </spotLight>
      )
    case 'directional':
      return (
        <directionalLight
          ref={lightRef}
          name={light.id}
          position={light.position}
          rotation={light.rotation}
          intensity={intensity}
          color={light.color}
          castShadow={light.shadow}
          shadow-bias={-0.001}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          onClick={handleClick}
        >
          {isSelected && (
            <mesh>
              <boxGeometry args={[0.3, 0.3, 0.3]} />
              <meshBasicMaterial color={light.color} />
            </mesh>
          )}
        </directionalLight>
      )
    case 'area':
      return (
        <rectAreaLight
          ref={lightRef}
          name={light.id}
          position={light.position}
          rotation={light.rotation}
          intensity={intensity}
          color={light.color}
          width={light.scale[0]}
          height={light.scale[1]}
          onClick={handleClick}
        >
          {isSelected && (
            <mesh>
              <planeGeometry args={[1, 1]} />
              <meshBasicMaterial color={light.color} side={THREE.DoubleSide} transparent opacity={0.5} />
            </mesh>
          )}
        </rectAreaLight>
      )
    default:
      return null
  }
}