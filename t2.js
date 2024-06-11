const QID_REGEX=/(<loop>(.+?)<\/loop>)|(\[([A-Z][A-Za-z0-9]*)[^\]]*?\])/gs
const QUESTION_REGEX=/\[([A-Z][A-Za-z0-9_]*)([^\]]*)\](.*)/gs
const QSPLIT_REGEX=/(?=<\/?loop>|\[[A-Z])/gs

export function split_module(markdown){
    let loop_id=0;
    let in_loop=false;
    let q1=null;
    let questions=markdown.split(QSPLIT_REGEX)
        .map(q=>q.trim())
        .reduce( (acc,cv) => {
            if (cv=="<loop>"){
                in_loop=true
                loop_id++;
                return acc;
            } else if (cv=="</loop>"){
                in_loop=false
                q1=null
                return acc;
            } else {
                let x = parse_question_markdown(cv)
                if (in_loop){
                    x.loop_id = loop_id
                    if (!q1) q1=x.id
                    x.loop_first_question = q1
                }
                acc.push(x)
            }
            return acc
        },[])
    return questions;
}

function parse_question_markdown(markdown){
    let parts = Array.from(markdown.matchAll(QUESTION_REGEX))
    if (!parts[0]){
        console.error(markdown)
    } else{
        parts=parts[0]
    }
    console.log(parts)
    let object = {
        markdown: parts[0],
        id:parts[1],
        params: parts[2],
        text: parts[3]
    }
    return object;
}

export function render_question(question,div){
    let html = question.text;
    console.log(div)
    div.innerHTML =`
<div class="metadata">${question.id}</div>
<div class="rendering">${html}</div>
<div class="bottom"><button>Back</button><button>Next</button></div>
`
}