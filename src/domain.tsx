type Json = number | string | boolean | null | { [key: string]: Json } | Json[]


/* Alternative Approaches:
    Some form of CoFree on Json so I don't have to specify this at all
    Recursive path implementation where the carrier types contain the rest of the path
*/
type JsonArrayPos = {
  type: "JsonArrayPos",
  position: number
}

// TODO: Key path
type JsonObjectLocation = {
  type: "JsonObjectLocation",
  position: number,
  focus: "key" | "value"
}
type JsonScalarLocation = {
  type: "JsonScalarLocation"
}
type JsonPath = JsonArrayPos | JsonObjectLocation | JsonScalarLocation

function arrayPath(n : number) : JsonArrayPos {
    return {
        type: "JsonArrayPos",
        position: n
      }
}

function objectPath(n: number, focus: "key" | "value") : JsonObjectLocation {
    return {
        type: "JsonObjectLocation",
        position: n,
        focus: focus
    }
}

function scalarPath() : JsonScalarLocation {
    return {
        type: "JsonScalarLocation"
    }
}

export type {Json, JsonArrayPos, JsonObjectLocation, JsonScalarLocation, JsonPath}
export {scalarPath, objectPath, arrayPath}