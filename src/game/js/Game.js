var Game = (function(){
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

        this.init = function () {

            //Get the dimensions of the tile we are using
            tileWidth = game.cache.getImage('tile').width;
            tileHeight = game.cache.getImage('tile').height;

            //Set the background colour to blue
            game.stage.backgroundColor = '479cde';

            //Enable the Arcade physics system
            game.physics.startSystem(Phaser.Physics.ARCADE);

        };

        this.create = function () {
            //Add a platforms group to hold all of our tiles, and create a bunch of them
            game.platforms = game.add.group();
            game.platforms.enableBody = true;
            game.platforms.createMultiple(250, 'tile');

            //The spacing for the initial platforms
            game.spacing = 300;

//Create the inital on screen platforms
            initPlatforms();

            var timer = game.time.events.loop(2000, addPlatform, this);
        };


        var addTile = function(x, y){

            //Get a tile that is not currently on screen
            var tile = game.platforms.getFirstDead();

            //Reset it to the specified coordinates
            tile.reset(x, y);
            tile.body.velocity.y = 150;
            tile.body.immovable = true;

            //When the tile leaves the screen, kill it
            tile.checkWorldBounds = true;
            tile.outOfBoundsKill = true;
        };

        var addPlatform = function(y){

            var me = this;

            //If no y position is supplied, render it just outside of the screen
            if(typeof(y) == "undefined"){
                y = -tileHeight;
            }

            //Work out how many tiles we need to fit across the whole screen
            var tilesNeeded = Math.ceil(game.world.width / tileWidth);

            //Add a hole randomly somewhere
            var hole = Math.floor(Math.random() * (tilesNeeded - 3)) + 1;

            //Keep creating tiles next to each other until we have an entire row
            //Don't add tiles where the random hole is
            for (var i = 0; i < tilesNeeded; i++){
                if (i != hole && i != hole + 1){
                    addTile(i * tileWidth, y);
                }
            }

        };

        var initPlatforms =function(){

            var me = this,
                bottom = game.world.height - tileHeight,
                top = tileHeight;

            //Keep creating platforms until they reach (near) the top of the screen
            for(var y = bottom; y > top - tileHeight; y = y - game.spacing){
                addPlatform(y);
            }

        };

        this.update = function () {

        };

    }

})();