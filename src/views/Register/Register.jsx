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
                setError("Please enter a valid phone number that is 10 digits long")
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

            /**
            * Updates app state and redirects on successful registration
            * 
            * Handles Firebase auth errors with user-friendly messages
            */
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

    /**
     * Updates user state for form fields
     * 
     * @param {string} prop - Property name to update
     * @returns {Function} Event handler that updates specified property
     */
    const updateUser = (prop) => (e) => {
        setUser({
            ...user,
            [prop]: e.target.value,
        });
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h2 className="register-title">Create Account</h2>
                <form onSubmit={register} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="firstName">
                                First Name
                                <span className="required-marker">*</span>
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className={`form-input ${error && !user.firstName ? "error" : ""}`}
                                    id="firstName"
                                    placeholder="Enter first name"
                                    value={user.firstName}
                                    onChange={updateUser("firstName")}
                                    required
                                />
                                <span className="input-icon">👤</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="lastName">
                                Last Name
                                <span className="required-marker">*</span>
                            </label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className={`form-input ${error && !user.lastName ? "error" : ""}`}
                                    id="lastName"
                                    placeholder="Enter last name"
                                    value={user.lastName}
                                    onChange={updateUser("lastName")}
                                    required
                                />
                                <span className="input-icon">👤</span>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="handle">
                            Username
                            <span className="required-marker">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className={`form-input ${error && !user.handle ? "error" : ""}`}
                                id="handle"
                                placeholder="Choose a username"
                                value={user.handle}
                                onChange={updateUser("handle")}
                                required
                            />
                            <span className="input-icon">🏷️</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email
                            <span className="required-marker">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                className={`form-input ${error && !user.email ? "error" : ""}`}
                                id="email"
                                placeholder="Enter your email"
                                value={user.email}
                                onChange={updateUser("email")}
                                required
                            />
                            <span className="input-icon">📧</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                            <span className="required-marker">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                className={`form-input ${error && !user.password ? "error" : ""}`}
                                id="password"
                                placeholder="Create a password"
                                value={user.password}
                                onChange={updateUser("password")}
                                required
                            />
                            <span className="input-icon">🔒</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="phone">
                            Phone
                            <span className="required-marker">*</span>
                        </label>
                        <div className="input-wrapper">
                            <input
                                type="tel"
                                className={`form-input ${error && !user.phone ? "error" : ""}`}
                                id="phone"
                                placeholder="Enter phone number (optional)"
                                value={user.phone}
                                onChange={updateUser("phone")}
                                required
                            />
                            <span className="input-icon">📱</span>
                        </div>
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="register-button">
                        Create Account
                    </button>
                </form>

                <p className="login-prompt">
                    Already have an account?{" "}
                    <Link to="/login" className="login-link">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}