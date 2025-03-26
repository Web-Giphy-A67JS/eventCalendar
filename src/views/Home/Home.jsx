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
    <div className="bg-gray-300 min-h-screen flex flex-col items-center p-8">
      <section className="hero-section w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white p-12 rounded-xl shadow-lg mb-16">
        <h2 className="text-4xl font-bold text-center mb-6">Welcome to our Event Calendar!</h2>
        <div className="text-center">
          <Link to="/register" className="btn btn-primary text-white px-8 py-3 rounded-full text-lg shadow-md hover:shadow-lg transition-all">
            Get Started
          </Link>
        </div>
      </section>
      <section className="stats-section w-full flex justify-center mb-16">
        <div className="stat-card bg-white rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
          <div className="stat-number text-5xl font-bold text-center text-indigo-600">{totalUsers}</div>
          <div className="stat-label text-center text-xl font-semibold mt-2 text-gray-600">Active Members</div>
        </div>
      </section>
      <section className="features-section w-full">
        <h3 className="features-title text-3xl font-bold text-center mb-8 text-gray-800">Why use our Calendar?</h3>
        <div className="features-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          <div className="feature-card bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h4 className="feature-title text-xl font-semibold text-indigo-600 mb-4">Stay Updated</h4>
            <p className="feature-description text-gray-700">Always keep track of your events and activities!</p>
          </div>
          <div className="feature-card bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h4 className="feature-title text-xl font-semibold text-indigo-600 mb-4">Organize</h4>
            <p className="feature-description text-gray-700">Organize events not only for yourself, but team members as well!</p>
          </div>
          <div className="feature-card bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
            <h4 className="feature-title text-xl font-semibold text-indigo-600 mb-4">Plan Ahead</h4>
            <p className="feature-description text-gray-700">Always know what is around the corner and stay prepared!</p>
          </div>
        </div>
      </section>
    </div>
  );
}
