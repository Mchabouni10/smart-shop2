//src/components/SignUpForm/SignUpForm.jsx
import React, { useState } from "react";
import { signUp } from "../../utilities/users-service";

const SignUpForm = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (evt) => {
    setFormData({
      ...formData,
      [evt.target.name]: evt.target.value,
    });
    setError("");
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const { name, email, password } = formData;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
      return;
    }
    if (name.length < 2 || name.length > 50) {
      setError('Name must be between 2 and 50 characters');
      return;
    }
    const payload = { name, email, password };
    try {
      setIsLoading(true);
      const user = await signUp(payload);
      setUser(user);
    } catch (e) {
      console.error('SignUp failed:', e);
      if (e.message.includes('Email already exists')) {
        setError('This email is already registered');
      } else if (e.message.includes('Validation')) {
        setError('Invalid input data. Please check your details.');
      } else {
        setError(e.message || 'Sign Up Failed - Try Again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disable = formData.password !== formData.confirm ||
    !formData.name ||
    !formData.email ||
    !formData.password ||
    formData.name.length < 2 ||
    formData.name.length > 50 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
    formData.password.length < 8 ||
    !/[A-Z]/.test(formData.password) ||
    !/[a-z]/.test(formData.password) ||
    !/\d/.test(formData.password) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ||
    isLoading;

  return (
    <div>
      <div className="form-container">
        <form autoComplete="off" onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <label>Confirm</label>
          <input
            type="password"
            name="confirm"
            value={formData.confirm}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <button className="Login-Out-Button" type="submit" disabled={disable}>
            {isLoading ? 'Signing Up...' : 'SIGN UP'}
          </button>
        </form>
      </div>
      {error && <p className="error-message" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
    </div>
  );
};

export default SignUpForm;