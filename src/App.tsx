import * as React from 'react'
import { ReactElement } from 'react'
import './App.css'
import { Json, JsonPath } from './domain';
import { down } from './navigation';

function optionallySelectedClassName(className: string, selected: boolean) {
  return className + (selected ? " selected" : "")
}

function render(data: Json, path: JsonPath[] = []): ReactElement {
  const pathHead = path[0];
  const scalarSelected = pathHead?.type === "JsonScalarLocation";

  if (data == null) {
    return (<span className={optionallySelectedClassName("null", scalarSelected)}>null</span>);
  } else if (typeof (data) == "string") {
    return <span className={optionallySelectedClassName("string", scalarSelected)}>"{data}"</span>;
  } else if (typeof (data) == "boolean") {
    return <span className={optionallySelectedClassName("boolean", scalarSelected)}>{data.toString()}</span>;
  } else if (typeof (data) == "number") {
    return <span className={optionallySelectedClassName("num", scalarSelected)}>{data}</span>;
  } else if (Array.isArray(data)) {
    const pathPosition = pathHead?.type == "JsonArrayPos" ? pathHead.position : null;
    const pathTail = path.slice(1, path.length);

    const foo: Json = data[data.length - 1];
    const bar: JsonPath[] = pathPosition == data.length - 1 ? pathTail : []
    const elems = data.slice(0, data.length - 1)
      .map((v, idx) => (<>{render(v, pathPosition == idx ? pathTail : [])},</>))
      .concat([render(foo, bar)])
      .map(v => <div className="listEntry">{v}</div>)

    return (
      <span className="list">
        <span className="listOpen">&#91;</span>
        {elems}
        <span className="listClose">&#93;</span>
      </span>
    );
  } else if (typeof (data) === 'object') {
    const pathPosition = pathHead?.type == "JsonObjectLocation" ? pathHead.position : null;
    const pathTail = path.slice(1, path.length);


    const pairs = Object.entries(data);
    const last = pairs[pairs.length - 1];
    const elems = pairs
      .map(([k, v], idx) => {
        const selected = pathPosition == idx && pathTail.length == 0 ? "selected" : ""
        return (<div className={`objectEntry ${selected}`}>"{k}": {render(v, pathPosition == idx ? pathTail : [])}{idx == (pairs.length - 1) ? "" : ","}</div>)
      })

    return (<span className={`object`}>
      <span className="objectBracket">&#123;</span>
      {elems}
      <span className="objectBracket">&#125;</span>

    </span>);
  } else {
    return (<></>);
  }
}


class JsonEditor extends React.Component<{jsonData: Json, jsonPath: JsonPath[]}, {jsonData: Json, jsonPath: JsonPath[]}> {
  constructor(props: {jsonData: Json, jsonPath: JsonPath[]}) {
    super(props);
    this.state = {jsonData: props.jsonData, jsonPath: props.jsonPath};
    this.handleKey = this.handleKey.bind(this);
  }

  handleKey() { 
    console.log("Path" + JSON.stringify(this.state.jsonPath))
    this.setState(prevState => ({jsonData: prevState.jsonData, jsonPath: down(prevState.jsonData, prevState.jsonPath)}));  
  }

  render() {
    return <div onKeyDown={this.handleKey} tabIndex={0}>{render(this.state.jsonData, this.state.jsonPath)}</div>
  }
}


export default function App() {
  const current: Json = {
    "Hello": "World",
    "empty": null,
    "truthy": true,
    "falsey": false,
    "listy": [1, 2, 3, [4, 5, 6]],
    "associate": { "bad_num": 10.3 }
  };
  let path : JsonPath[] = [{ "type": "JsonObjectLocation", "position": 0 , "focus" : "key"}];

  for (let i = 0; i < 0; i++) {
    let foo = down(current, path);
    path = foo;
  }

  return (
    <main>
      <JsonEditor jsonData={current} jsonPath={path} />
    </main>
  )
}