/** Props for the ConfirmDialog component. */
export interface ConfirmDialogProps {
  /** Title text (e.g. "Confirm Approve"). */
  title: string;
  /** Body message. */
  message: string;
  /** Label for the confirm button. */
  confirmLabel: string;
  /** Tailwind color class for the confirm button. */
  confirmColor: string;
  /** Callback when confirmed. */
  onConfirm: () => void;
  /** Callback when cancelled. */
  onCancel: () => void;
}

/**
 * Modal confirmation dialog with overlay.
 *
 * @param props - Dialog props
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
        <p className="mb-6 text-sm text-slate-400">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white active:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
