import * as React from 'react'
import { ReactElement } from 'react'
import './App.css'
import { Json, jsonArray, JsonArrayPos, jsonBoolean, jsonNull, jsonObject, JsonObjectLocation, JsonPath, jsonString, objectPath, parse } from './domain';
import { insert, remove, replace } from './modification';
import { down, enter, leave, up } from './navigation';

function optionallySelectedClassName(className: string, selected: boolean) {
  return className + (selected ? " selected" : "")
}

function jsonStringPath(path: JsonPath): boolean {
  switch (path.type) {
    case 'JsonString':
      return true
    default:
      return path.inner ? jsonStringPath(path.inner) : false
  }
}

function placeCaretAtEnd(el: HTMLElement) {
  el.focus();
  if (typeof window.getSelection != "undefined"
    && typeof document.createRange != "undefined") {
    var range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    var sel = window.getSelection();
    (sel as any).removeAllRanges();
    (sel as any).addRange(range);
  } else if (typeof (document.body as any).createTextRange != "undefined") {
    var textRange = (document.body as any).createTextRange();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
}

class JsonEditor extends React.Component<{ jsonData: Json, jsonPath: JsonPath }, { jsonData: Json, jsonPath: JsonPath }> {
  constructor(props: { jsonData: Json, jsonPath: JsonPath }) {
    super(props);
    this.state = { jsonData: props.jsonData, jsonPath: props.jsonPath };
    this.handleKey = this.handleKey.bind(this);
  }

  handleKey(event: KeyboardEvent) {
    console.log(event)
    // This feels real hacky. I also don't think there's a way to escape the editing for a root string
    if (jsonStringPath(this.state.jsonPath)) {
      if (event.key === "Escape")
        this.setState(prevState => {
          if ((document.activeElement as HTMLTextAreaElement)?.value) {
            return ({ jsonData: replace(prevState.jsonData, prevState.jsonPath, jsonString((document.activeElement as HTMLTextAreaElement)?.value)), jsonPath: leave(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath });
          }
          return ({ jsonData: prevState.jsonData, jsonPath: leave(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath });
        });
    } else {
      if (event.key === "Escape")
        this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: leave(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
      else if (event.key === "ArrowDown")
        this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: down(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
      else if (event.key === "ArrowUp")
        this.setState(prevState => ({ jsonData: prevState.jsonData, jsonPath: up(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath }));
      else if (event.key === "Enter")
        this.setState(prevState => {
          event.preventDefault()
          return ({ jsonData: prevState.jsonData, jsonPath: enter(prevState.jsonData, prevState.jsonPath) || prevState.jsonPath });
        });
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
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleKey)
  }

  innerRender(data: Json, path?: JsonPath, selected: boolean = false): ReactElement {
    const pathHead = path;
    if (data.kind === "null") {
      return (<span className={optionallySelectedClassName("null", selected)}>null</span>);
    } else if (data.kind === "string") {
      if (path?.type === "JsonString") {
        return <span className={optionallySelectedClassName("string", selected)}>"<textarea onChange={event => {
          let input = event?.target;
          input.style.overflow = 'hidden';
          input.style.height = "0";
          input.style.height = input.scrollHeight + 'px';
        }} ref={input => {
          if (!(document.activeElement === input)) {
            input && placeCaretAtEnd(input)
          }
          if(input) {
            input.selectionStart=data.value.length;
            input.selectionEnd=data.value.length;
          }
        }}>{data.value}</textarea>"</span>;
      } else {
        return <span className={optionallySelectedClassName("string", selected) + " display-linebreak"}>"{data.value}"</span>;
      }
    } else if (data.kind === "boolean") {
      return <span className={optionallySelectedClassName("boolean", selected)}>{data.value.toString()}</span>;
    } else if (data.kind === "number") {
      return <span className={optionallySelectedClassName("num", selected)}>{data.value}</span>;
    } else if (data.kind === "array") {
      const arrayPath = path as JsonArrayPos | undefined
      const pathPosition = arrayPath ? arrayPath.position : -1
      const inner: JsonPath | undefined = arrayPath?.inner

      const elems = data.value
        .map((v, idx) => this.innerRender(v, pathPosition === idx ? inner : undefined, false))
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
        .map(({ key: k, value: v }, idx) => {
          return (<div className={optionallySelectedClassName("objectEntry", pathPosition === idx && inner === undefined)}>"{k}": {this.innerRender(v, pathPosition === idx ? inner : undefined, false)}{idx === (pairs.length - 1) ? "" : ","}</div>)
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


  render() {
    return <div tabIndex={0}>{this.innerRender(this.state.jsonData, this.state.jsonPath)}</div>
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