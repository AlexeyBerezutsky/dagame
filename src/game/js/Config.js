var Config = new (function () {
    return function () {
        var self = this;
        
        self.PLATFORM_SPEED = 80;

        self.PLATFORM_CREATE_FREQ = 3000;

        self.PLAYER_GRAVITY = 2000;

        self.PLAYER_BOUNCE = 0.1;

        self.PLAYER_MAX_VERTICAL_VELOCITY = 3000;

        self. PLAYER_MAX_HORISONTAL_VELOCITY = 500;

        self.PLAYER_FRICTION_COEFFITIENT = 100;

        self.PLAYER_VELOCITY_TRESHOLD = 100;

        self.SHOT_DELAY = 10;

        self.BULLET_SPEED = 700;

        self.NUMBER_OF_BULLETS = 20;

        self.BULLET_GRAVITY = 500;

        self.BULLET_BOUNCE = 0.8;

        self.BACKGROUND_COLOR = '479cde';

        self.PHYSICS = Phaser.Physics.ARCADE;

        self.BRICK_CACHE_SIZE = 10;

        self.TILE_CACHE_SIZE = 250;

        self.CAMERA_AMP = 0.05;

        self.CAMERA_DURATION = 500;

        self.BRICK_APPEAR_RATE = 8;

        self.SCORE_FONT = "100px Arial";

        self.SCORE_ALIGN = "center";

        self.SCORE_COLOR = "#fff";

        self.SCORE_INCREMENT = 1;

        self.BASE_SIZE = 64;
    };
})();