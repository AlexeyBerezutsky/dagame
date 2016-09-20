var Inputs = (function () {
    return function (game) {
        var self = this;

        self.game = game;

        self.initPad = function (callBacks) {
            var gamepads = self.game.input.gamepad;

            gamepads.start();

            if (gamepads.supported && gamepads.active) {
                var pad = gamepads.pad1;

                if (pad) {
                    pad.addCallbacks(this, {
                        onConnect: function () {
                            var rightTriggerButton = pad.getButton(Phaser.Gamepad.XBOX360_RIGHT_TRIGGER);

                            rightTriggerButton.onFloat.add(
                                function (button, value) {
                                    callBacks.onJump(value);
                                });

                            pad.addCallbacks(this, {
                                onAxis: function (pad, axis, value) {
                                    callBacks.onRun(value);
                                }
                            });

                            var AButton = pad.getButton(Phaser.Gamepad.XBOX360_A);

                            AButton.onDown.add(function () {
                                callBacks.onFire();
                            });
                        }
                    });

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

            keyboard.onDownCallback = function (button) {
                switch (button.keyCode) {
                    case Phaser.KeyCode.UP:
                        callBacks.onJump();

                        break;

                    case Phaser.KeyCode.RIGHT:
                        callBacks.onRight();

                        break;

                    case Phaser.KeyCode.LEFT:
                        callBacks.onLeft();

                        break;

                    case Phaser.KeyCode.SPACEBAR:
                        callBacks.onFire();

                        break;
                }
            };

            keyboard.onUpCallback = function (button) {
                if ([Phaser.KeyCode.RIGHT, Phaser.KeyCode.LEFT].indexOf(button.keyCode) !== -1) {
                    callBacks.onStop();
                }
            };

            return keyboard;
        };

        self.initVirtualKeyboard = function (callBacks) {

            var buttonjump = game.add.button(600, 500, 'buttonjump', null, this, 0, 1, 0, 1);  //game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame

            buttonjump.fixedToCamera = true;  //our buttons should stay on the same place

            buttonjump.events.onInputOver.add(callBacks.onJump);

            buttonjump.events.onInputDown.add(callBacks.onJump);

            var buttonfire = game.add.button(700, 500, 'buttonfire', null, this, 0, 1, 0, 1);
            buttonfire.fixedToCamera = true;

            buttonfire.events.onInputOver.add(callBacks.onFire);

            buttonfire.events.onInputDown.add(callBacks.onFire);

            var buttonleft = game.add.button(0, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1);

            buttonleft.fixedToCamera = true;

            buttonleft.events.onInputOver.add(callBacks.onLeft);

            buttonleft.events.onInputOut.add(callBacks.onStop);

            buttonleft.events.onInputDown.add(callBacks.onLeft);

            buttonleft.events.onInputUp.add(callBacks.onStop);

            var buttonright = game.add.button(160, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1);

            buttonright.fixedToCamera = true;

            buttonright.events.onInputOver.add(callBacks.onRight);

            buttonright.events.onInputOut.add(callBacks.onStop);

            buttonright.events.onInputDown.add(callBacks.onRight);

            buttonright.events.onInputUp.add(callBacks.onStop);
        }
    };
})();