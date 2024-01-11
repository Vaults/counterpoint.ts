import {Voice} from "./strict/types";
import {toLily, toReadable, toScaleDegree} from "./output";
import {createEmptyVoice} from "./util";
import {waveCollapse} from "./strict/wave-collapse";

const generatePhrase: (voiceCount: number, length: number ) => Voice[] = (voiceCount = 4, length = 16) => {
    /* First species for now */
    const voices: Voice[] = Array(voiceCount).fill('').map(_ => createEmptyVoice(length))
    voices.forEach((v, i) => v.id = i )
    return waveCollapse(voices)
}

const phrase = generatePhrase(3, 10).reverse()

console.log(toLily(phrase))
console.log(toReadable(phrase))
console.log(toScaleDegree(phrase))