var Game = (function (Config, Builder, Inputs) {
    return function (game) {
        //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

        var cfg, builder, inputs;

        var player, bullets, score, tiles, bricks;

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
        };

        this.create = function () {
            tiles = builder.build('tiles');

            bricks = builder.build('bricks');

            bullets = builder.build('bullets');

            player = builder.build('player');

            score = builder.build('score');

            initControls();

            initPlatforms();

            timer = runPlatforms(function () {
                builder.build('platforms', {tiles: tiles, bricks: bricks, triggerOnLap: score.increment});
            });
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
                        player.isRunning = true;

                        player.body.velocity.x = value * cfg.PLAYER_MAX_HORISONTAL_VELOCITY;
                    }
                    else if (value > 0.1) {
                        player.isRunning = true;

                        player.body.velocity.x = value * cfg.PLAYER_MAX_HORISONTAL_VELOCITY;
                    } else {
                        player.isRunning = false;
                    }
                },

                onAButtonDown: function () {
                    bullets.shoot(player.body.x + cfg.BASE_SIZE / 2, player.body.y - cfg.BASE_SIZE / 2);
                }
            });

            inputs.initKeyboard({
                onDownKeyCallback: function (button) {
                    switch (button.keyCode) {
                        case Phaser.KeyCode.UP:
                            if (player.body.wasTouching.down) {
                                player.isRunning = false;

                                player.body.velocity.y = -cfg.PLAYER_MAX_VERTICAL_VELOCITY / 2;
                            }

                            break;

                        case Phaser.KeyCode.RIGHT:
                            player.isRunning = true;

                            player.body.velocity.x = cfg.PLAYER_MAX_HORISONTAL_VELOCITY / 2;

                            break;

                        case Phaser.KeyCode.LEFT:
                            player.isRunning = true;

                            player.body.velocity.x = -cfg.PLAYER_MAX_HORISONTAL_VELOCITY / 2;

                            break;

                        case Phaser.KeyCode.SPACEBAR:
                            bullets.shoot(player.body.x + cfg.BASE_SIZE / 2, player.body.y - cfg.BASE_SIZE / 2);

                            break;
                    }
                },

                onUpKeyboard: function (button) {
                    if ([Phaser.KeyCode.RIGHT, Phaser.KeyCode.LEFT].indexOf(button.keyCode) !== -1) {
                        player.isRunning = false;
                    }
                }
            })
        };

        var initPlatforms = function () {
            var spacing = 3 * cfg.BASE_SIZE;

            var bottom = game.world.height - cfg.BASE_SIZE,
                top = cfg.BASE_SIZE;

            //Keep creating platforms until they reach (near) the top of the screen
            for (var y = bottom; y > top - cfg.BASE_SIZE; y = y - spacing) {
                builder.build('platforms', {
                    verticalPosition: y,

                    tiles: tiles,

                    bricks: bricks,

                    triggerOnLap: score.increment
                });
            }
        };

        var runPlatforms = function (callBack) {
            return game.time.events.loop(cfg.PLATFORM_CREATE_FREQ, callBack, this);
        };

        this.update = function () {
            checkCollisions();

            checkPlayerPosition();

            player.friction();

            player.animation();
        };

        var checkCollisions = function () {
            //Make the sprite collide with the ground layer
            game.physics.arcade.collide(player, tiles);

            game.physics.arcade.collide(tiles, bullets);

            game.physics.arcade.collide(bricks, player);

            game.physics.arcade.overlap(bricks, bullets, destroyBrick, null, game);
        };

        var destroyBrick = function (brick, bullet) {
            brick.kill();

            bullet.kill();

            game.camera.shake(cfg.CAMERA_AMP, cfg.CAMERA_DURATION);
        };

        var checkPlayerPosition = function () {
            //Check if the player is touching the bottom
            if (player.body.position.y >= game.world.height - player.body.height) {
                gameOver();
            }
        };

        var gameOver = function () {
            timer.timer.removeAll();

            game.state.start('Game');
        };
    }
})(Config, Builder, Inputs);