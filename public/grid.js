'use strict';

class Cell {
	constructor(x, y, color = "#FFFFFF", qt = 1) {
		this.x = x;
		this.y = y;
		this.color = color;
		this.qt = qt;
	}
}

class Grid {

	constructor() {
		this.w = 30;
		this.h = 15;
		this.cells;
	}

	init() {
		this.cells = [];
		for(var x = 0; x < this.w; x++) {
			this.cells.push([]);
			for(var y = 0; y < this.h; y++) {
				var color = '#FFFFFF';//this.getRandomColor();
				this.cells[x].push(new Cell(x, y, color, 1));
			}
		}
	}

	getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

module.exports = Cell;
module.exports = Grid;