import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'

import '../index.css'

function About() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>About Page</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          About Page - Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <h1>Test About Page</h1>
    <About />
  </StrictMode>,
)
