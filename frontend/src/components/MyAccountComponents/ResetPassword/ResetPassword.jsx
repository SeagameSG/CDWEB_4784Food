import React, { useState } from "react";
import "./ResetPassword.css"; // Import CSS file

const ResetPassword = () => {
  const existingEmail = "user@example.com"; // Dummy email for verification
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ new: "", confirm: "" });
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0); // Strength level (0-3)

  const handleEmailSubmit = () => {
    if (email === existingEmail) {
      setStep(2);
      setError("");
    } else {
      setError("Không tìm thấy email! Vui lòng nhập email hợp lệ.");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });

    // Check password strength
    if (name === "new") {
      let strength = 0;
      if (value.length >= 6) strength++; // Minimum length
      if (value.match(/[A-Z]/)) strength++; // Uppercase letter
      if (value.match(/[0-9]/)) strength++; // Number
      if (value.match(/[^A-Za-z0-9]/)) strength++; // Special character
      setPasswordStrength(strength);
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength === 1) return "Weak";
    if (passwordStrength === 2) return "Good";
    return "Strong";
  };

  const handleResetPassword = () => {
    if (passwords.new !== passwords.confirm) {
      setError("Mật khẩu không khớp!");
      return;
    }

    // Reset all fields after successful password reset
    setEmail("");
    setPasswords({ new: "", confirm: "" });
    setPasswordStrength(0);
    setStep(1);
    setError("");

    alert("Đặt lại mật khẩu thành công!");
  };

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>

      {step === 1 ? (
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email của bạn"
          />
          {error && <p className="error-message">{error}</p>}
          <button onClick={handleEmailSubmit}>Verify Email</button>
        </div>
      ) : (
        <div>
          <input
            type="password"
            name="new"
            value={passwords.new}
            onChange={handlePasswordChange}
            placeholder="Mật khẩu mới"
          />

          {/* Password Strength Bar */}
          <div className="password-strength-container">
            <div className="password-strength-bar">
              <div className="bar" style={{ width: `${(passwordStrength / 3) * 100}%` }}></div>
            </div>
            <p className={`strength-label level-${passwordStrength}`}>
              {getStrengthLabel()}
            </p>
          </div>

          <input
            type="password"
            name="confirm"
            value={passwords.confirm}
            onChange={handlePasswordChange}
            placeholder="Xác nhận mật khẩu mới"
          />

          {error && <p className="error-message">{error}</p>}
          <button onClick={handleResetPassword}>Đặt lại mật khẩu</button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
