import {ReactNode} from "react";

type Props = {
    left?: ReactNode;
    right?: ReactNode;
    children?: ReactNode;
    [x: string]: unknown;
}
const HorizontalExpander = ({left, right, children, ...rest}: Props) => {
    return (
        <div style={{display: 'flex'}} {...rest}>
            {left}
            <div style={{flexGrow: 1}}>{children}</div>
            {right}
        </div>
    )
}
export default HorizontalExpander;
