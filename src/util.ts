import {Interval, NoteQuad, NoteQuadRow, Voice} from "./strict/types";
import {createInterval} from "./strict/interval-calc";

const voicesToQuads = (v: Voice[]) => getPowerset(v).filter(e => e.length == 2).map(toQuads)

function createEmptyVoice(length: number){
    return new Voice(Array(length).fill('').map(_ => ({notes: []})))
}

function getPowerset<T>(arr: T[]): T[][]{
    if (arr.length === 1) return [arr];
    else {
        const subarr = getPowerset(arr.slice(1));
        return subarr.concat(subarr.map(e => e.concat(arr[0])), [[arr[0]]]);
    }
}

const getNoteAmount = (voices: Voice[]) => voices
    .map(v => v.measures
        .map(m => m.notes).reduce((p, n) => p + n.length, 0)
    ).reduce((p, n) => p + n, 0)

function intersectVoice(real: Voice, ephemeral: Voice) {
    real.measures.forEach((_,i) => {
        if(!real.measureAdequatelyFilled(real.measures[i])){
            let newNotes =
                real.measures[i].notes.filter(n =>
                    ephemeral.measures[i].notes.some(en => n.scaleDegree.number == en.scaleDegree.number));

            real.measures[i].notes = newNotes
        }
    })
}

function toVoicepair(quadRow: NoteQuadRow): Voice[]{
    const top =  new Voice(Array(quadRow.top.measures.length).fill('').map(_ => ({notes: []})))
    const bottom =  new Voice(Array(quadRow.bottom.measures.length).fill('').map(_ => ({notes: []})))
    //console.log(quadRow.quads.length)
    quadRow.quads.forEach(q => {
        top.measures[q.leftIndex].notes.push(q.left.noteTuple.upper)
        top.measures[q.rightIndex].notes.push(q.right.noteTuple.upper)
        bottom.measures[q.leftIndex].notes.push(q.left.noteTuple.lower)
        bottom.measures[q.rightIndex].notes.push(q.right.noteTuple.lower)
    })

    return [bottom, top]
}

const toQuads = (voicePair: Voice[]): NoteQuadRow => {
    const bottom = voicePair[0]
    const top = voicePair[1]

    const quadRow: NoteQuadRow = {top, bottom, quads: []}
    bottom.measures.forEach((_, i) => {
        if(i > 0){
            const leftIndex = i - 1
            const rightIndex = i

            const possibleLefts: Interval[] = bottom.measures[leftIndex].notes.flatMap(bottomNote => {
                return top.measures[leftIndex].notes.map(topNote => {
                    return createInterval(bottomNote, topNote)
                })
            })
            const possibleRights: Interval[] = bottom.measures[rightIndex].notes.flatMap(bottomNote => {
                return top.measures[rightIndex].notes.map(topNote => {
                    return createInterval(bottomNote, topNote)
                })
            })

            const possibleQuads: NoteQuad[] = possibleLefts.flatMap(left => {
                return possibleRights.map(right => {
                    return {left, right, leftIndex, rightIndex}
                })
            })

            possibleQuads.forEach(q => quadRow.quads.push(q))
        }
    })
    return quadRow
}

export {createEmptyVoice, getPowerset, getNoteAmount, intersectVoice, voicesToQuads, toVoicepair, toQuads}