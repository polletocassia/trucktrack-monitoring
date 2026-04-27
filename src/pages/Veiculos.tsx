import { useMemo, useState } from "react";

import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import Table from "../components/ui/Table";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import ModalTabs from "../components/ui/ModalTabs";
import DetailSection from "../components/ui/DetailSection";

import veiculosData from "../data/veiculos.json";

type Veiculo = {
  id: string;
  placa: string;
  tipoVeiculo: string;
  descricaoTipo: string;
  marca: string;
  modelo: string;
  ano: string;
  transportadora: string;
  proprietario: string;
  documento: string;
  status: string;
  statusClass: string;
  limitePbt: string;
  totalPassagens: number;
  totalInfracoes: number;
  ultimaPassagem: string;
  ultimoLocal: string;
  observacao: string;
};

type VisualizacaoModal = "dados" | "operacao" | "historico";

const REGISTROS_POR_PAGINA = 10;

function getNumeroVeiculo(id: string): number {
  return Number(id.replace(/\D/g, "")) || 0;
}

export default function Veiculos() {
  const todosVeiculos: Veiculo[] = veiculosData.veiculos;

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [tipoVeiculo, setTipoVeiculo] = useState("todos");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [veiculoSelecionado, setVeiculoSelecionado] =
    useState<Veiculo | null>(null);

  const [visualizacaoModal, setVisualizacaoModal] =
    useState<VisualizacaoModal>("dados");

  const tiposVeiculo = useMemo(() => {
    return Array.from(new Set(todosVeiculos.map((item) => item.tipoVeiculo)));
  }, [todosVeiculos]);

  const veiculosFiltrados = useMemo(() => {
    return todosVeiculos
      .filter((item) => {
        const buscaFormatada = busca.toLowerCase();

        const correspondeBusca =
          item.id.toLowerCase().includes(buscaFormatada) ||
          item.placa.toLowerCase().includes(buscaFormatada) ||
          item.marca.toLowerCase().includes(buscaFormatada) ||
          item.modelo.toLowerCase().includes(buscaFormatada) ||
          item.transportadora.toLowerCase().includes(buscaFormatada);

        const correspondeStatus = status === "todos" || item.status === status;

        const correspondeTipo =
          tipoVeiculo === "todos" || item.tipoVeiculo === tipoVeiculo;

        return correspondeBusca && correspondeStatus && correspondeTipo;
      })
      .sort((a, b) => getNumeroVeiculo(b.id) - getNumeroVeiculo(a.id));
  }, [todosVeiculos, busca, status, tipoVeiculo]);

  const totalPaginas = Math.ceil(
    veiculosFiltrados.length / REGISTROS_POR_PAGINA
  );

  const veiculosPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * REGISTROS_POR_PAGINA;
    const fim = inicio + REGISTROS_POR_PAGINA;

    return veiculosFiltrados.slice(inicio, fim);
  }, [veiculosFiltrados, paginaAtual]);

  function limparFiltros() {
    setBusca("");
    setStatus("todos");
    setTipoVeiculo("todos");
    setPaginaAtual(1);
  }

  function abrirModal(veiculo: Veiculo) {
    setVeiculoSelecionado(veiculo);
    setVisualizacaoModal("dados");
  }

  function fecharModal() {
    setVeiculoSelecionado(null);
    setVisualizacaoModal("dados");
  }

  const totalVeiculos = veiculosFiltrados.length;

  const regulares = veiculosFiltrados.filter(
    (item) => item.statusClass === "ok"
  ).length;

  const atencao = veiculosFiltrados.filter(
    (item) => item.statusClass === "warn"
  ).length;

  const irregulares = veiculosFiltrados.filter(
    (item) => item.statusClass === "error"
  ).length;

  const totalInfracoes = veiculosFiltrados.reduce(
    (acc, item) => acc + item.totalInfracoes,
    0
  );

  const stats = [
    {
      title: "Veículos",
      value: totalVeiculos,
      description: "Registros encontrados"
    },
    {
      title: "Regulares",
      value: regulares,
      description: "Sem alerta relevante"
    },
    {
      title: "Atenção",
      value: atencao,
      description: "Com reincidência moderada"
    },
    {
      title: "Irregulares",
      value: irregulares,
      description: "Reincidência crítica"
    },
    {
      title: "Infrações",
      value: totalInfracoes,
      description: "Total acumulado"
    }
  ];

  return (
    <div className="veiculos-page mt-3">
      <h1 className="page-title">Veículos</h1>

      <div className="row g-3 mb-4">
        {stats.map((item, index) => (
          <div key={index} className="col-12 col-sm-6 col-md-4 col-xl">
            <StatCard {...item} />
          </div>
        ))}
      </div>

      <CardMain title="Filtros de Consulta">
        <div className="row g-3 passagens-filters">
          <div className="col-12 col-md-4">
            <div className="filter-group">
              <label>Buscar por placa, ID, marca ou transportadora</label>
              <input
                type="text"
                placeholder="Ex: EXD-9935, VOLVO ou Translog"
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPaginaAtual(1);
                }}
              />
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="filter-group">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPaginaAtual(1);
                }}
              >
                <option value="todos">Todos</option>
                <option value="Regular">Regular</option>
                <option value="Atenção">Atenção</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="filter-group">
              <label>Tipo de veículo</label>
              <select
                value={tipoVeiculo}
                onChange={(e) => {
                  setTipoVeiculo(e.target.value);
                  setPaginaAtual(1);
                }}
              >
                <option value="todos">Todos</option>
                {tiposVeiculo.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end mt-4">
            <button className="filter-clear-button" onClick={limparFiltros}>
              Limpar filtros
            </button>
          </div>
        </div>
      </CardMain>

      <div className="row g-3 mt-1">
        <div className="col-12">
          <CardMain title="Lista de Veículos">
            <Table<Veiculo>
              data={veiculosPaginados}
              emptyMessage="Nenhum veículo encontrado com os filtros selecionados."
              columns={[
                { header: "ID", accessor: "id" },
                { header: "Placa", accessor: "placa" },
                { header: "Tipo", accessor: "tipoVeiculo" },
                { header: "Marca", accessor: "marca" },
                { header: "Modelo", accessor: "modelo" },
                { header: "Transportadora", accessor: "transportadora" },
                { header: "Passagens", accessor: "totalPassagens" },
                { header: "Infrações", accessor: "totalInfracoes" },
                {
                  header: "Status",
                  render: (item) => (
                    <span className={`status ${item.statusClass}`}>
                      {item.status}
                    </span>
                  )
                },
                {
                  header: "Ação",
                  render: (item) => (
                    <button
                      className="table-action-button"
                      onClick={() => abrirModal(item)}
                    >
                      Detalhes
                    </button>
                  )
                }
              ]}
            />

            <Pagination
              paginaAtual={paginaAtual}
              totalPaginas={totalPaginas}
              quantidadeAtual={veiculosPaginados.length}
              totalRegistros={veiculosFiltrados.length}
              onAnterior={() => setPaginaAtual((pagina) => pagina - 1)}
              onProxima={() => setPaginaAtual((pagina) => pagina + 1)}
            />
          </CardMain>
        </div>
      </div>

      <Modal
        show={!!veiculoSelecionado}
        title={
          visualizacaoModal === "dados"
            ? "Dados do Veículo"
            : visualizacaoModal === "operacao"
            ? "Dados Operacionais"
            : "Histórico do Veículo"
        }
        subtitle={veiculoSelecionado?.placa}
        size="xl"
        onClose={fecharModal}
      >
        {veiculoSelecionado && (
          <>
            <ModalTabs<VisualizacaoModal>
              tabs={[
                { key: "dados", label: "Dados" },
                { key: "operacao", label: "Operação" },
                { key: "historico", label: "Histórico" }
              ]}
              activeTab={visualizacaoModal}
              onChange={setVisualizacaoModal}
            />

            {visualizacaoModal === "dados" && (
              <div className="passagem-details-bootstrap">
                <DetailSection title="Identificação">
                  <p>
                    <strong>Placa:</strong> {veiculoSelecionado.placa}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {veiculoSelecionado.tipoVeiculo} -{" "}
                    {veiculoSelecionado.descricaoTipo}
                  </p>
                  <p>
                    <strong>Marca/Modelo:</strong> {veiculoSelecionado.marca}{" "}
                    {veiculoSelecionado.modelo}
                  </p>
                  <p>
                    <strong>Ano:</strong> {veiculoSelecionado.ano}
                  </p>
                </DetailSection>

                <DetailSection title="Proprietário e Transportadora">
                  <p>
                    <strong>Transportadora:</strong>{" "}
                    {veiculoSelecionado.transportadora}
                  </p>
                  <p>
                    <strong>Proprietário:</strong>{" "}
                    {veiculoSelecionado.proprietario}
                  </p>
                  <p>
                    <strong>Documento:</strong> {veiculoSelecionado.documento}
                  </p>
                </DetailSection>
              </div>
            )}

            {visualizacaoModal === "operacao" && (
              <div className="passagem-details-bootstrap">
                <DetailSection title="Configuração Operacional">
                  <p>
                    <strong>Limite PBT:</strong> {veiculoSelecionado.limitePbt}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={`status ${veiculoSelecionado.statusClass}`}>
                      {veiculoSelecionado.status}
                    </span>
                  </p>
                  <p>
                    <strong>Observação:</strong> {veiculoSelecionado.observacao}
                  </p>
                </DetailSection>

                <DetailSection title="Último Registro">
                  <p>
                    <strong>Última passagem:</strong>{" "}
                    {veiculoSelecionado.ultimaPassagem}
                  </p>
                  <p>
                    <strong>Último local:</strong> {veiculoSelecionado.ultimoLocal}
                  </p>
                </DetailSection>
              </div>
            )}

            {visualizacaoModal === "historico" && (
              <div className="passagem-details-bootstrap">
                <DetailSection title="Indicadores Históricos">
                  <p>
                    <strong>Total de passagens:</strong>{" "}
                    {veiculoSelecionado.totalPassagens}
                  </p>
                  <p>
                    <strong>Total de infrações:</strong>{" "}
                    {veiculoSelecionado.totalInfracoes}
                  </p>
                  <p>
                    <strong>Taxa de infração:</strong>{" "}
                    {veiculoSelecionado.totalPassagens > 0
                      ? `${Math.round(
                          (veiculoSelecionado.totalInfracoes /
                            veiculoSelecionado.totalPassagens) *
                            100
                        )}%`
                      : "0%"}
                  </p>
                </DetailSection>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}