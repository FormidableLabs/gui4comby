import {ListGroup} from "react-bootstrap";
import DockerVersion from "../DockerVersion/DockerVersion";
import DockerCombyImage from "../DockerCombyImage/DockerCombyImage";
import {ReactNode} from "react";

const DockerSettings = () => {
  return (
    <ListGroup>
      <ListGroup.Item><DockerVersion/></ListGroup.Item>
      <ListGroup.Item><DockerCombyImage/></ListGroup.Item>
    </ListGroup>
  )
}

export  default DockerSettings;
