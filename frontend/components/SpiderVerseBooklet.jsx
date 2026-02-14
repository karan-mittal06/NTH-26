"use client";

import React, { useState } from "react";

const pages = [
  {
    title: "NTH",
    subtitle: "Network Treasure Hunt",
    content: [
      "This is a 24-hour online puzzle challenge.",
      "You have the entire internet. Use tools, logic, research, instinct.",
      "Each correct answer unlocks the next question.",
      "Progress depends entirely on how well you think and connect the dots."
    ],
    icon: "🌐"
  },
  {
    title: "TIMINGS",
    subtitle: "24 Hours. No Pause.",
    content: [
      "Start: 14th February – 9:00 PM",
      "End: 15th February – 9:00 PM",
      "The hunt remains live for exactly 24 hours.",
      "You may join anytime during the window.",
      "Progress saves automatically."
    ],
    icon: "⏳"
  },
  {
    title: "ANSWER FORMAT",
    subtitle: "Read This Carefully",
    content: [
      "Answers must contain ONLY:",
      "• lowercase letters (a-z)",
      "• numbers (0-9)",
      "• hyphens (-), periods (.), or underscores (_)",
      "No spaces. No uppercase. No special symbols.",
      "Incorrect formatting will not be accepted."
    ],
    icon: "🧠"
  },
  {
    title: "HOW TO SUBMIT",
    subtitle: "Modify The URL",
    content: [
      "Submit answers in this format:",
      "nth.credenz.co.in/question/your_answer_here",
      "Correct answer → redirects to next question.",
      "Incorrect answer → reloads current question.",
      "Spamming random answers will not help you.",
      "For reference, check out: https://www.instagram.com/reel/DGAUVpouocu"
    ],
    icon: "🔗"
  },
  {
    title: "SCORING & KEYS",
    subtitle: "Earn Your Advantage",
    content: [
      "Correct answers award keys.",
      "Keys unlock hints for your current question.",
      "Keys are limited. Use them wisely.",
      "Leaderboard updates in real time.",
      "Top participant/team after 24 hours wins."
    ],
    icon: "🔑"
  },
  {
    title: "PRIZES",
    subtitle: "Victory Has Rewards",
    content: [
      "1st Prize: ₹5,000",
      "2nd Prize: ₹3,000",
      "Online Event | Free Registration",
      "Glory lasts longer than the prize money."
    ],
    icon: "🏆"
  },
  {
    title: "STRICT RULES",
    subtitle: "Zero Tolerance",
    content: [
      "Teams may have any number of members.",
      "Gameplay must occur through ONE account only.",
      "Multiple accounts = immediate disqualification.",
      "Collusion between teams or participants is prohibited.",
      "If detected, it will result in permanent disqualification and forfeiture."
    ],
    icon: "⚖️"
  },
  {
    title: "FAIR PLAY POLICY",
    subtitle: "We Monitor Everything",
    content: [
      "Answer logs and activity patterns are monitored.",
      "Exploit attempts or automation scripts are forbidden.",
      "Brute-force or bot behavior may lead to account bans.",
      "Organizer decisions are final and non-negotiable."
    ],
    icon: "🚨"
  },
  {
    title: "NEED HELP?",
    subtitle: "Follow Procedure",
    content: [
      "Refer to the Help section first.",
      "Contact Instagram @nth__live only if necessary.",
      "The hunt begins at 9:00 PM.",
      "Prepare yourself."
    ],
    icon: "🚀"
  }
];

const SpiderVerseBooklet = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const page = pages[pageIndex];

  const handlePrev = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const handleNext = () => {
    if (pageIndex < pages.length - 1) setPageIndex(pageIndex + 1);
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 text-white">
      <div className="relative">
        <div className="absolute -inset-2 bg-gradient-to-r from-red-500/30 via-purple-500/30 to-cyan-500/30 blur-lg"></div>
        <div className="relative bg-black/70 border-2 border-white p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-gray-300">{page.subtitle}</p>
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-wider">{page.title}</h1>
            </div>
            <div className="text-4xl md:text-5xl">{page.icon}</div>
          </div>

          <ul className="mt-6 space-y-2 text-base md:text-lg text-gray-200">
            {page.content.map((line, idx) => (
              <li key={idx} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center">
        <button
          onClick={handlePrev}
          disabled={pageIndex === 0}
          className="px-4 py-2 border border-white text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed justify-self-start min-w-[110px]"
        >
          Previous
        </button>
        <div className="text-sm uppercase tracking-widest text-gray-300">
          {pageIndex + 1} / {pages.length}
        </div>
        <button
          onClick={handleNext}
          disabled={pageIndex === pages.length - 1}
          className="px-4 py-2 border border-white text-sm uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed justify-self-end min-w-[110px]"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SpiderVerseBooklet;
