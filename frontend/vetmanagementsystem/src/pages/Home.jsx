import React, { useState } from "react";
import { Link } from "react-router-dom";
import vmsLogo from "../assets/vmslogo.jpeg";

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const features = [
    {
      title: "Pet Management",
      img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80",
      alt: "Woman hugging a dog",
    },
    {
      title: "Appointment Booking",
      img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80",
      alt: "Veterinarian holding a cat",
    },
    {
      title: "Treatment Records",
      img: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80",
      alt: "Dog at a veterinary clinic",
    },
    {
      title: "Doctor Dashboard",
      img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80",
      alt: "Puppy being examined",
    },
    {
      title: "Client Dashboard",
      img: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80",
      alt: "Dog and owner outside",
    },
    {
      title: "Medical Records",
      img: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80",
      alt: "Dog close-up",
    },
    {
      title: "Treatment Management",
      img: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80",
      alt: "Dog on a clinic table",
    },
  ];

  return (
    <div className="home-root">
      <header className="home-topbar">
        <div className="home-logo">
          <img src={vmsLogo} alt="Veterinary Management System logo" />
        </div>
        <button
          type="button"
          className="home-menu-btn"
          aria-label="Toggle home menu"
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          {"\u2630"}
        </button>
        <div className={`home-actions ${mobileNavOpen ? "open" : ""}`}>
          <Link to="/register" className="home-btn">Customer Register</Link>
          <Link to="/doctor/register" className="home-btn">Doctor Register</Link>
          <Link to="/login" className="home-btn">Customer Login</Link>
          <Link to="/doctor/login" className="home-btn">Doctor Login</Link>
        </div>
      </header>

      <main className="home-main">
        <section className="home-panel hero">
          <div className="hero-text">
            <h2>Welcome to Veterinary Management System</h2>
            <p>
              Manage pets, appointments, treatments, and medical records in one
              secure and easy platform for doctors and customers.
            </p>
          </div>
          <div className="hero-media">
            <img
              src="https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1000&q=80"
              alt="Veterinarian with a dog"
            />
          </div>
        </section>

        <section className="home-panel">
          <h3>Features</h3>
          <div className="feature-grid">
            {features.map((item) => (
              <article key={item.title} className="feature-card">
                <img src={item.img} alt={item.alt} />
                <h4>{item.title}</h4>
              </article>
            ))}
          </div>
        </section>

        <section className="home-panel split">
          <div>
            <h3>Why Choose Us</h3>
            <ul>
              <li>Fast</li>
              <li>Secure</li>
              <li>Easy to use</li>
            </ul>
          </div>
          <div>
            <h3>Contact & Location</h3>
            <p>Email: infaanhameed.com</p>
            <p>Phone: +255 711 252 758</p>
            <p>Morrocco Street, Fuoni, Zanzibar</p>
          </div>
        </section>

        <section className="home-panel banner">
          <h3>Create your account today</h3>
          <div className="banner-actions">
            <Link to="/register" className="home-btn black">Register Now</Link>
            <Link to="/doctor/register" className="home-btn black">Doctor Register</Link>
          </div>
        </section>

        <section className="home-panel banner">
          <h3>Already have an account?</h3>
          <div className="banner-actions">
            <Link to="/login" className="home-btn black">Customer Login</Link>
            <Link to="/doctor/login" className="home-btn black">Doctor Login</Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-links">
          <Link to="/home">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/doctor/login">Doctor Login</Link>
        </div>
        <p>(c) 2026 Veterinary Management System</p>
      </footer>

      <style>{`
        .home-root {
          min-height: 100vh;
          background-image: url("https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: repeat;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
          color: #111;
        }
        .home-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.74);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.14);
        }
        .home-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .home-logo img {
          width: 110px;
          height: 44px;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.18);
          background: rgba(255, 255, 255, 0.6);
        }
        .home-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .home-menu-btn {
          display: none;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.2);
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
        }
        .home-main {
          width: min(1080px, 100%);
          margin: 0 auto;
          padding: 20px 14px 12px;
          display: grid;
          gap: 14px;
        }
        .home-panel {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
          padding: 20px;
        }
        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 16px;
          align-items: center;
        }
        .hero-text h2 { margin: 0 0 8px; font-size: 32px; }
        .hero-text p { margin: 0; font-size: 17px; line-height: 1.6; }
        .hero-media {
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 12px 22px rgba(0, 0, 0, 0.15);
        }
        .hero-media img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 10px;
        }
        .feature-card {
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.88);
          padding: 12px;
          transition: transform .16s ease, box-shadow .16s ease;
          display: grid;
          gap: 10px;
        }
        .feature-card img {
          width: 100%;
          height: 120px;
          object-fit: cover;
          border-radius: 10px;
          border: 1px solid rgba(0, 0, 0, 0.08);
        }
        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
        }
        .feature-card h4 { margin: 0; }
        .split {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .split ul { margin: 8px 0 0; padding-left: 18px; }
        .split p { margin: 6px 0; }
        .banner { text-align: center; }
        .banner-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }
        .home-btn {
          text-decoration: none;
          border-radius: 999px;
          border: 1px solid transparent;
          padding: 8px 12px;
          font-weight: 700;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          transition: transform .16s ease, background .16s ease, color .16s ease;
        }
        .home-btn:hover {
          transform: translateY(-2px);
          background: rgba(0, 0, 0, 0.86);
          color: #fff;
        }
        .home-footer {
          margin-top: 12px;
          background: rgba(255, 255, 255, 0.74);
          backdrop-filter: blur(8px);
          text-align: center;
          padding: 18px 14px 24px;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-links a {
          text-decoration: none;
          color: #111;
          font-weight: 700;
        }
        .footer-links a:hover { text-decoration: underline; }
        .home-footer p { margin: 10px 0 0; }
        @media (max-width: 768px) {
          .home-logo {
            width: 100%;
            justify-content: flex-start;
          }
          .home-logo img {
            width: 96px;
            height: 38px;
          }
          .home-menu-btn {
            display: grid;
            place-items: center;
          }
          .home-actions {
            width: 100%;
            display: none;
          }
          .home-actions.open {
            display: flex;
          }
          .home-btn {
            flex: 1 1 calc(50% - 8px);
            text-align: center;
          }
          .hero-text h2 {
            font-size: 25px;
            line-height: 1.3;
          }
          .hero-text p {
            font-size: 15px;
          }
          .hero {
            grid-template-columns: 1fr;
          }
          .hero-media img {
            height: 190px;
          }
          .split {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 430px) {
          .home-main {
            padding: 14px 10px 10px;
          }
          .home-panel {
            padding: 14px;
            border-radius: 12px;
          }
          .home-logo img {
            width: 88px;
            height: 34px;
          }
          .home-btn {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </div>
  );
}
