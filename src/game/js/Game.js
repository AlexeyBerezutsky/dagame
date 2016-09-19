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

            createHitches();

            initPlatforms();

            game.source.timer = runPlatforms(addPlatform);

            createBullets();

            createPlayer();

            initControls();

            createScore();
        };

        this.update = function () {
            checkCollisions();

            checkPlayerPosition();

            handlePlayerAnimation();
        };

        var createHitches = function(){
            game.source.platforms = createPlatforms();

            game.source.bricks = createBricks();
        };

        var createBricks = function(){
            var bricks = game.add.group();

            bricks.enableBody = true;

            //create pool of objects;

            bricks.createMultiple(10, 'brick');

            return bricks;
        };

        var destroyBrick = function(brick, bullet){
            brick.kill();

            bullet.kill();

            game.camera.shake(0.05, 500);
        };

        var createPlatforms = function () {
            var platforms = game.add.group();

            platforms.enableBody = true;

            //create pool of objects;

            platforms.createMultiple(250, 'tile');

            return platforms;
        };

        var initPlatforms = function () {
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
            for (var i = -1; i <= tilesNeeded; i++) {
                if (i != hole && i != hole + 1) {
                    addTile(i * tileWidth, y);
                }
                else {//if(Math.floor(Math.random() * 10) + 1 > 8  ){
                    addBrick(i * tileWidth, y);
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

        var addBrick = function(x,y){
            //Get a tile that is not currently on screen
            var brick = game.source.bricks.getFirstDead();

            //Reset it to the specified coordinates
            brick.reset(x, y);

            brick.body.velocity.y = 150;

            brick.body.immovable = true;

            //When the tile leaves the screen, kill it
            brick.checkWorldBounds = true;

            brick.outOfBoundsKill = true;
        };

        var runPlatforms = function (callBack) {
            return game.time.events.loop(1500, callBack, this);
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

            pad.addCallbacks(this, {
                onAxis: onStickAxisChanged
            });
        };

        var onRightTrigger = function (button, value) {
            var player = game.source.player;
            if (player.body.wasTouching.down) {
                game.source.animationRun = false;

                player.body.velocity.y = -value * 3000;
            }
        };

        var onStickAxisChanged = function (pad, axis, value) {
            var player = game.source.player;

            if (value < -0.1) {
                game.source.animationRun = true;

                player.body.velocity.x = value * 500;
            }
            else if (value > 0.1) {
                game.source.animationRun = true;

                player.body.velocity.x = value * 500;
            } else {
                game.source.animationRun = false;
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

                case Phaser.KeyCode.SPACEBAR:
                    shootBullet();

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
            //Make the sprite collide with the ground layer
            game.physics.arcade.collide(game.source.player, game.source.platforms);

            game.physics.arcade.collide(game.source.platforms, game.source.bullets);

            game.physics.arcade.collide(game.source.bricks, game.source.player);

            game.physics.arcade.overlap(game.source.bricks, game.source.bullets, destroyBrick, null, game);
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
                } else {

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

        // Setup the example
       var createBullets = function() {
           game.source.SHOT_DELAY = 10; // milliseconds (10 bullets/second)

           game.source.BULLET_SPEED = 500; // pixels/second

           game.source.NUMBER_OF_BULLETS = 20;

            // Create an object pool of bullets

           var bullets = game.add.group();

            for(var i = 0; i <  game.source.NUMBER_OF_BULLETS; i++) {
                // Create each bullet and add it to the group.
                var bullet = game.add.sprite(0, 0, 'fireball');

                bullet.scale.set(0.05);

                bullets.add(bullet);

                // Set its pivot point to the center of the bullet
                bullet.anchor.setTo(0.5, 0.5);

                // Enable physics on the bullet
                game.physics.arcade.enable(bullet);

                //Make the player fall by applying gravity
                bullet.body.gravity.y = 500;

                //Make the player collide with the game boundaries
                bullet.body.collideWorldBounds = true;

                bullet.body.bounce.set(0.8);

                // Set its initial state to "dead".
                bullet.kill();
            }

           game.source.bullets = bullets;
        };

        var shootBullet = function() {
            // Enforce a short delay between shots by recording
            // the time that each bullet is shot and testing if
            // the amount of time since the last shot is more than
            // the required delay.
            var lastBulletShotAt;

            if (lastBulletShotAt === undefined) {lastBulletShotAt = 0;}

            if (game.time.now - lastBulletShotAt < game.source.SHOT_DELAY) {return;}

            lastBulletShotAt = game.time.now;

            // Get a dead bullet from the pool
            var bullet = game.source.bullets.getFirstDead();

            // If there aren't any bullets available then don't shoot
            if (bullet === null || bullet === undefined) return;

            // Revive the bullet
            // This makes the bullet "alive"
            bullet.revive();

            // Bullets should kill themselves when they leave the world.
            // Phaser takes care of this for me by setting this flag
            // but you can do it yourself by killing the bullet if
            // its x,y coordinates are outside of the world.
            bullet.checkWorldBounds = true;

            bullet.outOfBoundsKill = true;

            // Set the bullet position to the gun position.
            bullet.reset(game.source.player.x, game.source.player.y);

            // Shoot it
            bullet.body.velocity.x = 0;

            bullet.body.velocity.y = -game.source.BULLET_SPEED;
        };
    }
})();