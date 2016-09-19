var Builder = (function(Cfg){
    return function (game) {
        var self = this;

        var cfg = new Cfg();

        var buildPlatforms = function () {
            var platforms = game.add.group();

            platforms.enableBody = true;

            //create pool of objects;

            platforms.createMultiple(cfg.TILE_CACHE_SIZE, 'tile');

            return platforms;
        };

        var buildPlayer = function () {
            //Add the player to the game by creating a new sprite
            var player = game.add.sprite(game.world.centerX, game.world.height - 7 * cfg.BASE_SIZE, 'baddie');

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

        var buildBricks = function () {
            var bricks = game.add.group();

            bricks.enableBody = true;

            //create pool of objects;

            bricks.createMultiple(cfg.BRICK_CACHE_SIZE, 'brick');

            return bricks;
        };

        var buildBullets = function () {
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

        var builders = {
            'player': buildPlayer,

            'platforms': buildPlatforms,

            'bricks': buildBricks,

            'bullets': buildBullets
        };

        self.build = function(name){
            return builders[name]
        };
    }
})(Config);