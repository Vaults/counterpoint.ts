import { assert } from "chai";
import {Interval, Note, NoteLength, PossibleInterval, PossibleSonority, ScaleDegree, Voice} from "@/strict/types";
import { createInterval } from "@/strict/interval-calc";
import {canCounterpoint} from "@/strict/wave-collapse";
import {createNote} from "../util";


let count = 0;
const createPossibleInterval= (i: Interval) => {
    const ret: PossibleInterval = {
        topVoice: new Voice([]),
        bottomVoice: new Voice([]),
        interval: i
    }
    ret.topVoice.id = count++
    ret.bottomVoice.id = count++
    return ret
}

describe("canCounterpoint", () => {
    it("Valid step", () => {
        const from: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(0), createNote(4))),
            createPossibleInterval(createInterval(createNote(4), createNote(7))),
            createPossibleInterval(createInterval(createNote(0), createNote(7))),
        ]
        const to: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(1), createNote(3))),
            createPossibleInterval(createInterval(createNote(3), createNote(6))),
            createPossibleInterval(createInterval(createNote(1), createNote(6)))
        ]

        assert.isTrue(canCounterpoint([from, to], to))
    })

    it("P5", () => {
        const from: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(0), createNote(4))),
            createPossibleInterval(createInterval(createNote(4), createNote(7))),
            createPossibleInterval(createInterval(createNote(0), createNote(7)))
        ]
        const other: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(2), createNote(6))),
            createPossibleInterval(createInterval(createNote(3), createNote(5)))
        ]
        const to: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(1), createNote(5))),
            createPossibleInterval(createInterval(createNote(5), createNote(8))),
            createPossibleInterval(createInterval(createNote(1), createNote(8)))
        ]

        assert.isFalse(canCounterpoint([from, other], to))
    })

    it("From actual test", () => {
        const from: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(0), createNote(4))),
            createPossibleInterval(createInterval(createNote(0), createNote(7))),
            createPossibleInterval(createInterval(createNote(0), createNote(11))),
            createPossibleInterval(createInterval(createNote(4), createNote(7))),
            createPossibleInterval(createInterval(createNote(4), createNote(11))),
            createPossibleInterval(createInterval(createNote(7), createNote(11))),
        ]
        const to: PossibleSonority = [
            createPossibleInterval(createInterval(createNote(1), createNote(3))),
            createPossibleInterval(createInterval(createNote(1), createNote(5))),
            createPossibleInterval(createInterval(createNote(1), createNote(10))),
            createPossibleInterval(createInterval(createNote(1), createNote(10))),
            createPossibleInterval(createInterval(createNote(3), createNote(10))),
            createPossibleInterval(createInterval(createNote(5), createNote(10))),
        ]
        assert.isTrue(canCounterpoint([from], to))
    })
})