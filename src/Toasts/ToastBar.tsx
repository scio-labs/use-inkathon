import { useInkathon } from '@/provider';
import { Toast } from '@/types';
import React, { useCallback } from 'react';
import { HiOutlineXMark as CloseIcon } from 'react-icons/hi2';
import ToastContent from './ToastContent';

// const HORIZONTAL_POSITION = 'left';
// const VERTICAL_POSITION = 'bottom';
// const DEFAULT_AUTO_HIDE_DURATION = 6000;

interface Props {
  toast: Toast;
  className?: string;
}

const ToastBar = ({ toast, className }: Props) => {
  const { id } = toast;
  const { removeToast } = useInkathon();

  const handleClose = useCallback(
    (_: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }

      removeToast(id);
    },
    [removeToast, id]
  );

  const containerStyle = {
    position: 'fixed' as const,
    bottom: '1rem',
    left: '1rem',
    zIndex: 50,
    padding: '1rem',
    backgroundColor: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const buttonStyle = {
    marginLeft: '1rem',
    color: 'rgba(107, 114, 128)',
    cursor: 'pointer',
  };

  const buttonHoverStyle = {
    color: 'rgba(75, 85, 99)',
  };

  return (
    <div style={containerStyle} className={className} role="alert">
      <ToastContent toast={toast} />
      <button
        style={buttonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.color = buttonHoverStyle.color)}
        onMouseLeave={(e) => (e.currentTarget.style.color = buttonStyle.color)}
        onClick={handleClose}
        aria-label="close"
      >
        <CloseIcon size={20} />
      </button>
    </div>
  );
};

export default ToastBar;
