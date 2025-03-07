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
    <div >
      <div className="bg-white p-8 rounded-xl shadow-xl w-full sm:w-96">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Log in</h2>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="email"
                className={`form-input w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''} bg-white`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📧</span>
            </div>
          </div>

          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="password"
                className={`form-input w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error ? 'border-red-500' : ''} bg-white`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">🔒</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          No account created yet?{" "}
          <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
