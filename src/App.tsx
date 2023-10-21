import React, { useState } from 'react';
import { Breadcrumb, Button, Col, Grid, Input, Layout, Row, Select, Space, Typography } from 'antd';
import { ExplorerChild, ExplorerPredicate, ExplorerRequest, ExplorerResponse, ExplorerType } from './types';

const styles = {
  code: {
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
  } as React.CSSProperties,
};

function App() {
  const [backendAddress, setBackendAddress] = useState('http://localhost:7070');
  const [explorerType, setExplorerType] = useState<ExplorerType>('search_space');

  const [predicates, setPredicates] = useState<ExplorerPredicate[]>([]);
  const [helpMessage, setHelpMessage] = useState<string>('Loading...');

  const [state, setState] = useState<string[]>([]);
  const [info, setInfo] = useState<string>('Please set the backend address.');
  const [consoleOutput, setConsoleOutput] = useState<string[]>(['KAS Explorer.']);
  const [children, setChildren] = useState<ExplorerChild[]>([]);

  const logToConsole = (message: string) => {
    if (message === '') {
      return;
    }
    let result = [...consoleOutput, message];
    if (result.length > 5) {
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
    setInfo(info);
    setChildren(children);
    logToConsole(message);
    if (download_url) {
      window.open(`${backendAddress}/${download_url}`, '_blank');
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
    <Layout>
      <Layout.Header>
        <Typography.Title level={2} style={{ color: 'white', margin: '15px' }}>KAS Explorer</Typography.Title>
      </Layout.Header>
      <Layout.Content style={{ paddingLeft: '50px', paddingRight: '50px', paddingTop: '30px', paddingBottom: '30px' }}>
        <Space.Compact>
          <Input value={backendAddress} onChange={(e) => {
            setBackendAddress(e.target.value);
          }} />
          <Button type="primary" onClick={async () => {
            await fetchState(explorerType, state, 'help');
            setConsoleOutput(['KAS Explorer.']);
          }}>Apply</Button>
          <Select defaultValue="search_space" value={explorerType} onChange={async (value) => {
            const explorer = value as ExplorerType;
            setExplorerType(explorer);
            await fetchState(explorer, state, 'help');
            setConsoleOutput(['KAS Explorer.']);
          }}>
            <Select.Option value="search_space">Search Space</Select.Option>
            <Select.Option value="algorithm">Algorithm-Specific</Select.Option>
          </Select>
        </Space.Compact>
        <Row gutter={[10, 10]}>
          <Col sm={24} md={8} style={{ paddingRight: '30px' }}>
            <h2>State</h2>
            <Breadcrumb items={["Root", ...state].map((value, index) => ({
              title: value,
              onClick: async () => {
                await updateState(state.slice(0, index));
              },
            }))} />
            <h2>Info</h2>
            <Typography.Text style={styles.code}>{info}</Typography.Text>
            <h2>Actions</h2>
            <Row gutter={[10, 10]} align='middle' justify='start' >
              {predicates.map((predicate, index) => (
                <Col key={index} md={12} lg={8}>
                  <Button style={{ width: '100%' }} key={index} type="primary" onClick={async () => {
                    const args = predicate.additional_args.map((arg, index) => {
                      return window.prompt(`Enter ${index}-th argument: (${arg})`);
                    });
                    if (args.includes(null)) {
                      return;
                    }
                    await handlePredicate(predicate.name, args as string[]);
                  }}>{predicate.name}</Button>
                </Col>
              ))}
            </Row>
            <h2>Console</h2>
            <Col>
            {consoleOutput.toReversed().map((message, index) => (
              <Row key={index}>
                <Typography.Text style={styles.code} key={index}>{message}</Typography.Text>
              </Row>
            ))}
            </Col>
            <h2>Help</h2>
            <Typography.Text style={styles.code}>{helpMessage}</Typography.Text>
          </Col>
          <Col sm={24} md={16}>
            <h2>Children</h2>
            <Row align='middle' gutter={[10, 5]}>
              {children.map((child, index) => (
                <Col key={index}>
                  <Row>
                    <Button type="primary" onClick={async () => {
                      await updateState([...state, child.value]);
                    }}>{child.value}</Button>
                  </Row>
                  <Row>
                    <Typography.Text style={styles.code}>{child.caption}</Typography.Text>
                  </Row>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}

export default App;
