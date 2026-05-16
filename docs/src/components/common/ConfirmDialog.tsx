import { useState, useEffect } from 'react';
import styles from './ConfirmDialog.module.css';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

let _confirm: ConfirmFn | null = null;

export const confirm = (opts: ConfirmOptions): Promise<boolean> => {
  if (!_confirm) return Promise.resolve(false);
  return _confirm(opts);
};

interface State {
  opts: ConfirmOptions;
  resolve: (v: boolean) => void;
}

export function ConfirmDialogProvider() {
  const [state, setState] = useState<State | null>(null);

  useEffect(() => {
    _confirm = opts =>
      new Promise<boolean>(resolve => {
        setState({ opts, resolve });
      });
    return () => { _confirm = null; };
  }, []);

  if (!state) return null;

  const close = (result: boolean) => {
    state.resolve(result);
    setState(null);
  };

  return (
    <div className="modal-overlay show" onClick={() => close(false)}>
      <div className={`border ${styles.card}`} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>{state.opts.title}</h2>
        <div className={styles.divider} />
        {state.opts.message && (
          <p className={styles.message}>{state.opts.message}</p>
        )}
        <div className={styles.btnRow}>
          <button className="btn border" onClick={() => close(false)}>
            {state.opts.cancelText ?? 'Cancel'}
          </button>
          <button
            className={`btn border${state.opts.danger ? ' btn-danger' : ' btn-primary'}`}
            onClick={() => close(true)}
          >
            {state.opts.confirmText ?? 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
