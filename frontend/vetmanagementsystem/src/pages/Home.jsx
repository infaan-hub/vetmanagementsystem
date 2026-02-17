import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const featureCards = [
    { title: "Pet Management", icon: "PM", text: "Register, track, and organize every pet profile in one place." },
    { title: "Appointment Booking", icon: "AB", text: "Schedule visits quickly with clear date and time flow." },
    { title: "Treatment Records", icon: "TR", text: "Maintain complete treatment history and updates." },
    { title: "Doctor Dashboard", icon: "DD", text: "Doctors manage visits, vitals, notes, and treatment plans." },
    { title: "Client Dashboard", icon: "CD", text: "Clients view appointments, receipts, and pet-related data." },
    { title: "Medical Records", icon: "MR", text: "Securely store and retrieve pet medical history." },
    { title: "Treatment Management", icon: "TM", text: "Track prescriptions, care plans, and follow-up actions." },
  ];

  const services = [
    "Register pets",
    "Book appointments",
    "View medical history",
    "Contact doctors",
  ];

  const faqs = [
    {
      q: "How do I start using the system?",
      a: "Create an account, add pet details, and begin booking appointments.",
    },
    {
      q: "Can doctors and customers use different dashboards?",
      a: "Yes. Doctor and customer accounts automatically access role-specific dashboards.",
    },
    {
      q: "Is my data secure?",
      a: "Yes. Access is role-based and your records are protected by authenticated access.",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage:
          "url('https://i.pinimg.com/736x/f8/ad/d5/f8add51acaad02b06db9c2c8b1483898.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        color: "#111",
      }}
    >
      <header className="home-topbar">
        <h1 style={{ margin: 0, fontSize: "22px" }}>Veterinary Management System</h1>
        <nav style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/register" className="home-link">Customer Register</Link>
          <Link to="/doctor/register" className="home-link">Doctor Register</Link>
          <Link to="/login" className="home-link">Customer Login</Link>
          <Link to="/doctor/login" className="home-link">Doctor Login</Link>
          <Link to="/logout" className="home-link danger">Logout</Link>
        </nav>
      </header>

      <main className="home-main">
        <section className="hero panel">
          <h2>Welcome to Veterinary Management System</h2>
          <p>
            A complete and secure platform to manage pets, appointments, medical history,
            treatment plans, and communication between clients and doctors.
          </p>
          <div className="cta-row">
            <Link to="/register" className="home-link primary">Register Now</Link>
            <Link to="/login" className="home-link primary">Get Started</Link>
            <Link to="/appointments" className="home-link primary">Book Appointment</Link>
          </div>
        </section>

        <section className="panel">
          <h3>Features</h3>
          <div className="card-grid">
            {featureCards.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="icon-badge">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>Services</h3>
          <p>What you can do in this system:</p>
          <div className="chip-row">
            {services.map((s) => (
              <span key={s} className="chip">{s}</span>
            ))}
          </div>
        </section>

        <section className="panel">
          <h3>How It Works</h3>
          <div className="step-grid">
            <div className="step-card"><strong>1.</strong> Register</div>
            <div className="step-card"><strong>2.</strong> Add Pet</div>
            <div className="step-card"><strong>3.</strong> Book Appointment</div>
          </div>
        </section>

        <section className="panel">
          <h3>About System</h3>
          <p>
            Built for modern veterinary workflows to keep doctors and customers aligned
            with faster, organized, and reliable data access.
          </p>
        </section>

        <section className="panel split">
          <div>
            <h3>Why Choose Us</h3>
            <ul className="clean-list">
              <li>Fast</li>
              <li>Secure</li>
              <li>Easy to use</li>
            </ul>
          </div>
          <div>
            <h3>Benefits</h3>
            <ul className="clean-list">
              <li>Saves time</li>
              <li>Easy access</li>
              <li>Organized data</li>
            </ul>
          </div>
        </section>

        <section className="panel split">
          <div>
            <h3>Testimonials</h3>
            <p>"Simple and very practical for our clinic team."</p>
            <p>"Now we can track every pet visit without confusion."</p>
          </div>
          <div>
            <h3>Statistics</h3>
            <p><strong>500+</strong> pets registered</p>
            <p><strong>50+</strong> doctors using the system</p>
            <p><strong>1000+</strong> records managed securely</p>
          </div>
        </section>

        <section className="panel split">
          <div>
            <h3>Contact</h3>
            <p>Email: support@vms.com</p>
            <p>Phone: +1 (555) 123-7890</p>
          </div>
          <div>
            <h3>Location</h3>
            <p>123 Vet Care Street</p>
            <p>New York, NY, United States</p>
          </div>
        </section>

        <section className="panel">
          <h3>FAQ</h3>
          <div className="faq-grid">
            {faqs.map((f) => (
              <article key={f.q} className="faq-item">
                <h4>{f.q}</h4>
                <p>{f.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel banner">
          <h3>Create your account today</h3>
          <p>Register now to manage pets, appointments, and treatment records efficiently.</p>
          <div className="cta-row">
            <Link to="/register" className="home-link primary">Customer Register</Link>
            <Link to="/doctor/register" className="home-link primary">Doctor Register</Link>
          </div>
        </section>

        <section className="panel banner">
          <h3>Already have an account?</h3>
          <p>Login to continue from your doctor or customer dashboard.</p>
          <div className="cta-row">
            <Link to="/login" className="home-link primary">Customer Login</Link>
            <Link to="/doctor/login" className="home-link primary">Doctor Login</Link>
          </div>
        </section>

        <section className="panel secure-note">
          <h3>Secure System Message</h3>
          <p>Your data is safe and protected with authenticated access and role-based controls.</p>
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
        .home-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 16px 20px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(12px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        .home-main {
          width: min(1120px, 100%);
          margin: 0 auto;
          padding: 24px 16px 16px;
          display: grid;
          gap: 16px;
        }
        .panel {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(12px);
          border-radius: 18px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.18);
          padding: 22px;
        }
        .hero h2 { margin-top: 0; font-size: 34px; }
        .hero p { font-size: 18px; line-height: 1.6; margin-bottom: 18px; }
        .home-link {
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.55);
          color: #111;
          font-weight: 700;
          border: 1px solid rgba(0,0,0,0.12);
          transition: transform .18s ease, background .18s ease, color .18s ease;
        }
        .home-link:hover {
          background: rgba(0,0,0,0.85);
          color: #fff;
          transform: translateY(-2px);
        }
        .home-link.primary {
          background: rgba(11,92,255,0.95);
          color: #fff;
          border-color: rgba(11,92,255,0.95);
        }
        .home-link.primary:hover {
          background: rgba(0,0,0,0.85);
        }
        .home-link.danger {
          background: #d33b37;
          color: #fff;
          border-color: transparent;
        }
        .home-link.danger:hover {
          background: #b62b27;
        }
        .cta-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 10px;
        }
        .feature-card {
          background: rgba(255,255,255,0.8);
          border-radius: 14px;
          padding: 14px;
          border: 1px solid rgba(0,0,0,0.08);
          transition: transform .18s ease, box-shadow .18s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.14);
        }
        .feature-card h4 { margin: 8px 0 6px; }
        .feature-card p { margin: 0; }
        .icon-badge {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(11,92,255,0.12);
          color: #0b5cff;
          font-weight: 800;
          display: grid;
          place-items: center;
        }
        .chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        .chip {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(0,0,0,0.1);
          padding: 8px 12px;
          border-radius: 999px;
          font-weight: 600;
        }
        .step-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }
        .step-card {
          background: rgba(255,255,255,0.82);
          border-radius: 12px;
          padding: 12px;
          border: 1px solid rgba(0,0,0,0.08);
          font-weight: 600;
        }
        .split {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .clean-list {
          margin: 8px 0 0;
          padding-left: 18px;
        }
        .faq-grid {
          display: grid;
          gap: 10px;
        }
        .faq-item {
          background: rgba(255,255,255,0.82);
          border-radius: 12px;
          padding: 12px;
          border: 1px solid rgba(0,0,0,0.08);
        }
        .faq-item h4 { margin: 0 0 4px; }
        .faq-item p { margin: 0; }
        .banner { text-align: center; }
        .secure-note {
          border: 1px solid rgba(11,92,255,0.2);
          background: rgba(235,243,255,0.78);
        }
        .home-footer {
          margin-top: 16px;
          padding: 20px 16px 26px;
          text-align: center;
          background: rgba(255,255,255,0.74);
          backdrop-filter: blur(10px);
        }
        .footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 8px;
        }
        .footer-links a {
          text-decoration: none;
          color: #111;
          font-weight: 700;
        }
        .footer-links a:hover { text-decoration: underline; }
        @media (max-width: 700px) {
          .home-topbar h1 { width: 100%; font-size: 18px; }
          .home-topbar nav { width: 100%; }
          .home-link { flex: 1 1 48%; text-align: center; }
          .hero h2 { font-size: 26px; }
          .hero p { font-size: 16px; }
          .split { grid-template-columns: 1fr; }
          .step-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
