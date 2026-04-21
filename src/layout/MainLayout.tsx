import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleToggleSidebar() {
    setSidebarOpen(!sidebarOpen);
  }

  function handleCloseSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      <div className="main">
        <Header onToggleSidebar={handleToggleSidebar} />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}