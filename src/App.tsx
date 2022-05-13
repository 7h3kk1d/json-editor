// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
import * as React from 'react'
import { ReactElement } from 'react'
import './App.css'

type Json = number | string | boolean | null | { [key: string]: Json } | Json[]

type JsonArrayPos = {
  type: "JsonArrayPos",
  position: number
}
type JsonObjectLocation = {
  type: "JsonObjectLocation",
  position: number
}
type JsonScalarLocation = {
  type: "JsonScalarLocation"
}
type JsonPath = JsonArrayPos | JsonObjectLocation | JsonScalarLocation

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

function fetch(data: Json, path: JsonPath[]): Json | null {
  if (path.length == 0)
    return data;

  const head: JsonPath = path[0];
  if (head.type == "JsonArrayPos") {
    const array: Json[] = data as any;
    return fetch(array[head.position], path.slice(1, path.length));
  } else if (head.type == "JsonObjectLocation") {
    const obj: { [key: string]: Json } = data as any;
    return fetch(Object.entries(obj)[head.position][1], path.slice(1, path.length));
  } else {
    return data;
  }
}

function basePath(data: Json): JsonPath[] {
  if (data == null) {
    return [{ "type": "JsonScalarLocation" }];
  } else if (Array.isArray(data)) {
    const head: JsonPath[] = [{ "type": "JsonArrayPos", "position": 0 }];
    const tail: JsonPath[] = basePath(data[0]);
    return head.concat(tail);
  } else if (typeof (data) == "object") {
    return [{ "type": "JsonObjectLocation", "position": 0 }]
  } else {
    return [{ "type": "JsonScalarLocation" }]
  }
}

function down(data: Json, path: JsonPath[]): JsonPath[] {

  if (path.length == 0)
    return path;

  const lait = path.slice(0, path.length - 1);

  const end: JsonPath = path[path.length - 1];
  if (end.type == "JsonScalarLocation")
    return down(data, path.slice(0, path.length - 1))
  else if (end.type == "JsonObjectLocation") {
    const obj: { [key: string]: Json } = fetch(data, lait) as any;

    if (Object.keys(obj).length > end.position) {
      const subpath = path.slice(0, path.length - 1)
        .concat([{ "type": "JsonObjectLocation", "position": end.position + 1 }])
      return subpath.concat(basePath(fetch(data, subpath)))
    } else {
      return down(data, path.slice(0, path.length - 1));
    }
  } else if (end.type == "JsonArrayPos") {
    const list = fetch(data, lait);

    // if (list.length > end.position) {
    //   console.log("Here")
    //   const subpath = path.slice(0, path.length - 1)
    //     .concat([{ "type": "JsonArrayPos", "position": end.position + 1 }])
    //   console.log(subpath)
    //   console.log(fetch(data, subpath))
    //   return subpath.concat(basePath(fetch(data, subpath)))
    // } else {
    //   return down(json, path.slice(0, path.length - 1));
    // }
      return [];
  }

  return [];
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
  let path : JsonPath[] = [{ "type": "JsonObjectLocation", "position": 0 },
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