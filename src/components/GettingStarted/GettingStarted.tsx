import {useRecoilValue} from "recoil";
import {mainSizeAtom} from "../../App.recoil";
import './GettingStarted.css';
import {TabType} from "../TabIcon/TabIcon";
import {Nav, Navbar} from "react-bootstrap";
import NewDocTabButton from "../NewTabButton/NewDocTabButton";
import NewTabLink from "../NewTabButton/NewTabLink";

const GettingStarted = () => {
  const mainSizeState = useRecoilValue(mainSizeAtom);

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
              <NewTabLink type={TabType.Playground} text={'Playground'} style={{padding: 0}}/>
            </Nav.Item>
            <Nav.Item>
              <NewTabLink type={TabType.Filesystem} text={'Filesystem Find & Replace'} style={{padding: 0}}/>
            </Nav.Item>
          </Nav>
          <Nav className={'flex-column'}>
            <Navbar.Brand><strong>Learn</strong></Navbar.Brand>
            <Nav.Item>
              <NewDocTabButton docId={'overview'} text={'Overview'} style={{padding: 0}}/>
            </Nav.Item>
            <Nav.Item>
              <NewDocTabButton docId={'basic-usage'} text={'Basic Usage'} style={{padding: 0}}/>
            </Nav.Item>
            <Nav.Item>
              <NewDocTabButton docId={'advanced-usage'} text={'Advanced Usage'} style={{padding: 0}}/>
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
  )
}
export default GettingStarted;
