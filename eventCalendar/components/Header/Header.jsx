import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../src/store/app.context";
import { useContext } from "react";
import { logoutUser } from "../../services/auth.services";
import { Roles } from "../../common/roles.enum";

/**
 * Header component that displays navigation based on user authentication and role
 * 
 * Renders different navigation options depending on:
 * - Whether user is logged in
 * - User's role (admin, regular user, or banned)
 * 
 * Banned users see only the logo and logout button
 * Admin users see all navigation options including admin tools
 * Regular users see standard navigation without admin tools
 * Non-authenticated users see only login and register options
 * 
 * @returns {JSX.Element} Header component with conditional navigation
 */
export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext)
  const navigate = useNavigate();

  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate('/')
      })
      .catch((error) => console.error(error.message))
  }

  if (userData?.role === Roles.banned) {
    return (
      <header className="navbar">
        <h1 className="logo">Event Calendar</h1>
        <div className="user-section">
          {user && <button className="logout-btn" onClick={logout}>Log Out</button>}
        </div>
      </header>
    );
  }

  return (
    <header className="navbar">
      <h1 className="logo">Event Calendar</h1>
      <nav className="nav-links">
        <NavLink to="/" className="nav-link">Home</NavLink>
        {user && userData && userData.role === Roles.admin && (
          <>
            <NavLink to="/user-profile" className="nav-link">My Profile</NavLink>
            <NavLink to="/calendar" className="nav-link">Calendar</NavLink>
            <NavLink to="/admin-tools" className="nav-link">Admin Tools</NavLink>
          </>
        )}
        {user && userData && userData.role === Roles.user && (
          <>
            <NavLink to="/user-profile" className="nav-link">My Profile</NavLink>
            <NavLink to="/calendar" className="nav-link">Calendar</NavLink>
          </>
        )}
        {!user && <NavLink to="/login" className="nav-link">Log in</NavLink>}
        {!user && <NavLink to="/register" className="nav-link">Register</NavLink>}
      </nav>
      <div className="user-section">
        {userData && <span className="welcome-text">Welcome, {userData.handle}</span>}
        {user && <button className="logout-btn" onClick={logout}>Log Out</button>}
      </div>
    </header>
  );
}