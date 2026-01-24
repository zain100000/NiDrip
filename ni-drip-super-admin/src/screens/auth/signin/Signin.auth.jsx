/**
 * Signin Component
 *
 * Provides the authentication form for logging into the admin panel.
 * Includes input validation, error handling, and Redux-powered login action.
 * Redirects to the admin dashboard on successful login.
 *
 * @component
 * @example
 * return (
 *   <Signin />
 * )
 */

import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../../../styles/global.styles.css";
import "./Signin.auth.css";
import Logo from "../../../assets/logo/logo.png";
import InputField from "../../../utilities/InputField/InputField.utility";
import Button from "../../../utilities/Button/Button.utility";
import {
  validateEmail,
  validatePassword,
  validateFields,
} from "../../../utilities/Validations/Validation.utility";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/slices/auth.slice";

const Signin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const hasErrors = emailError || passwordError || !email || !password;
  }, [emailError, passwordError, email, password]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(validateEmail(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(validatePassword(e.target.value));
  };

  const handleSignin = async (event) => {
    event.preventDefault();

    const fields = { email, password };
    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      toast.error(errors[firstErrorKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const loginData = { email, password };
      const resultAction = await dispatch(login(loginData));

      if (login.fulfilled.match(resultAction)) {
        const successMessage =
          resultAction.payload.message || "Login successful";
        toast.success(successMessage);

        setTimeout(() => {
          navigate("/super-admin/dashboard");
        }, 2000);

        setEmail("");
        setPassword("");
      } else if (login.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;

        let errorMessage = "Login failed. Please try again.";

        if (errorPayload) {
          errorMessage = errorPayload.message || errorMessage;

          if (
            errorPayload.status === 423 &&
            errorPayload.message?.includes("Account locked")
          ) {
            toast.error(errorPayload.message, { autoClose: 5000 });
            return;
          }

          if (
            errorPayload.status === 423 &&
            errorPayload.message?.includes("Too many failed")
          ) {
            toast.error(errorPayload.message, { autoClose: 6000 });
            return;
          }

          if (errorPayload.attempts !== undefined) {
            const remainingAttempts = 3 - errorPayload.attempts;
            if (remainingAttempts > 0) {
              toast.error(
                `${errorMessage} (${remainingAttempts} attempts remaining)`,
              );
              return;
            }
          }
        }

        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("An unexpected error occurred during login:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signin-screen">
      <div className="signin-grid">
        {/* Left side - Form */}
        <div className="left-side">
          <div className="form-content">
            <div className="logo-container">
              <img src={Logo} alt="Logo" className="logo" />
            </div>

            <form className="form-container" onSubmit={handleSignin}>
              <div className="input-group">
                <InputField
                  label="Email"
                  type="text"
                  editable={true}
                  value={email}
                  onChange={handleEmailChange}
                  icon={<i className="fas fa-envelope"></i>}
                  width={350}
                />
              </div>

              <div className="input-group">
                <InputField
                  label="Password"
                  type="password"
                  secureTextEntry={true}
                  editable={true}
                  value={password}
                  onChange={handlePasswordChange}
                  icon={<i className="fas fa-lock"></i>}
                  width={350}
                />
              </div>

              <div className="forgot-password-container">
                <NavLink to="/auth/forgot-password" className="forgot-link">
                  Forgot password?
                </NavLink>
              </div>

              <div className="btn-container">
                <Button
                  title="Sign in"
                  width={"100%"}
                  onPress={handleSignin}
                  loading={loading}
                  icon={<i className="fas fa-sign-in-alt"></i>}
                />
              </div>

              <div className="signup-container">
                <span className="signup-text">Don't have an account?</span>
                <NavLink to="/auth/signup" className="signup-link">
                  Sign up
                </NavLink>
              </div>
            </form>
          </div>
        </div>

        {/* Right side - Decorative orbiting elements (now 10 balls) */}
        <div className="right-side">
          <div className="orbit-system">
            <div className="orbit orbit-1">
              <div className="ball ball-1"></div>
            </div>
            <div className="orbit orbit-2">
              <div className="ball ball-2"></div>
            </div>
            <div className="orbit orbit-3">
              <div className="ball ball-3"></div>
            </div>
            <div className="orbit orbit-4">
              <div className="ball ball-4"></div>
            </div>
            <div className="orbit orbit-5">
              <div className="ball ball-5"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
