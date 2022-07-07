
import { arrayPath, Json, JsonPath, objectPath } from "./domain";
// Explore different type of tree walks/navigation operations

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
    return [{ "type": "JsonObjectLocation", "position": 0, "focus": "key" }]
  } else {
    return [{ "type": "JsonScalarLocation" }]
  }
}

// TODO: Can I use conditional types to enforce that path and data are coherent
function down(data: Json, path: JsonPath[]): JsonPath[] {
  if (path.length < 1)
    return []
  if (data == null)
    return path

  const head: JsonPath = path[0]
  const tail: JsonPath[] = path.slice(1, path.length)

  if (head["type"] == "JsonArrayPos" && Array.isArray(data)) {
    if (head.position < (data.length - 1)) {
      const foo: JsonPath[] = [arrayPath(head.position + 1)]
      return foo.concat(tail)
    } else {
      return path
    }
  } else if (head["type"] == "JsonObjectLocation" && typeof (data) === 'object') {
    if (head.position < (Object.keys(data).length - 1)) {
      const foo: JsonPath[] = [objectPath(head.position + 1, head.focus)]
      return foo.concat(tail)
    } else {
      return path
    }
  }
  return path
}

function up(data: Json, path: JsonPath[]): JsonPath[] {
  if (path.length < 1)
    return []
  if (data == null)
    return path

  const head: JsonPath = path[0]
  const tail: JsonPath[] = path.slice(1, path.length)

  if (head["type"] == "JsonArrayPos" && Array.isArray(data)) {
    if (head.position > 0) {
      const foo: JsonPath[] = [arrayPath(head.position - 1)]
      return foo.concat(tail)
    } else {
      return path
    }
  } else if (head["type"] == "JsonObjectLocation" && typeof (data) === 'object') {
    if (head.position > 0) {
      const foo: JsonPath[] = [objectPath(head.position - 1, head.focus)]
      return foo.concat(tail)
    } else {
      return path
    }
  }
  return path
}

export { down, fetch, up };