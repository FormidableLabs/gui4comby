import VerticalExpander from "../VerticalExpander/verticalExpander";
import {useRecoilValue} from "recoil";
import {mainSizeAtom} from "../../App.recoil";
import './GettingStarted.css';
import NewTabButton from "../NewTabButton/NewTabButton";
import {TabType} from "../TabIcon/TabIcon";
import {Nav, Navbar} from "react-bootstrap";

const GettingStarted = () => {
  const mainSizeState = useRecoilValue(mainSizeAtom);
  console.log('mainSizeState.rect!.height', mainSizeState.rect!.height);

  return (
    <div className='cover' style={{
      minBlockSize: `${mainSizeState.rect!.height}px`,
    }}>
      <div className={'hero'} style={{margin: 'auto'}}>
        <h2>GUI 4 Comby</h2>
        <h3>Find & Refactor made easy</h3>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Nav style={{marginRight: '1em'}} className={'flex-column'}>
            <Navbar.Brand><strong>Start</strong></Navbar.Brand>
            <Nav.Item>
              <NewTabButton type={TabType.Playground} text={'Playground'} style={{padding: 0}}/>
            </Nav.Item>
            <Nav.Item>
              <NewTabButton type={TabType.Filesystem} text={'Filesystem Find & Replace'} style={{padding: 0}}/>
            </Nav.Item>
          </Nav>
          <Nav className={'flex-column'}>
            <Navbar.Brand><strong>Learn</strong></Navbar.Brand>
            <Nav.Item>
              <NewTabButton type={TabType.Docs} text={'Overview'} style={{padding: 0}}/>
            </Nav.Item>
            <Nav.Item>
              <NewTabButton type={TabType.Docs} text={'Basic Usage'} style={{padding: 0}}/>
            </Nav.Item>
            <Nav.Item>
              <NewTabButton type={TabType.Docs} text={'Advanced Usage'} style={{padding: 0}}/>
            </Nav.Item>
          </Nav>
        </div>
      </div>
      <div>
        <Nav style={{display: 'flex', alignItems: 'center', margin: 'auto', justifyContent: 'center'}}>
          <Navbar.Brand>A desktop app for</Navbar.Brand>
          <Nav.Item><Nav.Link href={'https://comby.dev/'} target={'_blank'}>comby.dev</Nav.Link></Nav.Item>
          <Navbar.Brand>modeled after</Navbar.Brand>
          <Nav.Item><Nav.Link href={'https://comby.live/'} target={'_blank'}>comby.live</Nav.Link></Nav.Item>
        </Nav>

      </div>
    </div>
    // <VerticalExpander style={{}} header={<div><h1>GUI 4 Comby</h1><h2>Tag line</h2></div>}>Getting Started</VerticalExpander>
  )
}
export default GettingStarted;
