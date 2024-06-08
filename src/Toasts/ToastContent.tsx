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

  return (
    <div className={`flex flex-row items-center ${className}`} data-cy="notification-wrapper">
      <div className="iconContainer mr-4 flex">
        {type === 'success' ? (
          <HiOutlineCheckCircle data-cy="notification-icon-success" size={24} />
        ) : type === 'loading' ? (
          <CircularProgress data-cy="notification-icon-loading" size={24} />
        ) : type === 'canceled' ? (
          <ErrorOutlineIcon className="text-yellow-500" data-cy="notification-icon-canceled" size={24} />
        ) : (
          <ErrorOutlineIcon className="text-red-500" data-cy="notification-icon-error" size={24} />
        )}
      </div>
      <p className="titleContainer">{title}</p>
      {!!link && (
        <div className="linkIcon flex cursor-pointer pl-4" onClick={onOpenLink}>
          <LaunchIcon size={20} />
        </div>
      )}
    </div>
  );
};

export default ToastContent;
