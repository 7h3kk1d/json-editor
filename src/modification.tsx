import { Json, JsonPath } from "./domain";

function replace(existing: Json, path: JsonPath, updated_value: Json): Json {
    const clone = JSON.parse(JSON.stringify(existing)) // I need an actual data structure representation

    switch (path.type) {
        case "JsonArrayPos":
            if (path.inner) {
                const existingInner = (existing as Json[])[path.position] as Json
                const newInner = replace(existingInner, path.inner, updated_value)
                clone[path.position] = newInner
                return clone;
            } else {
                clone[path.position] = updated_value
                return clone
            }
        case "JsonObjectLocation":
            if (path.inner) {
                const pairs = Object.entries(existing as { [key: string]: Json })
                const existingInner = pairs[path.position]
                const newInner = replace(existingInner[1], path.inner, updated_value)
                pairs[path.position] = [existingInner[0], newInner]
                return Object.fromEntries(pairs);
            } else {
                const pairs = Object.entries(existing as { [key: string]: Json })
                const existingInner = pairs[path.position]

                pairs[path.position] = [existingInner[0], updated_value]
                return Object.fromEntries(pairs);
            }
    }
}

function insert(existing: Json, path: JsonPath): Json {
    const clone = JSON.parse(JSON.stringify(existing)) 

    switch (path.type) {
        case "JsonArrayPos":
            if (path.inner) {
                const existingInner = (existing as Json[])[path.position] as Json
                const newInner = insert(existingInner, path.inner)
                clone[path.position] = newInner
                return clone;
            } else {
                const array = (existing as Json[])
                return array.slice(0, path.position+1).concat([null]).concat(array.slice(path.position+1));
            }
        case "JsonObjectLocation":
            if (path.inner) {
                const pairs = Object.entries(existing as { [key: string]: Json })
                const existingInner = pairs[path.position]
                const newInner = insert(existingInner[1], path.inner)
                pairs[path.position] = [existingInner[0], newInner]
                return Object.fromEntries(pairs);
            } else {
                const pairs = Object.entries(existing as { [key: string]: Json })
                return Object.fromEntries(pairs.slice(0, path.position+1).concat([["", null]]).concat(pairs.slice(path.position+1)));
            }    
        }
}

function remove(existing: Json, path: JsonPath): Json {
    const clone = JSON.parse(JSON.stringify(existing)) 

    switch (path.type) {
        case "JsonArrayPos":
            if (path.inner) {
                const existingInner = (existing as Json[])[path.position] as Json
                const newInner = remove(existingInner, path.inner)
                clone[path.position] = newInner
                return clone;
            } else {
                const array = (existing as Json[])
                return array.slice(0, path.position).concat(array.slice(path.position+1));
            }
        case "JsonObjectLocation":
            if (path.inner) {
                const pairs = Object.entries(existing as { [key: string]: Json })
                const existingInner = pairs[path.position]
                const newInner = remove(existingInner[1], path.inner)
                pairs[path.position] = [existingInner[0], newInner]
                return Object.fromEntries(pairs);
            } else {
                const pairs = Object.entries(existing as { [key: string]: Json })
                return Object.fromEntries(pairs.slice(0, path.position).concat(pairs.slice(path.position+1)));
            }    
        }
}

export { replace, insert, remove }