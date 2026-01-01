import React, { useEffect, useState } from 'react'

const App: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0, click: 0 })

  useEffect(() => {
    // @ts-ignore
    window.api.onMousePulse((data: any) => {
      setMouse(data)
    })
  }, [])

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative',
      overflow: 'hidden',
      background: 'transparent'
    }}>
      {/* The Aura Ring */}
      <div
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          // Use translate3d for GPU acceleration
          transform: `translate3d(${mouse.x - 20}px, ${mouse.y - 20}px, 0) scale(${mouse.click > 0 ? 0.8 : 1.2})`,
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: `2px solid ${mouse.click > 0 ? '#007AFF' : 'rgba(0, 122, 255, 0.4)'}`,
          backgroundColor: mouse.click > 0 ? 'rgba(0, 122, 255, 0.2)' : 'transparent',
          boxShadow: `0 0 15px ${mouse.click > 0 ? '#007AFF' : 'rgba(0, 122, 255, 0.2)'}`,
          transition: 'transform 0.08s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.1s, background-color 0.1s',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}
      >
        {/* Minimal Inner Pointer */}
        <div style={{
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: '#007AFF',
          opacity: mouse.click > 0 ? 1 : 0.5
        }} />
      </div>
    </div>
  )
}

export default App