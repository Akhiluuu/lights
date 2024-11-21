import { useLightStore } from '../stores/lightStore'

export function TransformPanel() {
  const { selectedLight, lights, updateLightTransform } = useLightStore()
  const light = lights.find(l => l.id === selectedLight)

  if (!light) return null

  const handleChange = (property, axis, value) => {
    const numValue = parseFloat(value) || 0 // Prevent NaN values
    const newTransform = { [property]: [...light[property]] }
    newTransform[property][axis] = numValue
    updateLightTransform(light.id, newTransform)
  }

  return (
    <div className="mb-4 bg-gray-700 p-4 rounded">
      <h3 className="text-lg mb-2">Transform</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm">Location</label>
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="flex items-center mt-1">
              <span className="w-8">{axis}</span>
              <input
                type="number"
                value={light.position[i] || 0}
                onChange={(e) => handleChange('position', i, e.target.value)}
                className="bg-gray-600 px-2 py-1 rounded w-24"
                step="0.1"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm">Rotation</label>
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="flex items-center mt-1">
              <span className="w-8">{axis}</span>
              <input
                type="number"
                value={light.rotation[i] || 0}
                onChange={(e) => handleChange('rotation', i, e.target.value)}
                className="bg-gray-600 px-2 py-1 rounded w-24"
                step="0.1"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm">Scale</label>
          {['X', 'Y', 'Z'].map((axis, i) => (
            <div key={axis} className="flex items-center mt-1">
              <span className="w-8">{axis}</span>
              <input
                type="number"
                value={light.scale[i] || 1}
                onChange={(e) => handleChange('scale', i, e.target.value)}
                className="bg-gray-600 px-2 py-1 rounded w-24"
                step="0.1"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}