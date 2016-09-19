var Game = (function (Config, Builder, Inputs) {
    return function (game) {
        //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

        var cfg, builder, inputs;

        var player, platforms, bricks, bullets, score;

        var animationRun;

        var timer;

        this.init = function () {
            cfg = new Config();

            builder = new Builder(game);

            inputs = new Inputs(game);


            //Set the background colour to blue
            game.stage.backgroundColor = cfg.BACKGROUND_COLOR;

            //Enable the Arcade physics system
            game.physics.startSystem(cfg.PHYSICS);

            cfg.BASE_SIZE = game.cache.getImage('tile').height;
        };

        this.create = function () {
            platforms = builder.build('platforms');

            bricks = builder.build('bricks');

            bullets = builder.build('bullets');

            player = builder.build('player');

            score = builder.build('score');

            initControls();

            initPlatforms();

            timer = runPlatforms(addPlatform);
        };

        this.update = function () {
            checkCollisions();

            checkPlayerPosition();

            handlePlayerAnimation();
        };

        var destroyBrick = function (brick, bullet) {
            brick.kill();

            bullet.kill();

            game.camera.shake(cfg.CAMERA_AMP, cfg.CAMERA_DURATION);
        };

        var initPlatforms = function () {
            var spacing = 3 * cfg.BASE_SIZE;

            var bottom = game.world.height - cfg.BASE_SIZE,
                top = cfg.BASE_SIZE;

            //Keep creating platforms until they reach (near) the top of the screen
            for (var y = bottom; y > top - cfg.BASE_SIZE; y = y - spacing) {
                addPlatform(y);
            }
        };

        var addPlatform = function (y) {
            //If no y position is supplied, render it just outside of the screen

            if (typeof(y) == "undefined") {
                y = -cfg.BASE_SIZE;

                score.increment();
            }

            //Work out how many tiles we need to fit across the whole screen
            var tilesNeeded = Math.ceil(game.world.width / cfg.BASE_SIZE);

            //Add a hole randomly somewhere
            var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;

            //Keep creating tiles next to each other until we have an entire row
            //Don't add tiles where the random hole is
            for (var i = -1; i <= tilesNeeded; i++) {
                if (i != hole && i != hole + 1) {
                    addTile(i * cfg.BASE_SIZE, y);
                }
                else if (Math.floor(Math.random() * 10) + 1 > cfg.BRICK_APPEAR_RATE) {
                    addBrick(i * cfg.BASE_SIZE, y);
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

        var initControls = function () {
            inputs.initPad({
                onRightTrigger: function (button, value) {
                    if (player.body.wasTouching.down) {
                        animationRun = false;

                        player.body.velocity.y = -value * cfg.PLAYER_MAX_VERTICAL_VELOCITY;
                    }
                },

                onStickAxisChanged: function (pad, axis, value) {
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
                },

                onAButtonDown: function(){bullets.shoot(player.body.x, player.body.y - cfg.BASE_SIZE / 2)}
            });

            inputs.initKeyboard({
                onDownCallback: function (button) {
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
                            bullets.shoot(player.body.x, player.body.y - cfg.BASE_SIZE / 2);

                            break;
                    }
                },

                onUpKeyboard: function (button) {
                if ([Phaser.KeyCode.RIGHT, Phaser.KeyCode.LEFT].indexOf(button.keyCode) !== -1) {
                    animationRun = false;
                }
            }
            })
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


    }
})(Config, Builder, Inputs);