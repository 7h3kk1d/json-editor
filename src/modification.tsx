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

export { replace }