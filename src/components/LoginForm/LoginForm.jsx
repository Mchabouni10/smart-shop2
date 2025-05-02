//src/components/LoginForm/LoginForm.jsx

import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { login } from '../../utilities/users-service';

const LoginForm = ({ setUser }) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (evt) => {
    setCredentials({
      ...credentials,
      [evt.target.name]: evt.target.value,
    });
    setError("");
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
      const user = await login(credentials);
      console.log('Login successful, user:', user);
      setUser(user);
    } catch (e) {
      console.error('Login failed:', e);
      setError(e.message || 'Login Failed - Try Again');
    }
  };

  return (
    <div>
      <div className="form-container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center' }}>
            <FontAwesomeIcon icon={faUser} size="4x" style={{ marginBottom: '10px', color: 'var(--text-dark)' }} />
          </div>
          <label>Email<FontAwesomeIcon icon={faEnvelope} size="1x" style={{marginLeft:'6px', color: 'var(--text-dark)' }} /></label>
          <input
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder=""
            required
          />
          <label>Password<FontAwesomeIcon icon={faLock} size="1x" style={{marginLeft:'6px', color: 'var(--text-dark)' }} /></label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder=""
              required
            />
          </div>
          <button className="Login-Out-Button" type="submit">LOG IN</button>
        </form>
      </div>
      <p className="error-message">{error}</p>
    </div>
  );
};

export default LoginForm;