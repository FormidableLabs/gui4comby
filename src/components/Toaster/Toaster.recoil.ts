import {atom} from "recoil";
export enum ToastVariant {
  primary='primary',
  secondary='secondary',
  success='success',
  warning='warning',
  danger='danger',
  info='info',
  light='light',
  dark='dark',
  default='default'
}
//export type ToastVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'light' | 'dark' | 'default';
export type ToastInfo = {
  variant: ToastVariant;
  id: string;
  title: string;
  message: string;
  time: number;
}

export const toasterState = atom<ToastInfo[]>({
  key: 'toasterToasts',
  default: [],
});
