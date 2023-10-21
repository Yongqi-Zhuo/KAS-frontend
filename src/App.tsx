import React, { useState } from 'react';
import { Button, Col, Container, Form } from 'react-bootstrap';
import NavBar from './NavBar';
import { ExplorerChild, ExplorerPredicate, ExplorerRequest, ExplorerResponse, ExplorerType } from './types';

function App() {
  const [backendAddress, setBackendAddress] = useState('');
  const [explorerType, setExplorerType] = useState<ExplorerType>('search_space');

  const [predicates, setPredicates] = useState<ExplorerPredicate[]>([]);
  const [helpMessage, setHelpMessage] = useState<string>('Loading...');

  const [state, setState] = useState<string[]>([]);
  const [exists, setExists] = useState<boolean>(false);
  const [info, setInfo] = useState<string>('Please set the backend address.');
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['KAS Explorer.']);
  const [children, setChildren] = useState<ExplorerChild[]>([]);

  const logToConsole = (message: string) => {
    if (message === '') {
      return;
    }
    let result = [...consoleOutput, message];
    if (result.length > 100) {
      result.shift();
    }
    setConsoleOutput(result);
  };

  const fetchState = async (explorer: ExplorerType, currentState: string[], predicate: string, args: string[] = []) => {
    const request: ExplorerRequest = {
      state: currentState, predicate, args,
    };
    const response = await fetch(
      `${backendAddress}/explore?explorer=${explorer}`,
      {
        method: 'POST',
        mode: "cors",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      }
    );
    const {
      state: newState,
      valid,
      info,
      children,
      message,
      download_url,
      available_predicates,
      help_message,
    }: ExplorerResponse = await response.json();
    setState(newState);
    setExists(valid);
    setInfo(info);
    setChildren(children);
    logToConsole(message);
    if (download_url) {
      window.open(download_url);
    }
    if (available_predicates) {
      setPredicates(available_predicates);
    }
    if (help_message) {
      setHelpMessage(help_message);
    }
  };

  const updateState = async (newState: string[]) => {
    setState(newState);
    fetchState(explorerType, newState, '');
  };

  const handlePredicate = async (predicate: string, args: string[]) => {
    await fetchState(explorerType, state, predicate, args);
  };

  return (
    <Container>
      <Form>
        <Form.Group controlId="backendAddress">
          <Form.Label>Backend Address</Form.Label>
          <Form.Control type="text" placeholder="http://localhost:8080" value={backendAddress} onChange={(e) => {
            setBackendAddress(e.target.value);
          }} />
          <Button variant="primary" onClick={async () => {
            await fetchState(explorerType, state, 'help');
            setConsoleOutput(['KAS Explorer.']);
          }}>Apply</Button>
        </Form.Group>
        <Form.Group controlId="explorerType">
          <Form.Label>Explorer Type</Form.Label>
          <Form.Control as="select" value={explorerType} onChange={async (e) => {
            const explorer = e.target.value as ExplorerType;
            setExplorerType(explorer);
            await fetchState(explorer, state, 'help');
            setConsoleOutput(['KAS Explorer.']);
          }}>
            <option value="search_space">Search Space</option>
            <option value="algorithm">Algorithm-Specific</option>
          </Form.Control>
        </Form.Group>
      </Form>
      <NavBar state={["Root", ...state]} onBreadcrumbClick={async (index) => {
        await updateState(state.slice(0, index));
      }} />
      <Container>
        <Col>
          <h2>Info</h2>
          <p>{info}</p>
          <h2>Console</h2>
          {consoleOutput.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </Col>
        <Col>
          <h2>Children</h2>
          {children.map((child, index) => (
            <Container>
              <Button key={index} variant="primary" onClick={async () => {
                await updateState([...state, child.value]);
              }}>{child.value}</Button>
              <p>{child.caption}</p>
            </Container>
          ))}
          {/* {predicates.map((predicate, index) => (
            <Button key={index} variant="primary" onClick={async () => {
              await handlePredicate(predicate.name, predicate.args);
            }}>{predicate.name}</Button>
          ))} */}
          <h2>Help</h2>
          <p>{helpMessage}</p>
        </Col>
      </Container >
    </Container>
  );
}

export default App;
