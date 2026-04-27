type PaginationProps = {
  paginaAtual: number;
  totalPaginas: number;
  quantidadeAtual: number;
  totalRegistros: number;
  onAnterior: () => void;
  onProxima: () => void;
};

export default function Pagination({
  paginaAtual,
  totalPaginas,
  quantidadeAtual,
  totalRegistros,
  onAnterior,
  onProxima
}: PaginationProps) {
  if (totalRegistros === 0) return null;

  return (
    <div className="pagination-wrapper">
      <span>
        Página {paginaAtual} de {totalPaginas} — exibindo {quantidadeAtual} de{" "}
        {totalRegistros} registros
      </span>

      <div className="pagination-actions">
        <button disabled={paginaAtual === 1} onClick={onAnterior}>
          Anterior
        </button>

        <button disabled={paginaAtual === totalPaginas} onClick={onProxima}>
          Próxima
        </button>
      </div>
    </div>
  );
}