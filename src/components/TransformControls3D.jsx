import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useLightStore } from '../stores/lightStore'
import { useTransformStore } from '../stores/transformStore'
import { useHistoryStore } from '../stores/historyStore'

export function TransformControls3D() {
  const { selectedLight, updateLightTransform } = useLightStore()
  const { transformMode } = useTransformStore()
  const { pushState } = useHistoryStore()
  const { scene, camera } = useThree()
  const controlsRef = useRef()
  const isDragging = useRef(false)

  // Handle light object attachment
  useEffect(() => {
    if (!selectedLight || !controlsRef.current) return

    const obj = scene.getObjectByName(selectedLight)
    if (obj) {
      controlsRef.current.attach(obj)
    }

    return () => {
      if (controlsRef.current && controlsRef.current.object) {
        controlsRef.current.detach()
      }
    }
  }, [selectedLight, scene])

  // Handle orbit controls interaction
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return

    const handleMouseDown = () => {
      isDragging.current = true
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    controls.addEventListener('mouseDown', handleMouseDown)
    controls.addEventListener('mouseUp', handleMouseUp)
    
    return () => {
      controls.removeEventListener('mouseDown', handleMouseDown)
      controls.removeEventListener('mouseUp', handleMouseUp)
    }
  }, [])

  const handleTransformStart = () => {
    pushState()
  }

  const handleTransformChange = () => {
    if (!selectedLight || !isDragging.current) return

    const obj = scene.getObjectByName(selectedLight)
    if (obj) {
      const position = obj.position.toArray()
      const rotation = obj.rotation.toArray()
      const scale = obj.scale.toArray()

      updateLightTransform(selectedLight, {
        position: position.map(v => Number.isFinite(v) ? v : 0),
        rotation: rotation.map(v => Number.isFinite(v) ? v : 0),
        scale: scale.map(v => Number.isFinite(v) ? Math.max(0.1, v) : 1)
      })
    }
  }

  if (!selectedLight) return null

  return (
    <TransformControls
      ref={controlsRef}
      mode={transformMode}
      onObjectChange={handleTransformChange}
      onDragStart={handleTransformStart}
      size={1}
      showX={true}
      showY={true}
      showZ={true}
      space="world"
      camera={camera}
      rotationSnap={Math.PI / 24}
      translationSnap={0.25}
      scaleSnap={0.1}
    />
  )
}