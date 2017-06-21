const Player = require('./public/player.js');
const Grid = require('./public/grid.js');
var grid = new Grid();
grid.init();
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
	io.sockets.sockets[socket.id].emit('initgrid', grid);
	//Init grid the the new player
	io.sockets.sockets[socket.id].emit('initplayers', players);

	players[socket.id] = new Player("anonymous", 15, grid.getRandomColor(), socket.id);
	//Add the current player to all players
	io.emit('addplayer', players[socket.id]);
	io.emit('changename', {name:players[socket.id].name, id:socket.id});

	socket.on('play', function(play) {
		var player = players[play.id];
		if(player == null || player.qt <= 0) return;
		if(play.x >= 0 && play.x < grid.w && play.y >= 0 && play.y < grid.h) {
			if(player.hasTakedFirstCell) {
				//Check neighbours
				var canPlay = false;
				//Up
				if(play.y - 1 >= 0 && grid.cells[play.x][play.y-1].color == player.color) 
					canPlay = true;
				//Down
				if(play.y + 1 < grid.h && grid.cells[play.x][play.y+1].color == player.color) 
					canPlay = true;
				//Left
				if(play.x - 1 >= 0 && grid.cells[play.x-1][play.y].color == player.color) 
					canPlay = true;
				//Right
				if(play.x + 1 < grid.w && grid.cells[play.x+1][play.y].color == player.color) 
					canPlay = true;
				//Increase our first cell
				if(grid.cells[play.x][play.y].color == player.color)
					canPlay = true;

				if(!canPlay) {
					console.log(play.id + " is trying to play where he doesn't have a neighbours");
					return;
				}
			}

			var cell = grid.cells[play.x][play.y];
			//First time the play select a empty cell
			if(!player.hasTakedFirstCell) {
				if(cell.color == "#FFFFFF") {
					player.qt--;
					player.hasTakedFirstCell = true;
					cell.color = player.color;
				} 
			} else {
				//Empty
				if(cell.color == "#FFFFFF") {
					player.qt--;
					cell.color = player.color;
				} 
				//His cell
				else if(cell.color == player.color) {
					cell.qt++;
					player.qt--;
				} 
				//Other cell
				else {
					//Check whatever player has more, less of equals qt than the cell
					if(cell.qt < player.qt) {
						player.qt -= cell.qt;
						cell.qt = 1;
						cell.color = player.color;
					} else if(cell.qt > player.qt) {
						cell.qt -= player.qt;
						player.qt = 0;
					} else {
						cell.color = "#FFFFFF";
						player.qt = 0;
					}
				}
			}

			io.emit('updateplayer', player);
			io.emit('cellupdate', cell);
		}
	});

	socket.on("changename", function(data) {
		var player = players[data.id];
		if(player == null) return;
		player.name = data.name;
		io.emit('changename', data);
	});

	setInterval(function() {
		for(var key in players) {
            var player = players[key];
            player.qt++;
			io.emit('updateplayer', player);
        };
	}, 5000);

	socket.on('disconnect', function(){
		console.log('user ' + socket.id + ' disconnected');
		io.emit('removeplayer', socket.id);
		delete players[socket.id];
		console.log('Players: ' + Object.keys(players).length);
	});

	console.log('Players: ' + Object.keys(players).length);
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});