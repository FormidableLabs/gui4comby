import {CSSProperties, ReactNode} from "react";

type Props = {
    left?: ReactNode;
    right?: ReactNode;
    children?: ReactNode;
    style?: CSSProperties;
    [x: string]: unknown;
}
const HorizontalExpander = ({left, right, children, style, ...rest}: Props) => {
    const mixedStyle = {
        display: 'flex',
        ...style,
    }
    return (
        <div style={mixedStyle} {...rest}>
            {left}
            <div style={{flexGrow: 1}}>{children}</div>
            {right}
        </div>
    )
}
export default HorizontalExpander;
