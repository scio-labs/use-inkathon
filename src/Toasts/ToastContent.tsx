import { Toast } from '@/types';
import { CircularProgress } from '@mui/material';
import { useCallback } from 'react';
import { HiOutlineCheckCircle, HiOutlineArrowTopRightOnSquare as LaunchIcon } from 'react-icons/hi2';
import { MdErrorOutline as ErrorOutlineIcon } from 'react-icons/md';

export type ToastType = 'success' | 'error' | 'loading' | 'canceled';

export interface ToastContentProps {
  className?: string;
  toast: Toast;
}

const ToastContent = ({ className, toast }: ToastContentProps) => {
  const { type, title, link } = toast;

  const onOpenLink = useCallback(() => {
    window.open(link, '_blank');
  }, [link]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
  };

  const iconContainerStyle = {
    display: 'flex',
    marginRight: '1rem',
  };

  const linkIconStyle = {
    display: 'flex',
    cursor: 'pointer',
    paddingLeft: '1rem',
  };

  const canceledIconStyle = {
    color: '#FBBF24', // Tailwind 'text-yellow-500'
  };

  const errorIconStyle = {
    color: '#EF4444', // Tailwind 'text-red-500'
  };

  return (
    <div style={containerStyle} className={className} data-cy="notification-wrapper">
      <div style={iconContainerStyle}>
        {type === 'success' ? (
          <HiOutlineCheckCircle data-cy="notification-icon-success" size={24} />
        ) : type === 'loading' ? (
          <CircularProgress data-cy="notification-icon-loading" size={24} />
        ) : type === 'canceled' ? (
          <ErrorOutlineIcon style={canceledIconStyle} data-cy="notification-icon-canceled" size={24} />
        ) : (
          <ErrorOutlineIcon style={errorIconStyle} data-cy="notification-icon-error" size={24} />
        )}
      </div>
      <p>{title}</p>
      {!!link && (
        <div style={linkIconStyle} onClick={onOpenLink}>
          <LaunchIcon size={20} />
        </div>
      )}
    </div>
  );
};

export default ToastContent;
