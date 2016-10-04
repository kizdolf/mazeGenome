'use strict';

var publicMaze;

var mazeSize = 21;

var pxDim = 14; //px size for a wall.

var canevas = document.getElementById('mainFrame');
var fr = $('#mainFrame');
fr.attr('height', (mazeSize * pxDim));
fr.attr('width', (mazeSize * pxDim));

var ctx = canevas.getContext('2d');

var drawMaze = function(path, x, y){
	ctx.clearRect((x * pxDim), (y * pxDim), pxDim, pxDim);
    ctx.fillStyle = (path) ? 'white': 'black';
    ctx.fillRect((x * pxDim), (y * pxDim), pxDim, pxDim);
};

var showMaze = function(maze, start, end){
	for (var i = 0; i < mazeSize; i++){
		for (var j = 0; j < mazeSize; j++){
			if(maze[i][j] === true){
				drawMaze(true, i, j);
			}else{
				drawMaze(false, i, j);
			}
		}
	}
	ctx.clearRect(start[0] * pxDim, start[1] * pxDim, pxDim, pxDim);
    ctx.fillStyle ='green';
    ctx.fillRect(start[0] * pxDim, start[1] * pxDim, pxDim, pxDim);
    ctx.clearRect(end[0] * pxDim, end[1] * pxDim, pxDim, pxDim);
    ctx.fillStyle ='red';
    ctx.fillRect(end[0] * pxDim, end[1] * pxDim, pxDim, pxDim);
};


$.get('/maze/' + mazeSize, function(res){
	console.log(res);
	var start = [1, 1];
	var end = [mazeSize - 2, mazeSize - 2];
	publicMaze = res.maze;
	showMaze(res.maze, start, end);
});

$('#generate').click(function(){
	$.get('/maze/' + mazeSize, function(res){
		console.log(res);
		var start = [1, 1];
		var end = [mazeSize - 2, mazeSize - 2];
		publicMaze = res.maze;
		showMaze(res.maze, start, end);
	});
});
