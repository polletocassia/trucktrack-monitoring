import { ReactNode } from "react";

type Column<T> = {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
};

export default function Table<T>({
  columns,
  data,
  emptyMessage = "Nenhum registro encontrado."
}: TableProps<T>) {
  return (
    <div className="table-responsive">
      <table className="w-100 recent-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render
                    ? column.render(item)
                    : column.accessor
                    ? String(item[column.accessor] ?? "")
                    : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && <div className="empty-state">{emptyMessage}</div>}
    </div>
  );
}