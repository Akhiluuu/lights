import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'

const defaultRayVisibility = {
  diffuse: true,
  glossy: true,
  transmission: true,
  volumeScatter: true
}

const createDefaultLight = (type) => ({
  id: uuidv4(),
  type,
  position: [0, 5, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  power: 1000,
  color: '#ffffff',
  radius: 5,
  softFalloff: true,
  shadow: true,
  angle: Math.PI / 3,
  penumbra: 0.5,
  rayVisibility: { ...defaultRayVisibility },
  selected: false
})

export const useLightStore = create((set, get) => ({
  lights: [],
  selectedLight: null,

  addLight: (type) => {
    const light = createDefaultLight(type)
    set((state) => ({
      lights: [...state.lights, light],
      selectedLight: light.id
    }))
  },

  removeLight: (id) => set((state) => ({
    lights: state.lights.filter(light => light.id !== id),
    selectedLight: state.selectedLight === id ? null : state.selectedLight
  })),

  selectLight: (id) => set((state) => ({
    selectedLight: state.selectedLight === id ? null : id
  })),

  updateLightTransform: (id, transform) => {
    set((state) => ({
      lights: state.lights.map(light => {
        if (light.id !== id) return light

        const validateArray = (arr, defaultValue) => {
          if (!Array.isArray(arr)) return [defaultValue, defaultValue, defaultValue]
          return arr.map(v => isFinite(v) ? v : defaultValue)
        }

        return {
          ...light,
          position: validateArray(transform.position, 0),
          rotation: validateArray(transform.rotation, 0),
          scale: validateArray(transform.scale, 1).map(v => Math.max(0.1, v))
        }
      })
    }))
  },

  updateLightProperties: (id, properties) => {
    set((state) => ({
      lights: state.lights.map(light => {
        if (light.id !== id) return light

        const newLight = { ...light, ...properties }
        
        // Validate numeric properties
        if ('power' in properties) {
          newLight.power = Math.max(0, properties.power)
        }
        if ('radius' in properties) {
          newLight.radius = Math.max(0.1, properties.radius)
        }
        if ('angle' in properties) {
          newLight.angle = Math.max(0, Math.min(Math.PI, properties.angle))
        }
        if ('penumbra' in properties) {
          newLight.penumbra = Math.max(0, Math.min(1, properties.penumbra))
        }
        if ('rayVisibility' in properties) {
          newLight.rayVisibility = {
            ...defaultRayVisibility,
            ...properties.rayVisibility
          }
        }

        return newLight
      })
    }))
  }
}))