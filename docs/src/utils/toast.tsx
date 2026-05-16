import toast from 'react-hot-toast';

const ICONS = { success: '✓', error: '✗', info: 'ℹ' } as const;
type ToastType = keyof typeof ICONS;

function CustomToast({ message, type, visible }: { message: string; type: ToastType; visible: boolean }) {
  return (
    <div className={`custom-toast border ${type}${visible ? '' : ' hide'}`}>
      <span className="toast-icon">{ICONS[type]}</span>
      <span>{message}</span>
    </div>
  );
}

const show = (type: ToastType) => (message: string) =>
  toast.custom(t => <CustomToast message={message} type={type} visible={t.visible} />, {
    duration: type === 'error' ? 5000 : 3000,
  });

export const showToast = {
  success: show('success'),
  error: show('error'),
  info: show('info'),
};
