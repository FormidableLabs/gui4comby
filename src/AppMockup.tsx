import TitleBar from "./components/TitleBar/TitleBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./AppMockup.scss";
import "./style.css";
import "react-resizable/css/styles.css";
import {useEffect} from "react";
import {VSizable} from "./components/VSizable/VSizable";


const AppMockup = () => {
  useEffect(() =>{
     document.body.classList.add('default');
     document.body.classList.add('dark');
  }, [/* TODO reference theme state */]);

  return <>
    <TitleBar/>
    <VSizable sizable={<div style={{width: '100%', height: '100%'}}>Size Me</div>}>Hello</VSizable>
  </>
}
export default AppMockup;

