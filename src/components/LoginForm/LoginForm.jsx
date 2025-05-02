//src/components/LoginForm/LoginForm.jsx
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { login, requestPasswordReset } from '../../utilities/users-service';

const LoginForm = ({ setUser, setShowReset }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (evt) => {
    setCredentials({
      ...credentials,
      [evt.target.name]: evt.target.value,
    });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { email, password } = credentials;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    console.log('Login attempt with credentials:', { email, password: '[REDACTED]' });
    try {
      setIsLoading(true);
      const user = await login(credentials);
      console.log('Login successful, user:', user);
      setUser(user);
    } catch (e) {
      console.error('Login failed:', e);
      setError(e.message || 'Login Failed - Try Again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const { email } = credentials;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setIsLoading(true);
      await requestPasswordReset(email);
      setMessage('Password reset email sent. Please check your inbox.');
      setError("");
    } catch (e) {
      console.error('Forgot password failed:', e);
      setError(e.message || 'Failed to send reset email. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="form-container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center' }}>
            <FontAwesomeIcon icon={faUser} size="4x" style={{ marginBottom: '10px', color: 'var(--text-dark)' }} />
          </div>
          <label>Email <FontAwesomeIcon icon={faEnvelope} size="1x" style={{ marginLeft: '6px', color: 'var(--text-dark)' }} /></label>
          <input
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder=""
            required
            disabled={isLoading}
          />
          <label>Password <FontAwesomeIcon icon={faLock} size="1x" style={{ marginLeft: '6px', color: 'var(--text-dark)' }} /></label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder=""
              required
              disabled={isLoading}
            />
          </div>
          <button className="Login-Out-Button" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'LOG IN'}
          </button>
        </form>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleForgotPassword}
            style={{ background: 'none', border: 'none', color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
            disabled={isLoading}
          >
            Forgot Password?
          </button>
        </div>
      </div>
      {message && <p className="success-message" style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;