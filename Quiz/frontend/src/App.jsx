import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
        <h1 className="text-4xl font-bold mb-4 text-center bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Quiz Management
        </h1>
        <p className="text-gray-400 text-center mb-8">
          React + Tailwind CSS is successfully integrated!
        </p>
        
        <div className="flex flex-col items-center gap-6">
          <div className="text-6xl font-mono bg-gray-900 px-6 py-4 rounded-lg border border-gray-700 shadow-inner">
            {count}
          </div>
          
          <button
            onClick={() => setCount((count) => count + 1)}
            className="w-full py-3 px-6 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            Increment Count
          </button>
          
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 text-center">
              <span className="block text-sm text-gray-400">Framework</span>
              <span className="font-semibold text-blue-400">React 19</span>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 text-center">
              <span className="block text-sm text-gray-400">Styling</span>
              <span className="font-semibold text-purple-400">Tailwind 4</span>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="mt-12 text-gray-500 text-sm">
        Powered by Vite + Antigravity
      </footer>
    </div>
  )
}

export default App
