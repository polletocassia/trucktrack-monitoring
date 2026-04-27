import { ReactNode } from "react";

type ModalProps = {
  show: boolean;
  title: string;
  subtitle?: string;
  size?: "sm" | "lg" | "xl";
  onClose: () => void;
  children: ReactNode;
};

export default function Modal({
  show,
  title,
  subtitle,
  size = "xl",
  onClose,
  children
}: ModalProps) {
  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-dialog-scrollable modal-${size}`}
      >
        <div className="modal-content">
          <div className="modal-header passagem-modal-header">
            <div>
              <h5 className="modal-title">{title}</h5>
              {subtitle && <small>{subtitle}</small>}
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body mb-3">{children}</div>
        </div>
      </div>
    </div>
  );
}