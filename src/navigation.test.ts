import App from "./App";
import { arrayPath, JsonPath, objectPath, parse } from "./domain";
import { down, enter, up } from "./navigation";

describe('down', () => {
    describe('array', () => {
        test('single element at end goes nowhere', () => {
            expect(down(parse([0]), arrayPath(0))).toStrictEqual(null);
        })
        test('end of array goes nowhere', () => {
            expect(down(parse([0, 1, 2]), arrayPath(2))).toStrictEqual(null);
        })
        test('not end of array goes to next element', () => {
            expect(down(parse([0, 1, 2]), arrayPath(0))).toStrictEqual(arrayPath(1));
            expect(down(parse([0, 1, 2]), arrayPath(1))).toStrictEqual(arrayPath(2));
        })
    })

    describe('object', () => {
        test('single element at end goes nowhere', () => {
            expect(down(parse({ "hello": "world" }), objectPath(0))).toStrictEqual(null);
            expect(down(parse({ "hello": "world" }), objectPath(0))).toStrictEqual(null);
        })
        test('end of object goes nowhere', () => {
            expect(down(parse({ "foo": "bar", "hello": "world" }), objectPath(1))).toStrictEqual(null);
            expect(down(parse({ "foo": "bar", "hello": "world" }), objectPath(1))).toStrictEqual(null);
        })
        test('not end of array goes to next element', () => {
            expect(down(parse({ "foo": "bar", "hello": "world" }), objectPath(0))).toStrictEqual(objectPath(1));
            expect(down(parse({ "foo": "bar", "hello": "world" }), objectPath(0))).toStrictEqual(objectPath(1));
        })
    })
})

describe('up', () => {
    describe('array', () => {
        test('single element at beginning goes nowhere', () => {
            expect(up(parse([0]), arrayPath(0))).toStrictEqual(null);
        })
        test('beginning of array goes nowhere', () => {
            expect(up(parse([0, 1, 2]), arrayPath(0))).toStrictEqual(null);
        })
        test('not beginning of array goes to previous element', () => {
            expect(up(parse([0, 1, 2]), arrayPath(1))).toStrictEqual(arrayPath(0));
            expect(up(parse([0, 1, 2]), arrayPath(2))).toStrictEqual(arrayPath(1));
        })
    })

    describe('object', () => {
        test('single element at beginning goes nowhere', () => {
            expect(up(parse({ "hello": "world" }), objectPath(0))).toStrictEqual(null);
            expect(up(parse({ "hello": "world" }), objectPath(0))).toStrictEqual(null);
        })
        test('beginning of object goes nowhere', () => {
            expect(up(parse({ "foo": "bar", "hello": "world" }), objectPath(0))).toStrictEqual(null);
            expect(up(parse({ "foo": "bar", "hello": "world" }), objectPath(0))).toStrictEqual(null);
        })
        test('not beggining of array goes to previous element', () => {
            expect(up(parse({ "foo": "bar", "hello": "world" }), objectPath(1))).toStrictEqual(objectPath(0));
            expect(up(parse({ "foo": "bar", "hello": "world" }), objectPath(1))).toStrictEqual(objectPath(0));
        })
    })
})
