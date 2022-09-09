type JsonNumber = { kind: "number"; value: number; selected: boolean }
type JsonString = { kind: "string"; value: string; selected: boolean }
type JsonBoolean = { kind: "boolean"; value: boolean; selected: boolean }
type JsonNull = {kind: "null"; selected: boolean }
type JsonArray = {kind: "array"; value: Json[]; selected: boolean}
type JsonObject = {kind: "object"; value: {"key": string, "value": Json}[]; selected: boolean}


type Json = JsonNumber | JsonString | JsonBoolean | JsonNull | JsonObject | JsonArray


function  jsonNull(selected=false) : JsonNull {
  return {kind: "null", selected} 
}
function jsonString(value: string, selected=false) : JsonString{
  return {kind: "string", value, selected}
}
function jsonBoolean(value: boolean, selected=false) : JsonBoolean {
  return {kind: "boolean", value, selected};
}
function jsonNumber(value: number, selected=false) : JsonNumber {
  return {kind: "number", value, selected};
}
function jsonArray(value: Json[], selected=false) : JsonArray {
  return {kind: "array", value, selected};
}
function jsonObject(value: {"key": string, "value": Json}[], selected=false) : JsonObject {
  return {kind: "object", value: value, selected}
}

function parse(json: any) : Json {
  if (json == null) {
    return jsonNull();
  } else if (typeof (json) == "string") {
    return jsonString(json)
  } else if (typeof (json) == "boolean") {
    return jsonBoolean(json)
  } else if (typeof (json) == "number") {
    return jsonNumber(json)
  } else if (Array.isArray(json)) {
    return jsonArray(json.map(parse))
  } else {
    return jsonObject(Object.entries(json as object).map(kv => ({ key: kv[0], value: parse(kv[1]) })))
  }
}
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

function objectPath(n: number, inner?: JsonPath) : JsonObjectLocation {
    return {
        type: "JsonObjectLocation",
        position: n,
        focus: "key",
        inner: inner
          }
}


export type {Json, JsonArrayPos, JsonObjectLocation, JsonPath, JsonObject, JsonArray}
export {objectPath, arrayPath, parse, jsonObject, jsonArray, jsonNull, jsonNumber, jsonBoolean, jsonString}