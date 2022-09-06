import './Headings.css';
import {useLocation, useNavigate} from "react-router-dom";

function getAnchor(text:string): string {
  return text.toLowerCase ? text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/[ ]/g, '-') : text;
}

type LinkProps = {
  href: string;
}
const Link = ({href}:LinkProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <a href={href} className="anchor-link" onClick={(e) => {
      navigate(`${location.pathname}${href}`);
      e.stopPropagation();
    }}>
        §
    </a>
  )
}

type Props = {
  children: string
}

export const H1 = ({ children }:Props) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h1 id={anchor} className={'mdx'}>
      <Link href={link}/>
      {children}
    </h1>
  );
};

export const H2 = ({ children }:Props) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h2 id={anchor} className={'mdx'}>
      <Link href={link}/>
      {children}
    </h2>
  );
};

export const H3 = ({ children }:Props) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h3 id={anchor} className={'mdx'}>
      <Link href={link}/>
      {children}
    </h3>
  );
};

export const H4 = ({ children }:Props) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h4 id={anchor} className={'mdx'}>
      <Link href={link}/>
      {children}
    </h4>
  );
};

export const H5 = ({ children }:Props) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h5 id={anchor} className={'mdx'}>
      <Link href={link}/>
      {children}
    </h5>
  );
};

export const H6 = ({ children }:Props) => {
  const anchor = getAnchor(children);
  const link = `#${anchor}`;
  return (
    <h6 id={anchor} className={'mdx'}>
      <Link href={link}/>
      {children}
    </h6>
  );
};
