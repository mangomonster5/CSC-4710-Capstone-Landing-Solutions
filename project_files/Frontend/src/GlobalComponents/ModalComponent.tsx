import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  body: ReactNode;
  footer?: ReactNode;
  onDismiss: () => void;
}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, setIsOpen, title = "Modal title", body, footer, onDismiss }) => {
  if (!isOpen) return null;

  const handleClose = () => onDismiss();

  return (
    <div
      className="modal fade show"
      tabIndex={-1}
      style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
      aria-modal="true"
      role="dialog"
      onClick={handleClose} // clicking outside closes modal
    >
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">{title}</h1>
            <button type="button" className="btn-close" onClick={handleClose} aria-label="Close"></button>
          </div>
          <div className="modal-body p-0">{body}</div>
          {footer !== undefined ? (
            <div className="modal-footer">{footer}</div>
          ) : (
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
              <button type="button" className="btn btn-primary">Save changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalComponent;