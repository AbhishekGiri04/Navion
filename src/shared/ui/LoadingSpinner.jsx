import React from 'react'

const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <img 
        src="https://cdn.dribbble.com/userupload/42452057/file/original-085cef70f7583e3ca58f09ea8badd51e.gif"
        alt="Loading"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  )
}

export default LoadingScreen