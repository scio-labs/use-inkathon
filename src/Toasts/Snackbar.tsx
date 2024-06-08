import { useInkathon } from '@/provider';
import { Stack } from '@mui/material';
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
  return (
    <div style={containerStyle} className={className}>
      <Stack
        className={className}
        flexDirection="column"
        gap={1}
      >
          {toasts.map((toast) => (
            <ToastBar toast={toast} key={toast.id} />
          ))}
      </Stack>
    </div>
  );
};

export default Snackbar;
