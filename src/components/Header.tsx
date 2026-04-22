import { useLocation, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pathnames = location.pathname.split("/").filter(Boolean);

  const routeNames: Record<string, string> = {
    passagens: "Passagens",
    relatorios: "Relatórios",
    veiculos: "Veículos",
    configuracoes: "Configurações",
    perfil: "Perfil"
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header px-3 px-md-4">
      <div className="header-container">
        <div className="header-left">
          <button
            type="button"
            className="hamburger-button d-md-none me-3"
            onClick={onToggleSidebar}
          >
            ☰
          </button>

          <div className="breadcrumb">
            <Link to="/">Dashboard</Link>

            {pathnames.map((value, index) => {
              const to = "/" + pathnames.slice(0, index + 1).join("/");

              return (
                <span key={to}>
                  {" / "}
                  <Link to={to}>
                    {routeNames[value] || value}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>

        <div className="header-right">
          <div className="user-menu" ref={menuRef}>
            <button
              className="user-button"
              onClick={() => setOpen(!open)}
            >
              <div className="user-info">
                <span className="user-name">Admin</span>
              </div>

              <span className={`dropdown-arrow ${open ? "open" : ""}`}>
                ▾
              </span>
            </button>

            {open && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <div className="avatar large">A</div>
                  <div>
                    <strong>Admin</strong>
                    <p>admin@email.com</p>
                  </div>
                </div>

                <div className="dropdown-divider"></div>

                <Link to="/perfil">Meu perfil</Link>
                <Link to="/configuracoes">Configurações</Link>
                <button>Trocar conta</button>

                <div className="dropdown-divider"></div>

                <button className="logout">Sair</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}