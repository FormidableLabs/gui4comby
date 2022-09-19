import {useTitle} from "../SideSheet/SideSheet.recoil";
import {useRecoilState} from "recoil";
import {appThemeAtom} from "../../App.recoil";
import {Form, ListGroup} from "react-bootstrap";
import {ReactNode} from "react";

const ThemeSettings = () => {
  useTitle('Theme Settings');
  const [theme, setTheme] = useRecoilState(appThemeAtom);
  const toggle =  () => {
    setTheme(theme === 'dark' ? 'light':'dark');
  }

  return (<div>
    <ListGroup>
      <ListItem label={'Dark mode'}>
        <Form.Check
          type="switch"
          id="custom-switch"
          checked={theme === 'dark'}
          onChange={toggle}
        />
      </ListItem>
      {/*<ListGroup.Item>*/}
      {/*  ACE Theme*/}
      {/*</ListGroup.Item>*/}
    </ListGroup>
  </div>)
}
export default ThemeSettings;

const ListItem = ({label,children}:{label: string, children: ReactNode}) => {
  return (
    <ListGroup.Item style={{display: 'flex'}}>
      <strong><small>{label}</small></strong>
      <span style={{marginLeft: 'auto'}}>{children}</span>
    </ListGroup.Item>
  )
}
