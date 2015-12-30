/// <reference path="phaser.min.js" />

var SCREEN_WIDTH = 400;
var SCREEN_HEIGHT = 490;

// Initialize Phaser, and create a 400x490px game
var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, 'gameDiv');


// Create our 'main' state that will contain the game
var mainState = {

    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the game's assets  

        game.load.image('background', 'assets/bg.png');
        game.load.image('ground', 'assets/ground.png');
        // Load the bird sprite
        game.load.image('bird', 'assets/FlappyBird.png');
        game.load.spritesheet('redBird', 'assets/RedBird.png', 64, 139/3, 3);
        game.load.image('pipe', 'assets/MiddlePipe.png');
        game.load.image('pipeHead', 'assets/EndPipe.png');
        game.load.audio('jump', 'assets/jump.wav');
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc.  

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.Arcade);

        // Initialize background 
        this.background = game.add.sprite(0, 0, 'background');
        this.background.width = game.width;
        this.background.height = game.height;

        this.ground1 = game.add.sprite(0, SCREEN_HEIGHT * 7/8, 'ground');
        this.ground1.width = SCREEN_WIDTH;
        this.ground2 = game.add.sprite(SCREEN_WIDTH, SCREEN_HEIGHT * 7/8, 'ground');
        this.ground2.width = SCREEN_WIDTH;

        // Die when past the ground
        game.world.height = SCREEN_HEIGHT - SCREEN_HEIGHT * 1 / 8;

        // Display the bird on the screen
        //this.bird = this.game.add.sprite(100, 245, 'bird');
        this.bird = this.game.add.sprite(100, 245, 'redBird');
        this.bird.width = 40;
        this.bird.height = 40;
        // Add gravity to the bird to make it fall
        game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;
        this.bird.anchor.setTo(-0.2, 0.5);

        // Add animation
        var flap = this.bird.animations.add('flap');
        this.bird.animations.play('flap', 30, true);

        // Call the 'jump' function when the spacekey is hit
        var spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);

        // Create jumnp second
        this.jumpSound = game.add.audio('jump');

        // Create pipe group
        this.pipes = game.add.group(); // Create a group  
        this.pipes.enableBody = true;  // Add physics to the group  
        this.pipes.createMultiple(20, 'pipe'); // Create 20 pipes  
        this.pipes.forEach(function (p) {
            p.width = SCREEN_WIDTH / 5;
            p.height = SCREEN_HEIGHT / 8;
            p.body.setSize(SCREEN_WIDTH/5, SCREEN_HEIGHT/8, 0, 0);
        }, this)

        this.pipeHeads = game.add.group();
        this.pipeHeads.enableBody = true;
        this.pipeHeads.createMultiple(10, 'pipeHead');
        this.pipeHeads.forEach(function (p) {
            p.width = SCREEN_WIDTH / 4;
            p.height = SCREEN_HEIGHT / 16;
            p.body.setSize(SCREEN_WIDTH / 4, SCREEN_HEIGHT / 16, 0, 0);
        }, this)

        // Create pipes every 1.5 seconds
        this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

        // Keep track of current pipe on screen
        this.currentPipe = null;
        this.nextPipe = null;

        // Keep track of score 
        this.score = 0;
        this.labelScore = game.add.text(SCREEN_WIDTH/2, SCREEN_HEIGHT*1/6, "0", { font: "50px Dimitri", fill: "#ffffff"});
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic   
        if (this.bird.inWorld == false)
            this.restartGame();

        if (this.bird.angle < 20)
            this.bird.angle += 1;

        if (this.ground1.x <= -SCREEN_WIDTH + 5)
            this.ground1.x = SCREEN_WIDTH;

        if (this.ground2.x <= -SCREEN_WIDTH + 5)
            this.ground2.x = SCREEN_WIDTH;

        this.ground1.x-=200/60;
        this.ground2.x-=200/60;

        this.checkPipes();

        game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
        game.physics.arcade.overlap(this.bird, this.pipeHeads, this.hitPipe, null, this);
    },

    hitPipe: function () {
        // If the bird has already hit a pipe, we have nothing to do
        if (this.bird.alive == false)
            return;

        // Set the alive property of the bird to false
        this.bird.alive = false;

        // Prevent new pipes from appearing
        game.time.events.remove(this.timer);

        // Go through all the pipes, and stop their movement
        this.pipes.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);

        this.pipeHeads.forEachAlive(function (p) {
            p.body.velocity.x = 0;
        }, this);
    },

    // Check when to add score after passing pipe
    checkPipes: function(){
        if (this.currentPipe == null)
            this.currentPipe = this.nextPipe;

        if (this.currentPipe != null) {
            if (this.bird.x >= this.currentPipe.x) {
                this.currentPipe = this.nextPipe
                this.labelScore.text = ++this.score;
            }
        }
    },

    // Make the bird jump 
    jump: function () {
        if (this.bird.alive == false)
            return;
        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;

        // Create an animation on the bird
        var animation = game.add.tween(this.bird);

        // Set the animation to change the angle of the sprite to -20° in 100 milliseconds
        animation.to({ angle: -20 }, 100);

        // And start the animation
        animation.start();

        // Play jump sound
        this.jumpSound.play();
    },

    // Restart the game
    restartGame: function () {
        // Start the 'main' state, which restarts the game
        game.state.start('main');
    },

    addOnePipe: function (x, y, isHead) {
        // Get the first dead pipe of our group
        var pipe = isHead ? this.pipeHeads.getFirstDead() : this.pipes.getFirstDead();

        // Set the new position of the pipe
        if (isHead)
            pipe.reset((x - (SCREEN_WIDTH / 4 - SCREEN_WIDTH / 5)/2), y);
        else
            pipe.reset(x, y);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200;

        // Kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;

        return pipe;
    },

    addRowOfPipes: function () {
        // Pick where the hole will be (number from 3 to 6)
        var hole = Math.floor(Math.random() * 4) + 3;

        // Add the 5 pipes (iterate 8 times so that 2 spots are holes with 6 pipes)
        for (var i = 8; i > 1; i--) {
            if (i == hole + 2) {
                this.nextPipe = this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8) + (SCREEN_HEIGHT / 8 - SCREEN_HEIGHT / 16), true);
            }
            else if (i == hole) {
                this.nextPipe = this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8), true);
            }
            else if (i != hole + 1){
                this.nextPipe = this.addOnePipe(SCREEN_WIDTH, i * SCREEN_HEIGHT / 8 - (2 * SCREEN_HEIGHT / 8), false);
            }
        }
    },
};



// Add and start the 'main' state to start the game
game.state.add('main', mainState);  
game.state.start('main');  

