(function () {
    describe('Builder tests', function () {
        var builder;

        var gameMock = Init();

        beforeEach(function () {
            builder = new Builder(gameMock);
        });

        describe('build player', function(){
            it('player should not be empty', function(){
                var player = builder.build('player');

                expect(player).not.toBeUndefined();
            })
        });
    })
})();