import {ListGroup} from "react-bootstrap";
import DockerVersion from "../DockerVersion/DockerVersion";
import DockerCombyImage from "../DockerCombyImage/DockerCombyImage";

const DockerSettings = () => {
  return (
    <ListGroup>
      <ListGroup.Item><DockerVersion/></ListGroup.Item>
      <ListGroup.Item><DockerCombyImage/></ListGroup.Item>
    </ListGroup>
  )
}

export  default DockerSettings;
