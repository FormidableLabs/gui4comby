import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Spinner } from "react-bootstrap";
import { ErrorStatus } from "../ErrorStatus/ErrorStatus";

const DockerVersion = () => {
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState<string>();
  const [error, setError] = useState<string>();
  const [hint, setHint] = useState<string>();

  useEffect(() => {
    (async () => {
      try {
        let v: string = await invoke("docker_version");
        setLoading(false);
        setVersion(v);
      } catch (error) {
        if (typeof error === "string") {
          setError(error as string);
          setLoading(false);
          if (error.indexOf("No such file or directory") !== -1) {
            setHint("Check if docker is running");
          }
        }
      }
    })();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <small>
        <strong>Docker Version:</strong>
      </small>
      <span style={{ paddingLeft: "1em" }}>
        {loading && (
          <Spinner animation="border" role="status" size={"sm"}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        )}
        {!loading && error && <ErrorStatus error={error} hint={hint} />}
        {!loading && !error && (
          <small style={{ color: "var(--bs-success)" }}>{version}</small>
        )}
      </span>
    </div>
  );
};

export default DockerVersion;
