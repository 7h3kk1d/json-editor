
import { arrayPath, Json, JsonObject, JsonPath, objectPath } from "./domain";
// Explore different type of tree walks/navigation operations

function recurse(data: Json, path: JsonPath, fn: (innerData: Json, innerPath: JsonPath) => JsonPath | null): JsonPath | null {
  switch (data.kind) {
    case "array":
      const data2 = data.value
      if (path.inner) {
        const innerPath = recurse(data2[path.position], path.inner, fn)
        if (innerPath)
          return arrayPath(path.position, innerPath)
      }

      return fn(data, path)
    case "object":
      const objectEntries = data.value
      if (path.inner) {
        const innerPath = recurse(objectEntries[path.position].value, path.inner, fn)

        if (innerPath)
          return objectPath(path.position, innerPath)
      }

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
        if (data2.length > (innerPath.position + 1)) {
          return arrayPath(innerPath.position + 1)
        } else {
          return null;
        }

      case "object":
        const objectData = innerData as JsonObject
        if (objectData.value.length > (innerPath.position + 1)) {
          return objectPath(innerPath.position + 1)
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
        if (innerPath.position > 0) {
          return arrayPath(innerPath.position - 1)
        } else {
          return null;
        }
      case "object":
        if (innerPath.position > 0) {
          return objectPath(innerPath.position - 1)
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
    default:
      return null
  }
}

function enter(data: Json, path: JsonPath): JsonPath | null {
  return recurse(data, path, (innerData, innerPath) => {
    switch (innerData.kind) {
      case "array":
        const insidePath = defaultPath(innerData.value[innerPath.position])
        return insidePath ? arrayPath(innerPath.position, insidePath) : null
      case "object":
        const objData = data as JsonObject
        const objEntries = objData.value

        const insidePath2 = defaultPath(objEntries[innerPath.position].value)
        return insidePath2 ? objectPath(innerPath.position, insidePath2) : null
      default:
        return null
    }
  })
}


function leave(data: Json, path: JsonPath): JsonPath | undefined {
  const pathClone = JSON.parse(JSON.stringify(path)) as JsonPath
  if (!path.inner)
    return undefined
  const innerPath = leave(data, path.inner)
  pathClone.inner = innerPath
  return pathClone
}


export { down, up, enter, leave };

