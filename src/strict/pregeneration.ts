import {
    Interval,
    IntervalMap,
    Note,
    NoteLength,
    NoteQuad,
    NoteQuadRow,
    PossibleSonority,
    ScaleDegree,
    Voice
} from "./types";
import {createInterval} from "./interval-calc";
import {getPowerset, voicesToQuads} from "../util";
import {util} from "chai";

function generatePerfectSonority(voiceCount: number): Note<1>[] {
    const notes: Note<1>[] = [
        {scaleDegree: new ScaleDegree(7), length: 1},
        {scaleDegree: new ScaleDegree(11), length: 1},
        {scaleDegree: new ScaleDegree(14), length: 1},
        {scaleDegree: new ScaleDegree(18), length: 1},
        {scaleDegree: new ScaleDegree(21), length: 1},
        {scaleDegree: new ScaleDegree(24), length: 1},
    ]
    return notes.slice(0, voiceCount)
}


function generatePossibleSonority(voices: Voice[], notesSingle: Note<NoteLength>[]): PossibleSonority {
    const possibleSonority: PossibleSonority = []
    for(let i = 0; i < notesSingle.length; i++){
        for(let j = i+1; j < notesSingle.length; j++){
            const interval = createInterval(notesSingle[i], notesSingle[j], i == 0)
            possibleSonority.push({
                bottomVoice: voices[i],
                topVoice: voices[j],
                interval: interval
            })
        }
    }
    return possibleSonority
}

const generatePossibleSonorities: (measureIndex: number, voices: Voice[]) => PossibleSonority[] = (m, voices) => {
    const notes = voices.map(v => v.measures[m].notes)
    //remember: sonority = voice count - 1 and a list of intervals
    //we return the list of sonorities to give the possible ones
    //notes is an array of possible note arrays ordered by voice
    const generate = (notes: Note<NoteLength>[][], currIndex: number = 0): PossibleSonority[] => {
        if(currIndex == notes.length){
            const notesSingle = notes.flatMap(n => n)
            const sonority: PossibleSonority = generatePossibleSonority(voices, notesSingle)
            return [sonority]
        }
        // foreach: note in top non-singular notes: generate
        return notes[currIndex].flatMap(n => {
            const copy = notes.map(n => n)
            copy[currIndex] = [n]
            copy.forEach((_, i) => {
                if(i > currIndex) {
                    copy[i] = copy[i].filter(nc => nc.scaleDegree.number > n.scaleDegree.number)
                    copy[i] = copy[i].filter(nc => nc.scaleDegree.number > n.scaleDegree.number + 1)
                    copy[i] = copy[i].filter(nc => nc.scaleDegree.number > 7 - (currIndex + 1))
                }
            })

            return generate(copy, currIndex + 1)
        })
    }
    return generate(notes)
}

function waveCollapsePrepare(voices: Voice[]): {voices: Voice[], quads: NoteQuadRow[], intervalMap: IntervalMap} {
    const startSonority = generatePerfectSonority(voices.length)
    const targetSonority = generatePerfectSonority(voices.length)
    voices.forEach(v => v.measures.forEach(
        m => m.notes = Array(28).fill('').map((_, i) => ({scaleDegree: new ScaleDegree(i), length: 1}))
    ))
    voices.forEach((v,i) => v.measures[0].notes = [startSonority[i]])
    voices.forEach((v,i) => v.measures[v.measures.length - 1].notes = [targetSonority[i]])

    const quads = voicesToQuads(voices);
    const intervalMap: IntervalMap = []



    voices[0].measures.forEach((b, i) => {
        intervalMap[i] = generatePossibleSonorities(i, voices)
    })

    let sonoritiesLength = intervalMap.map(p => p.length).reduce((p, n)=>p+n);
    const formatSonority = (p: PossibleSonority) => p.map(i => [i.interval.noteTuple.lower.scaleDegree.number, i.interval.noteTuple.upper.scaleDegree.number])

    console.log("Sonorities length " + sonoritiesLength)
    console.log("Avg per measure " + sonoritiesLength / voices[0].measures.length)

    return {voices, quads, intervalMap}
}

export {waveCollapsePrepare, generatePerfectSonority}