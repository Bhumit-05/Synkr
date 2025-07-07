import React from 'react'

const Spinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Syncing playlist... Please wait.</p>
        </div>
    </div>

  )
}

export default Spinner;