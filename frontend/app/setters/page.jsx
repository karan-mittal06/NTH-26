"use client";

import '../team.css';
import TrainerCard from '@/components/TrainerCard';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const QuestionSetters = () => {
  const spiderVerseSetters = [
    {
      name: "Sanyog Pakhale",
      subtitle: "OG Spider • Mentor",
      badge: "SETTER",
      avatar: "/admin/sanyog.webp",
      linkedin: 'https://www.linkedin.com/in/sanyog-dilip-pakhale-85829532a',
      instagram: 'https://www.instagram.com/_sanyog____',
      github: 'https://github.com/SanyogPakhale',
      styleClass: 'style-1'
    },
    {
      name: "Suruchi Warke",
      subtitle: "Detective • 1933",
      badge: "SETTER",
      avatar: "/admin/suruchi.jpg",
      linkedin: 'https://www.linkedin.com/in/suruchi-warke-98a2b532a',
      instagram: 'https://www.instagram.com/suruchi_510',
      github: 'https://github.com/suruchiwarke',
      styleClass: 'style-2'
    },
    {
      name: "Gargi Nemade",
      subtitle: "Pilot • SP//dr",
      badge: "SETTER",
      avatar: "/admin/gargi.jpeg",
      linkedin: ' https://www.linkedin.com/in/gargi-nemade-17a879328',
      instagram: 'https://www.instagram.com/garginemade',
      github: 'https://github.com/garginemade',
      styleClass: 'style-3'
    },
    {
      name: "Vivek Amrutkar",
      subtitle: "Leader • Guardian",
      badge: "SETTER",
      avatar: "/admin/vivek.webp",
      linkedin: 'https://www.linkedin.com/in/vivekhimself/',
      instagram: 'https://www.instagram.com/vivekhimself/',
      github: 'https://github.com/kharnsagara',
      styleClass: 'style-3'
    },
    {
      name: "Sharva Marawar",
      subtitle: "Anarchist • Rebel",
      badge: "SETTER",
      avatar: "/admin/sharva.webp",
      linkedin: 'https://www.linkedin.com/in/sharva-marawar-61bb36332?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      instagram: 'https://www.instagram.com/__sharva__?igsh=MXM4YmxlMnVtNDJ4Nw==',
      github: 'https://github.com/vadapaavv',
      styleClass: 'style-3'
    }
  ];

  return (
    <div className="team-container">
      <div className="profiles-container five-cards">
        {spiderVerseSetters.map((setter, index) => (
          <div key={index} className={`profile-card ${setter.styleClass}`}>
            <div className="glitch-overlay"></div>
            <div className="verse-badge">{setter.badge}</div>
            <div className="header-bg"></div>
            <div className="profile-photo-container">
              <img src={setter.avatar} alt={setter.name} className="profile-photo" />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{setter.name}</h1>
              <p className="profile-subtitle">{setter.subtitle}</p>
              <div className="social-links">
                <a href={setter.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram">
                  <FaInstagram />
                </a>
                <a href={setter.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href={setter.github} target="_blank" rel="noopener noreferrer" className="social-link github" title="GitHub">
                  <FaGithub />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestionSetters;
