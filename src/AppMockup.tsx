import TitleBar from "./components/TitleBar/TitleBar";
import "./reset.scss";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./AppMockup.scss";
import "./style.css";
import {useEffect} from "react";

const AppMockup = () => {
  useEffect(() =>{
     document.body.classList.add('default');
     document.body.classList.add('dark');
  }, [/* TODO reference theme state */]);

  return <>
    <TitleBar/>
    App
  </>
}
export default AppMockup;
