import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import {Alert, Button, Form, Modal, OverlayTrigger, Spinner, Tooltip} from "react-bootstrap";
import {ErrorStatus} from "../ErrorStatus/ErrorStatus";
import {AiOutlineAlert, AiOutlineCloudDownload, AiOutlineQuestionCircle} from "react-icons/all";

const DockerCombyImage = () => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string>();
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleDownload = async () => {
    // invoke download
    setShow(false);
    setLoading(true);
    try {
      let result: string = await invoke("download_comby_image");
      console.log({download_comby_image_result: result});
      setImage(result);
    } catch (err) {
        setError(err as string);
    }
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      try {
        let v: string = await invoke("comby_image");
        setLoading(false);
        console.log({image: v});
        setImage(v);
      } catch (error) {
        if(typeof error === 'string'){
          setError(error as string);
          setLoading(false);
          if(error.indexOf('No such file or directory') !== -1){
            setHint('Check if docker is running')
          }
        }

      }
    })();
  }, []);

  return <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
    <small><strong>Comby Image:</strong></small>
    <span style={{paddingLeft: '1em'}}>
      {loading && <Spinner animation="border" role="status" size={'sm'}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>}
      {!loading && error && <ErrorStatus error={error} hint={hint}/>}
      {!loading && !error && <small style={{color: 'var(--bs-success)'}}>{image}</small>}
      <span style={{paddingLeft: '0.5em'}}>
        <OverlayTrigger
          placement={'top'}
          overlay={
            <Tooltip id={`comby-image-download-icon`}>
              Download or update image.
            </Tooltip>
          }
        >
          <span><AiOutlineCloudDownload style={{cursor: 'pointer'}} color={'var(--bs-primary)'} onClick={() => setShow(true)}/></span>
        </OverlayTrigger>
      </span>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Download comby/comby:latest</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant={'warning'}>
            <span><AiOutlineAlert style={{marginRight: '0.5em'}}/></span>
            Providing your DockerHub credentials is optional.<br/>
            However, you may receive <a target={'_blank'} href={'https://www.docker.com/increase-rate-limits/'}>ERROR: toomanyrequests: Too Many Requests</a> if you do not.
          </Alert>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDownload}>
            Download
          </Button>
        </Modal.Footer>
      </Modal>
    </span>
  </div>
}

export default DockerCombyImage;
