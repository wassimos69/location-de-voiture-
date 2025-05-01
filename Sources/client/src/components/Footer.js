import React from "react";
import "./Footer.css";

// Utiliser React.forwardRef pour passer un ref vers l'élément footer
const Footer = React.forwardRef((props, ref) => {
  return (
    <footer ref={ref} className="footer" id="footer-section">
      <div className="footer-section">
        <h3><strong>ONE</strong> - Rent A Car</h3>
        <p>Big range of vehicles for all your driving needs. We have the perfect car for your needs.</p>
        <p>📞 (123) -456-789</p>
        <p>📧 one@rentacar.com</p>
        <p>Created by Wassim Yousfi ©</p>
      </div>

      <div className="footer-section">
        <h3>COMPANY</h3>
        <p>Locations</p>
        <p>Careers</p>
        <p>Blog</p>
        <p>About us</p>
      </div>

      <div className="footer-section">
        <h3>WORKING HOURS</h3>
        <p>Mon - Fri: 9:00AM - 9:00PM</p>
        <p>Sat: 9:00AM - 7:00PM</p>
        <p>Sun: Closed</p>
      </div>

      <div className="footer-section">
        <h3>SUBSCRIPTION</h3>
        <p>Subscribe your email address for the latest news & updates.</p>
        <input type="email" placeholder="Enter Email Address" />
        <button>Submit</button>
      </div>
    </footer>
  );
});

export default Footer;
