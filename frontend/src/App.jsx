import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-dvh bg-bg">
      <header className="bg-white shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">
            Voice Shopping
          </h1>
          <span className="text-sm text-text-light">for Bharat</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-text mb-4">
            Welcome to Voice Shopping
          </h2>
          <p className="text-text-light text-lg">
            Shop using your voice in Hindi, Tamil, Telugu & more
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
