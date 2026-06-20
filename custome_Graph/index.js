import {StateGraph ,MessagesAnnotation ,END} from '@langchain/langgraph'
import { writeFileSync } from 'node:fs';


/**
 * cut the vegetable
*/
function cutTheVegetable(state){
    console.log("Cuttimg the vegetable....")
    return state;
}

/**
 * Boil the Rice
*/
function boilTheRice(state){
    console.log("Boiling the Rice....")
    return state;
}
/**
 * Add Salt
*/
function addTheSalt(state){
    console.log("Adding the Salt....")
    return state;
}

/**
 * Taste the 
*/
function tasteTheBriyani(state){
    console.log("Tasting the Briyani....")
    return state;
}

/**
 * Where to Go
 */

function whereToGo(){

    if(true){
        return "__end__"
    }else{
        return "addTheSalt"
    }
}

// define Graphs
const graph = new StateGraph(MessagesAnnotation)
.addNode("cutTheVegetable" , cutTheVegetable)
.addNode("boilTheRice" , boilTheRice)
.addNode("addTheSalt" , addTheSalt)
.addNode("tasteTheBriyani" , tasteTheBriyani)
.addEdge("__start__","cutTheVegetable")
.addEdge("cutTheVegetable","boilTheRice")
.addEdge("boilTheRice" ,"addTheSalt")
.addEdge("addTheSalt" ,"tasteTheBriyani")
.addConditionalEdges("tasteTheBriyani", whereToGo,{
    __end__ : END,
    addTheSalt : 'addTheSalt'
})

// finally
const briyaniProcess = graph.compile()

async function main(){

    const drawableGraphGraphState = await briyaniProcess.getGraph();
    const graphStateImage = await drawableGraphGraphState.drawMermaidPng();
    const graphStateArrayBuffer = await graphStateImage.arrayBuffer();

    const filePath = './briyani.png';
    writeFileSync(filePath, new Uint8Array(graphStateArrayBuffer))

    const finalSate = await briyaniProcess.invoke({messages:[]})
    console.log("Final --> ",finalSate)
}
main()

