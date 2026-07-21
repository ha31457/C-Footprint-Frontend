import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" onClick={onConfirm} className="modal-btn modal-btn-confirm">
            Yes, Proceed
          </button>
          <button type="button" onClick={onCancel} className="modal-btn modal-btn-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
