import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../../src/store/app.context";
import { useContext } from "react";
import { logoutUser } from "../../services/auth.services";
import { Roles } from "../../common/roles.enum";
import { PATHS } from "../../src/config/paths";


export default function Header() {
  const { user, userData, setAppState } = useContext(AppContext);
  const navigate = useNavigate();

  const logout = () => {
    logoutUser()
      .then(() => {
        setAppState({
          user: null,
          userData: null,
        });
        navigate('/');
      })
      .catch((error) => console.error(error.message));
  };

  return (
    <header className="navbar bg-white text-black shadow-sm fixed top-0 left-0 right-0 z-50 h-30">
      <div className="flex justify-between w-full">
        <div className="flex-1 flex items-center">
          <NavLink to={PATHS.HOME} className="text-bold font-bold text-2xl ml-5">Event Calendar</NavLink>
        </div>
        <div className="flex items-center space-x-4">
          {userData?.role === Roles.banned ? (
            <div className="user-section">
              {user && <button className="btn btn-error" onClick={logout}>Log Out</button>}
            </div>
          ) : (
            <>
              <nav className="menu menu-horizontal p-0">
                {user && userData && userData.role === Roles.admin && (
                  <>
                    <NavLink to={PATHS.PROFILE} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">My Profile</NavLink>
                    <NavLink to={PATHS.CALENDAR} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Calendar</NavLink>
                    <NavLink to={PATHS.EVENTS} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Events</NavLink>
                    <NavLink to={PATHS.CONTACT_LIST} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Contact List</NavLink>
                    <NavLink to={PATHS.ADMIN_TOOLS} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Admin Tools</NavLink>
                  </>
                )}
                {user && userData && userData.role === Roles.user && (
                  <>
                    <NavLink to={PATHS.PROFILE} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">My Profile</NavLink>
                    <NavLink to={PATHS.CALENDAR} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Calendar</NavLink>
                    <NavLink to={PATHS.EVENTS} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Events</NavLink>
                    <NavLink to={PATHS.CONTACT_LIST} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Contact List</NavLink>
                  </>
                )}
                {!user && <NavLink to={PATHS.EVENTS} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Events</NavLink>}
                {!user && <NavLink to={PATHS.LOGIN} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Log in</NavLink>}
                {!user && <NavLink to={PATHS.REGISTER} className="nav-link btn btn-ghost bg-transparent hover:bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:text-white mr-4">Register</NavLink>}
              </nav>
              <div className="flex items-center space-x-4">
                {userData && <span className="welcome-text">Welcome, {userData.handle}</span>}
                {user && <button className="btn btn-error" onClick={logout}>Log Out</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}