import {useRecoilState} from "recoil";
import {toasterState, ToastInfo, ToastVariant} from "./Toaster.recoil";
import {getId} from "../../App.recoil";

const useToaster = ()=> {
  const [toasts, setToasts] = useRecoilState(toasterState);

  const pushOverride = (toast: Pick<ToastInfo, 'title' | 'message'> & Partial<Omit<ToastInfo, 'title' | 'message'>>) => {
    const newToast: ToastInfo = Object.assign({}, {
        id: `toast-${getId()}`,
        variant: 'default',
        time: Date.now(),
      }, toast);
    setToasts(oldState => [
      ...oldState,
      newToast
    ])
  }

  const push = (title: string, message: string, variant?: ToastVariant) => {
    const newToast: ToastInfo = {
        title,
        message,
        id: `toast-${getId()}`,
        variant: variant || 'default',
        time: Date.now(),
      };
    setToasts(oldState => [
      ...oldState,
      newToast
    ])
  }

  const close = (id: string) => {
    setToasts(oldState => [
      ...oldState.filter(toast => toast.id !== id)
    ])
  }

  return {toasts, push, pushOverride, close};
}
export default useToaster;
