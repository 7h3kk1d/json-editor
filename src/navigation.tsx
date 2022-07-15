
import { arrayPath, Json, JsonPath, objectPath } from "./domain";
// Explore different type of tree walks/navigation operations

function fetch(data: Json, path: JsonPath[]): Json | null {
  if (path.length === 0)
    return data;

  const head: JsonPath = path[0];
  if (head.type === "JsonArrayPos") {
    const array: Json[] = data as any;
    return fetch(array[head.position], path.slice(1, path.length));
  } else if (head.type === "JsonObjectLocation") {
    const obj: { [key: string]: Json } = data as any;
    return fetch(Object.entries(obj)[head.position][1], path.slice(1, path.length));
  } else {
    return data;
  }
}

// TODO: Can I use conditional types to enforce that path and data are coherent
function down(data: Json, path: JsonPath): JsonPath | null {
  switch (path.type) {
    case "JsonArrayPos":
      const data2 = data as Json[]
      if (path.inner) {
        const innerPath = down(data2[path.position], path.inner)
        if (innerPath)
          return arrayPath(path.position, innerPath)
      }

      if (data2.length > (path.position + 1)) {
        return arrayPath(path.position + 1)
      } else {
        return null;
      }

    case "JsonObjectLocation":
      const objectData = data as { [key: string]: Json }
      const objectEntries = Object.entries(objectData)
      if (path.inner) {
        const innerPath = down(objectEntries[path.position][1], path.inner)

        if (innerPath)
          return objectPath(path.position, innerPath)
      }

      if (Object.entries(objectData).length > (path.position + 1)) {
        return objectPath(path.position + 1)
      } else {
        return null;
      }

  }
}

function up(data: Json, path: JsonPath): JsonPath | null {
  switch (path.type) {
    case "JsonArrayPos":
      const arrayData = data as Json[]
      if (path.inner) {
        const innerPath = up(arrayData[path.position], path.inner)
        if (innerPath)
          return arrayPath(path.position, innerPath)
      }

      if (path.position > 0) {
        return arrayPath(path.position - 1)
      } else {
        return null;
      }
    case "JsonObjectLocation":
      const objData = data as { [key: string]: Json }
      const objEntries = Object.entries(objData)
      if (path.inner) {
        const innerPath = up(objEntries[path.position], path.inner)
        if (innerPath)
          return objectPath(path.position, innerPath)
      }

      if (path.position > 0) {
        return objectPath(path.position - 1)
      } else {
        return null;
      }
  }
}

function defaultPath(data: Json): JsonPath | undefined {
  if (Array.isArray(data) && data.length > 0)
    return arrayPath(0)
  if (typeof (data) === 'object')
    if (Object.keys(data as object).length > 0)
      return objectPath(0)
}

// Move focus into the path your currently observing
function enter(data: Json, path: JsonPath): JsonPath | undefined {
  switch (path.type) {
    case "JsonArrayPos":
      const dataArray = data as Json[]

      if (path.inner) {
        const innerPath = enter(dataArray[path.position], path.inner)
        return innerPath ? arrayPath(path.position, innerPath) : undefined
      } else {
        const innerPath = defaultPath(dataArray[path.position])
        return innerPath ? arrayPath(path.position, innerPath) : undefined
      }
    
    case "JsonObjectLocation":
      const objData = data as { [key: string]: Json }
      const objEntries = Object.entries(objData)

      if(path.inner) {
        const innerPath = enter(objEntries[path.position][1], path.inner)

        return innerPath ? objectPath(path.position, innerPath) : undefined
      } else {
        const innerPath = defaultPath(objEntries[path.position][1])
        return innerPath ? objectPath(path.position, innerPath) : undefined

      }
  }
}

function leave(data: Json, path: JsonPath): JsonPath | undefined {
  const pathClone = JSON.parse(JSON.stringify(path)) as JsonPath
  if(!path.inner)
    return undefined
  const innerPath = leave(data, path.inner)
  pathClone.inner = innerPath
  return pathClone
}


export { down, fetch, up, enter, leave };

