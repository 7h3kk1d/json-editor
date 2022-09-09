import { Json, jsonArray, JsonArray, jsonNull, jsonObject, JsonObject, JsonPath } from "./domain";

function replace(existing: Json, path: JsonPath, updated_value: Json): Json {
    const clone = JSON.parse(JSON.stringify(existing)) // I need an actual data structure representation

    switch (path.type) {
        case "JsonArrayPos":
            if (path.inner) {
                const existingInner = (existing as JsonArray).value[path.position]
                const newInner = replace(existingInner, path.inner, updated_value)
                clone.value[path.position] = newInner
                return clone;
            } else {
                clone.value[path.position] = updated_value
                return clone
            }
        case "JsonObjectLocation":    
            if (path.inner) {
                const pairs = (existing as JsonObject).value
                const existingInner = pairs[path.position]
                const newInner = replace(existingInner.value, path.inner, updated_value)
                pairs[path.position] = {key: existingInner.key, value: newInner}
                return jsonObject(pairs);
            } else {
                const pairs = (existing as JsonObject).value
                const existingInner = pairs[path.position]

                pairs[path.position] = {key: existingInner.key, value: updated_value}
                return jsonObject(pairs);
            }
    }
}

function insert(existing: Json, path: JsonPath): Json {
    const clone = JSON.parse(JSON.stringify(existing)) 

    switch (path.type) {
        case "JsonArrayPos":
            if (path.inner) {
                const existingInner = (clone as JsonArray).value[path.position]
                const newInner = insert(existingInner, path.inner)
                clone.value[path.position] = newInner
                return clone;
            } else {
                const array = (clone as JsonArray).value
                return jsonArray(array.slice(0, path.position+1).concat([jsonNull()]).concat(array.slice(path.position+1)));
            }
        case "JsonObjectLocation":
            if (path.inner) {
                const pairs = (clone as JsonObject).value
                const existingInner = pairs[path.position]
                const newInner = insert(existingInner.value, path.inner)
                pairs[path.position] = {key: existingInner.key, value: newInner}
                return jsonObject(pairs);
            } else {
                const pairs = (clone as JsonObject).value
                return jsonObject(pairs.slice(0, path.position+1).concat({key: "", value: jsonNull()}).concat(pairs.slice(path.position+1)));
            }    
        }
}

function remove(existing: Json, path: JsonPath): Json {
    const clone = JSON.parse(JSON.stringify(existing)) 

    switch (path.type) {
        case "JsonArrayPos":
            if (path.inner) {
                const existingInner = (clone as JsonArray).value[path.position]
                const newInner = remove(existingInner, path.inner)
                clone.value[path.position] = newInner
                return clone;
            } else {
                const array = (clone as JsonArray).value
                return jsonArray(array.slice(0, path.position).concat(array.slice(path.position+1)));
            }
        case "JsonObjectLocation":
            if (path.inner) {
                const pairs = (clone as JsonObject).value
                const existingInner = pairs[path.position]
                const newInner = remove(existingInner.value, path.inner)
                pairs[path.position] = {key: existingInner.key, value: newInner}
                return jsonObject(pairs);
            } else {
                const pairs = (clone as JsonObject).value
                return jsonObject(pairs.slice(0, path.position).concat(pairs.slice(path.position+1)));
            }    
        }
}

export { replace, insert, remove }