  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import MainLayout from "./layout/MainLayout";

  import Dashboard from "./pages/Dashboard";
  import Passagens from "./pages/Passagens";
  import Relatorios from "./pages/Relatorios";
  import Veiculos from "./pages/Veiculos";
  import Configuracoes from "./pages/Configuracoes";

  function App() {

    return (
      <BrowserRouter>

        <Routes>

          <Route path="/" element={<MainLayout />}>

            <Route index element={<Dashboard />} />
            <Route path="passagens" element={<Passagens />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="veiculos" element={<Veiculos />} />

            <Route path="configuracoes" element={<Configuracoes />} />

          </Route>

        </Routes>

      </BrowserRouter>
    );

  }

  export default App;