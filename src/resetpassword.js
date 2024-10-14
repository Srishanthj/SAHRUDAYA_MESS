// import React, { useState } from "react";
// import { auth } from "./firebase_config";
// import { confirmPasswordReset } from "firebase/auth";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./login.css";

// const ResetPassword = () => {
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();

//   const handleResetPassword = async (e) => {
//     e.preventDefault();
//     const searchParams = new URLSearchParams(location.search);
//     const oobCode = searchParams.get("oobCode"); 

//     if (newPassword !== confirmPassword) {
//       setErrorMessage("Passwords do not match.");
//       return;
//     }

//     try {
//       await confirmPasswordReset(auth, oobCode, newPassword);
//       setSuccessMessage("Password has been successfully reset.");
//       setTimeout(() => {
//         navigate("/");
//       }, 2000); // Redirect to login page after 3 seconds
//     } catch (error) {
//       setErrorMessage("Failed to reset password. Please try again.");
//     }
//   };

//   return (
//     <div className="login-container">
//       <form className="login-form" onSubmit={handleResetPassword}>
//         <h1>Reset Your Password</h1>
//         <input
//           type="password"
//           placeholder="New Password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Confirm New Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           required
//         />
//         <button type="submit" className="submit-button">
//           Reset Password
//         </button>
//         {errorMessage && (
//           <div className="error-modal">
//             <p>{errorMessage}</p>
//           </div>
//         )}
//         {successMessage && (
//           <div className="success-modal">
//             <p>{successMessage}</p>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default ResetPassword;
import React, { useState } from "react";
import { auth } from "./firebase_config";
import { confirmPasswordReset } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import "./login.css";
import './resetpassword.css';


const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(location.search);
    const oobCode = searchParams.get("oobCode");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccessMessage("Password has been successfully reset.");
      setErrorMessage(""); // Clear any existing error messages
    } catch (error) {
      setErrorMessage("Failed to reset password. Please try again.");
    }
  };

  const handleOkClick = () => {
    navigate("/login");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleResetPassword}>
        <h1>Reset Your Password</h1>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="submit-button">
          Reset Password
        </button>

        {errorMessage && (
          <div className="error-modal">
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="success-modal">
            <p>{successMessage}</p>
            <button onClick={handleOkClick} className="ok-button">
              OK
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;
