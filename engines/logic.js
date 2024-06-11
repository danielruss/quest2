import localforage from 'https://cdn.jsdelivr.net/npm/localforage@1.10.0/+esm'
import {Tree} from './tree.js'

let responseStore = null;
let questionStore = null;
let questionQueue = null;


/**
 * initializes the module. 
 * @param {*} obj optionally contains keys
 *     module_name: The name of the module (default:Quest), if
 *         not present, will use the module name from the markdown
 *         if it exists.
 *     id: an id that can potentially separate
 *         multiple users taking the same questionnaire
 *         on the same device. (Default: questionnaire)
 *     dev: default {} an object that says we are in development
 *         can have keys 
 *              useCachedResults: uses the current tree/results in indexedDB  (default FALSE)
 */
export async function initializeJourney(obj,questions){
    // initialize responseStore and questionStore
    await initializeStores(obj,questions)
    // initialize the questionQueue
    await initializeQuestionQueue(obj,questions)
}


// initializes the indexedDB stores...
async function initializeStores(obj,questions){
    // if there are no question, we have and empty
    // module.  Either we are in development, or 
    // there are no questions in the module...
    // just return ...
    if (questions.length == 0 && !obj.dev) {
        console.warn("There are no question in the module...")
        return
    }

    // create or just get the indexedDB.
    let name = obj.module_name ?? (questions.metadata.name) ?? "Quest"
    let id = obj.id??"questionnaire"
    responseStore = await createLocalForage(name,id)
    questionStore = await createLocalForage(name,"__questions__")

    let numberOfQuestions = await questionStore.length()

    // if there are not cached question Or we
    // are developing a module, don't
    if (numberOfQuestions == 0){
        let promises = questions.map( (question,index,array) => {
            let next_index = index + 1
            question.default_next_id = ( next_index < array.length )?array[next_index].id:null
            questionStore.setItem(question.id,question)
        })
        await Promise.all(promises)
        console.log("all questions in LF")
    }
  

    // for questionnaire development only....
    if (location.host.includes("localhost")) {
        window.questionStore = questionStore;
        window.responseStore = responseStore
    }
}

async function initializeQuestionQueue(obj, questions) {
    // if there are no question, we have and empty
    // module.  Either we are in development, or 
    // there are no questions in the module...
    // just return ...
    if (questions.length == 0 && !obj.dev) {
        console.warn("There are no question in the module...")
        return
    }

    // if we are developing and you dont want to use the 
    // cached results... clear the results store...
    if (!obj.dev?.useCachedResults){
        await responseStore.clear()
    }

    // get or create the tree...
    questionQueue = await responseStore.getItem("_tree_") ?? new Tree()
    if (location.host.includes("localhost")) {
        window.questionQueue = questionQueue;
    }

    // If the question is empty, add the first question,
    // and make it the current question
    if (questionQueue.isEmpty()) {
        // question[0] does not have the next question id in it.
        let firstQuestion = await questionStore.getItem(questions[0].id)
        questionQueue.add(firstQuestion)
        questionQueue.next()
    }

}


async function createLocalForage(name,id){
    return await localforage.createInstance({
        name: name,
        storeName:id
    })
}

export async function clearLocalForage(store){
    await store.clear()
}

export async function clearDB(){
    await clearLocalForage(questionStore)
    await clearLocalForage(responseStore)
    await questionQueue.clear()
    location.reload()
}
/**
 * looks in the tree to get the currentQuestion.
 * Used during initialization.
 */
export function currentQuestion(){
    return questionQueue.currentNode.value
}

export async function nextQuestion(event){
    console.log("logic.js(nextQuestion): ",event)
    let question = currentQuestion()
    console.log("in currentQuestion: ",question)
    //1. collect the results...
    //2. store the results in lf (call the PWA's storeDataFunction)
    //3. Determine what is the next question (Might be submit)
    //4. Go to the next question. 
    question = await questionStore.getItem(question.default_next_id)
    questionQueue.add(question)
    questionQueue.next();
    console.log("in currentQuestion: ",question)
    return question
}

export function previousQuestion(event){
    console.log("logic.js(previousQuestion): ",event)
    //1. get the currentQuestion...
    //2. remove from LF??? (store the results somewhere???)
    //3. pop the question queue
    questionQueue.pop()
    return currentQuestion()
}

export function isFirstQuestion(){
    console.log(questionQueue)
    return questionQueue.isFirst();
}

// exported for development, make be removed later...
if (location.host.includes("localhost")) {
    window.clearLocalForage = clearLocalForage
    window.createLocalForage = createLocalForage
}
