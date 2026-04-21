import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">

        <div className="logo">
          <span className="logo-main">Truck</span>
          <span className="logo-sub">Track</span>
        </div>

      <div className="menu-group">

        <div className="menu-section">Monitoramento</div>

        <nav className="menu">

          <NavLink to="/" end>
            Dashboard
          </NavLink>

          <NavLink to="/passagens">
            Passagens
          </NavLink>

          <NavLink to="/relatorios">
            Relatórios
          </NavLink>

          <NavLink to="/veiculos">
            Veículos
          </NavLink>

        </nav>

      </div>

      <div className="menu-group">

        <div className="menu-section">Sistema</div>

        <nav className="menu">

          <NavLink to="/configuracoes">
            Configurações
          </NavLink>

        </nav>

      </div>

      <div className="sidebar-footer">
        <span>TruckTrack v1.0</span>
      </div>

    </aside>
  );
}