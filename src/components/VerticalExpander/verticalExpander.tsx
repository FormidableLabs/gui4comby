import { CSSProperties, ReactNode, useId } from "react";

type Props = {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  id?: string;
  [x: string]: unknown;
};
const VerticalExpander = ({
  id,
  header,
  footer,
  children,
  style,
  ...rest
}: Props) => {
  const componentStyle: CSSProperties = Object.assign(
    {},
    {
      height: "100%",
      display: "flex",
      flexDirection: "column",
    },
    style || {}
  );

  return (
    <div style={componentStyle} {...rest} id={id}>
      {header}
      <div
        style={{ flexGrow: 1, minHeight: 0 }}
        id={id ? `${id}-expander` : ""}
      >
        <div
          style={{ height: "100%", overflowY: "auto" }}
          id={id ? `${id}-expander-inner` : ""}
        >
          {children}
        </div>
      </div>
      {footer}
    </div>
  );
};
export default VerticalExpander;
