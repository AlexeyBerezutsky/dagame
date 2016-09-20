var Builder = (function (Cfg) {
    return function (game) {
        var self = this;

        self.game = game;

        var cfg = new Cfg();

        var buildPlayer = function () {
            //Add the player to the game by creating a new sprite
            var player = self.game.add.sprite(self.game.world.centerX, self.game.world.height - 7 * cfg.BASE_SIZE, 'baddie');

            player.isRunning = false;

            player.scale.set(2);

            //Set the players anchor point to be in the middle horizontally
            player.anchor.setTo(0.5, 1.0);

            //Enable physics on the player
            self.game.physics.arcade.enable(player);

            //Make the player fall by applying gravity
            player.body.gravity.y = cfg.PLAYER_GRAVITY;

            //Make the player collide with the game boundaries
            player.body.collideWorldBounds = true;

            player.animations.add('left', [1, 0], 10, true);

            player.animations.add('right', [3, 2], 10, true);

            player.frame = 1;

            player.body.bounce.set(cfg.PLAYER_BOUNCE);

            player.friction = function () {
                if (this.isRunning) {
                    return;
                }

                if (player.body.velocity.x > cfg.PLAYER_VELOCITY_TRESHOLD) {
                    player.body.velocity.x -= cfg.PLAYER_MAX_HORISONTAL_VELOCITY / cfg.PLAYER_FRICTION_COEFFITIENT;
                } else if (player.body.velocity.x < -cfg.PLAYER_VELOCITY_TRESHOLD) {
                    player.body.velocity.x += cfg.PLAYER_MAX_HORISONTAL_VELOCITY / cfg.PLAYER_FRICTION_COEFFITIENT;
                }
            };

            player.animation = function () {
                if (!this.isRunning) {
                    this.animations.stop();

                    if (this.body.velocity.x > 0.01) {
                        this.frame = 2;
                    } else if (this.body.velocity.x < -0.01) {
                        this.frame = 1;
                    }
                }
                else {
                    if (this.body.velocity.x > cfg.PLAYER_VELOCITY_TRESHOLD) {
                        this.animations.play('right');
                    } else if (this.body.velocity.x < -cfg.PLAYER_VELOCITY_TRESHOLD) {
                        this.animations.play('left');
                    }
                }
            };

            return player;
        };

        var buildTiles = function () {
            var tiles = self.game.add.group();

            tiles.enableBody = true;

            //create pool of objects;

            tiles.createMultiple(cfg.TILE_CACHE_SIZE, 'tile');

            tiles.addAt = function (x, y) {
                //Get a tile that is not currently on screen
                var tile = this.getFirstDead();

                //Reset it to the specified coordinates
                tile.reset(x, y);

                tile.body.velocity.y = cfg.PLATFORM_SPEED;

                tile.body.immovable = true;

                //When the tile leaves the screen, kill it
                tile.checkWorldBounds = true;

                tile.outOfBoundsKill = true;
            };

            return tiles;
        };

        var buildBricks = function () {
            var bricks = self.game.add.group();

            bricks.enableBody = true;

            //create pool of objects;

            bricks.createMultiple(cfg.BRICK_CACHE_SIZE, 'brick');

            bricks.addAt = function (x, y) {
                //Get a tile that is not currently on screen
                var brick = this.getFirstDead();

                //Reset it to the specified coordinates
                brick.reset(x, y);

                brick.body.velocity.y = cfg.PLATFORM_SPEED;

                brick.body.immovable = true;

                //When the tile leaves the screen, kill it
                brick.checkWorldBounds = true;

                brick.outOfBoundsKill = true;
            };

            return bricks;
        };

        var buildPlatforms = function (args) {
            //If no y position is supplied, render it just outside of the screen

            if (typeof(args.verticalPosition) == "undefined") {
                args.verticalPosition = -cfg.BASE_SIZE;

                args.triggerOnLap();
            }

            //Work out how many tiles we need to fit across the whole screen
            var tilesNeeded = Math.ceil(self.game.world.width / cfg.BASE_SIZE);

            //Add a hole randomly somewhere
            var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;

            //Keep creating tiles next to each other until we have an entire row
            //Don't add tiles where the random hole is
            for (var i = -1; i <= tilesNeeded; i++) {
                if (i != hole && i != hole + 1) {
                    args.tiles.addAt(i * cfg.BASE_SIZE, args.verticalPosition);
                }
                else if (Math.floor(Math.random() * 10) + 1 > cfg.BRICK_APPEAR_RATE) {
                    args.bricks.addAt(i * cfg.BASE_SIZE, args.verticalPosition);
                }
            }
        };

        var buildBullets = function () {
            var bullets = self.game.add.group();

            for (var i = 0; i < cfg.NUMBER_OF_BULLETS; i++) {
                // Create each bullet and add it to the group.
                var bullet = self.game.add.sprite(0, 0, 'fireball');

                bullet.scale.set(0.05);

                bullets.add(bullet);

                // Set its pivot point to the center of the bullet
                bullet.anchor.setTo(0.5, 0.5);

                // Enable physics on the bullet
                self.game.physics.arcade.enable(bullet);

                //Make the player fall by applying gravity
                bullet.body.gravity.y = cfg.BULLET_GRAVITY;

                bullet.body.bounce.set(cfg.BULLET_BOUNCE);

                // Set its initial state to "dead".
                bullet.kill();
            }

            bullets.shoot = function (sourcex, sourcey) {
                // Enforce a short delay between shots by recording
                // the time that each bullet is shot and testing if
                // the amount of time since the last shot is more than
                // the required delay.
                var lastBulletShotAt;

                if (lastBulletShotAt === undefined) {
                    lastBulletShotAt = 0;
                }

                if (self.game.time.now - lastBulletShotAt < cfg.SHOT_DELAY) {
                    return;
                }

                lastBulletShotAt = self.game.time.now;

                // Get a dead bullet from the pool
                var bullet = bullets.getFirstDead();

                // If there aren't any bullets available then don't shoot
                if (bullet === null || bullet === undefined) return;

                // Revive the bullet
                // This makes the bullet "alive"
                bullet.revive();

                bullet.outOfBoundsKill = true;

                // Set the bullet position to the gun position.
                bullet.reset(sourcex, sourcey);

                // Shoot it
                bullet.body.velocity.x = 0;

                bullet.body.velocity.y = -cfg.BULLET_SPEED;
            };

            return bullets;
        };

        var buildScore = function () {
            var score = {
                value: 0,

                label: ''
            };
            score.label = self.game.add.text((self.game.world.centerX), 100, "0", {font: cfg.SCORE_FONT, fill: cfg.SCORE_COLOR});

            score.label.anchor.setTo(0.5, 0.5);

            score.label.align = cfg.SCORE_ALIGN;

            var increment = function () {
                this.value += cfg.SCORE_INCREMENT;

                this.label.text = score.value;
            };

            score.increment = increment.bind(score);

            return score;
        };

        var builders = {
            'player': buildPlayer,

            'tiles': buildTiles,

            'bricks': buildBricks,

            'platforms': buildPlatforms,

            'bullets': buildBullets,

            'score': buildScore
        };

        self.build = function (name, args) {
            return builders[name](args);
        };
    }
})(Config);