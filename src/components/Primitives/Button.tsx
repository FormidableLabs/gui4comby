import {ReactNode} from "react";

type ButtonProps = {
  children?: ReactNode;
  panel: boolean;
};
const Button = ({children, panel, ...rest}: ButtonProps) => {
  return <div className={panel ? 'panel':''} {...rest}>{children}</div>
}
export default Button;
