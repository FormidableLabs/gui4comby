import {Toast, ToastContainer} from "react-bootstrap";
import useToaster from "./useToaster";
import {ToastInfo, ToastVariant} from "./Toaster.recoil";
import {AiOutlineAlert, AiOutlineCheckCircle, AiOutlineInfoCircle, AiOutlineWarning} from "react-icons/all";
import ReactTimeAgo from 'react-time-ago';

type ToastIconProps = {
  variant: ToastVariant;
  [x: string]: unknown;
}
const ToastIcon = ({variant, ...rest}:ToastIconProps) => {
  switch(variant) {
    case "danger": return <AiOutlineAlert {...rest}/>;
    case "warning": return <AiOutlineWarning {...rest}/>;
    case "success": return <AiOutlineCheckCircle {...rest}/>;
    default: return <AiOutlineInfoCircle {...rest}/>;
  }
}

type MyToastProps = {
  toast: ToastInfo;
  onClose?: () => void;
}
const MyToast = ({toast, onClose}: MyToastProps) => {
  return (
    <Toast onClose={onClose} className={`alert-${toast.variant}`}>
      <Toast.Header style={{color: `var(--bs-alert-color)`, background: `var(--bs-alert-bg)`}}>
        <ToastIcon variant={toast.variant} color={`var(--bs-alert-color)`}/>{/* TODO switch based on variant */}
        <strong style={{paddingLeft: '0.5em'}} className="me-auto">{toast.title}</strong>
        <small className="text-muted"><ReactTimeAgo date={new Date(toast.time)}/></small>
      </Toast.Header>
      <Toast.Body>{toast.message}</Toast.Body>
    </Toast>
  )
}

const Toaster = () => {
  const {toasts, close} = useToaster();

  return (
    <ToastContainer position={'bottom-end'} style={{padding: '1em'}}>
      {toasts.map(toast => <MyToast toast={toast} key={toast.id} onClose={()=>close(toast.id)}/>)}
    </ToastContainer>
  )
}
export default Toaster;
