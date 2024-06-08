import { useInkathon } from '@/provider';
import { Toast } from '@/types';
import { IconButton, Snackbar } from '@mui/material';
import React, { useCallback } from 'react';
import { HiOutlineXMark as CloseIcon } from 'react-icons/hi2';
import ToastContent from './ToastContent';

const HORIZONTAL_POSITION = 'left'
const VERTICAL_POSITION = 'bottom'
const DEFAULT_AUTO_HIDE_DURATION = 6000

interface Props {
  toast: Toast;
  className?: string;
}

const ToastBar = ({ toast, className }: Props) => {
  const { id, duration } = toast
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
    <Snackbar
      className={className}
      open={true}
      anchorOrigin={{ vertical: VERTICAL_POSITION, horizontal: HORIZONTAL_POSITION }}
      autoHideDuration={toast.type === 'error' ? null : duration || DEFAULT_AUTO_HIDE_DURATION}
      onClose={handleClose}
      key={id}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={handleClose}
        >
          <CloseIcon size={20} />
        </IconButton>
      }
      message={<ToastContent toast={toast} />}
    />
  );
};

export default ToastBar;
