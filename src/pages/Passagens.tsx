import { useMemo, useState } from "react";

import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import passagensData from "../data/passagens.json";

type Passagem = {
    id: string;
    placa: string;
    data: string;
    tipoVeiculo: string;
    descricaoTipo?: string;
    pbt: string;
    limite: string;
    excesso: string;
    status: string;
    statusClass: string;
    local?: string;
    velocidade?: string;
    faixa?: string;
    sentido?: string;
    marca?: string;
    cargaDeclarada?: string;
    confiancaOcr?: string;
    imagemOcr?: string;
    relatorio?: {
        numero: string;
        situacao: string;
        observacao: string;
        baseLegal: string;
    };
    eixos?: {
        eixo: number;
        peso: string;
        limite: string;
    }[];
};

const REGISTROS_POR_PAGINA = 50;

function parseToneladas(value: string): number {
    if (value === "-") return 0;
    return Number(value.replace("t", "").replace("+", "").trim()) || 0;
}

function getNumeroPassagem(id: string): number {
    return Number(id.replace(/\D/g, "")) || 0;
}

export default function Passagens() {
    const todasPassagens: Passagem[] = passagensData.passagens;

    const [busca, setBusca] = useState("");
    const [status, setStatus] = useState("todos");
    const [tipoVeiculo, setTipoVeiculo] = useState("todos");
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [passagemSelecionada, setPassagemSelecionada] =
        useState<Passagem | null>(null);

    const [visualizacaoModal, setVisualizacaoModal] = useState<
        "detalhes" | "relatorio" | "ocr"
    >("detalhes");

    const tiposVeiculo = useMemo(() => {
        return Array.from(new Set(todasPassagens.map((item) => item.tipoVeiculo)));
    }, [todasPassagens]);

    const passagensFiltradas = useMemo(() => {
        return todasPassagens
            .filter((item) => {
                const buscaFormatada = busca.toLowerCase();

                const correspondeBusca =
                    item.placa.toLowerCase().includes(buscaFormatada) ||
                    item.id.toLowerCase().includes(buscaFormatada);

                const correspondeStatus = status === "todos" || item.status === status;

                const correspondeTipo =
                    tipoVeiculo === "todos" || item.tipoVeiculo === tipoVeiculo;

                return correspondeBusca && correspondeStatus && correspondeTipo;
            })
            .sort((a, b) => getNumeroPassagem(b.id) - getNumeroPassagem(a.id));
    }, [todasPassagens, busca, status, tipoVeiculo]);

    const totalPaginas = Math.ceil(
        passagensFiltradas.length / REGISTROS_POR_PAGINA
    );

    const passagensPaginadas = useMemo(() => {
        const inicio = (paginaAtual - 1) * REGISTROS_POR_PAGINA;
        const fim = inicio + REGISTROS_POR_PAGINA;

        return passagensFiltradas.slice(inicio, fim);
    }, [passagensFiltradas, paginaAtual]);

    function limparFiltros() {
        setBusca("");
        setStatus("todos");
        setTipoVeiculo("todos");
        setPaginaAtual(1);
    }

    function abrirModal(passagem: Passagem) {
        setPassagemSelecionada(passagem);
        setVisualizacaoModal("detalhes");
    }

    function fecharModal() {
        setPassagemSelecionada(null);
        setVisualizacaoModal("detalhes");
    }

    const totalPassagens = passagensFiltradas.length;

    const totalAprovadas = passagensFiltradas.filter(
        (item) => item.statusClass === "ok"
    ).length;

    const totalInfracoes = passagensFiltradas.filter(
        (item) => item.statusClass !== "ok"
    ).length;

    const maiorExcesso = useMemo(() => {
        if (!passagensFiltradas.length) return "0.0t";

        const maior = Math.max(
            ...passagensFiltradas.map((item) => parseToneladas(item.excesso))
        );

        return `${maior.toFixed(1)}t`;
    }, [passagensFiltradas]);

    const stats = [
        {
            title: "Passagens",
            value: totalPassagens,
            description: "Registros encontrados"
        },
        {
            title: "Aprovadas",
            value: totalAprovadas,
            description: "Dentro do limite permitido"
        },
        {
            title: "Infrações",
            value: totalInfracoes,
            description: "Com excesso identificado"
        },
        {
            title: "Maior Excesso",
            value: maiorExcesso,
            description: "Maior excesso da consulta"
        }
    ];

    return (
        <div className="passagens-page mt-3">
            <h1 className="page-title">Passagens</h1>

            <div className="row g-3 mb-4">
                {stats.map((item, index) => (
                    <div key={index} className="col-12 col-sm-6 col-xl-3">
                        <StatCard {...item} />
                    </div>
                ))}
            </div>

            <CardMain title="Filtros de Consulta">
                <div className="passagens-filters">
                    <div className="filter-group">
                        <label>Buscar por placa ou ID</label>
                        <input
                            type="text"
                            placeholder="Ex: ABC-1234 ou PSG-001"
                            value={busca}
                            onChange={(e) => {
                                setBusca(e.target.value);
                                setPaginaAtual(1);
                            }}
                        />
                    </div>

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
                            <option value="Aprovado">Aprovado</option>
                            <option value="Excesso PBT">Excesso PBT</option>
                            <option value="Excesso Eixo">Excesso Eixo</option>
                        </select>
                    </div>

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

                    <button className="filter-clear-button" onClick={limparFiltros}>
                        Limpar filtros
                    </button>
                </div>
            </CardMain>

            <div className="row g-3 mt-1">
                <div className="col-12 col-md-12">
                    <CardMain title="Lista de Passagens">
                        <div className="table-responsive">
                            <table className="w-100 recent-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Placa</th>
                                        <th>Data</th>
                                        <th>Tipo</th>
                                        <th>PBT</th>
                                        <th>Limite</th>
                                        <th>Excesso</th>
                                        <th>Status</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {passagensPaginadas.map((item, index) => (
                                        <tr key={`${item.id}-${index}`}>
                                            <td>{item.id}</td>
                                            <td>{item.placa}</td>
                                            <td>{item.data}</td>
                                            <td>{item.tipoVeiculo}</td>
                                            <td>{item.pbt}</td>
                                            <td>{item.limite}</td>
                                            <td>{item.excesso}</td>
                                            <td>
                                                <span className={`status ${item.statusClass}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="table-action-button"
                                                    onClick={() => abrirModal(item)}
                                                >
                                                    Detalhes
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {passagensFiltradas.length === 0 && (
                                <div className="empty-state">
                                    Nenhuma passagem encontrada com os filtros selecionados.
                                </div>
                            )}
                        </div>

                        {passagensFiltradas.length > 0 && (
                            <div className="pagination-wrapper">
                                <span>
                                    Página {paginaAtual} de {totalPaginas} — exibindo{" "}
                                    {passagensPaginadas.length} de {passagensFiltradas.length}{" "}
                                    registros
                                </span>

                                <div className="pagination-actions">
                                    <button
                                        disabled={paginaAtual === 1}
                                        onClick={() => setPaginaAtual((pagina) => pagina - 1)}
                                    >
                                        Anterior
                                    </button>

                                    <button
                                        disabled={paginaAtual === totalPaginas}
                                        onClick={() => setPaginaAtual((pagina) => pagina + 1)}
                                    >
                                        Próxima
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardMain>
                </div>
            </div>

            {passagemSelecionada && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    role="dialog"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                        <div className="modal-content">
                            <div className="modal-header passagem-modal-header">
                                <div>
                                    <h5 className="modal-title">
                                        {visualizacaoModal === "detalhes" && "Detalhes da Passagem"}
                                        {visualizacaoModal === "relatorio" && "Relatório da Passagem"}
                                        {visualizacaoModal === "ocr" && "Imagem OCR"}
                                    </h5>
                                    <small>{passagemSelecionada.id}</small>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={fecharModal}
                                ></button>
                            </div>

                            <div className="modal-body mb-3">
                                <ul className="nav nav-pills modal-tabs-bootstrap mb-4">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${visualizacaoModal === "detalhes" ? "active" : ""
                                                }`}
                                            onClick={() => setVisualizacaoModal("detalhes")}
                                        >
                                            Detalhes
                                        </button>
                                    </li>

                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${visualizacaoModal === "relatorio" ? "active" : ""
                                                }`}
                                            onClick={() => setVisualizacaoModal("relatorio")}
                                        >
                                            Relatório
                                        </button>
                                    </li>

                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${visualizacaoModal === "ocr" ? "active" : ""
                                                }`}
                                            onClick={() => setVisualizacaoModal("ocr")}
                                        >
                                            OCR
                                        </button>
                                    </li>
                                </ul>

                                {visualizacaoModal === "detalhes" && (
                                    <div className="passagem-details-bootstrap">
                                        <div className="detalhes-section mb-3">
                                            <h6>Dados do Veículo</h6>

                                            <p><strong>Placa:</strong> {passagemSelecionada.placa}</p>
                                            <p>
                                                <strong>Tipo de veículo:</strong>{" "}
                                                {passagemSelecionada.tipoVeiculo}
                                                {passagemSelecionada.descricaoTipo
                                                    ? ` - ${passagemSelecionada.descricaoTipo}`
                                                    : ""}
                                            </p>
                                            <p><strong>Marca:</strong> {passagemSelecionada.marca || "Não informado"}</p>
                                            <p><strong>Carga declarada:</strong> {passagemSelecionada.cargaDeclarada || "Não informado"}</p>
                                        </div>

                                        <div className="detalhes-section mb-3">
                                            <h6>Dados da Passagem</h6>

                                            <p><strong>Data:</strong> {passagemSelecionada.data}</p>
                                            <p><strong>Local:</strong> {passagemSelecionada.local || "Não informado"}</p>
                                            <p><strong>Velocidade:</strong> {passagemSelecionada.velocidade || "Não informado"}</p>
                                            <p>
                                                <strong>Sentido / Faixa:</strong>{" "}
                                                {passagemSelecionada.sentido || "Não informado"} /{" "}
                                                {passagemSelecionada.faixa || "Não informado"}
                                            </p>
                                        </div>

                                        <div className="detalhes-section mb-3">
                                            <h6>Resultado da Pesagem</h6>

                                            <p><strong>PBT registrado:</strong> {passagemSelecionada.pbt}</p>
                                            <p><strong>Limite permitido:</strong> {passagemSelecionada.limite}</p>
                                            <p><strong>Excesso:</strong> {passagemSelecionada.excesso}</p>
                                            <p>
                                                <strong>Status:</strong>{" "}
                                                <span className={`status ${passagemSelecionada.statusClass}`}>
                                                    {passagemSelecionada.status}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {visualizacaoModal === "relatorio" && (
                                    <div className="passagem-details-bootstrap">
                                        <div className="detalhes-section mb-3">
                                            <h6>Relatório de Monitoramento</h6>
                                            <p><strong>Número:</strong> {passagemSelecionada.relatorio?.numero || "Não informado"}</p>
                                            <p><strong>Situação:</strong> {passagemSelecionada.relatorio?.situacao || "Não informado"}</p>
                                            <p><strong>Base legal:</strong> {passagemSelecionada.relatorio?.baseLegal || "Não informado"}</p>
                                            <p><strong>Observação:</strong> {passagemSelecionada.relatorio?.observacao || "Não informado"}</p>
                                        </div>

                                        <div className="detalhes-section mb-3">
                                            <h6>Dados da Passagem</h6>
                                            <p><strong>Placa:</strong> {passagemSelecionada.placa}</p>
                                            <p><strong>Veículo:</strong> {passagemSelecionada.tipoVeiculo}</p>
                                            <p><strong>Local:</strong> {passagemSelecionada.local || "Não informado"}</p>
                                            <p><strong>Data:</strong> {passagemSelecionada.data}</p>
                                            <p><strong>PBT registrado:</strong> {passagemSelecionada.pbt}</p>
                                            <p><strong>Limite permitido:</strong> {passagemSelecionada.limite}</p>
                                            <p><strong>Excesso:</strong> {passagemSelecionada.excesso}</p>
                                            <p><strong>Status:</strong> {passagemSelecionada.status}</p>
                                        </div>

                                        <div className="detalhes-section mb-3">
                                            <h6>Pesagem por Eixo</h6>

                                            <div className="table-responsive">
                                                <table className="w-100 recent-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Eixo</th>
                                                            <th>Peso</th>
                                                            <th>Limite</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {passagemSelecionada.eixos && passagemSelecionada.eixos.length > 0 ? (
                                                            passagemSelecionada.eixos.map((eixo) => (
                                                                <tr key={eixo.eixo}>
                                                                    <td>Eixo {eixo.eixo}</td>
                                                                    <td>{eixo.peso}</td>
                                                                    <td>{eixo.limite}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={3}>Nenhum eixo informado.</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {visualizacaoModal === "ocr" && (
                                    <div className="passagem-details-bootstrap">
                                        <div className="detalhes-section mb-3">
                                            <h6>Visualização OCR</h6>

                                            <div className="ocr-image-box">
                                                <div className="ocr-plate">{passagemSelecionada.placa}</div>
                                                <div className="ocr-line"></div>
                                                <span>Imagem simulada OCR</span>
                                            </div>
                                        </div>

                                        <div className="detalhes-section mb-3">
                                            <h6>Dados Reconhecidos</h6>
                                            <p><strong>Placa reconhecida:</strong> {passagemSelecionada.placa}</p>
                                            <p><strong>Confiança OCR:</strong> {passagemSelecionada.confiancaOcr || "Não informado"}</p>
                                            <p><strong>Arquivo da imagem:</strong> {passagemSelecionada.imagemOcr || "Não informado"}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}