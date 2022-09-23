
import { arrayPath, Json, JsonArrayPos, JsonObject, JsonObjectLocation, JsonPath, objectPath } from "./domain";
// Explore different type of tree walks/navigation operations

function recurse(data: Json, path: JsonPath, fn: (innerData: Json, innerPath: JsonPath) => JsonPath | null): JsonPath | null {
  switch (data.kind) {
    case "array":
      const data2 = data.value
      if ((path as JsonArrayPos).inner) {
        const innerPath = recurse(data2[(path as JsonArrayPos).position], ((path as JsonArrayPos).inner as JsonPath), fn)
        if (innerPath)
          return arrayPath((path as JsonArrayPos).position, innerPath)
      }

      return fn(data, path)
    case "object":
      const objectEntries = data.value
      if ((path as JsonObjectLocation).inner) {
        const innerPath = recurse(objectEntries[(path as JsonObjectLocation).position].value, (path as JsonObjectLocation).inner as JsonPath, fn)

        if (innerPath)
          return objectPath((path as JsonObjectLocation).position, innerPath)
      }

      return fn(data, path)
    case "string":
      return fn(data, path)
    default:
      return null
  }
}


// TODO: Can I use conditional types to enforce that path and data are coherent? Or more realistically move the focus onto the Json type
function down(data: Json, path: JsonPath): JsonPath | null {
  return recurse(data, path, (innerData, innerPath) => {
    switch (innerData.kind) {
      case "array":
        const data2 = innerData.value
        if (data2.length > ((innerPath as JsonArrayPos).position + 1)) {
          return arrayPath((innerPath as JsonArrayPos).position + 1)
        } else {
          return null;
        }

      case "object":
        const objectData = innerData as JsonObject
        if (objectData.value.length > ((innerPath as JsonObjectLocation).position + 1)) {
          return objectPath((innerPath as JsonObjectLocation).position + 1)
        } else {
          return null;
        }
      default:
        return null
    }
  })
}


function up(data: Json, path: JsonPath): JsonPath | null {
  return recurse(data, path, (innerData, innerPath) => {
    switch (innerData.kind) {
      case "array":
        if ((innerPath as JsonArrayPos).position > 0) {
          return arrayPath((innerPath as JsonArrayPos).position - 1)
        } else {
          return null;
        }
      case "object":
        if ((innerPath as JsonObjectLocation).position > 0) {
          return objectPath((innerPath as JsonObjectLocation).position - 1)
        } else {
          return null;
        }
      default:
        return null
    }
  })

}

function defaultPath(data: Json): JsonPath | null {
  switch (data.kind) {
    case "array":
      if (data.value.length > 0)
        return arrayPath(0)
      return null
    case "object":
      if (data.value.length > 0)
        return objectPath(0)
      return null
    case "string":
      return {"type": "JsonString"}
    default:
      return null
  }
}

function enter(data: Json, path: JsonPath): JsonPath | null {
  console.log(`initial = ${JSON.stringify(path)}`)
  return recurse(data, path, (innerData, innerPath) => {
    switch (innerData.kind) {
      case "array":
        const insidePath = defaultPath(innerData.value[(innerPath as JsonArrayPos).position])
        return insidePath ? arrayPath((innerPath as JsonArrayPos).position, insidePath) : null
      case "object":
        const objData = innerData as JsonObject
        const objEntries = objData.value

        const insidePath2 = defaultPath(objEntries[(innerPath as JsonObjectLocation).position].value)
        console.log(`innerPath = ${JSON.stringify(innerPath)}`)
        console.log(`objEntries = ${JSON.stringify(objEntries)}`)
        console.log(`insidePath2 = ${JSON.stringify(insidePath2)}`)
        console.log(`other = ${JSON.stringify(objEntries[(innerPath as JsonObjectLocation).position].value)}`)
        console.log(`other = ${JSON.stringify(objEntries[(innerPath as JsonObjectLocation).position].value)}`)

        return insidePath2 ? objectPath((innerPath as JsonObjectLocation).position, insidePath2) : null
      default:
        return null
    }
  })
}


function leave(data: Json, path: JsonPath): JsonPath {
  function innerLeave(path: JsonPath): JsonPath | null {
    switch(path.type) {
      case "JsonString":
        return null;
      case "JsonObjectLocation":
        if(!path.inner)
          return null
        return {...path, inner: innerLeave(path.inner) || undefined}
      case "JsonArrayPos":
        if(!path.inner)
          return null
        return {...path, inner: innerLeave(path.inner) || undefined}
      }
  }

  switch(path.type) {
    case "JsonString":
      return path;
    case "JsonObjectLocation":
      return innerLeave(path) || path
    case "JsonArrayPos":
      return innerLeave(path) || path
  }
}


export { down, up, enter, leave };

