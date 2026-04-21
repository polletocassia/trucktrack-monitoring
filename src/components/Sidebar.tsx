import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      ></div>

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

        <div className="logo">
          <span className="logo-main">Truck</span>
          <span className="logo-sub">Track</span>
        </div>

        <div className="menu-group">
          <div className="menu-section">Monitoramento</div>

          <nav className="menu">
            <NavLink to="/" end onClick={onClose}>
              Dashboard
            </NavLink>

            <NavLink to="/passagens" onClick={onClose}>
              Passagens
            </NavLink>

            <NavLink to="/relatorios" onClick={onClose}>
              Relatórios
            </NavLink>

            <NavLink to="/veiculos" onClick={onClose}>
              Veículos
            </NavLink>
          </nav>
        </div>

        <div className="menu-group">
          <div className="menu-section">Sistema</div>

          <nav className="menu">
            <NavLink to="/configuracoes" onClick={onClose}>
              Configurações
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <span>TruckTrack v1.0</span>
        </div>
      </aside>
    </>
  );
}