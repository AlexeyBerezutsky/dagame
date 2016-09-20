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

        //self.InitVirtualKeyboard = function(callBacks){
        //    buttonjump = game.add.button(600, 500, 'buttonjump', null, this, 0, 1, 0, 1);  //game, x, y, key, callback, callbackContext, overFrame, outFrame, downFrame, upFrame
        //    buttonjump.fixedToCamera = true;  //our buttons should stay on the same place
        //    buttonjump.events.onInputOver.add(function(){jump=true;});
        //    buttonjump.events.onInputOut.add(function(){jump=false;});
        //    buttonjump.events.onInputDown.add(function(){jump=true;});
        //    buttonjump.events.onInputUp.add(function(){jump=false;});
        //
        //    buttonfire = game.add.button(700, 500, 'buttonfire', null, this, 0, 1, 0, 1);
        //    buttonfire.fixedToCamera = true;
        //    buttonfire.events.onInputOver.add(function(){fire=true;});
        //    buttonfire.events.onInputOut.add(function(){fire=false;});
        //    buttonfire.events.onInputDown.add(function(){fire=true;});
        //    buttonfire.events.onInputUp.add(function(){fire=false;});
        //
        //    buttonleft = game.add.button(0, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        //    buttonleft.fixedToCamera = true;
        //    buttonleft.events.onInputOver.add(function(){left=true;});
        //    buttonleft.events.onInputOut.add(function(){left=false;});
        //    buttonleft.events.onInputDown.add(function(){left=true;});
        //    buttonleft.events.onInputUp.add(function(){left=false;});
        //
        //    buttonbottomleft = game.add.button(32, 536, 'buttondiagonal', null, this, 6, 4, 6, 4);
        //    buttonbottomleft.fixedToCamera = true;
        //    buttonbottomleft.events.onInputOver.add(function(){left=true;duck=true;});
        //    buttonbottomleft.events.onInputOut.add(function(){left=false;duck=false;});
        //    buttonbottomleft.events.onInputDown.add(function(){left=true;duck=true;});
        //    buttonbottomleft.events.onInputUp.add(function(){left=false;duck=false;});
        //
        //    buttonright = game.add.button(160, 472, 'buttonhorizontal', null, this, 0, 1, 0, 1);
        //    buttonright.fixedToCamera = true;
        //    buttonright.events.onInputOver.add(function(){right=true;});
        //    buttonright.events.onInputOut.add(function(){right=false;});
        //    buttonright.events.onInputDown.add(function(){right=true;});
        //    buttonright.events.onInputUp.add(function(){right=false;});
        //
        //    buttonbottomright = game.add.button(160, 536, 'buttondiagonal', null, this, 7, 5, 7, 5);
        //    buttonbottomright.fixedToCamera = true;
        //    buttonbottomright.events.onInputOver.add(function(){right=true;duck=true;});
        //    buttonbottomright.events.onInputOut.add(function(){right=false;duck=false;});
        //    buttonbottomright.events.onInputDown.add(function(){right=true;duck=true;});
        //    buttonbottomright.events.onInputUp.add(function(){right=false;duck=false;});
        //
        //    buttondown = game.add.button(96, 536, 'buttonvertical', null, this, 0, 1, 0, 1);
        //    buttondown.fixedToCamera = true;
        //    buttondown.events.onInputOver.add(function(){duck=true;});
        //    buttondown.events.onInputOut.add(function(){duck=false;});
        //    buttondown.events.onInputDown.add(function(){duck=true;});
        //    buttondown.events.onInputUp.add(function(){duck=false;});
        //}
    };
})();