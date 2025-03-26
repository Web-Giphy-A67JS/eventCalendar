import { AppContext } from "../../store/app.context";
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../../services/auth.services";
import { createUserHandle, getUserByHandle, getUserByPhone } from "../../../services/user.services";
import { Roles } from "../../../common/roles.enum";

/**
 * User registration component
 * 
 * @returns {JSX.Element} Registration form
 */
export default function Register() {
  const { setAppState } = useContext(AppContext);
  const [user, setUser] = useState({
    handle: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: Roles.user,
    phone: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * Handles user registration with validation
   * 
   * Validates form inputs, checks for existing username,
   * creates user account, and redirects on success
   * 
   * @param {Event} e - Form submission event
   */
  const register = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const nameRegex = /^[A-Za-z]+$/;

      if (user.firstName.length < 1 || user.firstName.length > 30 || !nameRegex.test(user.firstName)) {
        setError("Your first name must be between 1 and 30 characters and include only letters");
        return;
      }

      if (user.handle.length < 3 || user.handle.length > 30) {
        setError("Your username must be between 3 and 30 characters");
        return;
      }

      if (user.lastName.length < 1 || user.lastName.length > 30 || !nameRegex.test(user.lastName)) {
        setError("Your last name must be between 1 and 30 characters and include only letters");
        return;
      }

      const userFromDbByPhone = await getUserByPhone(user.phone);
      if (userFromDbByPhone) {
        setError("This phone number is already in use");
        return;
      }
      if (user.phone.length !== 10 || isNaN(user.phone)) {
        setError("Please enter a valid phone number that is 10 digits long");
        return;
      }

      const userFromDb = await getUserByHandle(user.handle);
      if (userFromDb) {
        setError(`User with username "${user.handle}" already exists`);
        return;
      }

      if (user.password.length < 8 || user.password.length > 30 || !/[!@#$%^&*(),.?":{}|<>]/.test(user.password) || !/\d/.test(user.password)) {
        setError("Your password must be between 8 and 30 characters, and include at least one symbol and one number");
        return;
      }

      const userCredential = await registerUser(user.email, user.password);
      await createUserHandle(
        user.handle,
        userCredential.user.uid,
        user.email,
        user.firstName,
        user.lastName,
        user.phone,
        user.role
      );

      setAppState({
        user: userCredential.user,
        userData: null,
      });
      navigate("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setError("The email address is already in use by another account.");
      } else {
        setError(error.message);
      }
    }
  };

  const updateUser = (prop) => (e) => {
    setUser({
      ...user,
      [prop]: e.target.value,
    });
  };

  return (
    <div className="pt-16 pb-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full sm:w-96 max-w-sm ">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Create Account</h2>
        
        <form onSubmit={register} className="space-y-6">
          {/* First Name */}
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700" htmlFor="firstName">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !user.firstName ? 'border-red-500' : ''}`}
                id="firstName"
                placeholder="Enter first name"
                value={user.firstName}
                onChange={updateUser("firstName")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">👤</span>
            </div>
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700" htmlFor="lastName">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !user.lastName ? 'border-red-500' : ''}`}
                id="lastName"
                placeholder="Enter last name"
                value={user.lastName}
                onChange={updateUser("lastName")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">👤</span>
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700" htmlFor="handle">
              Username <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !user.handle ? 'border-red-500' : ''}`}
                id="handle"
                placeholder="Choose a username"
                value={user.handle}
                onChange={updateUser("handle")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">🏷️</span>
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !user.email ? 'border-red-500' : ''}`}
                id="email"
                placeholder="Enter your email"
                value={user.email}
                onChange={updateUser("email")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📧</span>
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !user.password ? 'border-red-500' : ''}`}
                id="password"
                placeholder="Create a password"
                value={user.password}
                onChange={updateUser("password")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">🔒</span>
            </div>
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="block text-lg font-medium text-gray-700" htmlFor="phone">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                className={`form-input w-full p-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${error && !user.phone ? 'border-red-500' : ''}`}
                id="phone"
                placeholder="Enter phone number"
                value={user.phone}
                onChange={updateUser("phone")}
                required
              />
              <span className="absolute top-1/2 right-5 transform -translate-y-1/2 text-gray-500">📱</span>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit Button */}
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
