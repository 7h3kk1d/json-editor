type Json = number | string | boolean | null | { [key: string]: Json } | Json[]


/* Alternative Approaches:
    Some form of CoFree on Json so I don't have to specify this at all
    Recursive path implementation where the carrier types contain the rest of the path

    Lenses are probably a better approach
*/
type JsonArrayPos = {
  type: "JsonArrayPos",
  position: number,
  inner?: JsonPath
}

// TODO: Key path
type JsonObjectLocation = {
  type: "JsonObjectLocation",
  position: number,
  focus: "key" | "value"
  inner?: JsonPath
}

type JsonPath = JsonArrayPos | JsonObjectLocation


function arrayPath(n : number, inner?: JsonPath) : JsonArrayPos {
    return {
        type: "JsonArrayPos",
        position: n,
        inner: inner
      }
}

function objectPath(n: number, focus: "key" | "value"="key") : JsonObjectLocation {
    return {
        type: "JsonObjectLocation",
        position: n,
        focus: "key"
          }
}

export type {Json, JsonArrayPos, JsonObjectLocation, JsonPath}
export {objectPath, arrayPath}