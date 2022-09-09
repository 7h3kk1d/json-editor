
import { arrayPath, Json, jsonNull, JsonObject, JsonPath, objectPath } from "./domain";
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
function down(data: Json): Json {
  switch (data.kind) {
    case "array":
      let index: number = data.value.findIndex(j => j.selected)
      if (index < 0) {
        return {
          ...data,
          value: data.value.map(down)
        }
      } else {
        return {
          ...data,
          value: data.value.map((v, idx) => {
            if (index >= 0 && idx == index + 1) {
              return {
                ...v,
                selected: true
              }
            } else {
              return {
                ...v,
                selected: false
              }
            }
          })
        };
      }
    case "object":
      let objIndex: number = data.value.findIndex(j => j.value.selected)
      if (objIndex >= 0) {
        return {
          ...data,
          value: data.value.map((v, idx) => {
            if (idx == objIndex + 1) {
              return {
                key: v.key,
                value: {
                  ...v.value,
                  selected: true
                }
              }
            }
            return {
              key: v.key,
              value: {
                ...v.value,
                selected: false
              }
            }
          })
        };
      } else {
        return {
          ...data,
          value: data.value.map(k => ({
            ...k,
            value: down(k.value)
          }))
        }
      }
    default:
      return data
  }
}


// function up(data: Json, path: JsonPath): JsonPath | null {
//   return recurse(data, path, (innerData, innerPath) => {
//     switch (innerData.kind) {
//       case "array":
//         if (innerPath.position > 0) {
//           return arrayPath(innerPath.position - 1)
//         } else {
//           return null;
//         }
//       case "object":
//         if (innerPath.position > 0) {
//           return objectPath(innerPath.position - 1)
//         } else {
//           return null;
//         }
//       default:
//         return null
//     }
//   })

// }

function up(data: Json): Json {
  switch (data.kind) {
    case "array":
      let index: number = data.value.findIndex(j => j.selected)
      if (index < 0) {
        return {
          ...data,
          value: data.value.map(up)
        }
      } else {
        return {
          ...data,
          value: data.value.map((v, idx) => {
            if (index < data.value.length && idx == index - 1) {
              return {
                ...v,
                selected: true
              }
            } else {
              return {
                ...v,
                selected: false
              }
            }
          })
        };
      }
    case "object":
      let objIndex: number = data.value.findIndex(j => j.value.selected)
      if (objIndex < data.value.length) {
        return {
          ...data,
          value: data.value.map((v, idx) => {
            if (idx == objIndex - 1) {
              return {
                key: v.key,
                value: {
                  ...v.value,
                  selected: true
                }
              }
            }
            return {
              key: v.key,
              value: {
                ...v.value,
                selected: false
              }
            }
          })
        };
      } else {
        return {
          ...data,
          value: data.value.map(k => ({
            ...k,
            value: down(k.value)
          }))
        }
      }
    default:
      return data
  }
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

function enter(data: Json): Json {
  switch (data.kind) {
    case "array":
      if (data.selected && data.value.length > 0) {
        return {
          ...data,
          selected: false,
          value: data.value.map((v, idx) => {
            if (idx != 0)
              return v
            return {
              ...v,
              selected: true
            }
          })
        }
      }
      return {
        ...data,
        value: data.value.map(enter)
      }
    case "object":
      if (data.selected && data.value.length > 0) {
        return {
          ...data,
          selected: false,
          value: data.value.map((v, idx) => {
            if (idx != 0)
              return v
            return {
              ...v,
              value: {
                ...v.value,
                selected: true
              }
            }
          })
        }
      }
      return {
        ...data,
        value: data.value.map((kv) => ({
          ...kv,
          value: enter(kv.value)
        }))
      }
    default:
      return data
  }
}


function leave(data: Json): Json {
  switch (data.kind) {
    case "array":
      if (data.value.some(v => v.selected))
        return {
          ...data,
          value: data.value.map(leave),
          selected: true
        }
      return {
        ...data,
        value: data.value.map(leave),
        selected: false
      }
      break;
    case "object":
      if (data.value.some(v => v.value.selected))
        return {
          ...data,
          value: data.value.map(kv => ({ ...kv, value: leave(kv.value) })),
          selected: true
        }
      return {
        ...data,
        value: data.value.map(kv => ({ ...kv, value: leave(kv.value) })),
        selected: false
      }
    default:
      return {
        ...data,
        selected: false
      }
  }
}


export { down, up, enter, leave };

