import '../team.css';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Webteam = () => {
  const trainers = [
    {
      name: "Anushree Kamath",
      subtitle: "Web-Slinger • Hero of Brooklyn",
      badge: "NTH HEAD • WEB DEVELOPER",
      avatar: "/admin/anushree.jpg",
      linkedin: 'https://www.linkedin.com/in/anushreekamath04/',
      instagram: 'https://www.instagram.com/kamathanushree/',
      github: 'https://github.com/siriuslycoding',
      styleClass: 'style-1'
    },
    {
      name: "Karan Mittal",
      subtitle: "Spider-Ghost • Drummer",
      badge: "NTH HEAD • WEB DEVELOPER",
      avatar: "/admin/karan.jpg",
      linkedin: 'https://www.linkedin.com/in/karan-mittal-59a41a23a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
      instagram: 'https://www.instagram.com/karanmittal7303/',
      github: 'https://github.com/karan-mittal06',
      styleClass: 'style-2'
    },
  ]

  return (
    <div className="team-container">
      <div className="profiles-container">
        {trainers.map((trainer, index) => (
          <div key={index} className={`profile-card ${trainer.styleClass}`}>
            <div className="glitch-overlay"></div>
            <div className="verse-badge">{trainer.badge}</div>
            <div className="header-bg"></div>
            <div className="profile-photo-container">
              <img src={trainer.avatar} alt={trainer.name} className="profile-photo" />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{trainer.name}</h1>
              <p className="profile-subtitle">{trainer.subtitle}</p>
              <div className="social-links">
                <a href={trainer.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram" title="Instagram">
                  <FaInstagram />
                </a>
                <a href={trainer.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" title="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href={trainer.github} target="_blank" rel="noopener noreferrer" className="social-link github" title="GitHub">
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

export default Webteam;
