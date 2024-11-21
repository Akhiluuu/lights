import { useLightStore } from '../stores/lightStore'

export function LightProperties() {
  const { selectedLight, lights, updateLightProperties } = useLightStore()
  const light = lights.find(l => l.id === selectedLight)

  if (!light) return null

  const handleChange = (property, value) => {
    updateLightProperties(light.id, { [property]: value })
  }

  return (
    <div className="mb-4 bg-gray-700 p-4 rounded">
      <h3 className="text-lg mb-2">Light Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm">Color</label>
          <input
            type="color"
            value={light.color}
            onChange={(e) => handleChange('color', e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label className="block text-sm">Power</label>
          <input
            type="number"
            value={light.power}
            onChange={(e) => handleChange('power', parseFloat(e.target.value))}
            className="bg-gray-600 px-2 py-1 rounded w-24 mt-1"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm">Radius</label>
          <input
            type="number"
            value={light.radius}
            onChange={(e) => handleChange('radius', parseFloat(e.target.value))}
            className="bg-gray-600 px-2 py-1 rounded w-24 mt-1"
            step="0.1"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={light.softFalloff}
            onChange={(e) => handleChange('softFalloff', e.target.checked)}
            id="softFalloff"
          />
          <label htmlFor="softFalloff" className="text-sm">Soft Falloff</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={light.shadow}
            onChange={(e) => handleChange('shadow', e.target.checked)}
            id="shadow"
          />
          <label htmlFor="shadow" className="text-sm">Shadow</label>
        </div>

        <div>
          <h4 className="text-sm font-bold mb-2">Ray Visibility</h4>
          {['diffuse', 'glossy', 'transmission', 'volumeScatter'].map(prop => (
            <div key={prop} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={light.rayVisibility?.[prop] ?? true}
                onChange={(e) => handleChange('rayVisibility', {
                  ...light.rayVisibility,
                  [prop]: e.target.checked
                })}
                id={prop}
              />
              <label htmlFor={prop} className="text-sm capitalize">
                {prop.replace(/([A-Z])/g, ' $1').trim()}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}