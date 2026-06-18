import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { oauthStart } from "./auth.js";
import {
  LogoMark,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  AlertIcon,
  SpinnerIcon,
  GoogleIcon,
} from "./icons.jsx";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Заполните все поля");
      return;
    }
    if (isRegister && password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (isRegister && password.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }

    setLoading(true);
    try {
      if (isRegister) await register(email.trim(), password);
      else await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="brand">
          <LogoMark />
          <span className="brand-name">Unite Gaming</span>
        </div>

        <div className="auth-title">{isRegister ? "Создать аккаунт" : "С возвращением"}</div>
        <div className="auth-sub">
          {isRegister ? "Зарегистрируйтесь, чтобы продолжить" : "Войдите в свой аккаунт"}
        </div>

        <button
          type="button"
          className="oauth-btn oauth-full"
          disabled={loading}
          onClick={() => oauthStart("google")}
        >
          <GoogleIcon />
          Продолжить с Google
        </button>

        <div className="divider">или по email</div>

        {error && (
          <div className="banner error">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}

        <div className="field">
          <label>Email</label>
          <div className="input-wrap">
            <span className="lead">
              <MailIcon />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="field">
          <label>Пароль</label>
          <div className="input-wrap">
            <span className="lead">
              <LockIcon />
            </span>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
            <button
              type="button"
              className="toggle-eye"
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPass ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {isRegister && (
          <div className="field">
            <label>Повторите пароль</label>
            <div className="input-wrap">
              <span className="lead">
                <LockIcon />
              </span>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Повторите пароль"
                autoComplete="new-password"
              />
            </div>
          </div>
        )}

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading && <SpinnerIcon />}
          {loading ? "Подождите…" : isRegister ? "Зарегистрироваться" : "Войти"}
        </button>

        <div className="switch">
          {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
          <button type="button" onClick={() => navigate(isRegister ? "/login" : "/register")}>
            {isRegister ? "Войти" : "Создать"}
          </button>
        </div>
      </form>
    </div>
  );
}
