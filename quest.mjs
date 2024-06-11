import { parseQuestMarkup } from "./engines/parser.js";
import { renderQuestion } from "./engines/renderer.js";
import { currentQuestion, initializeJourney, isFirstQuestion, nextQuestion, previousQuestion, clearDB } from "./engines/logic.js";
import { getLocalizedString, setLocale } from "./engines/i18n.js";

// Define the Date prototype function toQuestFormat
Date.prototype.toQuestFormat = function () { return `${this.getFullYear()}-${this.getMonth() + 1}-${this.getDate()}` }

// Define a service worker that caches the questionnaires.
// if you are using an ancient browser without serviceworkers
// it will just fetch without caching...
/*
if (navigator.serviceWorker){
    const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
}
*/

// maintain the state of the Questionnaire
// the state is cached in IndexedDB as are
// the responses.  Initially, we start with an
// empty state until the render is called
let state = {
}
window.questState=state

// render is the entry to quest. It takes:
// obj: an object with keys:
//    text: the markdown 
//    url: a URL to pull down the markdown.  Either url or text should be given
//    stylesheet (optional): the css stylesheet used by the renderer
// elementId: an html element on the DOM where the current question
//            will be displayed 
// previousResults: A JSON object with results from previous taken questionnaire
export async function render(obj,elementId,previousResults){
    if (obj.locale) {
        console.log(`setting locale to ${obj.locale}`)
        setLocale(obj.locale,"en")
    }
    console.log(".... rendering ")
    if (!elementId){
        throw Error(`Quest requires an element id to display the questionnaire! element id=${elementId}`)
    }
    state.rootElement = document.getElementById(elementId)


    // load the markdown...
    let contents = obj.text ?? ""
    if (obj.url){
        contents = await (await fetch(obj.url)).text();
    }

    // load the default CSS and the user provided stylesheet.
    addStyleSheet("https://episphere.github.io/quest/Style1.css")
    if (obj.stylesheet){
        addStyleSheet(obj.stylesheet)
    }

    // parse the text
    let questions  = parseQuestMarkup(contents)

    // initialize the model/state 
    await initializeJourney(obj,questions);
    // initalize the view
    initializeUI()

    
}

// helper function that adds the CSS stylesheet to the <head>
function addStyleSheet(url){
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

function buildUI(){
    // create a divs for the Question
    state.questionWrapper = document.createElement("div")
    state.rootElement.insertAdjacentElement("beforeEnd",state.questionWrapper)

    // and add the previous/reset/next buttons
    let previousButton=document.createElement("button")
    previousButton.id = "previousButton"
    previousButton.dataset.direction = "previous"
    previousButton.innerText = getLocalizedString("backButton") 
    previousButton.addEventListener("click",changeQuestion)
    let nextButton=document.createElement("button")
    nextButton.dataset.direction = "next"
    nextButton.innerText = getLocalizedString("nextButton")
    nextButton.id = "nextButton"
    nextButton.addEventListener("click",changeQuestion)
    let resetButton=document.createElement("button")
    resetButton.dataset.direction = "reset"
    resetButton.innerText = getLocalizedString("resetAnswerButton") 
    resetButton.addEventListener("click",changeQuestion)
    let delbutton = document.createElement("button")
    delbutton.innerText = "Reset DB/Tree";
    delbutton.addEventListener("click",clearDB)
    let buttonRow = document.createElement("div")
    buttonRow.insertAdjacentElement("beforeend",previousButton)
    buttonRow.insertAdjacentElement("beforeend",resetButton)
    buttonRow.insertAdjacentElement("beforeend",nextButton)
    buttonRow.insertAdjacentElement("beforeend",delbutton)
    state.rootElement.insertAdjacentElement("beforeend",buttonRow) 
}

function initializeUI(){
    let locale = navigator.language || navigator.languages[0]
    let localized_text = 

    buildUI()

    displayQuestion()
    // find the currentquestion or else go to the first question
    // render the current question in the display
}

function displayQuestion(){
    let question = currentQuestion();
    console.log(`Displaying question: ${question.id}`)
    // render the question if the displayif 
    let  questionElement = renderQuestion(currentQuestion())
    while (questionElement.displayQuestion === "false"){
        selectNextQuestion()
        renderQuestion(currentQuestion())
    }
    state.questionWrapper.innerText=""
    state.questionWrapper.insertAdjacentElement("beforeEnd",questionElement)
    document.getElementById("previousButton").style.visibility = isFirstQuestion()?"hidden":"visible";
}


function selectNextQuestion(){
    console.log("... need current question information and response... ")

    // 1. does the current selection have 1 or more -> (add to tree)
    // 2. select the next question in the tree or 
    //    whatever is next on the list of question
    // 3. if the question is in a loop and is the last question
    //    i.e. _continue, then increment the index and go to the 
    //    first question in the loop or drop out of the loop
    // 4. check for displayif
    //   - if do not display... select next question and return result
}

async function changeQuestion(event){
    console.log(`${event.target.dataset.direction} was clicked`)
    let question = null
    if (event.target.dataset.direction.toLowerCase() == "next"){
        await nextQuestion(event);
    }
    if (event.target.dataset.direction.toLowerCase() == "previous"){
       await previousQuestion(event);
    }
    displayQuestion()
}