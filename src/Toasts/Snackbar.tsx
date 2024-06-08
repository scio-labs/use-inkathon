import { useInkathon } from '@/provider';
import ToastBar from './ToastBar';

interface Props {
  className?: string;
}

const Snackbar = ({ className }: Props) => {
  const { toasts } = useInkathon();

  const containerStyle = {
    position: 'fixed' as const,
    bottom: '1rem',
    left: '1rem',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  };
  console.log("toasts");

  return (
    <div style={containerStyle} className={className}>
      {toasts.map((toast) => (
        <ToastBar toast={toast} key={toast.id} />
      ))}
    </div>
  );
};

export default Snackbar;
