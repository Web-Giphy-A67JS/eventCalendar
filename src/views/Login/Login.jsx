import { useContext, useState } from "react";
import { loginUser } from "../../../services/auth.services";
import { useNavigate, Link } from "react-router-dom";
import { AppContext } from "../../store/app.context";
import { Roles } from "../../../common/roles.enum";
import { getUserData } from "../../../services/user.services";

/**
 * User login component
 * 
 * @returns {JSX.Element} Login form
 */
export default function Login() {
  const { setAppState } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

/**
 * Handles user authentication and redirection
 * 
 * Authenticates user, retrieves user data, updates app state,
 * and redirects based on user role
 * 
 * @param {Event} e - Form submission event
 */
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await loginUser(email, password);
      const user = userCredential.user;
      const userData = await getUserData(user.uid);
      const userRole = userData[Object.keys(userData)[0]].role;

      setAppState({
        user,
        userData: userData[Object.keys(userData)[0]],
      });

      if (userRole === Roles.banned) {
        navigate("/banned");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Log in</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">
              Email
              <span className="required-marker">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="input-icon">📧</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
              <span className="required-marker">*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="password"
                className={`form-input ${error ? 'error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="input-icon">🔒</span>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="auth-button">
            Log in
          </button>
        </form>

        <p className="account-prompt">
          No account created yet?{" "}
          <Link to="/register" className="signup-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
