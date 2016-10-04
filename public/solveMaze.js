/*
    1: Create first random generation.
    2: get fitness for each member.
    3: get generation fitness.
    4: select N% bests members based on fitness. (N ~= 20%)
    5: select V% random members based on fitness. (V ~= 5%)
    6: Defined selected members as Parents.
    7: Mutate Parents.
    8: Create Childrens by crossing random Parents.
    9: Unfify Parents and Childrens as New generation.
    10 : back to step 2.
*/

'use strict';

var btn = $('#start');
var moves = ['top' ,'left' ,'right' ,'bot'];

var population = 10;
var maxGenerations = 50;

var mutateRate = 0.1;
var bestRate = 0.3;
var worstRate = 0.05;

var showPath = function(path){
    var pos = [1, 1];
    var newPos;
    path.forEach(function(step){
        newPos = getNewPos(pos, step);
    	ctx.clearRect((newPos[0] * pxDim), (newPos[1] * pxDim), pxDim, pxDim);
        ctx.fillStyle = 'orange';
        ctx.fillRect((newPos[0] * pxDim), (newPos[1] * pxDim), pxDim, pxDim);
        pos = newPos;
    });
};

var clearPath = function(){
    var start = [1, 1];
    var end = [mazeSize - 2, mazeSize - 2];
    publicMaze = publicMaze;
    showMaze(publicMaze, start, end);
};

var getNewPos = function(pos, step){
    var newPos;
    switch(step){
        case 'top':
            newPos = new Array(pos[0], pos[1] - 1);
            break;
        case 'left':
            newPos = new Array(pos[0] - 1, pos[1]);
            break;
        case 'right':
            newPos = new Array(pos[0] + 1, pos[1]);
            break;
        case 'bot':
            newPos = new Array(pos[0], pos[1] + 1);
            break;
    }
    return newPos;
};

var getSurrounding = function(maze, pos){
    var vizu = {
        'top'   : maze[pos[0]][pos[1] - 1],
        'left'  : maze[pos[0] - 1][pos[1]],
        'right' : maze[pos[0] + 1][pos[1]],
        'bot'   : maze[pos[0]][pos[1] + 1],
    };
    return vizu;
};

var createOneSolution = function(){
    var minLen = (mazeSize - 2) + (mazeSize - 2 - 1);
    var maxLen = (mazeSize - 2) * (mazeSize - 2);
    var solution = [];
    var len = Math.floor(Math.random() * (maxLen - minLen)) + minLen;
    for (var i = 0; i < len; i++) {
        var randomDir = moves[Math.floor(Math.random() * (moves.length))];
        solution.push(randomDir);
    }
    return solution;
};

var testSolution = function(maze, solution){
    var pos = [1, 1];
    var path = [];
    var previous = '';
    var notGoingBack = function(step){
        if(step == 'top')
            return (previous != 'bot');
        else if(step == 'bot')
            return (previous != 'top');
        else if(step == 'right')
            return (previous != 'left');
        else
            return (previous != 'right');
    };
    for (var i = 0; i < solution.length; i++) {
        var step =  solution[i];
        var visu = getSurrounding(maze, pos);
        pos = getNewPos(pos, step);
        if(visu[step] === true && notGoingBack(step)){
            previous = step;
            path.push(step);
        }else{
            return(path);
        }
    }
};


var getSelectedIndividus = function(fullGeneration){
    var sortedGeneration = fullGeneration.sort(function(a, b){
        if(a.finesse > b.finesse)
            return a;
        else
            return b;
    });

    var selectedGeneration = sortedGeneration.slice(0, Math.floor(bestRate * population));
    return(selectedGeneration);
};

var getCrossGeneration = function(generation){
    generation.forEach(function(individu, i){
        individu.solution.forEach(function(step, j){
            if(generation[i + 1] && generation[i + 1].solution[j] && (j % 2 === 0)){
                generation[i].solution[j] = generation[i + 1].solution[j];
            }
        });
    });
    return(generation);
};

var getNewGeneration = function(selected){
    var remaining = population - selected.length;
    var newGeneration = selected;
    for (var i = 0; i < remaining; i++) {
        newGeneration.push({
            solution: createOneSolution(),
            finesse: 0
        });
    }
    var crossedGeneration = getCrossGeneration(newGeneration);
    return crossedGeneration;
};

var mutateGeneration = function(generation){
    for (var i = 0; i < generation.length; i++) {
        for(var j = 0; j < generation[i].solution.length; j++){
            if(Math.random() < mutateRate){
                generation[i].solution[j] = moves[Math.floor(Math.random() * (moves.length))];
            }
        }
    }
    return generation;
};

var countGeneration = 0;
var finesseMax = 0;
var bestIndividu;

var solveMaze = function(generation){
    countGeneration++;
    // clearPath();
    var maze = publicMaze;
    generation.forEach(function(individu, i){
        individu.path = testSolution(maze, individu.solution);
        individu.finesse = individu.path.length;
        generation[i] = individu;
        if(individu.finesse > finesseMax){
            console.log('new best :)');
            finesseMax = individu.finesse;
            bestIndividu = individu;
        }
    });
    showPath(bestIndividu.path);
    var selected = getSelectedIndividus(generation);
    console.log('generation ' + countGeneration + ', ' + selected.length + ' selected');
    console.log(selected);
    // console.log(generation.length);
    var newGeneration = getNewGeneration(selected);
    var nextGeneration = mutateGeneration(newGeneration);
    // console.log(generation);
    // console.log(newGeneration);
    // console.log(nextGeneration);
    setTimeout(function(){
        if(countGeneration <= maxGenerations){
            // console.log(nextGeneration.length);
            solveMaze(nextGeneration);
        }
    },0);
};


btn.click(function(){
    var firstGeneration = [];
    countGeneration = 0;
    for (var i = 0; i < population; i++) {
        firstGeneration.push({
            solution: createOneSolution(),
            finesse: 0
        });
    }
    solveMaze(firstGeneration);
});
