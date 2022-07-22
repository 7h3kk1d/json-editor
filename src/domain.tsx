type Json = number | string | boolean | null | { [key: string]: Json } | Json[]

type JsonNumber = { kind: "number"; value: number; }
type JsonString = { kind: "string"; value: string; }
type JsonBoolean = { kind: "boolean"; value: boolean; }
type JsonNull = {kind: "null"; }
type JsonArray = {kind: "array"; value: Json2[]; }
type JsonObject = {kind: "object"; value: {"key": string, "value": Json2}[];}


type Json2 = JsonNumber | JsonString | JsonBoolean | JsonNull | JsonObject | JsonArray


function  jsonNull() : JsonNull {
  return {kind: "null"} 
}
function jsonString(value: string) : JsonString{
  return {kind: "string", value: "string"}
}
function jsonBoolean(value: boolean) : JsonBoolean {
  return {kind: "boolean", value};
}
function jsonNumber(value: number) : JsonNumber {
  return {kind: "number", value};
}
function jsonArray(value: Json2[]) : JsonArray {
  return {kind: "array", value};
}
function jsonObject(value: {"key": string, "value": Json2}[]) : JsonObject {
  return {kind: "object", value: value}
}

function parse(json: Json) : Json2 {
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
    return jsonObject(Object.entries(json as object).map(kv => ({ key: kv[0], value: kv[1] })))
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

export type {Json, JsonArrayPos, JsonObjectLocation, JsonPath}
export {objectPath, arrayPath}