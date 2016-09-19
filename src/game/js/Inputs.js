var Inputs = (function () {
    return function (game) {
        self.game = game;

        self.initPad = function (callBacks) {
            var gamepads = self.game.input.gamepad;

            gamepads.start();

            if (gamepads.supported && gamepads.active) {
                var pad = gamepads.pad1;

                if (pad) {
                    pad.addCallbacks(this,{onConnect: function () {
                        var rightTriggerButton = pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

                        rightTriggerButton.onFloat.add(callBacks.onRightTrigger);

                        pad.addCallbacks(this, {
                            onAxis: callBacks.onStickAxisChanged
                        });

                        var AButton = pad.getButton(Phaser.Gamepad.XBOX360_A);

                        AButton.onDown.add(callBacks.onAButtonDown);
                    }});

                    return pad;
                } else {
                    console.log('can not find first gamepad');
                }
            } else {
                console.log('Gamepad is not supported');
            }
        };

        self.initKeyboard = function (callBacks) {
            var keyboard = game.input.keyboard;

            keyboard.onDownCallback = callBacks.onDownKeyboard;

            keyboard.onUpCallback = callBacks.onUpKeyboard;

            return keyboard;
        };
    };
})();