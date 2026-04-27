import StatCard from "../components/ui/StatCard";
import CardMain from "../components/ui/CardMain";
import DetailSection from "../components/ui/DetailSection";

import configuracoesData from "../data/configuracoes.json";

export default function Configuracoes() {
  const { sistema, monitoramento, pesagem, ocr, notificacoes } =
    configuracoesData;

  const stats = [
    {
      title: "Sistema",
      value: sistema.status,
      description: `${sistema.nome} • ${sistema.versao}`
    },
    {
      title: "Ambiente",
      value: sistema.ambiente,
      description: "Modo atual de operação"
    },
    {
      title: "Limite Diário",
      value: monitoramento.limitePassagensDia,
      description: "Passagens simuladas por dia"
    },
    {
      title: "Retenção",
      value: `${monitoramento.armazenamentoDias} dias`,
      description: "Tempo de armazenamento"
    }
  ];

  return (
    <div className="configuracoes-page mt-3">
      <h1 className="page-title">Configurações</h1>

      <div className="row g-3 mb-4">
        {stats.map((item, index) => (
          <div key={index} className="col-12 col-sm-6 col-xl-3">
            <StatCard {...item} />
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-6">
          <CardMain title="Configurações do Sistema">
            <div className="passagem-details-bootstrap">
              <DetailSection title="Identificação">
                <p>
                  <strong>Nome:</strong> {sistema.nome}
                </p>
                <p>
                  <strong>Versão:</strong> {sistema.versao}
                </p>
                <p>
                  <strong>Ambiente:</strong> {sistema.ambiente}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="status ok">{sistema.status}</span>
                </p>
              </DetailSection>
            </div>
          </CardMain>
        </div>

        <div className="col-12 col-xl-6">
          <CardMain title="Monitoramento">
            <div className="passagem-details-bootstrap">
              <DetailSection title="Parâmetros de Operação">
                <p>
                  <strong>Local padrão:</strong> {monitoramento.localPadrao}
                </p>
                <p>
                  <strong>Tempo de atualização:</strong>{" "}
                  {monitoramento.tempoAtualizacao}
                </p>
                <p>
                  <strong>Limite de passagens por dia:</strong>{" "}
                  {monitoramento.limitePassagensDia}
                </p>
                <p>
                  <strong>Armazenamento:</strong>{" "}
                  {monitoramento.armazenamentoDias} dias
                </p>
              </DetailSection>
            </div>
          </CardMain>
        </div>

        <div className="col-12 col-xl-6">
          <CardMain title="Regras de Pesagem">
            <div className="passagem-details-bootstrap">
              <DetailSection title="Limites e Tolerâncias">
                <p>
                  <strong>Tolerância PBT:</strong> {pesagem.toleranciaPbt}
                </p>
                <p>
                  <strong>Tolerância por eixo:</strong>{" "}
                  {pesagem.toleranciaEixo}
                </p>
                <p>
                  <strong>Unidade de peso:</strong> {pesagem.unidadePeso}
                </p>
                <p>
                  <strong>Fonte das regras:</strong> {pesagem.fonteRegras}
                </p>
              </DetailSection>
            </div>
          </CardMain>
        </div>

        <div className="col-12 col-xl-6">
          <CardMain title="OCR">
            <div className="passagem-details-bootstrap">
              <DetailSection title="Reconhecimento de Placas">
                <p>
                  <strong>Confiança mínima:</strong> {ocr.confiancaMinima}
                </p>
                <p>
                  <strong>Armazenar imagem:</strong> {ocr.armazenarImagem}
                </p>
                <p>
                  <strong>Formato da imagem:</strong> {ocr.formatoImagem}
                </p>
                <p>
                  <strong>Diretório:</strong> {ocr.diretorio}
                </p>
              </DetailSection>
            </div>
          </CardMain>
        </div>

        <div className="col-12">
          <CardMain title="Notificações e Alertas">
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <div className="filter-group">
                  <label>Alerta de Excesso de PBT</label>
                  <select defaultValue={notificacoes.alertaExcessoPbt}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="filter-group">
                  <label>Alerta de Excesso por Eixo</label>
                  <select defaultValue={notificacoes.alertaExcessoEixo}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="filter-group">
                  <label>Alerta OCR com baixa confiança</label>
                  <select defaultValue={notificacoes.alertaOcrBaixaConfianca}>
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="filter-group">
                  <label>E-mail do responsável</label>
                  <input
                    type="email"
                    defaultValue={notificacoes.emailResponsavel}
                  />
                </div>
              </div>

              <div className="col-12 d-flex justify-content-end mt-4">
                <button className="details-primary-button">
                  Salvar configurações
                </button>
              </div>
            </div>
          </CardMain>
        </div>
      </div>
    </div>
  );
}