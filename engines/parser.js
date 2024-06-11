const QID_REGEX=/(<loop>(.+?)<\/loop>)|(\[([A-Z][A-Za-z0-9]*)[^\]]*?\])/gs
const QUESTION_METADATA_REGEX=/\[([A-Z_][A-Z0-9_#]*)([?!]?)([\|\,][^\]]*\|?)?\]/g;
QUESTION_METADATA_REGEX.groups=["match","id","skip_type","arguments"]
const QSPLIT_REGEX=/(?=<\/?loop|\[[A-Z])/gs


const findAllIndices = function(array,search) {
    return array.reduce((acc, cv, indx) => {
        if ((search instanceof RegExp && search.test(cv)) || search === cv) {
            acc.push(indx)
        }
        return acc
    }, [])
}

// Parse the text into questions...
export function parseQuestMarkup(text){
    let d = new Date()
    console.log(`The time in parser.js is ${d.toQuestFormat()} ${d}`)
    console.time("markup parse")

    // 1. Strip out any comments....
    text = text.replace(/\/\/.+/g,"")
    // 2. Break up question/loops
    let qs  = text.split( QSPLIT_REGEX )

    // 3. iterate through the split and create question objects.
    // If we have a loop, dont add the loop as a question, but
    // make sure that the question is marked as in loop and get the
    // first and last question in the loop....
    let inLoop = false
    let loopNumber=0;
    let loopInfo={}
    let loopEnds = findAllIndices(qs,/<\/loop/)    
    let lastQuestion = new Map();

    qs = qs.reduce( (pv,cv,indx) => {
        // the first element of the array is the the stuff
        // before the first question.  It is either
        // empty or JSON text.
        if (indx==0){
            let metadata = cv.trim()
            metadata = (/^\{.*\}$/.test(metadata))?JSON.parse(metadata):{}
            metadata.name = metadata.name ?? "questionnaire";
            console.log(metadata)
            pv.metadata = metadata
            return pv
        }
        if (cv.startsWith("<loop")) {
            // need to check the loop id
            // may need to create it as loop-1, loop-2...
            loopNumber++;
            loopInfo.loopId = `loop-${loopNumber}`
            inLoop = true
            //loopInfo.args="I dont know"
            return pv
        }
        if (cv.startsWith("</loop")){
            inLoop = false
            loopInfo={}
            return pv
        }

        let question_obj = parseQuestion(cv)

        if (inLoop) {
            loopInfo.firstQuestion = loopInfo.firstQuestion ?? question_obj.id
            if (loopEnds.includes(indx+1)){
                lastQuestion.set(loopInfo.firstQuestion,question_obj.id)
            }
            question_obj.loopInfo = loopInfo;
        }
        pv.push(question_obj)
        pv[question_obj.id] = pv.length-1
        return pv
    },[]);
    
    console.log( qs.filter( (q)=> q.loopInfo).forEach((q)=>q.loopInfo.lastQuestion=lastQuestion.get(q.loopInfo.firstQuestion)) )
    console.log(qs)
    console.timeEnd("markup parse")

    return qs;
}


function parseQuestion(question){

    let metadata = [...question.matchAll(QUESTION_METADATA_REGEX)][0]
    console.log(question,"\n",metadata)

    let question_obj = QUESTION_METADATA_REGEX.groups.reduce( (obj,currentValue,index) => {
        // the first item is the complete [QID,displayif=...] match.  skip it...
        if (index == 0) return obj
        obj[currentValue] = metadata[index];
        return obj;
    },{markdown:question});
    // replace the skip type with hard or soft...
    question_obj.skip_type = question_obj.skip_type === "?" ? "soft"
            : question_obj.skip_type == "!" ? "hard"
            : null

    // handle the arguments...
    parseArguments(question_obj)

    console.log(`question:`, question_obj)
    return question_obj;
}

function parseArguments(question){
    if (!question.arguments) {
        console.log(`${question.id} has no arguments....`)
        return
    }
    // the arguments likely start with a "," or a "|"" and
    // possibly end with a "|" remove them..
    let regex = /^[|,]|\|$/g
    question.arguments = question.arguments.replaceAll(regex,"").trim()??""
    // make sure the documentation points out that displayif
    // must be the last argument because I have to allow for spaces.
    // look for a displayif=....$
    regex = /displayif\s*=\s*(.+)$/
    let displayif = (regex.exec(question.arguments))
    if (displayif){
        question.displayif=displayif[1]
        question.arguments=question.arguments.replace(displayif[0],"").trim()
    }
    
}

