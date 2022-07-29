import * as React from 'react'
import { ReactElement } from 'react'
import './App.css'
import { Json, jsonArray, JsonArrayPos, jsonBoolean, jsonNull, jsonObject, JsonObjectLocation, JsonPath, jsonString, objectPath, parse } from './domain';
import { insert, remove, replace } from './modification';
import { down, enter, leave, up } from './navigation';

function optionallySelectedClassName(className: string, selected: boolean) {
  return className + (selected ? " selected" : "")
}

function render(data: Json, path?: JsonPath, selected: boolean = false): ReactElement {
  const pathHead = path;
  if (data.kind === "null") {
    return (<span className={optionallySelectedClassName("null", selected)}>null</span>);
  } else if (data.kind === "string") {
    return <span className={optionallySelectedClassName("string", selected)}>"{data.value}"</span>;
  } else if (data.kind === "boolean") {
    return <span className={optionallySelectedClassName("boolean", selected)}>{data.value.toString()}</span>;
  } else if (data.kind === "number") {
    return <span className={optionallySelectedClassName("num", selected)}>{data.value}</span>;
  } else if (data.kind === "array") {
    const arrayPath = path as JsonArrayPos | undefined
    const pathPosition = arrayPath ? arrayPath.position : -1
    const inner: JsonPath | undefined = arrayPath?.inner

    const elems = data.value
      .map((v, idx) => render(v, pathPosition === idx ? inner : undefined, false))
      .map((v, idx) => idx === (data.value.length - 1) ? v : <>{v},</>)
      .map((v, idx) => <div className={optionallySelectedClassName("listEntry", pathPosition === idx && inner === undefined)}>{v}</div>)
    // I kind of wish we could select just the element text and not the comma with the whole list entry

    return (
      <span className={optionallySelectedClassName("list", selected)}>
        <span className="listOpen">&#91;</span>
        {elems}
        <span className="listClose">&#93;</span>
      </span>
    );
  } else if (data.kind === 'object') {
    const pathPosition = pathHead?.type === "JsonObjectLocation" ? pathHead.position : null;
    const objectPath = path as JsonObjectLocation | undefined

    const pairs = data.value;
    const inner: JsonPath | undefined = objectPath?.inner

    const elems = pairs
      .map(({key: k, value: v}, idx) => {
        return (<div className={optionallySelectedClassName("objectEntry", pathPosition === idx && inner === undefined)}>"{k}": {render(v, pathPosition === idx ? inner : undefined, false)}{idx === (pairs.length - 1) ? "" : ","}</div>)
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


class JsonEditor extends React.Component<{ jsonData: Json, jsonPath: JsonPath }, { jsonData: Json, jsonPath: JsonPath }> {
  constructor(props: { jsonData: Json, jsonPath: JsonPath }) {
    super(props);
    this.state = { jsonData: props.jsonData, jsonPath: props.jsonPath };
    this.handleKey = this.handleKey.bind(this);
  }

  handleKey(event: KeyboardEvent) {
    if (event.key === "ArrowDown")
      this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: down(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
    else if (event.key === "ArrowUp")
      this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: up(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
    else if (event.key === "Enter") 
      this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: enter(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
    else if (event.key === "Escape") 
      this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: leave(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
    else if (event.key === "n")
      this.setState(prevState => ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonNull()), jsonPath: prevState.jsonPath }))
    else if (event.key === "t")
      this.setState(prevState => ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonBoolean(true)), jsonPath: prevState.jsonPath }))
    else if (event.key === "f")
      this.setState(prevState => ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonBoolean(false)), jsonPath: prevState.jsonPath }))
    else if (event.key === "{")
      this.setState(prevState => ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonObject([])), jsonPath: prevState.jsonPath }))
    else if (event.key === "[")
      this.setState(prevState => ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonArray([])), jsonPath: prevState.jsonPath }))
    else if (event.key === "\"")
      this.setState(prevState => ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonString("")), jsonPath: prevState.jsonPath }))
    else if (event.key === ",")
      this.setState(prevState => ({ jsonData: insert(prevState.jsonData, prevState.jsonPath), jsonPath: prevState.jsonPath }))
    else if (event.key === "Delete")
      this.setState(prevState => ({ jsonData: remove(prevState.jsonData, prevState.jsonPath), jsonPath: prevState.jsonPath }))

  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKey)
  }

  render() {
    return <div tabIndex={0}>{render(this.state.jsonData, this.state.jsonPath)}</div>
  }
}


export default function App() {
  const current = {
    "Hello": "World",
    "empty": null,
    "truthy": true,
    "falsey": false,
    "listy": [1, 2, 3, [4, 5, 6]],
    "associate": { "bad_num": 10.3 }
  };
  let path: JsonPath = objectPath(0);


  return (
    <main>
      <JsonEditor jsonData={parse(current)} jsonPath={path} />
    </main>
  )
}