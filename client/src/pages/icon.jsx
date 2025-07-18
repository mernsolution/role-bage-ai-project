import React, { useState, useEffect } from 'react';

const AnimatedNetwork = () => {
  const [activeFlow, setActiveFlow] = useState(0);
  const [hoveredIcon, setHoveredIcon] = useState(null);

  // Icon data positioned to form natural connection paths
  const icons = [
    { id: 'github', symbol: '⚫', color: 'bg-gray-800', x: 8, y: 12 },
    { id: 'robinhoodie', symbol: '📈', color: 'bg-green-500', x: 22, y: 18 },
    { id: 'discord', symbol: '💬', color: 'bg-indigo-600', x: 42, y: 22 },
    { id: 'teams', symbol: 'T', color: 'bg-pink-500', x: 65, y: 18 },
    { id: 'google', symbol: 'G', color: 'bg-blue-500', x: 82, y: 12 },
    
    { id: 'youtube', symbol: '▶', color: 'bg-red-600', x: 2, y: 32 },
    { id: 'twitter', symbol: '🐦', color: 'bg-blue-400', x: 28, y: 42 },
    { id: 'figma', symbol: 'F', color: 'bg-purple-500', x: 52, y: 48 },
    { id: 'outlook', symbol: 'O', color: 'bg-blue-600', x: 72, y: 42 },
    
    { id: 'slack', symbol: '#', color: 'bg-green-400', x: 12, y: 55 },
    { id: 'vscode', symbol: 'VS', color: 'bg-blue-500', x: 35, y: 65 },
    { id: 'notion', symbol: 'N', color: 'bg-gray-700', x: 58, y: 68 },
    { id: 'power', symbol: 'P', color: 'bg-yellow-500', x: 78, y: 62 },
    
    { id: 'wechat', symbol: '💬', color: 'bg-green-400', x: 88, y: 48 },
    { id: 'adobe', symbol: 'X', color: 'bg-purple-600', x: 92, y: 72 }
  ];

  // Define which icons are connected (adjacent in the flow)
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Top row flow
    [5, 6], [6, 7], [7, 8], // Second row flow  
    [9, 10], [10, 11], [11, 12], // Third row flow
    [13, 14], // Bottom flow
    
    // Vertical connections
    [0, 5], [1, 6], [2, 7], [3, 8], [4, 13],
    [5, 9], [6, 10], [7, 11], [8, 12], [12, 14],
    
    // Cross connections
    [1, 7], [2, 8], [6, 11], [7, 12]
  ];

  // Auto-advance animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % connections.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isIconInActiveFlow = (iconIndex) => {
    if (activeFlow >= connections.length) return false;
    const [start, end] = connections[activeFlow];
    return iconIndex === start || iconIndex === end;
  };

  const isIconConnectedToHovered = (iconIndex) => {
    if (hoveredIcon === null) return false;
    return connections.some(([start, end]) => 
      (start === hoveredIcon && end === iconIndex) || 
      (end === hoveredIcon && start === iconIndex)
    );
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(rgba(51, 51, 51, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 51, 51, 0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Icons - they form the network themselves */}
      {icons.map((icon, index) => {
        const isActive = isIconInActiveFlow(index);
        const isConnected = isIconConnectedToHovered(index);
        const isHovered = hoveredIcon === index;
        
        return (
          <div
            key={icon.id}
            className={`absolute w-12 h-12 rounded-full ${icon.color} 
              flex items-center justify-center text-white font-bold text-sm
              cursor-pointer transition-all duration-500 transform
              ${isHovered ? 'scale-150 shadow-2xl z-30' : 
                isActive ? 'scale-125 z-25' : 
                isConnected ? 'scale-110 z-20' : 'hover:scale-110 z-10'}
            `}
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              boxShadow: isHovered 
                ? `0 0 40px ${icon.color.includes('blue') ? '#3b82f6' : 
                           icon.color.includes('red') ? '#ef4444' :
                           icon.color.includes('green') ? '#22c55e' :
                           icon.color.includes('purple') ? '#a855f7' :
                           icon.color.includes('yellow') ? '#eab308' : '#6b7280'}, 
                   0 0 80px ${icon.color.includes('blue') ? '#3b82f6' : 
                           icon.color.includes('red') ? '#ef4444' :
                           icon.color.includes('green') ? '#22c55e' :
                           icon.color.includes('purple') ? '#a855f7' :
                           icon.color.includes('yellow') ? '#eab308' : '#6b7280'}`
                : isActive 
                  ? '0 0 25px #3b82f6, 0 0 50px #3b82f6'
                  : isConnected
                    ? '0 0 20px #22c55e'
                    : 'none',
              filter: isActive 
                ? 'brightness(1.3) saturate(1.2)' 
                : isConnected 
                  ? 'brightness(1.1)' 
                  : 'none',
              border: isActive 
                ? '3px solid #3b82f6' 
                : isConnected 
                  ? '2px solid #22c55e' 
                  : isHovered 
                    ? '2px solid white' 
                    : 'none'
            }}
            onMouseEnter={() => setHoveredIcon(index)}
            onMouseLeave={() => setHoveredIcon(null)}
            onClick={() => setActiveFlow(Math.floor(Math.random() * connections.length))}
          >
            <span className="select-none">{icon.symbol}</span>
            
            {/* Pulsing ring for active icons */}
            {isActive && (
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
            )}
            
            {/* Ripple effect on hover */}
            {isHovered && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-white opacity-50 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-4 border-white opacity-25 animate-ping" style={{animationDelay: '0.2s'}}></div>
              </>
            )}
          </div>
        );
      })}

      {/* Floating data particles that move between icons */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-40"
            style={{
              left: `${10 + (i * 8)}%`,
              top: `${20 + (i * 4)}%`,
              animation: `dataFlow ${4 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 text-gray-400 text-sm">
        <p>🌊 Network flow through icons • Hover to see connections • Click to trigger flow</p>
      </div>

      <style jsx>{`
        @keyframes dataFlow {
          0%, 100% { transform: translateX(0px) translateY(0px) scale(0.8); opacity: 0.2; }
          25% { transform: translateX(200px) translateY(-50px) scale(1); opacity: 0.6; }
          50% { transform: translateX(400px) translateY(0px) scale(0.9); opacity: 0.4; }
          75% { transform: translateX(600px) translateY(50px) scale(1.1); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedNetwork;