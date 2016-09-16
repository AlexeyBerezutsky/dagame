var Boot =( function() {
	return function (game) {
		this.init = function () {
			// Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
			game.input.maxPointers = 1;

			// Pause if the browser tab or game is in loses focus.
			game.stage.disableVisibilityChange = true;

			game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

			// Scale the width down to avoid vertical scrolling
			game.scale.windowConstraints.bottom = "visual";

			// Always center the game
			game.scale.pageAlignHorizontally = true;

			game.scale.pageAlignVertically = true;

			if (game.device.desktop) {
			} else {
				// We're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
				game.scale.setMinMax(480, 260, 1024, 768);

				game.scale.forceLandscape = true;

				game.scale.pageAlignHorizontally = true;
			}
		};

		this.preload = function () {
			// Here we load the assets required for our preloader
			game.load.image('tile', 'img/tile.png');

			game.load.image('fireball', 'img/fireball.png');

			game.load.spritesheet('baddie','img/baddie.png', 32, 32, 4);
		};

		this.create = function () {
			game.state.start('Game');
		};
	};
})();
