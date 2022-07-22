
import { arrayPath, Json2, JsonArray, JsonObject, JsonPath, objectPath } from "./domain";
// Explore different type of tree walks/navigation operations


// TODO: Can I use conditional types to enforce that path and data are coherent? Or more realistically move the focus onto the Json type
function down(data: Json2, path: JsonPath): JsonPath | null {
  switch (data.kind) {
    case "array":
      const data2 = data.value
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

    case "object":
      const objectData = data as JsonObject
      const objectEntries = data.value
      if (path.inner) {
        const innerPath = down(objectEntries[path.position].value, path.inner)

        if (innerPath)
          return objectPath(path.position, innerPath)
      }

      if (objectData.value.length > (path.position + 1)) {
        return objectPath(path.position + 1)
      } else {
        return null;
      }
    default:
      return null
  }
}


function up(data: Json2, path: JsonPath): JsonPath | null {
  switch (data.kind) {
    case "array":
      if (path.inner) {
        const innerPath = up(data.value[path.position], path.inner)
        if (innerPath)
          return arrayPath(path.position, innerPath)
      }

      if (path.position > 0) {
        return arrayPath(path.position - 1)
      } else {
        return null;
      }
    case "object":
      if (path.inner) {
        const innerPath = up(data.value[path.position].value, path.inner)
        if (innerPath)
          return objectPath(path.position, innerPath)
      }

      if (path.position > 0) {
        return objectPath(path.position - 1)
      } else {
        return null;
      }
    default: 
      return null
  }
}

function defaultPath(data: Json2): JsonPath | undefined {
  switch(data.kind) {
    case "array":
      if(data.value.length > 0)
        return arrayPath(0)
      break
    case "object":
      if(data.value.length > 0)
        return objectPath(0)
  }
}

// Move focus into the path your currently observing
function enter(data: Json2, path: JsonPath): JsonPath | undefined {
  switch (path.type) {
    case "JsonArrayPos":
      const dataArray = data as JsonArray

      if (path.inner) {
        const innerPath = enter(dataArray.value[path.position], path.inner)
        return innerPath ? arrayPath(path.position, innerPath) : undefined
      } else {
        const innerPath = defaultPath(dataArray.value[path.position])
        return innerPath ? arrayPath(path.position, innerPath) : undefined
      }
    
    case "JsonObjectLocation":
      const objData = data as JsonObject
      const objEntries = objData.value

      if(path.inner) {
        const innerPath = enter(objEntries[path.position].value, path.inner)

        return innerPath ? objectPath(path.position, innerPath) : undefined
      } else {
        const innerPath = defaultPath(objEntries[path.position].value)
        return innerPath ? objectPath(path.position, innerPath) : undefined
      }
  }
}

function leave(data: Json2, path: JsonPath): JsonPath | undefined {
  const pathClone = JSON.parse(JSON.stringify(path)) as JsonPath
  if(!path.inner)
    return undefined
  const innerPath = leave(data, path.inner)
  pathClone.inner = innerPath
  return pathClone
}


export { down, up, enter, leave };

