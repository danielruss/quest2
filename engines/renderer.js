/**
 * returns HTML for the markdown in the question object.
 * The question object should have keys: 
 *  - markdown: the markdown for the question
 * 
 * This function ONLY creates HTML.  No question logic
 * is performed here.
 * 
 * @param {*} question 
 */
export function renderQuestion(question){
    console.log("called render question ",question.id)

    if (question.render){

        return {displayQuestion:true}
    } else{

    }
    let formElement = document.createElement("form")
    formElement.classList.add("question")
    formElement.id = question.id
    formElement.insertAdjacentHTML('beforeend',renderQuestMarkdown(question.markdown))

    //create a div element that contains the markdown....
    let markdownDiv = document.createElement("code")
    markdownDiv.style.whiteSpace="pre-wrap"
    console.log(JSON.stringify(question,null,3))
    markdownDiv.innerText=JSON.stringify(question,null,3);
    formElement.insertAdjacentElement("beforeend",markdownDiv)
    return formElement
}


function evaluateCondition(condition){

}


function renderQuestMarkdown(markdown){
    // get rid of the id...
    let html = markdown.replace(/^\[[^\]]+\]/,"")

    // replace (###) String -> Id
    let regex = /\((\d*)(\*)?\)(.+)/g
    html = html.replace(regex,(match,m1,m2)=>{
        console.log(`in replace function: id:|${m1}| clearOthers:|${m2}|`)
        let label="test123"
        return `<div class="response"><input type="radio" value=""><label>${label}</label></div>`
    })

    return html
}


