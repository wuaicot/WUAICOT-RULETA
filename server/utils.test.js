"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
const mockUsersData = [
    {
        playerId: "powpow",
        win: 0,
    },
    {
        playerId: "boom",
        win: 1200,
    },
    { playerId: "kaboom", win: -300 },
];
describe("should properly assess if user's id is unique", () => {
    test("should return false if id is not unique", () => {
        expect((0, utils_1.isIdUnique)(mockUsersData, "powpow")).toBe(false);
    });
    test("should return true if id is unique", () => {
        expect((0, utils_1.isIdUnique)(mockUsersData, "rico")).toBe(true);
    });
});
const mockBets1 = [
    {
        betAmount: 100,
        betSpot: "RED",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
    {
        betAmount: 100,
        betSpot: "BLACK",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
];
const mockBets2 = [
    {
        betAmount: 50,
        betSpot: "1ST12",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
    {
        betAmount: 50,
        betSpot: "3RD12",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
    {
        betAmount: 50,
        betSpot: "2ND12",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
];
const mockBets3 = [
    {
        betAmount: 20,
        betSpot: "2TO1_1",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
    {
        betAmount: 20,
        betSpot: "2TO1_2",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
    {
        betAmount: 20,
        betSpot: "2TO1_3",
        betChips: [{}],
        betLocation: { x: 0, y: 0 },
    },
];
describe("should calculate win properly according to winning number", () => {
    test("should return double if betted on blacks, red, odd, even", () => {
        expect((0, utils_1.calculateWin)(23, mockBets1)).toBe(200);
        expect((0, utils_1.calculateWin)(22, mockBets1)).toBe(200);
    });
    test("should return triple if betted on lines or triples", () => {
        expect((0, utils_1.calculateWin)(23, mockBets2)).toBe(150);
        expect((0, utils_1.calculateWin)(22, mockBets2)).toBe(150);
        expect((0, utils_1.calculateWin)(5, mockBets3)).toBe(60);
    });
    test("should return 0 if it's not betted on", () => {
        expect((0, utils_1.calculateWin)(0, mockBets1)).toBe(0);
        expect((0, utils_1.calculateWin)(0, mockBets2)).toBe(0);
        expect((0, utils_1.calculateWin)(0, mockBets3)).toBe(0);
    });
    test("should calculate multiple wins", () => {
        expect((0, utils_1.calculateWin)(23, [...mockBets1, ...mockBets2, ...mockBets3])).toBe(410);
    });
    test("should return 36 times bet if it was a winning number", () => {
        expect((0, utils_1.calculateWin)(23, [
            {
                betAmount: 10,
                betSpot: "23",
                betChips: [{}],
                betLocation: { x: 0, y: 0 },
            },
        ])).toBe(360);
    });
});
describe("should return proper line numbers", () => {
    test("should return proper numbers for first line", () => {
        expect((0, utils_1.calculateLineNumbers)("first")).toStrictEqual([
            1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34,
        ]);
    });
    test("should return proper numbers for second line", () => {
        expect((0, utils_1.calculateLineNumbers)("second")).toStrictEqual([
            2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35,
        ]);
    });
    test("should return proper numbers for third line", () => {
        expect((0, utils_1.calculateLineNumbers)("third")).toStrictEqual([
            3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
        ]);
    });
});
