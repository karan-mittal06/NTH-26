'use client';
import React, { useEffect, useRef, useState } from "react";
import API from "@/utils/api"; 
import { toast } from "react-toastify";
import { GrCaretNext, GrCaretPrevious } from "react-icons/gr";
import Loader from "./Loader";
import "@/app/button.css";

export default function SpiderVerseLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); 
  const [usersPerPage] = useState(10); 
  const isFirstRender = useRef(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!isFirstRender.current) {
        return;
      }
      isFirstRender.current = false;
      
      try {
        const res = await API.get(`/leaderboard`); 
        if (res.status === 200) {
          setLeaderboardData(res.data);
        } else {
          toast.error("Failed to fetch leaderboard data.");
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        toast.error("An error occurred while fetching leaderboard data.");
      } finally {
        await new Promise(resolve => {
          setTimeout(() => { resolve('') }, 1000);
        })
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const totalPages = Math.ceil(leaderboardData.length / usersPerPage);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = leaderboardData.slice(indexOfFirstUser, indexOfLastUser);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) {
    return <Loader/>;
  }

  const getMedalIcon = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return "text-yellow-300";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-300";
    return "text-white";
  };

  return (
    <div className="h-screen w-full flex items-center justify-center px-4 py-16 md:py-20 relative">
      {/* Main container */}
      <div className="relative max-w-4xl w-full">
        {/* Comic book style title panel */}
        <div className="relative mb-1">
          <div className="absolute -inset-2 bg-gradient-to-r from-red-500/30 via-purple-500/30 to-cyan-500/30 blur-lg"></div>
          <div className="relative bg-black/60 border-2 border-white p-2 md:p-3 transform shadow-xl">
            <div className="transform">
              <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider text-center" 
                  style={{ 
                    fontFamily: 'Iceland, sans-serif',
                    textShadow: '2px 2px 0px rgba(255,0,68,0.7), 4px 4px 0px rgba(139,0,255,0.7)'
                  }}>
                Leaderboard
              </h1>
              <p className="text-center text-gray-300 text-xs mt-0.5 tracking-widest uppercase" 
                 style={{ fontFamily: 'Iceland, sans-serif' }}>
                Heroes Across All Dimensions
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard panel */}
        <div className="relative">
          {/* Scanlines effect */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)] animate-[scanlines_6s_linear_infinite]"></div>
          </div>

          {/* Glitch overlay */}
          <div className="absolute -inset-1 bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500 opacity-20 blur-xl"></div>
          
          <div className="relative bg-black/70 border-2 border-white shadow-xl overflow-hidden">
            {/* Inner neon border effect */}
            <div className="absolute inset-0 border-2 border-red-500/30 pointer-events-none animate-pulse"></div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-red-600/30 via-purple-600/30 to-cyan-600/30 border-b-2 border-white/20">
                  <tr>
                    <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-sm md:text-base font-bold text-white uppercase tracking-wider"
                        style={{ fontFamily: 'Iceland, sans-serif' }}>
                      Rank
                    </th>
                    <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-sm md:text-base font-bold text-white uppercase tracking-wider"
                        style={{ fontFamily: 'Iceland, sans-serif' }}>
                      Hero
                    </th>
                    <th className="px-2 md:px-3 py-1.5 md:py-2 text-left text-sm md:text-base font-bold text-white uppercase tracking-wider"
                        style={{ fontFamily: 'Iceland, sans-serif' }}>
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center px-3 py-6">
                        <p className="text-base text-gray-400 uppercase tracking-wide"
                           style={{ fontFamily: 'Iceland, sans-serif' }}>
                          No heroes found in this dimension...
                        </p>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user, index) => {
                      const globalRank = indexOfFirstUser + index + 1;
                      return (
                        <tr key={user.id} 
                            className="border-b border-white/10 hover:bg-gradient-to-r hover:from-red-500/10 hover:via-purple-500/10 hover:to-cyan-500/10 transition-all duration-300 group">
                          <td className={`px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base font-bold ${getRankColor(globalRank)}`}
                              style={{ fontFamily: 'Iceland, sans-serif' }}>
                            <div className="flex items-center gap-1">
                              <span className="group-hover:scale-110 transition-transform">
                                #{globalRank}
                              </span>
                            </div>
                          </td>
                          <td className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base text-white font-semibold uppercase tracking-wide"
                              style={{ 
                                fontFamily: 'Iceland, sans-serif',
                                textShadow: globalRank <= 3 ? '0 0 10px rgba(255,255,255,0.5)' : 'none'
                              }}>
                            {user.username}
                          </td>
                          <td className="px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base font-bold"
                              style={{ fontFamily: 'Iceland, sans-serif' }}>
                            <span className="inline-block px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/30 to-purple-500/30 text-cyan-300 border border-cyan-500/50 text-xs md:text-sm">
                              {user.curr_level}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-center gap-2 md:gap-3">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="cybr-btn !min-w-[100px] md:!min-w-[120px] !h-[40px] !leading-[40px] !text-xs md:!text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ 
                '--primary-hue': '280',
                '--shadow-primary-hue': '180',
                '--shadow-secondary-hue': '320'
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

            <div className="text-center">
              <div className="bg-black/80 border-2 border-white px-2 md:px-3 py-1 md:py-1.5">
                <p className="text-sm md:text-base font-bold text-white uppercase tracking-wider"
                   style={{ 
                     fontFamily: 'Iceland, sans-serif',
                     textShadow: '2px 2px 0px rgba(255,0,68,0.7)'
                   }}>
                  {currentPage} / {totalPages}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="cybr-btn !min-w-[100px] md:!min-w-[120px] !h-[40px] !leading-[40px] !text-xs md:!text-sm disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ 
                '--primary-hue': '180',
                '--shadow-primary-hue': '200',
                '--shadow-secondary-hue': '280'
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
        )}
      </div>

      <style jsx>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(100px); }
        }
      `}</style>
    </div>
  );
}
