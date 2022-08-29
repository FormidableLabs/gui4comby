import {ListGroup} from "react-bootstrap";
import DockerVersion from "../DockerVersion/DockerVersion";
import DockerCredentials from "../DockerCredentials/DockerCredentials";

const DockerSettings = () => {
  return (
    <ListGroup>
      <ListGroup.Item><DockerVersion/></ListGroup.Item>
      <ListGroup.Item><DockerCredentials/></ListGroup.Item>
      <ListGroup.Item>Comby Image</ListGroup.Item>
    </ListGroup>
  )
}

export  default DockerSettings;
