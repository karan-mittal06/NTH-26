'use client';
import React, { useState, useEffect } from 'react';
import { GrCaretNext, GrCaretPrevious } from 'react-icons/gr';
import "@/app/button.css";

const SpiderVerseBooklet = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  const pages = [
    {
      title: "WELCOME TO NTH",
      subtitle: "Name the Hero",
      content: [
        "Welcome to the ultimate Spider-Verse challenge!",
        "Test your knowledge across multiple dimensions and prove you're the ultimate Spider-Hero expert.",
        "Are you ready to swing into action?"
      ],
      icon: "🕷️"
    },
    {
      title: "OBJECTIVE",
      subtitle: "Your Mission",
      content: [
        "Solve riddles and clues to identify heroes from across the Spider-Verse.",
        "Each correct answer brings you closer to the top of the leaderboard.",
        "Think fast, think smart, and remember... with great power comes great responsibility!"
      ],
      icon: "🎯"
    },
    {
      title: "HOW TO PLAY",
      subtitle: "The Rules",
      content: [
        "1. Register or Login to start your journey",
        "2. Read each question carefully",
        "3. Submit your answer before time runs out",
        "4. Earn points for correct answers",
        "5. Climb the leaderboard and become legendary!"
      ],
      icon: "📖"
    },
    {
      title: "SCORING",
      subtitle: "Points System",
      content: [
        "Correct Answer: Advance to the next level",
        "Speed Bonus: Faster answers = Higher ranks",
        "No Penalties: Wrong answers don't cost points, just keep trying!",
        "Every hero gets unlimited attempts!"
      ],
      icon: "⭐"
    },
    {
      title: "PRO TIPS",
      subtitle: "Insider Secrets",
      content: [
        "Think outside the box - answers might surprise you",
        "Pay attention to wordplay and hidden meanings",
        "Use all available hints wisely",
        "Check the Question Setters page for inspiration",
        "The Spider-Sense is strong with this one!"
      ],
      icon: "💡"
    },
    {
      title: "READY?",
      subtitle: "Begin Your Adventure",
      content: [
        "You've learned the basics.",
        "You understand the rules.",
        "Now it's time to prove yourself!",
        "Good luck, Spider-Hero! 🕸️"
      ],
      icon: "🚀"
    }
  ];

  const handleNextPage = () => {
    if (currentPage < pages.length - 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setIsFlipping(false);
      }, 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, isFlipping]);

  const currentPageData = pages[currentPage];

  return (
    <div className="h-screen w-full flex items-center justify-center px-4 py-16 md:py-20 relative">
      {/* Main booklet container */}
      <div className="relative max-w-4xl w-full">
        {/* Booklet */}
        <div className="relative perspective-1000">
          {/* Page flip animation wrapper */}
          <div 
            className={`relative transition-all duration-300 ${isFlipping ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipping ? 'rotateY(-5deg)' : 'rotateY(0deg)'
            }}>
            
            {/* Book shadow/depth effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-red-900/40 via-purple-900/40 to-cyan-900/40 blur-xl rounded-lg"></div>
            
            {/* Main page */}
            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 md:border-3 border-white rounded-lg shadow-xl overflow-hidden">
              {/* Comic book texture overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>

              {/* Scanlines effect */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)] animate-[scanlines_6s_linear_infinite]"></div>
              </div>

              {/* Page content */}
              <div className="relative p-4 md:p-6 min-h-[280px] md:min-h-[320px] flex flex-col">
                {/* Page number indicator */}
                <div className="absolute top-2 right-2 bg-black/60 border border-red-500 px-2 py-0.5 rounded-full">
                  <span className="text-red-400 text-sm font-bold" style={{ fontFamily: 'Iceland, sans-serif' }}>
                    {currentPage + 1} / {pages.length}
                  </span>
                </div>

                {/* Icon */}
                {/* <div className="flex justify-center mb-2 md:mb-3">
                  <div className="text-3xl md:text-4xl animate-pulse">
                    {currentPageData.icon}
                  </div>
                </div> */}

                {/* Title */}
                <div className="relative mb-2 md:mb-3">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-cyan-500/20 blur-md"></div>
                  <h1 
                    className="relative text-3xl md:text-4xl font-bold text-center text-white uppercase tracking-wider mb-1"
                    style={{ 
                      fontFamily: 'Iceland, sans-serif',
                      textShadow: '2px 2px 0px rgba(255,0,68,0.7), 4px 4px 0px rgba(139,0,255,0.7)'
                    }}>
                    {currentPageData.title}
                  </h1>
                  <p 
                    className="relative text-center text-cyan-400 uppercase tracking-widest"
                    style={{ fontFamily: 'Iceland, sans-serif' }}>
                    {currentPageData.subtitle}
                  </p>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="space-y-1.5 md:space-y-2 max-w-2xl">
                    {currentPageData.content.map((line, index) => (
                      <div 
                        key={index}
                        className="transform hover:scale-105 transition-transform duration-200"
                        style={{
                          animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                        }}>
                        <div className="bg-gradient-to-r from-red-600/20 via-purple-600/20 to-cyan-600/20 border-l-2 border-red-500 p-2 md:p-2.5 rounded-r-lg backdrop-blur-sm">
                          <p 
                            className="text-white text-sm md:text-lg leading-relaxed"
                            style={{ fontFamily: 'Iceland, sans-serif' }}>
                            {line}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Page corner fold effect */}
                <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-gray-700 to-transparent opacity-30 rounded-tl-full"></div>
              </div>

              {/* Inner glow border */}
              <div className="absolute inset-0 border-4 border-red-500/20 pointer-events-none rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-3 md:mt-4 gap-2 md:gap-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="cybr-btn !min-w-[100px] md:!min-w-[120px] !h-[40px] !leading-[40px] !text-xs md:!text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ 
              '--primary-hue': '340',
              '--shadow-primary-hue': '200',
              '--shadow-secondary-hue': '280'
            }}>
            <GrCaretPrevious className="inline w-3 h-3 mr-1" />
            Previous
            <span aria-hidden>_</span>
            <span aria-hidden className="cybr-btn__glitch">
              <GrCaretPrevious className="inline w-3 h-3 mr-1" />
              Previous_
            </span>
            <span aria-hidden className="cybr-btn__tag">NTH</span>
          </button>

          {/* Progress dots */}
          <div className="text-center">
            <div className="bg-black/80 border-2 border-white px-2 md:px-3 py-1 md:py-1.5">
              <p className="text-sm md:text-base font-bold text-white uppercase tracking-wider"
                 style={{ 
                   fontFamily: 'Iceland, sans-serif',
                   textShadow: '2px 2px 0px rgba(255,0,68,0.7)'
                 }}>
                {currentPage + 1} / {pages.length}
              </p>
            </div>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === pages.length - 1}
            className="cybr-btn !min-w-[100px] md:!min-w-[120px] !h-[40px] !leading-[40px] !text-xs md:!text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ 
              '--primary-hue': '0',
              '--shadow-primary-hue': '180',
              '--shadow-secondary-hue': '60'
            }}>
            Next
            <GrCaretNext className="inline w-3 h-3 ml-1" />
            <span aria-hidden>_</span>
            <span aria-hidden className="cybr-btn__glitch">
              Next
              <GrCaretNext className="inline w-3 h-3 ml-1" />
              _
            </span>
            <span aria-hidden className="cybr-btn__tag">NTH</span>
          </button>
        </div>

        {/* Keyboard hint */}
        <div className="text-center mt-2 md:mt-3">
          <p className="text-gray-400 text-sm uppercase tracking-wide" style={{ fontFamily: 'Iceland, sans-serif' }}>
            Use arrow keys ← → to navigate
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default SpiderVerseBooklet;
