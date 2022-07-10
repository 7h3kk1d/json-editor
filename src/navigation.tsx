
import { json } from "stream/consumers";
import { arrayPath, Json, JsonArrayPos, JsonPath, objectPath } from "./domain";
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
  if (Array.isArray(data)) {
    const head: JsonPath[] = [{ "type": "JsonArrayPos", "position": 0 }];
    const tail: JsonPath[] = basePath(data[0]);
    return head.concat(tail);
  } else if (typeof (data) == "object") {
    return [{ "type": "JsonObjectLocation", "position": 0, "focus": "key" }]
  } else {
    return []
  }
}

// TODO: Can I use conditional types to enforce that path and data are coherent
function down(data: Json, path: JsonPath): JsonPath | null {
  switch (path.type) {
    case "JsonArrayPos":
      const data2 = data as Json[]
      if (!path.inner) {
        if (data2.length >= path.position) {
          return arrayPath(path.position + 1)
        } else {
          return null;
        }
      }
      else {
        return arrayPath(path.position, path.inner) // Incomplete
      }
    case "JsonObjectLocation":
      const objectData = data as { [key: string]: Json }
      if (!path.inner) {
        if (Object.entries(objectData).length >= path.position) {
          return objectPath(path.position + 1)
        } else {
          return null;
        }
      }
      else {
        return path// Incomplete
      }
  }
}

function up(data: Json, path: JsonPath): JsonPath | null {
  switch (path.type) {
    case "JsonArrayPos":
      if (!path.inner) {
        if (path.position > 0) {
          return arrayPath(path.position - 1)
        } else {
          return null;
        }
      }
      else {
        return arrayPath(path.position, path.inner) // Incomplete
      }
      case "JsonObjectLocation":
        if (!path.inner) {
          if (path.position > 0) {
            return objectPath(path.position - 1)
          } else {
            return null;
          }
        }
        else {
          return path// Incomplete
        }  
  }
}

export { down, fetch, up };