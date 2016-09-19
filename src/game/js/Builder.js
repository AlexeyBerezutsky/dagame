var Builder = (function(Cfg){
    return function (game) {
        var self = this;

        self.game = game;

        var cfg = new Cfg();

        var buildPlatforms = function () {
            var platforms = self.game.add.group();

            platforms.enableBody = true;

            //create pool of objects;

            platforms.createMultiple(cfg.TILE_CACHE_SIZE, 'tile');

            return platforms;
        };

        var buildPlayer = function () {
            //Add the player to the game by creating a new sprite
            var player = self.game.add.sprite(self.game.world.centerX, self.game.world.height - 7 * cfg.BASE_SIZE, 'baddie');

            player.scale.set(2);

            player.smoothed = true;

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

            return player;
        };

        var buildBricks = function () {
            var bricks = self.game.add.group();

            bricks.enableBody = true;

            //create pool of objects;

            bricks.createMultiple(cfg.BRICK_CACHE_SIZE, 'brick');

            return bricks;
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

            bullets.shoot = function (sourcex,sourcey) {
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
            score.label = game.add.text((game.world.centerX), 100, "0", {font: cfg.SCORE_FONT, fill: cfg.SCORE_COLOR});

            score.label.anchor.setTo(0.5, 0.5);

            score.label.align = cfg.SCORE_ALIGN;

            score.increment = function () {
                this.value += cfg.SCORE_INCREMENT;

                this.label.text = score.value;
            };

            return score;
        };

        var builders = {
            'player': buildPlayer,

            'platforms': buildPlatforms,

            'bricks': buildBricks,

            'bullets': buildBullets,

            'score': buildScore
        };

        self.build = function(name, args){
            return builders[name](args);
        };
    }
})(Config);