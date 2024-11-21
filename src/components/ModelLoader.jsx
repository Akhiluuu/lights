import { useCallback, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { TextureLoader } from 'three'
import * as THREE from 'three'

export function ModelLoader() {
  const groupRef = useRef()
  const { camera, scene } = useThree()

  const loadTexture = (url) => {
    return new Promise((resolve, reject) => {
      const textureLoader = new TextureLoader()
      textureLoader.load(url, resolve, undefined, reject)
    })
  }

  const loadModel = useCallback(async (file, loader) => {
    const url = URL.createObjectURL(file)
    
    try {
      const result = await new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject)
      })

      if (groupRef.current) {
        // Clear existing models
        while (groupRef.current.children.length > 1) {
          const child = groupRef.current.children[1]
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose())
            } else {
              child.material.dispose()
            }
          }
          groupRef.current.remove(child)
        }
        
        const model = result.scene || result
        
        // Handle textures for different model types
        model.traverse(async (child) => {
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
            
            if (child.material) {
              // Handle material maps
              if (child.material.map) {
                try {
                  const texture = await loadTexture(child.material.map.image.src)
                  child.material.map = texture
                  child.material.needsUpdate = true
                } catch (error) {
                  console.warn('Failed to load texture:', error)
                }
              }
              
              child.material.side = THREE.DoubleSide
              child.material.needsUpdate = true
            }
          }
        })
        
        // Center and scale the model
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        
        model.position.copy(center).multiplyScalar(-1)
        model.scale.multiplyScalar(scale)
        
        groupRef.current.add(model)

        // Position camera to view the model
        const distance = maxDim * 2
        camera.position.set(distance, distance, distance)
        camera.lookAt(0, 0, 0)
      }
    } catch (error) {
      console.error('Error loading model:', error)
      alert('Error loading model. Please try another file.')
    } finally {
      URL.revokeObjectURL(url)
    }
  }, [camera])

  useEffect(() => {
    const input = document.getElementById('model-upload')
    if (!input) return

    const handleUpload = (event) => {
      const file = event.target.files[0]
      if (!file) return

      const extension = file.name.split('.').pop().toLowerCase()
      
      // Initialize loaders
      const gltfLoader = new GLTFLoader()
      const dracoLoader = new DRACOLoader()
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/')
      gltfLoader.setDRACOLoader(dracoLoader)
      
      const fbxLoader = new FBXLoader()
      const objLoader = new OBJLoader()

      // Choose loader based on file extension
      switch (extension) {
        case 'glb':
        case 'gltf':
          loadModel(file, gltfLoader)
          break
        case 'fbx':
          loadModel(file, fbxLoader)
          break
        case 'obj':
          loadModel(file, objLoader)
          break
        default:
          alert('Unsupported file format. Please use GLB files.')
      }
    }

    input.addEventListener('change', handleUpload)
    return () => input.removeEventListener('change', handleUpload)
  }, [loadModel])

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh receiveShadow position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </group>
  )
}