"use client"

const InstructionsPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated comic book style background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-red-600 via-blue-600 to-yellow-500"></div>
        </div>
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)] animate-[scan_6s_linear_infinite]"></div>
      </div>

      {/* Halftone dots effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Comic book style title panel */}
        <div className="relative mb-12">
          <div className="absolute -inset-4 bg-gradient-to-r from-red-500/20 via-blue-500/20 to-yellow-500/20 blur-xl"></div>
          <div className="relative bg-black/80 border-4 border-white p-8 transform -rotate-1 shadow-2xl">
            <div className="transform rotate-1">
              <h1 className="text-6xl md:text-8xl font-bold text-white uppercase tracking-wider mb-4" 
                  style={{ 
                    fontFamily: 'Iceland, sans-serif',
                    textShadow: '4px 4px 0px rgba(255,0,0,0.5), 8px 8px 0px rgba(0,0,255,0.5)'
                  }}>
                Coming Soon
              </h1>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-red-500/10 via-blue-500/10 to-yellow-500/10 border-2 border-blue-400/30 rounded-lg p-6 backdrop-blur-sm transform hover:scale-105 transition-transform">
            <p className="text-lg text-gray-300 uppercase tracking-wide"
               style={{ fontFamily: 'Iceland, sans-serif' }}>
              Instructions Are Being Compiled Across The Spider-Verse...
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 max-w-xs h-2 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-blue-500 to-yellow-500 animate-[progress_10s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
        
        @keyframes progress {
          0%, 100% { width: 0%; }
          50% { width: 100%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default InstructionsPage
