import App from "./App";
import { arrayPath, objectPath, scalarPath } from "./domain";
import { down, up } from "./navigation";

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

describe('up', () => {
    describe('scalar', () => {
        test('scalar goes nowhere', () => {
            expect(up("scalar", [scalarPath()])).toStrictEqual([scalarPath()])
        })
    })
    
    describe('array', () => {
        test('single element at end goes nowhere', () => {
            expect(up([0], [arrayPath(0)])).toStrictEqual([arrayPath(0)]);
        })
        test('beginning of array goes nowhere', () => {
            expect(up([0, 1, 2], [arrayPath(0)])).toStrictEqual([arrayPath(0)]);
        })
        test('not beginning of array goes to previous element', () => {
            expect(up([0, 1, 2], [arrayPath(1)])).toStrictEqual([arrayPath(0)]);
            expect(up([0, 1, 2], [arrayPath(2)])).toStrictEqual([arrayPath(1)]);
        })
    })

    describe('object', () => {
        test('single element at beginning goes nowhere', () => {
            expect(up({"hello" : "world"}, [objectPath(0, "key")])).toStrictEqual([objectPath(0, "key")]);
            expect(up({"hello" : "world"}, [objectPath(0, "value")])).toStrictEqual([objectPath(0, "value")]);
        })
        test('beginning of object goes nowhere', () => {
            expect(up({"foo": "bar", "hello" : "world"}, [objectPath(0, "key")])).toStrictEqual([objectPath(0, "key")]);
            expect(up({"foo": "bar", "hello" : "world"}, [objectPath(0, "value")])).toStrictEqual([objectPath(0, "value")]);
        })
        test('not beggining of array goes to previous element', () => {
            expect(up({"foo": "bar", "hello" : "world"}, [objectPath(1, "key")])).toStrictEqual([objectPath(0, "key")]);
            expect(up({"foo": "bar", "hello" : "world"}, [objectPath(1, "value")])).toStrictEqual([objectPath(0, "value")]);
        })
    })
})

