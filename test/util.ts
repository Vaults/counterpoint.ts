import { assert } from "chai";
import {createEmptyVoice, getNoteAmount, getPowerset, toQuads, toVoicepair} from "@/util";
import {Measure, Note, NoteLength, NoteQuad, ScaleDegree, Voice} from "@/strict/types";

function createNote(scaleDegree?: number): Note<NoteLength> {
    if(scaleDegree == undefined){ scaleDegree = ~~(Math.random() * 20)}
    return {
        scaleDegree: new ScaleDegree(scaleDegree),
        length: 1
    };
}

function generateIntersectionVoices(randoms: number[]) {
    const voices: Voice[] = randoms.map(createEmptyVoice)
    randoms.forEach((o, i) => {
        Array(o).fill('').forEach(() => {
            let measure = voices[i].measures;
            measure[~~(Math.random() * measure.length)].notes.push(createNote())
        })
    })
    return voices;
}

function generateQuadVoicePair() {
    const voices: Voice[] = [10,10].map(createEmptyVoice)
    voices.forEach(v => {
        v.measures.forEach(m => {
            m.notes.push(createNote())
            while(Math.random() < 0.7) {
                m.notes.push(createNote())
            }
        })
    })

    return voices;
}

describe("getPowerset", () => {
    it("Does the thing", () => {
        const testSet = [1, 2, 3]
        const expected = [[1],[2],[3],[1,2],[2,3],[1,3],[1,2,3]]
        const actual = getPowerset(testSet)

        expected.forEach(a => a.sort())
        actual.forEach(a => a.sort())

        expected.sort()
        actual.sort()

        assert.deepEqual(actual, expected)
    })
})

describe("getNoteAmount", () => {
    it("Gets correct amount of notes for regular case", () => {
        const randoms: number[] = Array(3).fill('').map(_ => ~~(Math.random() * 20))
        console.log(randoms)
        const voices: Voice[] = randoms
            .map(r =>
                new Voice(Array(5)
                    .fill("")
                    .map(_ => ({notes: []}))
                )
            )
        randoms.forEach((o, i) => {
            Array(o).fill('').forEach(() => {
                let measure = voices[i].measures;
                measure[~~(Math.random() * measure.length)].notes.push({scaleDegree: new ScaleDegree(1), length: 1})
            })
        })
        const expected = randoms.reduce((p, n) => p + n, 0)
        const actual = getNoteAmount(voices)
        assert.equal(actual, expected)

    })
})


describe("intersectVoice", () => {
    it("Intersects voices properly", () => {
        const real = createEmptyVoice(2)
        const ephemeral = createEmptyVoice(2)

    })
})

describe("Voice to Quad conversion", () => {
    it("just works. (two way integration, should return same voices", () => {
        const voices = generateQuadVoicePair()
        const newVoices = toVoicepair(toQuads(voices))

        function processMeasure(m: Measure) {
            m.notes.sort((a, b) => a.scaleDegree.number - b.scaleDegree.number);
            m.notes = m.notes
                .filter((n,i,a)=>
                    a.findIndex(n2=>(n2.scaleDegree.number == n.scaleDegree.number))===i
                )
        }

        voices.forEach(v => v.measures.forEach(processMeasure))
        newVoices.forEach(v => v.measures.forEach(processMeasure))

        console.log(voices)
        assert.deepEqual(newVoices, voices)
    })

    it("converts from voicepairs to quads", () => {
        const bass = createEmptyVoice(2)
        const sop = createEmptyVoice(2)
        bass.measures[0].notes = [createNote(1), createNote(2)]
        bass.measures[1].notes = [createNote(3)]
        sop.measures[0].notes = [createNote(4)]
        sop.measures[1].notes = [createNote(5), createNote(6)]

        const quadRow = toQuads([bass, sop])

        console.log(JSON.stringify(quadRow.quads, null, 4))
        assert.equal(quadRow.top, sop)
        assert.equal(quadRow.bottom, bass)

        /* TODO: more assertions */

    })

    /*it("converts from quads to voicepairs", () => {
        const q1: NoteQuad = {
            left: {
                noteTuple: {
                    upper: createNote(2),
                    lower: createNote(1)
                },
                unison: true,
                sameClass: true,
                perfect: true,
                consonant: true,
                dissonant: true
            },
            leftIndex: 0,
            right: {
                noteTuple: {
                    upper: createNote(4),
                    lower: createNote(3)
                },
                unison: true,
                sameClass: true,
                perfect: true,
                consonant: true,
                dissonant: true
            },
            rightIndex: 1}
        const voicePair = toVoicepair({quads: [q1], top: new Voice([{notes: []}, {notes: []}]), bottom: new Voice([{notes: []}, {notes: []}])})

        /!*
        TODO assertions
        console.log(JSON.stringify(voicePair, null, 4))
         *!/
    })*/

})

export {createNote}
