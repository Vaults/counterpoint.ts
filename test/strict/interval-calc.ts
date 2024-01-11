import { assert } from "chai";
import {Interval, Note, NoteLength, ScaleDegree} from "@/strict/types";
import { createInterval } from "@/strict/interval-calc";

describe("Interval calculation", () => {
    it("Provides a proper noteTuple", () => {
        const note1: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const note2: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const interval = createInterval(note1, note2)
        assert.equal(interval.noteTuple.lower, note1)
        assert.equal(interval.noteTuple.upper, note2)
    })
    it("Should return proper interval on the same notes", () => {
        const note: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const interval = createInterval(note, note)
        assert.isTrue(interval.sameClass)
        assert.isTrue(interval.perfect)
        assert.isTrue(interval.consonant)
        assert.isFalse(interval.dissonant)
    });

    it("Should return proper interval on a fifth", () => {
        const note1: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const note2: Note<NoteLength> = {scaleDegree: new ScaleDegree(5), length: 1}
        const interval = createInterval(note1, note2)
        assert.isFalse(interval.sameClass)
        assert.isTrue(interval.perfect)
        assert.isTrue(interval.consonant)
        assert.isFalse(interval.dissonant)
    });
    it("Should return proper interval on a sixth", () => {
        const note1: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const note2: Note<NoteLength> = {scaleDegree: new ScaleDegree(6), length: 1}
        const interval = createInterval(note1, note2)
        assert.isFalse(interval.sameClass)
        assert.isFalse(interval.perfect)
        assert.isTrue(interval.consonant)
        assert.isFalse(interval.dissonant)
    });
    it("Should return proper interval on a second", () => {
        const note1: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const note2: Note<NoteLength> = {scaleDegree: new ScaleDegree(2), length: 1}
        const interval = createInterval(note1, note2)
        assert.isFalse(interval.sameClass)
        assert.isFalse(interval.perfect)
        assert.isFalse(interval.consonant)
        assert.isTrue(interval.dissonant)
    });
    it("Should return proper interval on a tenth", () => {
        const note1: Note<NoteLength> = {scaleDegree: new ScaleDegree(1), length: 1}
        const note2: Note<NoteLength> = {scaleDegree: new ScaleDegree(10), length: 1}
        const interval = createInterval(note1, note2)
        assert.isFalse(interval.sameClass)
        assert.isFalse(interval.perfect)
        assert.isTrue(interval.consonant)
        assert.isFalse(interval.dissonant)
    });
});