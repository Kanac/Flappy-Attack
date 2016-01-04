/// <reference path="phaser.min.js" />
//var SCREEN_WIDTH = 500;
//var SCREEN_HEIGHT = 600;
var SCREEN_WIDTH = window.innerWidth;
var SCREEN_HEIGHT = window.innerHeight;

var MAP_VELOCITY_X = SCREEN_WIDTH / -2
var GRAVITY_Y = SCREEN_HEIGHT * 2;
var BIRD_WIDTH = 45 * SCREEN_WIDTH / 600;
var BIRD_HEIGHT = BIRD_WIDTH;
var BIRD_VELOCITY_Y = SCREEN_WIDTH * -6 / 8;
var POWERUP_WIDTH = BIRD_WIDTH;
var POWERUP_HEIGHT = BIRD_HEIGHT;
var GODMODE_DURATION = 6000;
var BULLET_WIDTH = BIRD_WIDTH;
var BULLET_HEIGHT = BIRD_HEIGHT;
var MIN_POWERUP_SPAWN_TIME = 600;
var MAX_POWERUP_SPAWN_TIME = 1000;
var MIN_BULLET_SPAWN_TIME = 2500;
var MAX_BULLET_SPAWN_TIME = 5000;
//var MIN_POWERUP_SPAWN_TIME = 300;
//var MAX_POWERUP_SPAWN_TIME = 300;
//var MIN_BULLET_SPAWN_TIME = 500;
//var MAX_BULLET_SPAWN_TIME = 600;
var GROUND_HEIGHT = SCREEN_HEIGHT / 8;
var PIPE_WIDTH = SCREEN_WIDTH / 6;
var PIPE_HEIGHT = SCREEN_HEIGHT / 8;
var PIPE_HEAD_WIDTH = SCREEN_WIDTH / 5;
var PIPE_HEAD_HEIGHT = SCREEN_HEIGHT / 16;
var PIPE_SPAWN_TIME = 1250;

var gameCount = 0; // used to iterate background/bird colour

window.onload = function () {
    document.getElementById("gameDiv").setAttribute("style", "width:" + SCREEN_WIDTH + "px;height:" + SCREEN_HEIGHT + "px; margin: 0 auto");
};

var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, 'gameDiv');

// Create our 'main' state that will contain the game
var mainState = {

    //render: function () {
    //    game.debug.body(this.bird);
    //},

    preload: function () {
        // This function will be executed at the beginning     
        // That's where we load the game's assets  
        game.load.image('background1', 'assets/bg1.png');
        game.load.image('background2', 'assets/bg2.png');
        game.load.image('ground', 'assets/ground.png');
        game.load.image('tap', 'assets/Tap.png');
        game.load.image('getReady', 'assets/GetReady.png');
        game.load.spritesheet('redBird', 'assets/RedBird.png', 64, 64, 3);
        game.load.spritesheet('blueBird', 'assets/BlueBird.png', 64, 64, 3);
        game.load.spritesheet('yellowBird', 'assets/YellowBird.png', 64, 64, 3);
        game.load.image('bonusPoints', 'assets/BonusPoints.png');
        game.load.image('godMode', 'assets/GodMode.png');
        game.load.spritesheet('bullet', 'assets/BulletBoth.png', 68, 69, 2);
        game.load.image('pipe', 'assets/MiddlePipe.png');
        game.load.image('pipeHead', 'assets/EndPipe.png');
        game.load.image('gameOver', 'assets/GameOver.png');
        game.load.image('record', 'assets/Record.png');
        game.load.image('goldMedal', 'assets/GoldMedal.png');
        game.load.image('silverMedal', 'assets/SilverMedal.png');
        game.load.image('bronzeMedal', 'assets/BronzeMedal.png');
        game.load.image('continue', 'assets/Continue.png');
        game.load.image('share', 'assets/Share.png');
        //game.load.audio('godModeSong', 'assets/GodModeSong.mp3');
        //game.load.audio('woosh', 'assets/woosh.mp3');
        //game.load.audio('jump', 'assets/jump.mp3');
        //game.load.audio('score', 'assets/score.mp3');
        //game.load.audio('smack', 'assets/smack.mp3');
        //game.load.audio('boom', 'assets/boom.mp3');
    },

    create: function () {
        // Set the physics system
        game.physics.startSystem(Phaser.Physics.P2JS);
        game.physics.p2.gravity.y = GRAVITY_Y;

        // Assign the physics interaction groups 
        this.birdCollisionGroup = game.physics.p2.createCollisionGroup();
        this.pipeCollisionGroup = game.physics.p2.createCollisionGroup();
        this.powerUpCollisionGroup = game.physics.p2.createCollisionGroup();
        this.bulletCollisionGroup = game.physics.p2.createCollisionGroup();
        this.groundCollisionGroup = game.physics.p2.createCollisionGroup();

        game.physics.p2.updateBoundsCollisionGroup();

        // Initialize background 
        this.background = gameCount % 2 == 0 ? game.add.sprite(0, 0, 'background1') : game.add.sprite(0, 0, 'background2');
        this.background.width = game.width;
        this.background.height = game.height;

        // Iniitalize ground
        this.ground = game.add.tileSprite(0, SCREEN_HEIGHT * 7 / 8, SCREEN_WIDTH, GROUND_HEIGHT, "ground");
        game.physics.p2.enable(this.ground);
        this.ground.anchor.setTo(0);
        this.ground.body.setRectangle(this.ground.width, this.ground.height, this.ground.width * 0.5, this.ground.height * 0.5);
        this.ground.body.setCollisionGroup(this.groundCollisionGroup);
        this.ground.body.collides([this.birdCollisionGroup]);
        this.ground.body.data.gravityScale = 0;

        // Initialize start UI
        this.tap = game.add.sprite(SCREEN_WIDTH * 1 / 2 - (SCREEN_WIDTH / 3) / 2, SCREEN_HEIGHT * 4.5 / 10, 'tap');
        this.tap.width = SCREEN_WIDTH * 1 / 3;
        this.tap.height = SCREEN_HEIGHT * 2 / 10;
        this.getReady = game.add.sprite(SCREEN_WIDTH * 1 / 2 - (SCREEN_WIDTH * 2 / 3) / 2, SCREEN_HEIGHT * 2.5 / 10 + 15, 'getReady');
        this.getReady.width = SCREEN_WIDTH * 2 / 3;
        this.getReady.height = SCREEN_HEIGHT * 1 / 8;

        // Display the bird on the screen
        if (gameCount % 3 == 0)
            this.bird = this.game.add.sprite(game.world.centerX * 6 / 10, game.world.centerY, 'redBird');
        else if (gameCount % 3 == 1)
            this.bird = this.game.add.sprite(game.world.centerX * 6 / 10, game.world.centerY, 'blueBird');
        else
            this.bird = this.game.add.sprite(game.world.centerX * 6 / 10, game.world.centerY, 'yellowBird');

        // Set bird physics and properties
        this.bird.width = BIRD_WIDTH;
        this.bird.height = BIRD_HEIGHT;
        game.physics.p2.enable(this.bird);
        this.bird.body.data.gravityScale = 0;
        this.bird.body.setCircle(this.bird.width / 2);
        this.bird.body.data.shapes[0].sensor = true;   // Set sensor (meaning no physics but still check) after body shape is set 
        this.bird.body.fixedRotation = true;
        this.bird.body.setCollisionGroup(this.birdCollisionGroup);
        this.bird.body.onBeginContact.add(this.hitObject, this);
        this.bird.body.collides([this.pipeCollisionGroup, this.powerUpCollisionGroup, this.bulletCollisionGroup, this.groundCollisionGroup]);
        var flap = this.bird.animations.add('flap');
        this.bird.animations.play('flap', 10, true);

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        // Create sounds
        //this.wooshSound = game.add.audio('woosh');
        //this.jumpSound = game.add.audio('jump');
        //this.scoreSound = game.add.audio('score');
        //this.smackSound = game.add.audio('smack');
        //this.boomSound = game.add.audio('boom');
        //this.godModeSong = game.add.audio('godModeSong');

        // Create pipe group
        this.pipes = game.add.group();
        this.pipes.createMultiple(15, 'pipe');
        this.pipes.createMultiple(6, 'pipeHead');
        this.pipes.forEach(function (p) {
            p.width = p.key == "pipeHead" ? PIPE_HEAD_WIDTH : PIPE_WIDTH;
            p.height = p.key == "pipeHead" ? PIPE_HEAD_HEIGHT : PIPE_HEIGHT;
            game.physics.p2.enable(p);
            p.body.setRectangle(p.width, p.height, 0.5 * p.width, 0.5 * p.height);
            p.body.setCollisionGroup(this.pipeCollisionGroup);
            p.body.collides(this.birdCollisionGroup);
            p.body.static = true;
        }, this)

        // Keep track of current pipes on screen, where each index contains a pipe (chose bottom head) that represents the entire row
        this.currentRow = new Array();
        // Create pipes every 1.25 seconds
        this.timerPipe = game.time.events.loop(PIPE_SPAWN_TIME, this.addRowOfPipes, this);

        // Create power ups
        this.powerUps = game.add.group();
        this.powerUps.createMultiple(10, 'bonusPoints');
        this.powerUps.createMultiple(5, 'godMode');
        this.powerUps.forEach(function (p) {
            p.width = POWERUP_WIDTH;
            p.height = POWERUP_HEIGHT;
            game.physics.p2.enable(p);
            p.body.setRectangle(p.width, p.height, 0.5 * p.width, 0.5 * p.height);
            p.body.setCollisionGroup(this.powerUpCollisionGroup);
            p.body.collides(this.birdCollisionGroup);
            p.body.static = true;
        }, this)

        // Add in random bonus point and godmode spawner and emitter effect
        this.timerPowerUp = game.time.events.add(game.rnd.integerInRange(MIN_POWERUP_SPAWN_TIME, MAX_POWERUP_SPAWN_TIME) + PIPE_SPAWN_TIME, this.addPowerUp, this);
        this.emitter = game.add.emitter(0, 0, 100);
        this.emitter.makeParticles('bonusPoints');
        this.emitter.gravity = GRAVITY_Y;

        this.emitterGod = game.add.emitter(0, 0, 100);
        this.emitterGod.makeParticles('godMode');
        this.emitterGod.gravity = GRAVITY_Y;

        // Create bullet enemies 
        this.bullets = game.add.group();
        this.bullets.createMultiple(5, 'bullet');
        this.bullets.forEach(function (p) {
            p.width = BULLET_WIDTH;
            p.height = BULLET_HEIGHT;
            game.physics.p2.enable(p);
            p.body.data.gravityScale = 0;
            p.body.setRectangle(p.width, p.height, 0.5 * p.width, 0.5 * p.height);
            p.body.data.shapes[0].sensor = true;
            p.body.setCollisionGroup(this.bulletCollisionGroup);
            p.body.collides(this.birdCollisionGroup);
            p.body.static = true;
        }, this)

        this.timerBullet = game.time.events.add(game.rnd.integerInRange(MIN_BULLET_SPAWN_TIME, MAX_BULLET_SPAWN_TIME), this.addBullet, this);

        // Keep track of score 
        this.score = 0;
        this.labelScore = game.add.text(SCREEN_WIDTH / 2 - 15, SCREEN_HEIGHT * 1 / 6, "0", { font: "50px Dimitri", fill: "#ffffff" });
        if (localStorage.getItem('score') == null)
            localStorage.setItem('score', 0);

        // Create Pause button
        this.labelPause = game.add.text(0, 15, "Pause", { font: "50px Dimitri", fill: "#ffffff" });
        this.labelPause.anchor.setTo(1, 0);  // Horizontal Alignment to right
        this.labelPause.x = SCREEN_WIDTH - 15;
        this.labelPause.inputEnabled = true;
        this.labelPause.events.onInputDown.add(this.pause, this);

        // Add in ability to tap to jump or resume if paused
        this.background.inputEnabled = true;
        this.background.events.onInputDown.add(this.jump, this);
        game.input.onDown.add(this.resume, this, 0, 'game');

        this.gameStart = false;
        this.alive = true;  // Use a boolean before signalling bird.alive (will change properties)
        this.godMode = false;
        ++gameCount;
    },

    // This function is called 60 times per second    
    update: function () {
        // Don't change bird angle before game starts
        if (this.bird.angle > -0 && !this.gameStart)
            this.bird.angle = 0;
            // Constantly lower the bird's angle to -90 
        else if (this.bird.angle < 90 && this.gameStart)
            this.bird.angle += 2;

        if (this.alive)
            this.ground.tilePosition.x += MAP_VELOCITY_X / 60;

        this.checkPipes();
    },

    jump: function () {
        if (!this.gameStart) {
            game.add.tween(this.tap).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
            game.add.tween(this.getReady).to({ alpha: 0 }, 500, Phaser.Easing.Linear.None, true, 0, 0, false);
            this.bird.body.data.gravityScale = 1;
            this.gameStart = true;
        }

        if (!this.alive)
            return;

        this.bird.body.velocity.y = BIRD_VELOCITY_Y;

        if (this.godMode) {
            this.emitterGod.x = this.bird.x;
            this.emitterGod.y = this.bird.y;
            this.emitterGod.setXSpeed(0.5 * MAP_VELOCITY_X, 1 * MAP_VELOCITY_X);
            this.emitterGod.start(true, 1500, null, 10);
        }

        var animation = game.add.tween(this.bird);
        animation.to({ angle: -40 }, 100);
        animation.start();
        //this.jumpSound.play();
    },

    // Check when to add score after passing pipe
    checkPipes: function () {
        if (this.currentRow.length == 0)
            return;
        else if (this.bird.x >= this.currentRow[0].x + this.currentRow[0].width) {
                this.currentRow.splice(0, 1);   // Delete first index of array 
                this.labelScore.text = ++this.score;
                //this.scoreSound.play();
        }
    },

    pause: function (item) {
        //if (this.bird.alive) {
        //    game.paused = true;
        //    this.labelPause.text = "Resume";
        //}
    },

    resume: function (event) {
        if (this.game.paused) {
            game.paused = false;
            if (this.labelPause != null)
                this.labelPause.text = "Pause";
        }
    },

    hitObject: function (body, bodyB, shapeA, shapeB, equation) {
        if (!this.bird.alive)  // Don't play smack sound again if already hit pipe
            return;

        if (body == null) {
            this.bird.body.moveDown(25);
        }

        else if (body.sprite.key == "ground" || this.bird.y <= 0.5 * this.bird.height) {
            if (this.godMode)
                // Set to a high number to fight back gravity, otherwise bird will get stuck
                this.bird.body.moveUp(200);
            else
                this.hitGround();
        }

        else if (body.sprite.key == "bullet") {
            // Check if bullet kills bird (bird didn't jump on it or no god mode on)
            if (this.bird.y > body.sprite.y + body.sprite.height * 0.2 && !this.godMode) {
                this.bird.bringToTop();
                this.alive = false;
                this.endGame();
            }
            else {
                if (this.bird.y <= body.sprite.y + body.sprite.height * 0.2) {
                    this.jump();
                }
                body.sprite.body.velocity.y = BIRD_VELOCITY_Y * -2;
                body.sprite.frame = 1;
                this.labelScore.text = ++this.score;
                //this.smackSound.play();
            }
        }

        else if (!this.godMode && this.alive && (body.sprite.key == "pipe" || body.sprite.key == "pipeHead")) {
            this.bird.bringToTop();
            this.alive = false;
            this.endGame();
        }
        else if (body.sprite.key == "bonusPoints") {
            this.labelScore.text = ++this.score;
            //this.scoreSound.play();
            this.emitter.x = body.x;
            this.emitter.y = body.y;
            this.emitter.start(true, 1500, null, 10);
            body.sprite.kill();
        }
        else if (body.sprite.key == "godMode") {
            this.godMode = true;
            body.sprite.kill();
            this.bird.bringToTop();
            //this.godModeSong.play();
            // Remove all previous signals if still in god mode and use new one
            //this.godModeSong.onStop.removeAll();
            //this.godModeSong.onStop.addOnce(function () {
            //    this.godMode = false;
            //}, this);
        }
    },

    // Stops the bird from moving once it hits ground
    hitGround: function () {
        if (this.godMode)
            return;

        // Stop all movement at this point
        this.bird.body.velocity.y = 0;
        this.bird.body.data.gravityScale = 0;
        this.bird.body.static = true;
        this.bird.alive = false

        // If dying from ground hit, finish off the game
        if (this.alive) {
            this.endGame();
            this.alive = false;
        }
    },

    // Stops everything in the game
    endGame: function () {
        var flash = game.add.tween(this.background).to({ tint: 0 }, 50, "Linear", true, 0, 0);
        flash.yoyo(true, 0);
        //this.smackSound.play();

        game.time.events.removeAll(this.timerPipe);
        game.time.events.removeAll(this.timerPowerUp);
        game.time.events.removeAll(this.timerBullet);

        this.pipes.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);
        this.powerUps.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);
        this.bullets.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);

        this.labelScore.alpha = 0;
        this.labelScore.x = SCREEN_WIDTH * 3 / 4;
        this.labelScore.y = game.world.centerY * 8 / 10;

        if (this.score > localStorage.getItem('score')) {
            localStorage.setItem('score', this.score);
        }

        this.gameOver = game.add.sprite((SCREEN_WIDTH - SCREEN_WIDTH * 2 / 3) / 2, SCREEN_HEIGHT * 1 / 10, "gameOver");
        this.gameOver.alpha = 0;
        this.gameOver.width = SCREEN_WIDTH * 2 / 3;
        this.gameOver.height = SCREEN_HEIGHT * 2 / 11;

        this.record = game.add.sprite((SCREEN_WIDTH - SCREEN_WIDTH * 4 / 5) / 2, SCREEN_HEIGHT * 3 / 10, "record");
        this.record.alpha = 0;
        this.record.width = SCREEN_WIDTH * 4 / 5;
        this.record.height = SCREEN_HEIGHT * 3 / 9;

        if (this.score >= 20) {
            if (this.score >= 50) {
                this.medal = game.add.sprite(SCREEN_WIDTH * 1.8 / 10, SCREEN_HEIGHT * 4 / 10, "goldMedal");
            }
            else if (this.score >= 35) {
                this.medal = game.add.sprite(SCREEN_WIDTH * 1.8 / 10, SCREEN_HEIGHT * 4 / 10, "silverMedal");
            }
            else if (this.score >= 20)
                this.medal = game.add.sprite(SCREEN_WIDTH * 1.8 / 10, SCREEN_HEIGHT * 4 / 10, "bronzeMedal");

            this.medal.alpha = 0;
            this.medal.width = SCREEN_WIDTH * 2 / 10;
            this.medal.height = SCREEN_HEIGHT * 2 / 10;
            this.medal.bringToTop();
        }

        this.labelHighScore = game.add.text(SCREEN_WIDTH * 3 / 4, game.world.centerY * 1.05, localStorage.getItem('score'), { font: "50px Dimitri", fill: "#ffffff" });
        this.labelHighScore.alpha = 0;

        this.continue = game.add.button(SCREEN_WIDTH * 1 / 10, SCREEN_HEIGHT * 7 / 8 - SCREEN_HEIGHT * 1.5 / 9, "continue", this.continueClick, this);
        this.continue.alpha = 0;
        this.continue.width = SCREEN_WIDTH / 3;
        this.continue.height = SCREEN_HEIGHT * 1.5 / 9;

        this.share = game.add.button(SCREEN_WIDTH * 6 / 10, SCREEN_HEIGHT * 7 / 8 - SCREEN_HEIGHT * 1.5 / 9, "share", this.shareClick, this);
        this.share.alpha = 0;
        this.share.width = SCREEN_WIDTH / 3;
        this.share.height = SCREEN_HEIGHT * 1.5 / 9;

        this.labelScore.bringToTop();

        game.add.tween(this.gameOver).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 0, 0, false);
        game.add.tween(this.record).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        if (this.medal != null) game.add.tween(this.medal).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.labelScore).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.labelHighScore).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.continue).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
        game.add.tween(this.share).to({ alpha: 1 }, 300, Phaser.Easing.Linear.None, true, 300, 0, false);
    },

    continueClick: function () {
        //this.wooshSound.play();
        this.restartGame();
    },

    shareClick: function () {
        var url = "https://twitter.com/intent/tweet?text=I+scored+" + this.score + "+points+on+Flappy+Bird!+Try+to+beat+me+at+Kanac.github.io/Flappy-Bird+now!"
        window.open(url);
    },

    restartGame: function () {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function (x, y, isHead) {
        do {
            var pipe = this.pipes.getRandom();
        } while (!((pipe.key == "pipeHead" && isHead) || (pipe.key == "pipe" && !isHead)) || pipe.alive)

        // Set anchor back to 0, since p2 changes it to 0.5
        pipe.anchor.setTo(0);

        // Set the new position of the pipe
        if (isHead)
            // Calculate where to place pipehead so thats its in the middle of a pipe
            pipe.reset((x - (PIPE_HEAD_WIDTH - PIPE_WIDTH) / 2), y);
        else
            pipe.reset(x, y);

        pipe.body.velocity.x = MAP_VELOCITY_X;

        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
        return pipe;
    },

    addRowOfPipes: function () {
        if (!this.gameStart)
            return;

        // Pick where the hole will be (number from 2 to 6)
        var hole = Math.floor(Math.random() * 5) + 2;

        // Add the 5 pipes (iterate 7 times so that 2 spots are holes with 5 pipes)
        // All calculations done with the fact that anchor is 0,0 (top left)
        for (var i = 8; i > 1; i--) {
            if (i == hole + 2) {
                // Place bottom pipe head and choose this pipe to keep track of to represent the row for scoring
                // Y calculation means take the current step size away from the ground and account for anchor offset to place it level with previous pipe
                this.currentRow.push(this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (GROUND_HEIGHT + PIPE_HEIGHT) + (PIPE_HEIGHT - PIPE_HEAD_HEIGHT), true));
            }
            else if (i == hole) {
                // Place top pipe head (normal calculation since using empty hole area)
                this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (GROUND_HEIGHT + PIPE_HEIGHT), true);
            }
            else if (i != hole + 1) {
                // Normal pipe calculation 
                this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (GROUND_HEIGHT + PIPE_HEIGHT), false);
            }
        }
    },

    addPowerUp: function () {
        // Change delay of next power up spawn
        this.timerPowerUp = game.time.events.add(game.rnd.integerInRange(MIN_POWERUP_SPAWN_TIME, MAX_POWERUP_SPAWN_TIME), this.addPowerUp, this);

        // Ensure game has started and that there are no pipes near this power up 
        if (!this.gameStart)
            return;

        if (this.currentRow.length > 0) {
            var frontPipe = this.currentRow[this.currentRow.length - 1];
            // Don't place a power up inside a pipe
            if (frontPipe.x >= SCREEN_WIDTH - frontPipe.width || frontPipe.x <= SCREEN_WIDTH * 5.1 / 8)
                return;
        }

        do {
            var powerUp = this.powerUps.getRandom();
        } while (powerUp.alive);

        // Pick random y value above ground
        var randY = Math.floor(Math.random() * SCREEN_WIDTH * 6 / 8);

        powerUp.bringToTop();
        powerUp.anchor.setTo(0, 0);
        powerUp.reset(SCREEN_WIDTH, (game.rnd.integerInRange(SCREEN_WIDTH * 1 / 8, SCREEN_WIDTH * 6 / 8)));
        powerUp.body.velocity.x = MAP_VELOCITY_X;
        powerUp.checkWorldBounds = true;
        powerUp.outOfBoundsKill = true;
    },

    addBullet: function () {
        this.timerPowerUp = game.time.events.add(game.rnd.integerInRange(MIN_BULLET_SPAWN_TIME, MAX_BULLET_SPAWN_TIME), this.addBullet, this);
        if (!this.gameStart)
            return;

        // Pick random y value above ground
        var randY = Math.floor(Math.random() * SCREEN_WIDTH * 6 / 8);
        // Pick random velocity multiplier from 1.5 to 2.5
        var randVelocity = (Math.random() * 1) + 1.5

        var bullet = this.bullets.getFirstDead();
        bullet.frame = 0;
        bullet.anchor.setTo(0, 0);
        bullet.reset(SCREEN_WIDTH, randY);
        bullet.body.velocity.x = randVelocity * MAP_VELOCITY_X;
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
        //this.boomSound.play();
    }
};

// Add and start the 'main' state to start the game
game.state.add('main', mainState);
game.state.start('main');

