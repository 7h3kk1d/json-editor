import * as React from 'react'
import { ReactElement } from 'react'
import './App.css'
import { Json, JsonArrayPos, JsonObjectLocation, JsonPath, objectPath } from './domain';
import { replace } from './modification';
import { down, up } from './navigation';

function optionallySelectedClassName(className: string, selected: boolean) {
  return className + (selected ? " selected" : "")
}

function render(data: Json, path?: JsonPath, selected: boolean=false): ReactElement {
  console.log(JSON.stringify(path))
  const pathHead = path;
  if (data == null) {
    return (<span className={optionallySelectedClassName("null", selected)}>null</span>);
  } else if (typeof (data) == "string") {
    return <span className={optionallySelectedClassName("string", selected)}>"{data}"</span>;
  } else if (typeof (data) == "boolean") {
    return <span className={optionallySelectedClassName("boolean", selected)}>{data.toString()}</span>;
  } else if (typeof (data) == "number") {
    return <span className={optionallySelectedClassName("num", selected)}>{data}</span>;
  } else if (Array.isArray(data)) {
    const arrayPath = path as JsonArrayPos | undefined
    const pathPosition = arrayPath ? arrayPath.position : -1
    const inner: JsonPath | undefined = arrayPath?.inner

    const elems = data
      .map((v, idx) => render(v, pathPosition === idx ? inner : undefined, false))
      .map((v, idx) => idx === (data.length-1) ? v : <>{v},</>)
      .map((v, idx) => <div className={optionallySelectedClassName("listEntry", pathPosition === idx && inner === undefined)}>{v}</div>)
      // I kind of wish we could select just the element text and not the comma with the whole list entry

    return (
      <span className={optionallySelectedClassName("list", selected)}>
        <span className="listOpen">&#91;</span>
        {elems}
        <span className="listClose">&#93;</span>
      </span>
    );
  } else if (typeof (data) === 'object') {
    const pathPosition = pathHead?.type == "JsonObjectLocation" ? pathHead.position : null;
    const objectPath = path as JsonObjectLocation | undefined

    const pairs = Object.entries(data);
    const inner: JsonPath | undefined = objectPath?.inner

    const elems = pairs
      .map(([k, v], idx) => {
        return (<div className={optionallySelectedClassName("objectEntry", pathPosition === idx && inner === undefined)}>"{k}": {render(v, pathPosition === idx ? inner : undefined, false)}{idx == (pairs.length - 1) ? "" : ","}</div>)
      })

    return (<span className={optionallySelectedClassName("object", selected)}>
      <span className="objectBracket">&#123;</span>
      {elems}
      <span className="objectBracket">&#125;</span>

    </span>);
  } else {
    return (<></>);
  }
}


class JsonEditor extends React.Component<{jsonData: Json, jsonPath: JsonPath}, {jsonData: Json, jsonPath: JsonPath}> {
  constructor(props: {jsonData: Json, jsonPath: JsonPath}) {
    super(props);
    this.state = {jsonData: props.jsonData, jsonPath: props.jsonPath};
    this.handleKey = this.handleKey.bind(this);
  }

  handleKey(event: KeyboardEvent) {
    if(event.key=="ArrowDown")
      this.setState(prevState => ({jsonData: prevState.jsonData, jsonPath: down(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath})); 
    else if(event.key=="ArrowUp")
      this.setState(prevState => ({jsonData: prevState.jsonData, jsonPath: up(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath}));
    else if (event.key=="n")
      this.setState(prevState => ({jsonData: replace(prevState.jsonData, prevState.jsonPath, null), jsonPath: prevState.jsonPath}))
    else if (event.key=="t")
      this.setState(prevState => ({jsonData: replace(prevState.jsonData, prevState.jsonPath, true), jsonPath: prevState.jsonPath}))
    else if (event.key=="f")
      this.setState(prevState => ({jsonData: replace(prevState.jsonData, prevState.jsonPath, false), jsonPath: prevState.jsonPath}))
    else if (event.key=="{")
      this.setState(prevState => ({jsonData: replace(prevState.jsonData, prevState.jsonPath, {}), jsonPath: prevState.jsonPath}))
    else if (event.key=="[")
      this.setState(prevState => ({jsonData: replace(prevState.jsonData, prevState.jsonPath, []), jsonPath: prevState.jsonPath}))
      else if (event.key=="\"")
      this.setState(prevState => ({jsonData: replace(prevState.jsonData, prevState.jsonPath, ""), jsonPath: prevState.jsonPath}))
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKey)
  }

  render() {
    return <div tabIndex={0}>{render(this.state.jsonData, this.state.jsonPath)}</div>
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
  let path : JsonObjectLocation = objectPath(0);


  return (
    <main>
      <JsonEditor jsonData={current} jsonPath={path} />
    </main>
  )
}