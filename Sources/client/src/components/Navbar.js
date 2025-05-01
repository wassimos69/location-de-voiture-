import React from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ scrollToSection }) {
  const location = useLocation();

  // Scroll ou redirection avec ancre selon la page
  const handleScroll = (e, section) => {
    e.preventDefault();
    if (location.pathname === "/") {
      scrollToSection(section);
    } else {
      window.location.href = `/#${section}`;
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/logo.png" alt="Logo" />
      </div>
      <ul className="navbar-links">
        <li>
          <a href="/#voituresSectionRef" onClick={(e) => handleScroll(e, "accueil")}>
            Accueil
          </a>
        </li>
        <li>
          <a href="/#locationFormSection" onClick={(e) => handleScroll(e, "location")}>
            Locations
          </a>
        </li>
        <li>
          <a href="/#footer-section" onClick={(e) => handleScroll(e, "contact")}>
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}
