'use strict';

class Player {
	constructor(name, qt, color, key) {
		this.name = name;
		this.qt = qt;
		this.color = color;
		this.key = key;
		this.hasTakedFirstCell = false;
	}
}

module.exports = Player;