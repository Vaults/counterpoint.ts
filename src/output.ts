import {Voice} from "./strict/types";

const voiceToLily = (v: Voice) => {
    return "{" + v.measures
        .map(m =>
            m.notes
                .map(n =>
                    ["c", "d", "e", "f", "g", "a", "b"][n.scaleDegree.number % 7]
                    + "'".repeat(~~(n.scaleDegree.number/7))
                    + n.length)
        )
        .join(" ") + "}"
}
const voiceToString = (v: Voice) => {
    return v.measures
        .map(m =>
            m.notes
                .map(n => ["c", "d", "e", "f", "g", "a", "b"][n.scaleDegree.number % 7])
        )
        .join(" ")
}


const toLily = (i: Voice[]) => {
    return "<<" + i.sort((a, b) => a.id - b.id).reverse().map(voiceToLily).join("\\ \n") + ">>"
}

const toReadable = (i: Voice[]) => {
    return i.map(voiceToString).join("\n")
}

const toScaleDegree = (i: Voice[]) => {
    return i
        .map(v =>
            v.measures.flatMap(n => n.notes)
                .map(n => n.scaleDegree.number)
                .join(" ")
        ).join('\n')
}

export {toLily, toReadable, toScaleDegree }