import {Interval, IntervalMap, Note, NoteLength, NoteQuad, NoteQuadRow, PossibleSonority, Voice} from "./types";
import {getNoteAmount, intersectVoice, toQuads, toVoicepair, voicesToQuads} from "./../util";
import {waveCollapsePrepare} from "./pregeneration";

type NoteConstraint = (a: Note<NoteLength>, b: Note<NoteLength>) => boolean
const noteConstraints: NoteConstraint[] = [
    (a: Note<NoteLength>, b: Note<NoteLength>) => {
        const diff = Math.abs(a.scaleDegree.number - b.scaleDegree.number)
        return diff >= 1 && diff <= 2 + Math.pow(Math.random(), 2) * 3
    }
]
type IntervalConstraint = (x: Interval) => boolean
const IntervalConstraints: IntervalConstraint[] = [
    (a) => !a.dissonant,
    (a) => !a.unison,
    (a) => a.distance < 12,
]


type CounterpointConstraint = (left: Interval, right: Interval) => boolean
const CounterpointConstraints: CounterpointConstraint[] = [
    //No parallels
    (left, right) => {
        const bothPerfect = left.perfect && right.perfect
        return bothPerfect
    },
/*    (left, right) => {
        const bothPerfect = left.perfect && right.perfect
        return !(bothPerfect && !(left.sameClass && right.sameClass))
    },*/
]

/*
function propagateQuadRow(row: NoteQuadRow, voices: Voice[]) {
    const top: Voice = voices.find(v => v == row.top)!
    const bottom: Voice = voices.find(v => v == row.bottom)!
    //filter intervals that rely on non-existing notes
    row.quads = row.quads.filter(q => {
        return top.measures[q.leftIndex].notes.includes(q.left.noteTuple.upper)
            && top.measures[q.rightIndex].notes.includes(q.right.noteTuple.upper)
            && bottom.measures[q.leftIndex].notes.includes(q.left.noteTuple.lower)
            && bottom.measures[q.rightIndex].notes.includes(q.right.noteTuple.lower)

    })
    //filter quads that have no valid predecessors
    row.quads = row.quads.filter(fq =>
        row.quads.find(q1 =>
            q1.right.noteTuple.upper.scaleDegree.number == fq.left.noteTuple.upper.scaleDegree.number &&
            q1.right.noteTuple.lower.scaleDegree.number == fq.left.noteTuple.lower.scaleDegree.number
        )
    )

    //do interval filtering
    row.quads = row.quads.filter(q => IntervalConstraints.every(c => c(q.left) && c(q.right)))
    //do counterpoint logic
    row.quads = row.quads.filter(q => CounterpointConstraints.every(c => c(q)))
    //filter notes that are no longer possible
    const ephemeralVoicePair: Voice[] = toVoicepair(row)
    intersectVoice(bottom, ephemeralVoicePair[0])
    intersectVoice(top, ephemeralVoicePair[1])
}
*/

function propagateVoices(voices: Voice[]) {
    // no leaps
    voices.forEach(v => {
        v.measures.reduce((m1, m2) => {
            if (!v.measureAdequatelyFilled(m2)) {
                m2.notes = m2.notes.filter(nf =>
                    m1.notes.find(n => noteConstraints.every(c => c(n, nf)))
                )
            }
            return m2
        })
    })


}

function canCounterpoint(prev: PossibleSonority[], next: PossibleSonority) {
    const allPairs = prev.map(p => ({prev: p, next: next}))
    return allPairs.some(pair => {
        const p = pair.prev
        const n = pair.next

        return p.every((_, i) =>
            CounterpointConstraints.every(c => c(p[i].interval, n[i].interval))
        )
    })
}

function excludeAllSameSonorities(prev: PossibleSonority[], next: PossibleSonority) {
    const allPairs = prev.map(p => ({prev: p, next: next}))
    return allPairs.some(pair => {
        const p = pair.prev
        const n = pair.next

        return p.some((_, i) =>
            p[i].interval.distance != n[i].interval.distance
        )
    })
}

function propagateIntervalMap(intervalMap: IntervalMap, voices: Voice[]) {
    // Voice => Interval prune
    voices.forEach((v, i) => {
        v.measures.forEach((m, mi) => {
            const possibleSonorities = intervalMap[mi]
            intervalMap[mi] = possibleSonorities.filter(s =>{
                return m.notes.some(n1 => {
                       return s.flatMap(s => s)
                        .filter(pi => pi.topVoice == v || pi.bottomVoice == v )
                        .map(pi => pi.topVoice == v? pi.interval.noteTuple.upper : pi.interval.noteTuple.lower)
                        .some(n2 => n1.scaleDegree.number == n2.scaleDegree.number )
                })
            })
        })
    })

    // Prune based on interval logic
    intervalMap.forEach((possibleSonorities, i) => {
        // Do interval pruning based on interval constraints
        possibleSonorities = possibleSonorities
            .filter(ps =>
                ps.every(possibleInterval =>
                    IntervalConstraints.every(c => c(possibleInterval.interval))
                )
            )
        intervalMap[i] = possibleSonorities
    })

    //Prune based on counterpoint logic.. lezzgoooo😤😤
    //fuck
    intervalMap.forEach((_, i) => {
        if(i > 0) {
            const prev = intervalMap[i - 1]
            const next = intervalMap[i]
            intervalMap[i] = next.filter(n => canCounterpoint(prev, n))
            intervalMap[i] = next.filter(n => excludeAllSameSonorities(prev, n))
        }
    })



    // Interval => Voice prune
    // my ass is heavy
    const newVoices = voices.map((v, vi) => {
        let newVoice = new Voice(Array(v.measures.length).fill('').map(_ => ({notes: []})))
        newVoice.id = v.id
        intervalMap.forEach((possibleSonoritiesInMeasure, measureIndex) => {
           const notes = possibleSonoritiesInMeasure
               .flatMap(s => s)
               .filter(pi => pi.topVoice == v || pi.bottomVoice == v )
               .map(pi => pi.topVoice == v? pi.interval.noteTuple.upper : pi.interval.noteTuple.lower)
            newVoice.measures[measureIndex].notes = notes
        })
        return newVoice
    })

    voices.forEach((_, i) => intersectVoice(voices[i], newVoices[i]))
}

/*
Idea: Propagate on three layers:
    * Voice notes (should be single pass)
    * Do WFC on intervals as well to prune those past naively
    * Do WFC on multi-measures (counterpoint)

Multiple maps to keep track of:
    * Possible notes (local to note only)
    * Possible intervals (local to two measures adjacent in two voices)
    * Possible counterpoint (local to a quad (left and right interval))

 */
function propagate(voices: Voice[], quadRows: NoteQuadRow[], intervalMap: IntervalMap) {
    const notesLeft: number = getNoteAmount(voices)
    const getSonorityCount = () => intervalMap.flatMap(p => p).length
    const sonoritiesLeft = getSonorityCount()

    /* Voice rules */
    propagateVoices(voices)
    propagateIntervalMap(intervalMap, voices)
    /* Interval rules */
    //quadRows.forEach(row => propagateQuadRow(row, voices))
    return getNoteAmount(voices) != notesLeft || getSonorityCount() != sonoritiesLeft
}

function findLowestEntropyMeasure(voices: Voice[]) {
    return voices
        .flatMap(v => v.measures)
        .filter(m => m.notes.length > 1)
        .sort((a, b) => a.notes.length - b.notes.length)
        [0]
}

function chooseNextNote(voices: Voice[]) {
    const measure = findLowestEntropyMeasure(voices)
    const chosenNote = measure.notes[~~(Math.random() * measure.notes.length)]
    measure.notes = [chosenNote]
}

const waveCollapse = (voices: Voice[]) => {
    //fills remaining measures with all possible notes
    const state = waveCollapsePrepare(voices)

    while(!voices.every(v => v.isCollapsed())){
        const canPropagate = propagate(state.voices, state.quads, state.intervalMap)
        if(!canPropagate) {
            chooseNextNote(voices)
        }
    }

    return voices
}

export {waveCollapse, canCounterpoint}