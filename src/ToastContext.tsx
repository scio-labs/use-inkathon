// import { createContext, useContext, useState } from 'react';
// import PropTypes from 'prop-types';
// import Snackbar from './Toasts/Snackbar';
// import { ToastType } from './Toasts/ToastContent';

// export type Toast = {
//   id: number
//   title?: string
//   link?: string
//   duration?: number
//   type: ToastType
// }

// const MAX_VISIBLE_TOASTS = 6

// export type ToastContextProps = {
//   toasts: Toast[]
//   setToasts: (toasts: Toast[]) => void
//   addToast: (toast: Omit<Toast, 'id'>) => void
//   removeToast: (id: Toast['id']) => void
// }

// const ToastContext = createContext<ToastContextProps | undefined>(undefined)

// const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
//   const [toasts, setToasts] = useState<Toast[]>([])

//   const addToast = (toast: Omit<Toast, 'id'>) => {
//     const id = Date.now()

//     const rest = toasts.length < MAX_VISIBLE_TOASTS ? toasts : toasts.slice(0, -1)

//     setToasts([{ ...toast, id }, ...rest])
//   }

//   const removeToast = (key: Toast['id']) => {
//     setToasts((prev) => prev.filter((toast) => toast.id !== key))
//   }

//   return (
//     <ToastContext.Provider value={{ toasts, setToasts, addToast, removeToast }}>
//       <Snackbar />
//       {children}
//     </ToastContext.Provider>
//   )
// }

// ToastProvider.propTypes = {
//   children: PropTypes.node.isRequired,
// };

