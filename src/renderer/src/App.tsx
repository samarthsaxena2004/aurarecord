import React from 'react'

const App: React.FC = () => {
  return (
    <div style={{ 
      background: '#0a0a0a', 
      color: '#fff', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ letterSpacing: '-0.05em' }}>AuraRecord <span style={{ color: '#007AFF' }}>v1.0</span></h1>
    </div>
  )
}

export default App