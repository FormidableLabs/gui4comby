import {useTitle} from "../SideSheet/SideSheet.recoil";
import {useRecoilState} from "recoil";
import {appThemeAtom} from "../../App.recoil";
import {Form, InputGroup} from "react-bootstrap";
import {AiOutlineBgColors } from "react-icons/all";
import {themes} from './themes';

const ThemeSettings = () => {
  useTitle('Theme Settings');
  const [theme, setTheme] = useRecoilState(appThemeAtom);


  return (<div>
    <InputGroup size={'sm'}>
      <InputGroup.Text id="basic-addon1"><AiOutlineBgColors /></InputGroup.Text>
      <Form.Select value={theme} onChange={e => setTheme(e.target.value)} aria-label="App Theme">
        {themes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </Form.Select>
    </InputGroup>
  </div>)
}
export default ThemeSettings;
