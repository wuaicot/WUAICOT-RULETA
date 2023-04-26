import { jest } from "@jest/globals";
import { assetsURL } from "../utils/utils";
import { chipsToSpawn, indexSpin, calculateWinSpin } from "./gameStore";

describe("gameStore", () => {
    test("returns correct chips to spawn on board", () => {
        expect(chipsToSpawn(10)).toStrictEqual([
            {
                url: assetsURL.orange,
                alt: "chip orange value 10",
                value: 10,
                id: "10",
            },
        ]);
        expect(chipsToSpawn(20)).toStrictEqual([
            {
                url: assetsURL.purple,
                alt: "chip purple value 20",
                value: 20,
                id: "20",
            },
        ]);
        expect(chipsToSpawn(50)).toStrictEqual([
            {
                url: assetsURL.blue,
                alt: "chip blue value 50",
                value: 50,
                id: "50",
            },
        ]);
        expect(chipsToSpawn(100)).toStrictEqual([
            {
                url: assetsURL.black,
                value: 100,
                alt: "chip black value 100",
                id: "100",
            },
        ]);
    });
    test("should return proper spin in radians", () => {
        expect(calculateWinSpin(0)).toBe(0.0);
        expect(calculateWinSpin(10)).toBe(3.06);
        expect(calculateWinSpin(30)).toBe(2.55);
    });
});
