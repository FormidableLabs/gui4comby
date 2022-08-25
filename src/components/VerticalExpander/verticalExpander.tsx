import {CSSProperties, ReactNode} from "react";

type Props = {
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    style?: CSSProperties;
    [x: string]: unknown;
}
const VerticalExpander = ({header, footer, children, style, ...rest}: Props) => {
    const componentStyle: CSSProperties = Object.assign({},{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    }, style || {});

    return (
        <div style={componentStyle} {...rest}>
            {header}
            <div style={{flexGrow: 1, minHeight: 0}}>
                <div style={{height: '100%',  overflowY: 'auto'}}>
                    {children}
                </div>
            </div>
            {footer}
        </div>
    )
}
export default VerticalExpander;
