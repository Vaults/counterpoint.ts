import {Interval, Note, NoteLength} from "./types";
const mod = (n: number,m:number) => ((n % m) + m) % m;
const createInterval = (lower: Note<NoteLength>, upper: Note<NoteLength>, withBass: boolean = true): Interval => {
    const top = upper.scaleDegree.number
    const bottom = lower.scaleDegree.number

    const relTop = mod(top, 7)
    const relBottom = mod(bottom, 7)
    const relDis = mod(top - bottom, 7)
    const isTritone = (relTop == 3 && relBottom == 6) || (relTop == 6 || relBottom == 3)


    const unison = top - bottom == 0
    const sameClass = relDis == 0
    const perfect = sameClass || relDis == 4
    const consonant = perfect || relDis == 2 || relDis == 5 || (relDis == 3 && !withBass) && !isTritone
    const dissonant = !consonant
    return {
        noteTuple: {upper, lower},
        distance: top - bottom,
        sameClass,
        unison,
        perfect,
        consonant,
        dissonant
    }
}

export {createInterval}