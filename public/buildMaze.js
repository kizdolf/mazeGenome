'use strict';

var mazeSize = 40;

var pxDim = 20; //px size for a wall.

var canevas = document.getElementById('mainFrame');
var fr = $('#mainFrame');
fr.attr('height', (mazeSize * pxDim));
fr.attr('width', (mazeSize * pxDim));

var ctx = canevas.getContext('2d');


var nextDir = function(maze, x, y){
	var choices = [];
	// var choices = ["UP", "DOWN", "RIGHT", "LEFT"];
	if((x - 2) >= 0 && maze[x - 1][y] === false && maze[x - 2][y] === false ) //left is possible.
		choices.push("left");
	if((x + 2) < mazeSize && maze[x + 1][y] === false && maze[x + 2][y] === false) //right is possible
		choices.push("right");
	if((y - 2) >= 0 && maze[x][y - 1] == false && maze[x][y - 2] == false) //up is possible
		choices.push("up");
	if((y + 2) < mazeSize && maze[x][y + 1] === false && maze[x][y + 2] === false) // down is possible
		choices.push("down");
	if(choices.length == 0)
		return false;
	else
		return (choices[Math.floor((Math.random() * choices.length))]);
}

var backTrack = function(maze, stack, depth, cb){
	var len = stack.length - 1;
	var backPos = stack[len - depth];

	var dir = nextDir(maze, backPos[0], backPos[1]);
	if(dir == false){
		if(depth >= len){
			cb(false);
		}else{
			backTrack(maze, stack, depth + 1, cb);
		}
	}else{
		cb(dir, backPos);
	}
};

var getNewPos = function(dir, maze, pos, cb){
	var newPos;
	switch (dir){
		case 'left':
			maze[pos[0] - 1][pos[1]] = true;
			maze[pos[0] - 2][pos[1]] = true;
			newPos = new Array(pos[0] - 2, pos[1]);
			break;
		case 'right':
			maze[pos[0] + 1][pos[1]] = true;
			maze[pos[0] + 2][pos[1]] = true;
			newPos = new Array(pos[0] + 2, pos[1]);
			break;
		case 'up':
			maze[pos[0]][pos[1] - 1] = true;
			maze[pos[0]][pos[1] - 2] = true;
			newPos = new Array(pos[0], pos[1] - 2);
			break;
		case 'down':
			maze[pos[0]][pos[1] + 1] = true;
			maze[pos[0]][pos[1] + 2] = true;
			newPos = new Array(pos[0], pos[1] + 2);
			break;
	}
	cb(newPos, maze);
}

var nextPath = function(maze, pos, stack, cb){
	var dir = nextDir(maze, pos[0], pos[1]);
	if(dir == false){
		// cb(maze);
		backTrack(maze, stack, 1, function(backDir, backPos){
			if(backDir === false){
				cb(maze, stack);
			}else{
				getNewPos(backDir, maze, backPos, function(newPos, mazeUpdated){
					maze = mazeUpdated;
					stack.push(newPos);
					nextPath(maze, newPos, stack, cb);
				});
			}
		});
	}else{
		getNewPos(dir, maze, pos, function(newPos, mazeUpdated){
			maze = mazeUpdated;
			stack.push(newPos);
			nextPath(maze, newPos, stack, cb);
		});
	}
}

var buildMaze = function(size, cb) {
	var maze = [];
	var stack = [];
	for (var i = 0; i < mazeSize; i++){
		maze[i] = [];
		for (var j = 0; j < mazeSize; j++)
			maze[i][j] = false;
	}
	var pos = [0, 0];
	stack.push(pos);
	maze[pos[0]][pos[1]] = true;
	nextPath(maze, pos, stack, function(maze, stack){
		cb(maze, stack);
	});
};


var drawMaze = function(path, x, y){
	ctx.clearRect((x * pxDim), (y * pxDim), pxDim, pxDim);
    ctx.fillStyle = (path === false) ? 'black': 'white';
    ctx.fillRect((x * pxDim), (y * pxDim), pxDim, pxDim);
}

var showMaze = function(maze, end){
	for (var i = 0; i < mazeSize; i++){
		for (var j = 0; j < mazeSize; j++){
			if(maze[i][j] === true){
				drawMaze(true, i, j);
			}else{
				drawMaze(false, i, j);
			}
		}
	}

	ctx.clearRect(0, 0, pxDim, pxDim);
    ctx.fillStyle ='green';
    ctx.fillRect(0, 0, pxDim, pxDim);

    ctx.clearRect(end[0] * pxDim, end[1] * pxDim, pxDim, pxDim);
    ctx.fillStyle ='red';
    ctx.fillRect(end[0] * pxDim, end[1] * pxDim, pxDim, pxDim);

};

var maze = buildMaze(mazeSize, function(maze, stack){
	var end = stack[stack.length -1];
	console.log(stack.length);
	console.log(end);
	showMaze(maze, end);
	console.log(maze);
});

