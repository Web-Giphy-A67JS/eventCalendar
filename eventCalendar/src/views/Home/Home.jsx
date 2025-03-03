import { useState, useEffect } from "react";
import { getTotalUsers } from "../../../services/user.services";
import { Link } from "react-router-dom";

/**
 * Home page component displaying site statistics
 * 
 * @returns {JSX.Element} Home page with user and post counts
 */
export default function Home() {
  const [totalUsers, setTotalUsers] = useState(0);

/**
 * Fetches and displays total user and post counts
 * 
 * @effect Retrieves statistics on component mount
 */
  useEffect(() => {
    async function fetchTotalUsers() {
      const totalUsers = await getTotalUsers();
      setTotalUsers(totalUsers);
    }
    fetchTotalUsers();
  }, []);

  return (
    <div className="main-container">
      <section className="hero-section">
        <h2 className="hero-title">Welcome to our Event Calendar!</h2>
        <div className="button-container">
          <Link to="/register" className="primary-button">Get Started</Link>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalUsers}</div>
            <div className="stat-label">Active Members</div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h3 className="features-title">Why use our Calendar?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <h4 className="feature-title">Stay updated</h4>
            <p className="feature-description">
              Always keep track of every event and activity!
            </p>
          </div>
          <div className="feature-card">
            <h4 className="feature-title">Organize</h4>
            <p className="feature-description">
              Organize events not only for yourself, but team members as well!
            </p>
          </div>
          <div className="feature-card">
            <h4 className="feature-title">Grow</h4>
            <p className="feature-description">
              Learn from others and grow your skills through meaningful discussions
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}