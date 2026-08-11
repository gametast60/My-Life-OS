import React from "react";
import { ConfirmDialog } from "../ConfirmDialog";

export interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant,
  onConfirm,
  onCancel,
}) => {
  return (
    <ConfirmDialog
      isOpen={open}
      title={title}
      message={message}
      confirmText={confirmLabel}
      cancelText={cancelLabel}
      variant={variant}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
