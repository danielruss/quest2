import { assert } from "https://unpkg.com/chai/chai.js"
import { render } from "../quest.mjs"
import { parseQuestMarkup } from "../engines/parser.js";
import localforage from 'https://cdn.jsdelivr.net/npm/localforage@1.10.0/+esm'
import { renderQuestion } from "../engines/renderer.js";
console.log(localforage)


describe('module_1', function () {

    beforeEach(function () {
        console.log("Initialising...");
        document.getElementById("test1").innerText=""
    });

    it('should pass', function () {
        assert.equal(1, 1)
    })
    it('should parse module 1',async function(){
        // it should parse all the questions...
        let text = await (await fetch("https://raw.githubusercontent.com/episphere/questionnaire/main/module1Stage.txt")).text()
        let questions = parseQuestMarkup(text)
        console.log(questions)
        assert.equal(questions.metadata.name,"D_726699695_V2","module 1 metadata is incorrect");
        assert.equal(questions.END,320)
        assert.equal(questions[320].id,"END")
    })
    it('should parse module 2',async function(){
        // it should parse all the questions...
        let text = await (await fetch("https://raw.githubusercontent.com/episphere/questionnaire/main/module2Stage.txt")).text()
        let questions = parseQuestMarkup(text)
        assert.equal(questions.metadata.name,"D_745268907_V2","module 2 metadata is incorrect");
    })


    it('should render simple select',async function(){
        let text = await (await fetch("https://raw.githubusercontent.com/episphere/questionnaire/main/module1Stage.txt")).text()
        let questions = parseQuestMarkup(text)

        // Module 1 D_783167257
        let indx = questions["D_783167257"]
        let html=renderQuestion(questions[indx])

        console.log(questions[indx])
        console.log(html)
    })

    /*
    it('should render module 1',  async function () {


        await render({
            url: "https://raw.githubusercontent.com/episphere/questionnaire/main/module1Stage.txt",
        }, "test1")

        let x = [...document.querySelectorAll('[data-direction]')]
        console.log(x)
        console.log(x.length)
        assert.equal(x.length,3)
    })

    it('should parse module 2',  async function () {
        await render({
            url: "https://raw.githubusercontent.com/episphere/questionnaire/main/module2Stage.txt",
        }, "test1")

        let x = [...document.querySelectorAll('[data-direction]')]
        console.log(x)
        console.log(x.length)
        assert.equal(x.length,3)
    })
    */
})