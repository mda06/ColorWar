const Player = require('./public/player.js');
const Grid = require('./public/grid.js');
var grid = new Grid();
grid.init();
var player = new Player('Mike', 10, '#00FF00', 'azertyuio');
var players = {};

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + "/public/index.html");
});

io.on('connection', function(socket){
	console.log('user ' + socket.id + ' connected');
	//Add all the players to the new player
	socket.emit('initgrid', grid);
	//Init grid the the new player
	socket.emit('initplayers', players);

	players[socket.id] = new Player("anonymous", 15, grid.getRandomColor(), socket.id);
	//Add the current player to all players
	io.emit('addplayer', players[socket.id]);

	socket.on('play', function(play) {
		var player = players[play.id];
		if(player == null) return;
		if(play.x >= 0 && play.x < grid.w && play.y >= 0 && play.y < grid.h) {
			var cell = grid.cells[play.x][play.y];
			cell.color = player.color;
			io.emit('cellupdate', cell);
		}
	});

	socket.on('disconnect', function(){
		console.log('user ' + socket.id + ' disconnected');
		io.emit('removeplayer', socket.id);
		delete players[socket.id];
	});
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});