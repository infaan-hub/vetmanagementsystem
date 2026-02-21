import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pinImages = [
    "https://i.pinimg.com/736x/95/e1/58/95e158868c3ffe27a748e2d7a16ca410.jpg",
    "https://i.pinimg.com/736x/66/f2/7a/66f27a139976bf66316ea089fc022d67.jpg",
    "https://i.pinimg.com/736x/8d/d3/07/8dd307185c19f57313fcaf269aeccad8.jpg",
    "https://i.pinimg.com/736x/40/ca/34/40ca348056397314c11369684248701f.jpg",
    "https://i.pinimg.com/736x/8c/d0/24/8cd02418ea964e082f7fa32b6ea06125.jpg",
    "https://i.pinimg.com/736x/37/13/d0/3713d02b728ca1d82a7f5fa49214aae3.jpg",
  ];

  const features = [
    {
      title: "Pet Management",
      description: "Store pet profiles, breed details, and owner links in one place.",
      image: pinImages[0],
    },
    {
      title: "Appointment Booking",
      description: "Track upcoming visits and simplify schedule management.",
      image: pinImages[1],
    },
    {
      title: "Treatment Records",
      description: "Keep diagnosis, treatment plans, and progress history organized.",
      image: pinImages[2],
    },
    {
      title: "Doctor Dashboard",
      description: "Give doctors a fast view of tasks, visits, and patient updates.",
      image: pinImages[3],
    },
    {
      title: "Client Dashboard",
      description: "Help pet owners see records, reminders, and appointment status.",
      image: pinImages[4],
    },
    {
      title: "Medical Records",
      description: "Securely access complete health history whenever needed.",
      image: pinImages[5],
    },
    {
      title: "Treatment Management",
      description: "Monitor medications, procedures, and care outcomes in real time.",
      image: pinImages[0],
    },
  ];

  return (
    <div className="home-root">
      <header className="home-topbar">
        <h1></h1>
        <button
          type="button"
          className="home-menu-btn"
          aria-label="Toggle home menu"
          onClick={() => setMobileNavOpen((v) => !v)}
        >
          {"\u2630"}
        </button>
        <div className={`home-actions ${mobileNavOpen ? "open" : ""}`}>
          <Link to="/login" className="home-btn">Customer Login</Link>
          <Link to="/doctor/login" className="home-btn">Doctor Login</Link>
        </div>
      </header>

      <main className="home-main">
        <section className="home-panel hero">
          <h2>Welcome to Veterinary Management System🐾</h2>
          <p>
            Manage pets, appointments, treatments, and medical records in one
            secure and easy platform for doctors and customers.
          </p>
        </section>

        <section className="home-panel">
          <h3>Features</h3>
          <div className="feature-grid">
            {features.map((item) => (
              <article key={item.title} className="feature-card">
                <img src={item.image} alt={item.title} className="feature-card-image" loading="lazy" />
                <h4>{item.title}</h4>
                <p>{item.description}</p>
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
          <h3>Already have an account?</h3>
          <div className="banner-actions">
            <Link to="/login" className="home-btn black">Customer Login</Link>
            <Link to="/doctor/login" className="home-btn black">Doctor Login</Link>
          </div>
        </section>
      </main>

      <footer className="home-footer">
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
        .home-topbar h1 { margin: 0; font-size: 22px; }
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
        .hero h2 { margin: 0 0 8px; font-size: 32px; }
        .hero p { margin: 0; font-size: 17px; line-height: 1.6; }
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
          overflow: hidden;
          transition: transform .16s ease, box-shadow .16s ease;
        }
        .feature-card-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 10px;
          display: block;
          margin-bottom: 10px;
          background: #eaeaea;
        }
        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
        }
        .feature-card h4 { margin: 0 0 6px; }
        .feature-card p { margin: 0; color: #333; line-height: 1.45; font-size: 14px; }
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
          .home-topbar h1 {
            width: 100%;
            font-size: 19px;
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
          .hero h2 {
            font-size: 25px;
            line-height: 1.3;
          }
          .hero p {
            font-size: 15px;
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
          .home-btn {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </div>
  );
}
