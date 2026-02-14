import SpiderVerseLeaderboard from '@/components/SpiderVerseLeaderboard'

const page = () => {
  return (
    <div className="h-screen overflow-hidden relative">
      {/* Spider-Verse background */}
      <img
        src={`leaderboard-bg.jpg`}
        alt="Background"
        className="fixed w-full h-full -z-10 bottom-0 object-cover xl:object-fill opacity-75"
      />
      
      {/* Animated gradient overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/60 via-red-900/20 to-purple-900/40"></div>
      
      {/* Comic book halftone dots effect */}
      <div className="fixed inset-0 -z-10 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <SpiderVerseLeaderboard />
    </div>
  )
}

export default page