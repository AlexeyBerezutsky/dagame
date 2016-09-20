var Init = (function (Boot, Game) {
    return function() {
        var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameContainer');

        game.state.add('Boot', Boot);

        game.state.add('Game', Game);

        game.state.start('Boot');

        return game;
    };
})(Boot, Game);

Init();