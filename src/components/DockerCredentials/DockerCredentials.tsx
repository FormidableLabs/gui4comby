import {Button, Form, Spinner} from "react-bootstrap";
import {useState} from "react";
import {AiOutlineQuestionCircle} from "react-icons/all";

const DockerCredentials = () => {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');

  return (<div style={{display: 'flex', alignItems: 'top', justifyContent: 'space-between'}}>
    <strong><small>Docker Credentials:</small></strong>
    <span>
      {loading && <Spinner animation="border" role="status" size={'sm'}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>}
      {!loading && <Form>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>
            <strong><small>Username</small></strong>
          </Form.Label>
          <Form.Control type="text" placeholder="docker hub username" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="secret">
          <Form.Label>
            <strong><small>
              Access Token <a href={'https://docs.docker.com/docker-hub/access-tokens/'} target={'_blank'}><AiOutlineQuestionCircle/></a>
            </small></strong>
          </Form.Label>
          <Form.Control type="password" placeholder="secret" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicCheckbox" style={{alignItems: 'flex-end'}}>
          <Button variant="primary" type="submit">
            Save
          </Button>
          <Button variant="primary" type="submit">
            Reset
          </Button>
        </Form.Group>
      </Form>}
    </span>
  </div>)
}
export default DockerCredentials;
