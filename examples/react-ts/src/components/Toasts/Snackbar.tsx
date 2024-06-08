import { useInkathon } from '@poppyseed/lastic-sdk';
import ToastBar from './ToastBar';

interface Props {
  className?: string;
}

const Snackbar = ({ className }: Props) => {
  const { toasts } = useInkathon();

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex flex-col gap-2 ${className}`}>
      {toasts.map((toast) => (
        <ToastBar toast={toast} key={toast.id} />
      ))}
    </div>
  );
};

export default Snackbar;
