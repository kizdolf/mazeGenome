/*
    OK 1: Create first random generationFit.
    OK 2: get fitness for each member.
    OK 3: get generation fitness.
    OK 4: select N% bests members based on fitness. (N ~= 20%)
    OK 5: select V% random members based on fitness. (V ~= 5%)
    OK 6: Defined selected members as Parents.
    OK 7: Mutate Parents.
    OK 8: Create Childrens by crossing random Parents.
    OK 9: Unfify Parents and Childrens as New generation.
    10 : back to step 2.
*/
/*I need to be able to stop stuff*/
(function(window, nextTick, process, prefixes, i, p, fnc) {
    p = window[process] || (window[process] = {});
    while (!fnc && i < prefixes.length) {
        fnc = window[prefixes[i++] + 'equestAnimationFrame'];
    }
    p[nextTick] = p[nextTick] || (fnc && fnc.bind(window)) || window.setImmediate || window.setTimeout;
})(window, 'nextTick', 'process', 'r webkitR mozR msR oR'.split(' '), 0);

/* Globals come from buildMaze.js */

/* Define */
var moves = ['top' ,'left' ,'right' ,'bot'];

var maxGenerations = 50000;
var populationSize = 200;

var mutateRate = 0.2;
var bestRate = 0.9;
var worstRate = 0.05;

/*To display*/
var pathToDisplay;
var curToDisplay;
var topFitness = 0;
var genFitness = 0;

var printOne = function(cb){
    if(topFitness === 0 && genFitness === 0) cb();
    clearPath();
    // console.log(pathToDisplay);
    // console.log(topFitness);
    var pos = [1, 1];
    var newPos;
    var color;
    if(pathToDisplay){
        pathToDisplay.forEach(function(step, i){
            if(i == pathToDisplay.length - 1)
                color = '#17ffb6';
            else
                color = 'orange';
            newPos = getNewPos(pos, step);
        	ctx.clearRect((newPos[0] * pxDim), (newPos[1] * pxDim), pxDim, pxDim);
            ctx.fillStyle = color;
            ctx.fillRect((newPos[0] * pxDim), (newPos[1] * pxDim), pxDim, pxDim);
            pos = newPos;
        });
    }
    pos = [1, 1];
    setTimeout(function(){
        curToDisplay.forEach(function(step){
            newPos = getNewPos(pos, step);
        	ctx.clearRect((newPos[0] * pxDim), (newPos[1] * pxDim), pxDim, pxDim);
            ctx.fillStyle = 'blue';
            ctx.fillRect((newPos[0] * pxDim), (newPos[1] * pxDim), pxDim, pxDim);
            pos = newPos;
        });
        setTimeout(function(){
            cb();
        },0);
    },0);
};
var clearPath = function(){
    var start = [1, 1];
    var end = [mazeSize - 2, mazeSize - 2];
    publicMaze = publicMaze;
    showMaze(publicMaze, start, end);
};

var nextDir = function(maze, x, y){
	var choices = [];
	if((x - 2) >= 0) choices.push("left");
	if((x + 2) < mazeSize) choices.push("right");
	if((y - 2) >= 0) choices.push("top");
	if((y + 2) < mazeSize) choices.push("bot");

	if(choices.length === 0) return(false);
	else return(choices[Math.floor((Math.random() * choices.length))]);
};


var createRandomMember = function(){
    var minLen = (mazeSize - 2) + (mazeSize - 2 - 1);
    var maxLen = (mazeSize - 2) * (mazeSize / 2);
    var solution = [];
    var pos = [1, 1];
    var len = maxLen;
    // var len = Math.floor(Math.random() * (maxLen - minLen)) + minLen;
    for (var i = 0; i < len; i++) {
        var randomDir = nextDir(publicMaze, pos[0], pos[1]);
        solution.push(randomDir);
        var nPos = getNewPos(pos, randomDir);
        pos = nPos;
    }
    return solution;
};

var getRandomDir = function(){
    return(moves[Math.floor(Math.random() * moves.length)]);
};

// 1. Create First Generation.
var randomGeneration = function(){
    var generation = [];
    for (var i = 0; i < populationSize; i++) {
        var member = {
            genes : createRandomMember(),
            path : [],
            fitness: 0
        };
        generation.push(member);
    }
    return generation;
};

var getSurrounding = function(pos){
    var vizu = {
        'top'   : publicMaze[pos[0]][pos[1] - 1],
        'left'  : publicMaze[pos[0] - 1][pos[1]],
        'right' : publicMaze[pos[0] + 1][pos[1]],
        'bot'   : publicMaze[pos[0]][pos[1] + 1],
    };
    return vizu;
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

var caclulFitnessMember = function(member, cb){
    genFitness = 0;
    var pos = [1, 1];
    var end = [mazeSize - 2, mazeSize - 2];
    var previous = '';
    var fitnessMember = 0;
    var path = [];
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
    for (var i = 0; i < member.genes.length; i++) {
        var step = member.genes[i];
        var visu = getSurrounding(pos);
        if(visu[step] === true && notGoingBack(step)){
            pos = getNewPos(pos, step);
            previous = step;
            // fitnessMember++;

            path.push(step);
            if(pos[0] == end[0] && pos[1] == end[1]){
                console.log('DONE');
                cb(path);
            }
        }else{
            fitnessMember = path.length;
            member.path = path;
            member.fitness = fitnessMember;
            //toDisplay
            if(member.fitness > topFitness){
                topFitness = fitnessMember;
                pathToDisplay = path;
            }
            if(member.fitness > genFitness){
                genFitness = fitnessMember;
                curToDisplay = member.genes;
            }
            cb(member);
        }
    }
};

var caclulFitnessGeneration = function(generation, cb){
    var sumFitness = 0;
    generation.forEach(function(member){
        member = caclulFitnessMember(member, function(newMember){
            if(!newMember.path){
                cb(false, newMember);
            }
            sumFitness += newMember.fitness;
        });
    });
    cb((sumFitness / generation.length), generation);
};

var getBestsParents = function(generation, cb){
    var nbParents = Math.floor(bestRate * populationSize);
    var parents = generation.slice(0, nbParents);
    cb(parents);
};

var getRandomParents = function(generation, cb){
    var nbParents = Math.floor(worstRate * populationSize);
    var nbTaken = Math.floor(bestRate * populationSize);
    var parents = [];
    for (var i = 0; i < nbParents; i++){
        var rand = Math.floor(Math.random() * (generation.length - nbTaken));
        parents.push(generation[rand + nbTaken]);
    }
    cb(parents);
};

var mutate = function(generation, cb){
    for (var i = 0; i < generation.length; i++) {
        for (var j = 0; j < generation[i].genes.length; j++) {
            var rand = Math.random();
            if(rand < mutateRate){
                var dir = getRandomDir();
                // console.log('mutate at ' + i + ' , ' + j +  ' from ' + generation[i].genes[j] + ' to ' + dir);
                generation[i].genes[j] = dir;
            }
            if(i == generation.length - 1 && j == generation[i].genes.length - 1)
                cb(generation);
        }
    }
};

var crossingPool = function(generation, cb){
    var nbMissingChlidren = populationSize - generation.length;
    var childrens = [];
    for (var i = 0; i < nbMissingChlidren; i++){
        var dad = generation[Math.floor(Math.random() * generation.length)];
        var mom = generation[Math.floor(Math.random() * generation.length)];
        // var halfDad = dad.genes.slice(0, (dad.genes.length / 2));
        // var halfMom = mom.genes.slice((mom.genes.length / 2), (mom.genes.length - 1));
        var halfDad = dad.genes.slice(0, (dad.fitness / 2));
        var halfMom = mom.genes.slice((mom.fitness / 2), (mom.fitness - 1));
        var child = halfDad.concat(halfMom);
        // var child = halfDad;
        var minLen = (mazeSize - 2) + (mazeSize - 2 - 1);
        var maxLen = (mazeSize - 2) * (mazeSize / 2);
        var len = maxLen;
        // var len = Math.floor(Math.random() * (maxLen - minLen)) + minLen;
        for (var j = child.length; j < len; j++) {
            var randomDir = moves[Math.floor(Math.random() * (moves.length))];
            child.push(randomDir);
        }
        childrens.push({
            genes : child,
            path : [],
            fitness: 0
        });
        if(childrens.length == nbMissingChlidren){
            cb(childrens);
        }
    }
};

var statsToHtml = function(loop, fitness){
    $('#generation').html(loop);
    $('#finesse').html(fitness);
    $('#pathLen').html(pathToDisplay.length);
    $('#curPathLen').html(curToDisplay.length);
};

var main = function(generation, loop){
    printOne(function(){
        setTimeout(function(){
            caclulFitnessGeneration(generation, function(fitness, generationFit){
                if(fitness === false){ //DONE!!
                    console.log('OUUUUii'); //which is the ultime path.
                    console.log(generationFit); //which is the ultime path.
                    pathToDisplay = generationFit;
                    loop = maxGenerations;
                    printOne(function(){
                    });
                    exit(); //fake cmd to kill callstack.
                }else{
                    statsToHtml(loop, fitness);
                    // console.log(generationFit);
                    generationFit = generationFit.sort(function(a, b){return (a.fitness > b.fitness) ? -1 : 1; });
                    getBestsParents(generationFit, function(bestParents){
                        getRandomParents(generationFit, function (randomParents) {
                            var parents = bestParents.concat(randomParents);
                            mutate(parents, function(mutatedParents){
                                setTimeout(function(){
                                    crossingPool(mutatedParents, function(childrens){
                                        var newGeneration = mutatedParents.concat(childrens);
                                        setTimeout(function(){
                                            if(loop < maxGenerations)
                                            main(newGeneration, loop + 1);
                                        },0);
                                    });
                                },0);
                            });
                        });
                    });
                }
            });
        },0);
    });
};


$('#start').click(function(){
    var firstGeneration = randomGeneration();
    main(firstGeneration, 0);
});
