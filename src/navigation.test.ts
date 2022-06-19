import App from "./App";
import { arrayPath, objectPath, scalarPath } from "./domain";
import { down } from "./navigation";

describe('down', () => {
    describe('scalar', () => {
        test('scalar goes nowhere', () => {
            expect(down("scalar", [scalarPath()])).toStrictEqual([scalarPath()])
        })
    })
    
    describe('array', () => {
        test('single element at end goes nowhere', () => {
            expect(down([0], [arrayPath(0)])).toStrictEqual([arrayPath(0)]);
        })
        test('end of array goes nowhere', () => {
            expect(down([0, 1, 2], [arrayPath(2)])).toStrictEqual([arrayPath(2)]);
        })
        test('not end of array goes to next element', () => {
            expect(down([0, 1, 2], [arrayPath(0)])).toStrictEqual([arrayPath(1)]);
            expect(down([0, 1, 2], [arrayPath(1)])).toStrictEqual([arrayPath(2)]);
        })
    })

    describe('object', () => {
        test('single element at end goes nowhere', () => {
            expect(down({"hello" : "world"}, [objectPath(0, "key")])).toStrictEqual([objectPath(0, "key")]);
            expect(down({"hello" : "world"}, [objectPath(0, "value")])).toStrictEqual([objectPath(0, "value")]);
        })
        test('end of object goes nowhere', () => {
            expect(down({"foo": "bar", "hello" : "world"}, [objectPath(1, "key")])).toStrictEqual([objectPath(1, "key")]);
            expect(down({"foo": "bar", "hello" : "world"}, [objectPath(1, "value")])).toStrictEqual([objectPath(1, "value")]);
        })
        test('not end of array goes to next element', () => {
            expect(down({"foo": "bar", "hello" : "world"}, [objectPath(0, "key")])).toStrictEqual([objectPath(1, "key")]);
            expect(down({"foo": "bar", "hello" : "world"}, [objectPath(0, "value")])).toStrictEqual([objectPath(1, "value")]);
        })
    })
})
