import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { fetchDevices, revokeDevice } from "./auth.js";
import { detectType, describe, timeAgo } from "./devices.js";
import {
  LogoMark,
  LogoutIcon,
  DevicesIcon,
  DesktopIcon,
  MobileIcon,
  TabletIcon,
  GlobeIcon,
  ClockIcon,
  AlertIcon,
  SpinnerIcon,
  TrashIcon,
} from "./icons.jsx";

function TypeIcon({ type }) {
  if (type === "mobile") return <MobileIcon />;
  if (type === "tablet") return <TabletIcon />;
  return <DesktopIcon />;
}

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [devices, setDevices] = useState(null);
  const [error, setError] = useState("");
  const [revoking, setRevoking] = useState({});

  useEffect(() => {
    let active = true;
    fetchDevices(token)
      .then((list) => active && setDevices(list))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [token]);

  const isCurrent = (d, i) => d.current || (devices?.every((x) => x.current === undefined) && i === 0);

  const handleRevoke = async (d, i) => {
    const id = d.id ?? i;
    setRevoking((r) => ({ ...r, [id]: true }));
    setError("");
    try {
      await revokeDevice(token, d.id);
      setDevices((list) => list.filter((x, j) => (x.id ?? j) !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setRevoking((r) => ({ ...r, [id]: false }));
    }
  };

  const initial = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="dash">
      <div className="dash-inner">
        <div className="topbar">
          <div className="brand">
            <LogoMark />
            <span className="brand-name">Unite Gaming</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <LogoutIcon />
            Выйти
          </button>
        </div>

        <div className="card">
          <div className="profile">
            <div className="avatar">{initial}</div>
            <div className="profile-meta">
              <div className="name">{user?.name || "Пользователь"}</div>
              <div className="email">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-head">
            <DevicesIcon />
            Активные устройства
          </div>
          <div className="section-sub">
            Список устройств и сессий, выполнявших вход в ваш аккаунт.
          </div>

          {error && (
            <div className="banner error">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}

          {!error && devices === null && (
            <div className="loading-row">
              <SpinnerIcon />
              Загрузка устройств…
            </div>
          )}

          {!error && devices && devices.length === 0 && (
            <div className="empty">Сессий пока нет</div>
          )}

          {!error &&
            devices &&
            devices.map((d, i) => {
              const ua = d.ua || d.userAgent || "";
              const type = d.type || detectType(ua);
              const name = d.name || describe(ua);
              const current = isCurrent(d, i);
              const id = d.id ?? i;
              return (
                <div className="device" key={id}>
                  <div className="device-icon">
                    <TypeIcon type={type} />
                  </div>
                  <div className="device-info">
                    <div className="device-name">
                      {name}
                      {current && <span className="pill">это устройство</span>}
                    </div>
                    <div className="device-sub">
                      <span>
                        <GlobeIcon /> {d.ip || "IP скрыт"}
                      </span>
                      {(d.lastActive || d.createdAt) && (
                        <span>
                          <ClockIcon /> {timeAgo(d.lastActive || d.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  {!current && (
                    <button
                      className="revoke-btn"
                      onClick={() => handleRevoke(d, i)}
                      disabled={revoking[id]}
                      aria-label="Завершить сессию"
                      title="Завершить сессию"
                    >
                      {revoking[id] ? <SpinnerIcon /> : <TrashIcon />}
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
