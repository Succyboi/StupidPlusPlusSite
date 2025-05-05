// Hi! Puk here.
// I know this code is quite the piece of shit but forgive me, I hate JS and all this was put together in a few hours at most.
// Have a good read.
//
// All this is CC-BY-NC
// https://creativecommons.org/licenses/by-nc/4.0/

// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function sfc32(a, b, c, d) {
    return function() {
        a |= 0; b |= 0; c |= 0; d |= 0;
        let t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

// https://stackoverflow.com/questions/1349404/generate-a-string-of-random-characters
function generateId(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(rand() * charactersLength));
    }
    return result;
}

function dateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

const inIframe = window.self !== window.top;
const date = dateString(new Date());
const seed = cyrb128(date);
let rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

class Rule { }

class BpmRule extends Rule {
    
    constructor() {
        super();
        
        let min = 50;
        let max = 250;
        
        this.bpm = Math.round((min + rand() * (max - min)) / 5) * 5;
    }

    generate() {
        let rule = `<span class="rule-highlight">${this.bpm}</span> bpm`;
        
        return rule;
    }

}

class SignatureRule extends Rule {

    constructor(additional) {
        super();

        let minFirst = 1;
        let maxFirst = 15;

        this.additional = additional;
        this.second = [2, 4, 8][Math.round(rand() * 2)];
        this.first = Math.round(minFirst + rand() * (maxFirst - minFirst));
    }

    generate() {
        let rule = this.additional ? "then " : "";
        rule += `<span class="rule-highlight">${this.first}/${this.second}</span> time`;
        
        return rule;
    }

}

class NoRule extends Rule {

    constructor() {
        super();

        let options = [ 
            "instruments",
            "daw",
            "hardware",
            "chromatic pitch",
            "synthesis",
            "samples",
            "vocals",
            "rhythm",
            "melody",
            "harmony",
            "words",
            "language",
            "2nd beat",
            "3rd beat",
            "7th beat",
            "familiar tools"
            //TODO
        ];

        this.result = options[Math.floor(options.length * rand())];
    }

    generate() {
        let rule = `<span class="rule-highlight">no ${this.result}</span>`;
        
        return rule;
    }

}

class SingleRule extends Rule {
    
    constructor() {
        super();

        let options = [
            "outside",
            "on the go",
            "laying down",
            "sitting on the floor",
            "acoustic",
            "digital",
            "binary",
            "polyrhythmic",
            "polymetric",
            "euclidean",
            "monophonic",
            "polyphonic",
            "improvised",
            "one take",
            "with a friend"
            // TODO more
        ];

        this.result = options[Math.floor(options.length * rand())];
    }

    generate() {
        let rule = `<span class="rule-highlight">${this.result}</span>`;
        
        return rule;
    }

}

class ReplaceRule extends Rule {
    
    constructor() {
        super();

        let searchOptions = [
            "everything",
            "half of everything",
            "the left ear",
            "the right ear",
            "every bar",
            "every other bar",
            "every measure",
            "every other measure",
            "every 3rd beat",
            "every 4th beat",
            "every 5th beat",
            "every 6th beat",
            "every 7th beat",
            "every snare",
            "every 2nd snare",
            "every 3rd snare",
            "every rhythm",
            "50% of rhythm",
            "every melody",
            "50% of melody",
            "every hook",
            "every melody",
            "every harmony",
            "every instrument",
            "every word",
            "every sentence"
        ];

        let replaceOptions = [
            "faster",
            "slower",
            "quiet",
            "silent",
            "loud",
            "gone",
            "leaving",
            "doubletime",
            "halftime",
            "a bridge",
            "broken",
            "cut time",
            "a fill",
            "a different instrument",
            "a different tempo",
            "a different signature",
            "a different octave",
            "a different scale",
            "a different person",
            "different",
            "interrupted",
            "a syncopation",
            "in triplets",
            "late",
            "off grid",
            "improvised",
            "far away",
            "close",
            "behind you",
            "noise",
            "random"
        ];

        this.search = searchOptions[Math.floor(searchOptions.length * rand())];
        this.replace = replaceOptions[Math.floor(replaceOptions.length * rand())];
    }

    generate() {
        let rule = `<span class="rule-highlight">${this.search}</span> is <span class="rule-highlight">${this.replace}</span>`;
        
        return rule;
    }

}

class GenreRule extends Rule {
    
    constructor() {
        super();

        let descriptionOptions = [
            "typical",
            "a little bit like",
            "kinda like",
            "just like",
            "sort of like",
            "so, like",
            "i think it's called",
            "formerly known as",
            "aka",
            "not too far from",
            "gimme some",
            "gimme that",
            "i can haz",
            "not unlike",
            "more commonly known as",
            "as the kids say,",
            "you may know it as",
            "it's called",
            "they call it",
            "that's just"
            //TODO more
        ];

        let styleOptions = [
            "nu",
            "electronic",
            "experimental",
            "punk",
            "synth",
            "techno",
            "ambient",
            "classic",
            "hardcore",
            "hard",
            "noise",
            "black",
            "tech",
            "deep",
            "industrial",
            "death",
            "progressive",
            "soft",
            "emo",
            "euro",
            "minimal",
            "dub",
            "country",
            "gangsta",
            "intelligent",
            "fusion",
            "doom",
            "spiritual",
            "acid",
            "goth",
            "conscious",
            "power",
            "digital",
            "analog",
            "bubble",
            "horror",
            "cold",
            "new",
            "no",
            "electroacoustic",
            "speed",
            "alt",
            "cloud",
            "glitch",
            "plunder",
            "hyper"
        ];

        let genreOptions = [
            "rock",
            "electronica",
            "jazz",
            "funk",
            "soul",
            "classical",
            "hip hop",
            "reggae",
            "blues",
            "pop",
            "house",
            "punk",
            "synth",
            "techno",
            "ambient",
            "disco",
            "electro",
            "trance",
            "noise",
            "industrial",
            "dub",
            "country",
            "breaks",
            "acid",
            "ska",
            "core",
            "jungle",
            "hop",
            "wave",
            "style",
            "electronics",
            "collage",
            "zouk",
            "violence",
            "juke",
            "glitch",
            "clash",
            "phonics"
        ];

        this.description = descriptionOptions[Math.floor(descriptionOptions.length * rand())];
        this.style = styleOptions[Math.floor(styleOptions.length * rand())];
        this.genre = genreOptions[Math.floor(genreOptions.length * rand())];
    }

    generate() {
        let rule = `${this.description} <span class="rule-highlight">${this.style} ${this.genre}</span>`;
        
        return rule;
    }

}

// TODO more everything
// TODO a couple more rules
// TODO by who (randomly generated person), about
// TODO title
// TODO icon
// TODO publish

function generate(dateSeeded) {
    if (!dateSeeded) {
        let seed = [(Math.random()*2**32)>>>0, (Math.random()*2**32)>>>0, (Math.random()*2**32)>>>0, (Math.random()*2**32)>>>0];
        rand = sfc32(seed[0], seed[1], seed[2], seed[3]);

        window.scrollTo(0, 0);
    }

    let ruleParentObject = document.getElementById("rule-parent");
    let descriptionParentObject = document.getElementById("description-parent");
    let aboutObject = document.getElementById("about");
    let generateIdObject = document.getElementById("generate-id");
    let targetRuleCount = Math.floor(3 + rand() * 2);
    let ruleCount = 0;
    let content = "";

    function addRule(rule) {
        content += `<span class="rule">${rule.generate()}</span>,\n`;
        ruleCount++;
        ruleParentObject.innerHTML = content;
    }

    // Tempo rule
    if (rand() <= 0.8) {
        addRule(new BpmRule());
    }

    // Signature rules
    if (rand() <= 0.5) {
        addRule(new SignatureRule());
        
        if (rand() <= 0.4) {
            addRule(new SignatureRule(true));
        }
    }

    // Other rules
    let otherRuleCount = 3;
    let otherRuleIndex = Math.floor(rand() * otherRuleCount);
    for (let r = ruleCount; r < targetRuleCount; r++) {
        switch ((otherRuleIndex + r) % otherRuleCount) {
            case 0:
                addRule(new NoRule());
                break;

            case 1:
                addRule(new SingleRule());
                break;

            case 2:
                addRule(new ReplaceRule());
                break;
        }
    }

    let finishers = [
        "good luck",
        "go",
        "have fun",
        "you've got this",
        "kill it",
        "yeah",
        "boom",
        "hit it",
        "go ham"
        //TODO more
    ];
    content += `<i>${finishers[Math.floor(finishers.length * rand())]}!</i>`;
    ruleParentObject.innerHTML = content;

    descriptionParentObject.innerHTML = `${new GenreRule().generate()}.`
    generateIdObject.innerHTML = `(${generateId(8)})`;
    
    if (inIframe) {
        aboutObject.remove();
    }
}