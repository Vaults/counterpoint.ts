type NoteTuple = {"lower": Note<NoteLength>, "upper": Note<NoteLength>}

type Interval = {
    noteTuple: NoteTuple
    distance: number,
    unison: boolean,
    sameClass: boolean,
    perfect: boolean,
    consonant: boolean,
    dissonant: boolean,
}

class Voice {
    measures: Measure[]
    id: number
    constructor(measures: Measure[]) {
        this.measures = measures
        this.id = -1
    }

    isCollapsed(): boolean {
        return this.measures.every(this.measureAdequatelyFilled)
    }

    measureAdequatelyFilled(m: Measure): boolean{
        return m.notes.length == 1
    }
}

type NoteLength = 1 | 2 | 4 | 8
type Note<NoteLength> = {
    scaleDegree: ScaleDegree
    length: NoteLength
}

//type FirstSpeciesMeasure = {notes: Note<1>[]}
/*type SecondSpeciesMeasure = {notes: Note<2>[]}
type ThirdSpeciesMeasure = {notes: Note<4>[]}
type FourthSpeciesMeasure = {notes: Note<1>[]}*/
type FifthSpeciesMeasure = {notes: Note<NoteLength>[]}
type Measure = FifthSpeciesMeasure // FirstSpeciesMeasure //| SecondSpeciesMeasure | ThirdSpeciesMeasure | FourthSpeciesMeasure | FifthSpeciesMeasure

type PossibleInterval = {
    topVoice: Voice,
    bottomVoice: Voice,
    interval: Interval
}

type PossibleSonority = PossibleInterval[]

//index 0: Measure
//index 1: PossibleSonority
type IntervalMap = PossibleSonority[][]

type NoteQuad = {left: Interval, right: Interval, leftIndex: number, rightIndex: number}
type NoteQuadRow = {top: Voice, bottom: Voice, quads: NoteQuad[]}
class ScaleDegree {
    number: number
    constructor(number: number) {
        this.number = number
    }
}

export {NoteTuple, Interval, Voice, Note, NoteLength, FifthSpeciesMeasure, Measure, ScaleDegree, NoteQuad, NoteQuadRow, IntervalMap, PossibleSonority, PossibleInterval}