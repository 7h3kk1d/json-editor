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
      .map(([k, v], idx) => (<div className="objectEntry">"{k}": {render(v, pathPosition == idx ? pathTail : [])}{idx == (pairs.length - 1) ? "" : ","}</div>))

    return (<span className="object">
      <span className="objectBracket">&#123;</span>
      {elems}
      <span className="objectBracket">&#125;</span>

    </span>);
  } else {
    return (<></>);
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
  let path : JsonPath[] = [{ "type": "JsonObjectLocation", "position": 0 , "focus" : "key"},
  { "type": "JsonScalarLocation" }];

  for (let i = 0; i < 0; i++) {
    let foo = down(current, path);
    path = foo;
  }
  console.log(path);
  return (
    <main>
      {render(current, path)}
    </main>
  )
}