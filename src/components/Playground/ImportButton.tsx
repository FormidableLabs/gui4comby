import {useRecoilValue, useSetRecoilState} from "recoil";
import {rewrittenFamily, sourceFamily} from "./Playground.recoil";
import {Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import {AiOutlineImport} from "react-icons/all";
import "./ImportButton.scss";

const ImportButton = ({id}:{id:string}) => {
  const setSource = useSetRecoilState(sourceFamily(id));
  const rewritten = useRecoilValue(rewrittenFamily(id));

  const renderTooltip = (props:Record<string, unknown>) => (
    <Tooltip id="button-tooltip" {...props}>
      Click import to copy the results of the rewrite to your source code.
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="left"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <Button size={'sm'} className={'import'} onClick={() => setSource(rewritten)}><AiOutlineImport/></Button>
    </OverlayTrigger>
  );
}
export default ImportButton;
