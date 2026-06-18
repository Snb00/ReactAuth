import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import AuthForm from "./AuthForm.jsx";
import Dashboard from "./Dashboard.jsx";

function Protected({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? children : <Navigate to="/login" replace />;
}

function Guest({ children }) {
  const { isAuthed } = useAuth();
  return isAuthed ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route
          path="/login"
          element={
            <Guest>
              <AuthForm mode="login" />
            </Guest>
          }
        />
        <Route
          path="/register"
          element={
            <Guest>
              <AuthForm mode="register" />
            </Guest>
          }
        />
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
