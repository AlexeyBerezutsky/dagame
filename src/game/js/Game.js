var Game = (function () {
    return function (game) {
        //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

        var add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
        var camera;    //  a reference to the game camera (Phaser.Camera)
        var cache;     //  the game cache (Phaser.Cache)
        var input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
        var load;      //  for preloading assets (Phaser.Loader)
        var math;      //  lots of useful common math operations (Phaser.Math)
        var sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
        var stage;     //  the game stage (Phaser.Stage)
        var time;      //  the clock (Phaser.Time)
        var tweens;    //  the tween manager (Phaser.TweenManager)
        var state;     //  the state manager (Phaser.StateManager)
        var world;     //  the game world (Phaser.World)
        var particles; //  the particle manager (Phaser.Particles)
        var physics;   //  the physics manager (Phaser.Physics)
        var rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
        var tileWidth;
        var tileHeight;
        var spacing;
        var player, platforms;
        var cursors, pad;
        var score, scoreLabel;

        this.init = function () {

            //Get the dimensions of the tile we are using
            tileWidth = game.cache.getImage('tile').width;
            tileHeight = game.cache.getImage('tile').height;

            //Set the background colour to blue
            game.stage.backgroundColor = '479cde';

            //Enable the Arcade physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

        };

        var initPlatforms = function () {
            var bottom = game.world.height - tileHeight,
                top = tileHeight;

            //Keep creating platforms until they reach (near) the top of the screen
            for (var y = bottom; y > top - tileHeight; y = y - spacing) {
                addPlatform(y);
            }
        };

        var addPlatform = function (y) {
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
            var tile = platforms.getFirstDead();

            //Reset it to the specified coordinates
            tile.reset(x, y);

            tile.body.velocity.y = 150;

            tile.body.immovable = true;

            //When the tile leaves the screen, kill it
            tile.checkWorldBounds = true;

            tile.outOfBoundsKill = true;
        };

        var createPlayer = function () {
            //Add the player to the game by creating a new sprite
            player = game.add.sprite(game.world.centerX, game.world.height - (spacing * 2 + (3 * tileHeight)), 'baddie');

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

            player.animations.add('left', [0, 1], 10, true);

            player.animations.add('right', [2, 3], 10, true);

            player.body.bounce.set(0.4);
        };

        var onRightTrigger = function (button, value) {
            console.log(value);
            if (player.body.wasTouching.down) {
                player.body.velocity.y = -value * 2000;
            }
        };

        function addButtons() {
            var pad = game.input.gamepad.pad1;

            var rightTriggerButton = pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

            rightTriggerButton.onFloat.add(onRightTrigger);
        }

        var createScore = function(){
            var scoreFont = "100px Arial";

            scoreLabel = game.add.text((game.world.centerX), 100, "0", {font: scoreFont, fill: "#fff"});
            scoreLabel.anchor.setTo(0.5, 0.5);
            scoreLabel.align = 'center';
        };

        var incrementScore = function(){
            score += 1;
            scoreLabel.text = score;
        };

        this.create = function () {
            //Add a platforms group to hold all of our tiles, and create a bunch of them
            platforms = game.add.group();

            platforms.enableBody = true;

            platforms.createMultiple(250, 'tile');

            //The spacing for the initial platforms
            spacing = 200;

            //Create the inital on screen platforms

            initPlatforms();

            createPlayer();

            score = 0;

            createScore();

            game.input.gamepad.start();

            // if (game.input.gamepad.supported && game.input.gamepad.active && game.input.gamepad.pad1.connected) {
            pad = game.input.gamepad.pad1;

            pad.addCallbacks(this, {onConnect: addButtons});
            //} else {
            cursors = game.input.keyboard.createCursorKeys();
            //}



            var timer = game.time.events.loop(2000, addPlatform, this);
        };

        var gameOver = function () {
            game.state.start('Game');
        };
        var animationIsOn = false;


        this.update = function () {
            //Make the sprite collide with the ground layer
            game.physics.arcade.collide(player, platforms);

            //Check if the player is touching the bottom
            if (player.body.position.y >= game.world.height - player.body.height) {
                gameOver();
            }

            if (cursors) {
                //Make the sprite jump when the up key is pushed
                if (cursors.up.isDown && player.body.wasTouching.down) {
                    player.body.velocity.y = -1400;
                }
                //Make the player go left
                if (cursors.left.isDown) {
                    player.body.velocity.x += -50;

                } else if (cursors.right.isDown) {
                    player.body.velocity.x += 50;
                } else {
                  animationIsOn = false;
                }
            }

            if (game.input.gamepad.supported && game.input.gamepad.active && game.input.gamepad.pad1.connected) {
                if (pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < -0.1) {
                    player.body.velocity.x += pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) * 10;
                }
            else if (pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.1) {
                player.body.velocity.x += pad.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) * 10;
            }
        };


        if (player.body.velocity.x> 0.1) {
            player.animations.play('right');
            player.body.velocity.x -= 1;
        } else if(player.body.velocity.x < -0.1){
            player.body.velocity.x += 1;
            player.animations.play('left');
        } else {
            player.animations.stop();
        }

    };
}
})
();