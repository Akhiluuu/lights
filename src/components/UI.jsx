import { useLightStore } from '../stores/lightStore'
import { LightProperties } from './LightProperties'
import { TransformPanel } from './TransformPanel'

export function UI() {
  const { lights, removeLight, selectedLight, selectLight } = useLightStore()

  return (
    <div className="w-1/4 bg-gray-800 text-white p-4 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-lg mb-2">Scene Lights</h3>
        {lights.map(light => (
          <div
            key={light.id}
            className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
              selectedLight === light.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => selectLight(light.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {light.type === 'point' && '💡'}
                  {light.type === 'spot' && '🔦'}
                  {light.type === 'directional' && '☀️'}
                  {light.type === 'area' && '⬜'}
                </span>
                <span className="capitalize">{light.type} Light</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeLight(light.id)
                }}
                className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedLight && (
        <>
          <TransformPanel />
          <LightProperties />
        </>
      )}
    </div>
  )
}