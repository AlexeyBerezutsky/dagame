var Game = (function (Cfg) {
    return function (game) {
        //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

        var cfg;

        var player, platforms, bricks, bullets;

        var input = {};

        var animationRun;

        var timer;

        var score;

        this.init = function () {

            cfg = new Cfg();

            score = {
                value: 0,

                label: ''
            };
            //Set the background colour to blue
            game.stage.backgroundColor = cfg.BACKGROUND_COLOR;

            //Enable the Arcade physics system
            game.physics.startSystem(cfg.PHYSICS);

            cfg.hitchSize = game.cache.getImage('tile').height;
        };

        this.create = function () {
            createHitches();

            initPlatforms();

            timer = runPlatforms(addPlatform);

            bullets = createBullets();

            player = createPlayer();

            initControls();

            createScore();
        };

        this.update = function () {
            checkCollisions();

            checkPlayerPosition();

            handlePlayerAnimation();
        };

        var createHitches = function () {
            platforms = createPlatforms();

            bricks = createBricks();
        };

        var createBricks = function () {
            var bricks = game.add.group();

            bricks.enableBody = true;

            //create pool of objects;

            bricks.createMultiple(cfg.BRICK_CACHE_SIZE, 'brick');

            return bricks;
        };

        var destroyBrick = function (brick, bullet) {
            brick.kill();

            bullet.kill();

            game.camera.shake(cfg.CAMERA_AMP, cfg.CAMERA_DURATION);
        };

        var createPlatforms = function () {
            var platforms = game.add.group();

            platforms.enableBody = true;

            //create pool of objects;

            platforms.createMultiple(cfg.TILE_CACHE_SIZE, 'tile');

            return platforms;
        };

        var initPlatforms = function () {
            var spacing = 3 * cfg.hitchSize;

            var bottom = game.world.height - cfg.hitchSize,
                top = cfg.hitchSize;

            //Keep creating platforms until they reach (near) the top of the screen
            for (var y = bottom; y > top - cfg.hitchSize; y = y - spacing) {
                addPlatform(y);
            }
        };

        var addPlatform = function (y) {
            //If no y position is supplied, render it just outside of the screen

            if (typeof(y) == "undefined") {
                y = -cfg.hitchSize;

                incrementScore();
            }

            //Work out how many tiles we need to fit across the whole screen
            var tilesNeeded = Math.ceil(game.world.width / cfg.hitchSize);

            //Add a hole randomly somewhere
            var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;

            //Keep creating tiles next to each other until we have an entire row
            //Don't add tiles where the random hole is
            for (var i = -1; i <= tilesNeeded; i++) {
                if (i != hole && i != hole + 1) {
                    addTile(i * cfg.hitchSize, y);
                }
                else if (Math.floor(Math.random() * 10) + 1 > cfg.BRICK_APPEAR_RATE) {
                    addBrick(i * cfg.hitchSize, y);
                }
            }
        };

        var addTile = function (x, y) {
            //Get a tile that is not currently on screen
            var tile = platforms.getFirstDead();

            //Reset it to the specified coordinates
            tile.reset(x, y);

            tile.body.velocity.y = cfg.PLATFORM_SPEED;

            tile.body.immovable = true;

            //When the tile leaves the screen, kill it
            tile.checkWorldBounds = true;

            tile.outOfBoundsKill = true;
        };

        var addBrick = function (x, y) {
            //Get a tile that is not currently on screen
            var brick = bricks.getFirstDead();

            //Reset it to the specified coordinates
            brick.reset(x, y);

            brick.body.velocity.y = cfg.PLATFORM_SPEED;

            brick.body.immovable = true;

            //When the tile leaves the screen, kill it
            brick.checkWorldBounds = true;

            brick.outOfBoundsKill = true;
        };

        var runPlatforms = function (callBack) {
            return game.time.events.loop(cfg.PLATFORM_CREATE_FREQ, callBack, this);
        };

        var createPlayer = function () {
            //Add the player to the game by creating a new sprite
            var player = game.add.sprite(game.world.centerX, game.world.height - 7 * cfg.hitchSize, 'baddie');

            player.scale.set(2);

            player.smoothed = true;

            //Set the players anchor point to be in the middle horizontally
            player.anchor.setTo(0.5, 1.0);

            //Enable physics on the player
            game.physics.arcade.enable(player);

            //Make the player fall by applying gravity
            player.body.gravity.y = cfg.PLAYER_GRAVITY;

            //Make the player collide with the game boundaries
            player.body.collideWorldBounds = true;

            player.animations.add('left', [1, 0], 10, true);

            player.animations.add('right', [3, 2], 10, true);

            player.frame = 1;

            player.body.bounce.set(cfg.PLAYER_BOUNCE);

            return player;
        };

        var initControls = function () {
            input.pad = initPad();

            input.keyboard = initKeyBoard();
        };

        var initPad = function () {
            var gamepad = game.input.gamepad;

            gamepad.start();

            if (gamepad.supported && gamepad.active) {
                var pad = game.input.gamepad.pad1;

                if (pad) {
                    pad.addCallbacks(this, {onConnect: addButtons});
                } else {
                    console.log('can not find first gamepad');
                }
                return pad;
            } else {
                console.log('Gamepad is not supported');
            }
        };

        var addButtons = function () {
            var rightTriggerButton = input.pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

            rightTriggerButton.onFloat.add(onRightTrigger);

            input.pad.addCallbacks(this, {
                onAxis: onStickAxisChanged
            });

            var AButton = input.pad.getButton(Phaser.Gamepad.XBOX360_A);

            AButton.onDown.add(shootBullet);
        };

        var onRightTrigger = function (button, value) {
            if (player.body.wasTouching.down) {
                animationRun = false;

                player.body.velocity.y = -value * cfg.PLAYER_MAX_VERTICAL_VELOCITY;
            }
        };

        var onStickAxisChanged = function (pad, axis, value) {
            if (value < -0.1) {
                animationRun = true;

                player.body.velocity.x = value * cfg.PLAYER_MAX_HORISONTAL_VELOCITY;
            }
            else if (value > 0.1) {
                animationRun = true;

                player.body.velocity.x = value * cfg.PLAYER_MAX_HORISONTAL_VELOCITY;
            } else {
                animationRun = false;
            }
        };

        var initKeyBoard = function () {
            var keyboard = game.input.keyboard;

            keyboard.onDownCallback = onDownKeyboard;

            keyboard.onUpCallback = onUpKeyboard;

            return keyboard;
        };

        var onDownKeyboard = function (button) {
            switch (button.keyCode) {
                case Phaser.KeyCode.UP:
                    if (player.body.wasTouching.down) {
                        animationRun = false;

                        player.body.velocity.y = -cfg.PLAYER_MAX_VERTICAL_VELOCITY/2;
                    }

                    break;

                case Phaser.KeyCode.RIGHT:
                    animationRun = true;

                    player.body.velocity.x = cfg.PLAYER_MAX_HORISONTAL_VELOCITY/2;

                    break;

                case Phaser.KeyCode.LEFT:
                    animationRun = true;

                    player.body.velocity.x = -cfg.PLAYER_MAX_HORISONTAL_VELOCITY/2;

                    break;

                case Phaser.KeyCode.SPACEBAR:
                    shootBullet();

                    break;
            }
        };

        var onUpKeyboard = function (button) {
            if ([Phaser.KeyCode.RIGHT, Phaser.KeyCode.LEFT].indexOf(button.keyCode) !== -1) {
                animationRun = false;
            }
        };

        var createScore = function () {
            var scoreFont = "100px Arial";

            score.label = game.add.text((game.world.centerX), 100, "0", {font: cfg.SCORE_FONT, fill: cfg.SCORE_COLOR});

            score.label.anchor.setTo(0.5, 0.5);

            score.label.align = 'center';
        };

        var incrementScore = function () {
            score.value += cfg.SCORE_INCREMENT;

            score.label.text = score.value;
        };

        var gameOver = function () {
            timer.timer.removeAll();

            game.state.start('Game');
        };

        var checkCollisions = function () {
            //Make the sprite collide with the ground layer
            game.physics.arcade.collide(player, platforms);

            game.physics.arcade.collide(platforms, bullets);

            game.physics.arcade.collide(bricks, player);

            game.physics.arcade.overlap(bricks, bullets, destroyBrick, null, game);
        };

        var checkPlayerPosition = function () {
            //Check if the player is touching the bottom
            if (player.body.position.y >= game.world.height - player.body.height) {
                gameOver();
            }
        };

        var handlePlayerAnimation = function () {
            if (!animationRun) {
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

        var createBullets = function () {
            var bullets = game.add.group();

            for (var i = 0; i < cfg.NUMBER_OF_BULLETS; i++) {
                // Create each bullet and add it to the group.
                var bullet = game.add.sprite(0, 0, 'fireball');

                bullet.scale.set(0.05);

                bullets.add(bullet);

                // Set its pivot point to the center of the bullet
                bullet.anchor.setTo(0.5, 0.5);

                // Enable physics on the bullet
                game.physics.arcade.enable(bullet);

                //Make the player fall by applying gravity
                bullet.body.gravity.y = cfg.BULLET_GRAVITY;

                //Make the player collide with the game boundaries
                bullet.body.collideWorldBounds = true;

                bullet.body.bounce.set(cfg.BULLET_BOUNCE);

                // Set its initial state to "dead".
                bullet.kill();
            }

            return bullets;
        };

        var shootBullet = function () {
            // Enforce a short delay between shots by recording
            // the time that each bullet is shot and testing if
            // the amount of time since the last shot is more than
            // the required delay.
            var lastBulletShotAt;

            if (lastBulletShotAt === undefined) {
                lastBulletShotAt = 0;
            }

            if (game.time.now - lastBulletShotAt < cfg.SHOT_DELAY) {
                return;
            }

            lastBulletShotAt = game.time.now;

            // Get a dead bullet from the pool
            var bullet = bullets.getFirstDead();

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
            bullet.reset(player.x, player.y - cfg.hitchSize / 2);

            // Shoot it
            bullet.body.velocity.x = 0;

            bullet.body.velocity.y = -cfg.BULLET_SPEED;
        };
    }
})(Config);