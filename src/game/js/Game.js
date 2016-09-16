var Game = (function () {
    return function (game) {
        //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

        this.init = function () {
            //Set the background colour to blue
            game.stage.backgroundColor = '479cde';

            //Enable the Arcade physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);
        };

        this.create = function () {
            game.source = game.source || {};

            game.source.platforms = createPlatforms();

            initPlatforms();

            game.source.timer = runPlatforms(addPlatform);

            createPlayer();

            initControls();

            createScore();
        };

        this.update = function () {
            checkCollisions();

            checkPlayerPosition();

            handlePlayerAnimation();
        };

        var createPlatforms = function () {
            var platforms = game.add.group();

            platforms.enableBody = true;

            //create pool of objects;

            platforms.createMultiple(250, 'tile');

            return platforms;
        };

        var initPlatforms = function (platforms) {
            var tileHeight = game.cache.getImage('tile').height;

            var spacing = 3 * tileHeight;

            var bottom = game.world.height - tileHeight,
                top = tileHeight;

            //Keep creating platforms until they reach (near) the top of the screen
            for (var y = bottom; y > top - tileHeight; y = y - spacing) {
                addPlatform(y);
            }
        };

        var addPlatform = function (y) {
            var tileWidth = game.cache.getImage('tile').width;

            var tileHeight = game.cache.getImage('tile').height;

            //If no y position is supplied, render it just outside of the screen

            if (typeof(y) == "undefined") {
                y = -tileHeight;

                incrementScore();
            }

            //Work out how many tiles we need to fit across the whole screen
            var tilesNeeded = Math.ceil(game.world.width / tileWidth);

            //Add a hole randomly somewhere
            var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;

            //Keep creating tiles next to each other until we have an entire row
            //Don't add tiles where the random hole is
            for (var i = 0; i < tilesNeeded; i++) {
                if (i != hole && i != hole + 1) {
                    addTile(i * tileWidth, y);
                }
            }
        };

        var addTile = function (x, y) {
            //Get a tile that is not currently on screen
            var tile = game.source.platforms.getFirstDead();

            //Reset it to the specified coordinates
            tile.reset(x, y);

            tile.body.velocity.y = 150;

            tile.body.immovable = true;

            //When the tile leaves the screen, kill it
            tile.checkWorldBounds = true;

            tile.outOfBoundsKill = true;
        };

        var runPlatforms = function (callBack) {
            return game.time.events.loop(2000, callBack, this);
        };

        var createPlayer = function () {
            var tileHeight = game.cache.getImage('tile').height;

            //Add the player to the game by creating a new sprite
            var player = game.add.sprite(game.world.centerX, game.world.height - 7 * tileHeight, 'baddie');

            player.scale.set(2);

            player.smoothed = true;

            //Set the players anchor point to be in the middle horizontally
            player.anchor.setTo(0.5, 1.0);

            //Enable physics on the player
            game.physics.arcade.enable(player);

            //Make the player fall by applying gravity
            player.body.gravity.y = 2000;

            //Make the player collide with the game boundaries
            player.body.collideWorldBounds = true;

            //Make the player bounce a little
            player.body.bounce.y = 0.1;

            player.animations.add('left', [1, 0], 10, true);

            player.animations.add('right', [3, 2], 10, true);

            player.frame = 1;

            player.body.bounce.set(0.1);

            game.source.player = player;
        };

        var initControls = function () {
            initPad();

            initKeyBoard();
        };

        var initPad = function () {
            game.input.gamepad.start();
            if (game.input.gamepad.supported && game.input.gamepad.active) {
                var pad = game.input.gamepad.pad1;

                if (pad) {
                    pad.addCallbacks(this, {onConnect: addButtons});
                } else {
                    console.log('can not find first gamepad');
                }
            } else {
                console.log('Gamepad is not supported');
            }
        };

        var addButtons = function () {
            var pad = game.input.gamepad.pad1;

            var rightTriggerButton = pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

            rightTriggerButton.onFloat.add(onRightTrigger);

            var leftStick = pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

            leftStick.onAxisCallback = onStickAxisChanged;
        };

        var onRightTrigger = function (button, value) {
            var player = game.source.player;
            if (player.body.wasTouching.down) {

                player.body.velocity.y = -value * 2000;
            }
        };

        var onStickAxisChanged = function () {
            if (pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                player.body.velocity.x += pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) * 10;
            }
            else if (pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                player.body.velocity.x += pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) * 10;
            }
        };

        var initKeyBoard = function () {
            var keyboard = game.input.keyboard;

            keyboard.onDownCallback = onDownKeyboard;
            keyboard.onUpCallback = onUpKeyboard;
        };

        var onDownKeyboard = function (button) {
            var player = game.source.player;

            switch (button.keyCode) {
                case Phaser.KeyCode.UP:
                    if (player.body.wasTouching.down) {
                        game.source.animationRun = false;

                        player.body.velocity.y = -1400;
                    }

                    break;

                case Phaser.KeyCode.RIGHT:
                    game.source.animationRun = true;

                    player.body.velocity.x += 50;

                    break;

                case Phaser.KeyCode.LEFT:
                    game.source.animationRun = true;

                    player.body.velocity.x -= 50;

                    break;
            }

            console.log(player.body.velocity.x);
        };

        var onUpKeyboard = function (button) {
            if ([Phaser.KeyCode.RIGHT, Phaser.KeyCode.LEFT].indexOf(button.keyCode) !== -1) {
                game.source.animationRun = false;
            }
        };

        var createScore = function () {
            game.source.score = 0;

            var scoreFont = "100px Arial";

            game.source.scoreLabel = game.add.text((game.world.centerX), 100, "0", {font: scoreFont, fill: "#fff"});

            game.source.scoreLabel.anchor.setTo(0.5, 0.5);

            game.source.scoreLabel.align = 'center';
        };

        var incrementScore = function () {
            game.source.score += 1;

            game.source.scoreLabel.text = game.source.score;
        };

        var gameOver = function () {
            game.source.timer.timer.removeAll();

            game.state.start('Game');
        };

        var checkCollisions = function () {
            var player = game.source.player;

            //Make the sprite collide with the ground layer
            game.physics.arcade.collide(player, game.source.platforms);
        };

        var checkPlayerPosition = function () {
            var player = game.source.player;
            //Check if the player is touching the bottom
            if (player.body.position.y >= game.world.height - player.body.height) {
                gameOver();
            }
        };

        var handlePlayerAnimation = function () {
            var player = game.source.player;

            if (!game.source.animationRun) {
                player.animations.stop();

                if (player.body.velocity.x > 0.01) {
                    player.frame = 2;
                } else if (player.body.velocity.x < -0.01) {
                    player.frame = 1;
                } else{

                }
            }
            else {
                if (player.body.velocity.x > 10) {
                    player.animations.play('right');
                } else if (player.body.velocity.x < -10) {
                    player.animations.play('left');
                }
            }
        };
    }
})();