'use strict';

var port = 9091;
var mazeSize;
var maxStack = 200;
var randomBackTrack = true;
var express     = require('express');

    express()
    .use(express.static('./public'))
    .get('/maze/:size', function(req, res){
    	mazeSize = req.params.size;
    	buildMaze(req.params.size, function(maze, stack){
    		res.json({maze: maze, stack: stack});
    	});
    })
    .listen(port);

    console.log('open browser at : http://localhost:' + port);




var nextDir = function(maze, x, y, cb){
	var choices = [];
	if((x - 2) >= 0 && maze[x - 1][y] === false && maze[x - 2][y] === false ) //left is possible.
		choices.push("left");
	if((x + 2) < mazeSize && maze[x + 1][y] === false && maze[x + 2][y] === false) //right is possible
		choices.push("right");
	if((y - 2) >= 0 && maze[x][y - 1] === false && maze[x][y - 2] === false) //up is possible
		choices.push("up");
	if((y + 2) < mazeSize && maze[x][y + 1] === false && maze[x][y + 2] === false) // down is possible
		choices.push("down");

	if(choices.length === 0)
		cb(false);
	else
		cb(choices[Math.floor((Math.random() * choices.length))]);
};

var backTrack = function(maze, stack, depth, cb){
	var len = stack.length - 1;
	var backPos = stack[len - depth];

	nextDir(maze, backPos[0], backPos[1], function(dir){
		if(dir === false){
			if(depth >= len){
				cb(false);
			}else{
				if(depth % maxStack === 0){
					setTimeout(function(){
						backTrack(maze, stack, depth + 1, cb);
					}, 0);
				}else{
					backTrack(maze, stack, depth + 1, cb);
				}
			}
		}else{
			cb(dir, backPos);
		}
	});
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
};

var nextPath = function(maze, pos, stack, loop, cb){
	nextDir(maze, pos[0], pos[1], function(dir){
		if(dir === false){
			// cb(maze);
			backTrack(maze, stack, 1, function(backDir, backPos){
				if(backDir === false){
					cb(maze, stack);
				}else{
					getNewPos(backDir, maze, backPos, function(newPos, mazeUpdated){
						maze = mazeUpdated;
						stack.push(newPos);
						if(loop % maxStack === 0){
							setTimeout(function(){
								nextPath(maze, newPos, stack, loop + 1,  cb);
							},0);
						}else{
								nextPath(maze, newPos, stack, loop + 1,  cb);
						}
					});
				}
			});
		}else{
			if(randomBackTrack && stack.length > 3 && Math.floor((Math.random() * 100)) < 20){
				backTrack(maze, stack, 1, function(backDir, backPos){
					getNewPos(backDir, maze, backPos, function(newPos, mazeUpdated){
						maze = mazeUpdated;
						stack.push(newPos);
						if(loop % maxStack === 0){
							setTimeout(function(){
								nextPath(maze, newPos, stack, loop + 1,  cb);
							});
						}else{
							nextPath(maze, newPos, stack, loop + 1,  cb);
						}
					});
				});
			}else{
				getNewPos(dir, maze, pos, function(newPos, mazeUpdated){
					maze = mazeUpdated;
					stack.push(newPos);
					if(loop % maxStack === 0){
						setTimeout(function(){
							nextPath(maze, newPos, stack, loop + 1,  cb);
						},0);
					}else{
						nextPath(maze, newPos, stack, loop + 1,  cb);
					}
				});
			}
		}
	});
};

var buildMaze = function(size, cb) {
	console.log('start');
	var maze = [];
	var stack = [];
	for (var i = 0; i < mazeSize; i++){
		maze[i] = [];
		for (var j = 0; j < mazeSize; j++)
			maze[i][j] = false;
	}
	var pos = [1, 1];
	stack.push(pos);
	maze[pos[0]][pos[1]] = true;
	// maze[mazeSize - 2][mazeSize - 2] = true;
	nextPath(maze, pos, stack, 0, function(maze, stack){
		cb(maze, stack);
	});
};
