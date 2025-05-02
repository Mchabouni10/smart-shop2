import React, { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom'; // Add react-router-dom
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import { resetPassword } from '../../utilities/users-service';

const ResetPasswordForm = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: "",
    token: "",
    newPassword: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Parse query parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get('email') || "";
    const token = params.get('token') || "";
    setFormData((prev) => ({
      ...prev,
      email: decodeURIComponent(email),
      token,
    }));
  }, [location.search]);

  const handleChange = (evt) => {
    setFormData({
      ...formData,
      [evt.target.name]: evt.target.value,
    });
    setError("");
    setMessage("");
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { email, token, newPassword, confirm } = formData;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    if (!token) {
      setError('Reset token is required');
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword({ email, token, newPassword });
      setMessage('Password reset successful! Please log in.');
      setError("");
      setFormData({ email: "", token: "", newPassword: "", confirm: "" });
    } catch (e) {
      console.error('Reset password failed:', e);
      setError(e.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="form-container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center' }}>
            <FontAwesomeIcon icon={faLock} size="4x" style={{ marginBottom: '10px', color: 'var(--text-dark)' }} />
            <h3>Reset Password</h3>
          </div>
          <label>Email <FontAwesomeIcon icon={faEnvelope} size="1x" style={{ marginLeft: '6px', color: 'var(--text-dark)' }} /></label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            disabled={isLoading}
          />
          <label>Reset Token</label>
          <input
            type="text"
            name="token"
            value={formData.token}
            onChange={handleChange}
            placeholder="Enter the token from your email"
            required
            disabled={isLoading}
          />
          <label>New Password <FontAwesomeIcon icon={faLock} size="1x" style={{ marginLeft: '6px', color: 'var(--text-dark)' }} /></label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="Enter new password"
            required
            disabled={isLoading}
          />
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirm"
            value={formData.confirm}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
            disabled={isLoading}
          />
          <button className="Login-Out-Button" type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting...' : 'RESET PASSWORD'}
          </button>
        </form>
      </div>
      {message && <p className="success-message" style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    </div>
  );
};

export default ResetPasswordForm;