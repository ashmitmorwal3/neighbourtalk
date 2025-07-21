import React, { useState } from "react";
import { Container } from "@mui/material";
import Login from "./Login";
import Register from "./Register";

const AuthContainer: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleAuth = () => {
    setShowLogin(!showLogin);
  };

  return (
    <Container>
      {showLogin ? (
        <Login onSwitchToRegister={toggleAuth} />
      ) : (
        <Register onSwitchToLogin={toggleAuth} />
      )}
    </Container>
  );
};

export default AuthContainer;
