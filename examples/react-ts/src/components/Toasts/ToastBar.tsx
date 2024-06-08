import { Toast } from '@/types';
import { useInkathon } from '@poppyseed/lastic-sdk';
import React, { useCallback } from 'react';
import { HiOutlineXMark as CloseIcon } from 'react-icons/hi2';
import ToastContent from './ToastContent';

const HORIZONTAL_POSITION = 'left';
const VERTICAL_POSITION = 'bottom';
const DEFAULT_AUTO_HIDE_DURATION = 6000;

interface Props {
  toast: Toast;
  className?: string;
}

const ToastBar = ({ toast, className }: Props) => {
  const { id, duration } = toast;
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

  return (
    <div
      className={`fixed ${VERTICAL_POSITION}-4 ${HORIZONTAL_POSITION}-4 z-50 p-4 bg-white shadow-lg rounded flex items-center justify-between ${className}`}
      role="alert"
    >
      <ToastContent toast={toast} />
      <button
        className="ml-4 text-gray-500 hover:text-gray-700"
        onClick={handleClose}
        aria-label="close"
      >
        <CloseIcon size={20} />
      </button>
    </div>
  );
};

export default ToastBar;
