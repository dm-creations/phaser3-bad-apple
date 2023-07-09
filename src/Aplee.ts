import * as Phaser from 'phaser';

export default class Aplee {
    private scene: Phaser.Scene
    private aplee!: Phaser.Physics.Arcade.Sprite
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    private boostCooldown: number
    private isBoosting: boolean

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene
        this.cursors = this.scene.cursors
        this.boostCooldown = 0;
        this.isBoosting = false;
    
        // Set up the animations
        this.setupAnimations();
        // Configure the animations for the apple
        
    
        // Play the initial animation
        // this.scene.anims.play('move_up');
        this.aplee = this.scene.physics.add.sprite(300, 300, 'aplee')
            .setCircle(8, 8, 10)
            .setScale(4);

    }
    public handleInput (delta: number) {
        const { up, down, left, right } = this.cursors;
        const spacebar = this.cursors.space;

        // Calculate velocity based on key input
        let velocityX = 0;
        let velocityY = 0;

        if (up?.isDown) {
            if (left?.isDown || right?.isDown) {
                velocityY = -150;
            } else {
                velocityY = -200;
            }
        } else if (down?.isDown) {
            if (left?.isDown || right?.isDown) {
                velocityY = 150;
            } else {
                velocityY = 200;
            }
        }

        if (left?.isDown) {
            if (up?.isDown || down?.isDown) {
                velocityX = -150;
            } else {
                velocityX = -200;
            }
        } else if (right?.isDown) {
            if (up?.isDown || down?.isDown) {
                velocityX = 150;
            } else {
                velocityX = 200;
            }
        }
        if (this.boostCooldown <= 0 && spacebar.isDown) {
            // Apply boost velocity
            velocityX *= 2;
            velocityY *= 2;
      
            // Set boost state and cooldown
            this.isBoosting = true;
            this.boostCooldown = 1000; // 1 second cooldown (adjust as needed)
        }
        if (this.boostCooldown > 0) {
            this.boostCooldown -= delta;
            if (this.boostCooldown <= 0) {
                this.boostCooldown = 0;
                this.isBoosting = false;
            }
        }
        if (this.isBoosting) {
            this.aplee.setVelocity(velocityX*2, velocityY*2);
        } else {
            this.aplee.setVelocity(velocityX, velocityY); // Normal velocity
        }
    }
    public animateDirection() {
        // animate the aplee based on the 8 directions that the velocity is currently moving
        let direction = this.getDirection(this.aplee.body.velocity.x, this.aplee.body.velocity.y);
        // if boost is active, prepend 'slash' to the direction
        if (this.isBoosting) {
            direction = 'slash' + direction;
        }
        console.log(direction);
        this.aplee.anims.play(direction, true);
    }
    private getDirection(xVelocity: number, yVelocity: number): string {
        if (xVelocity > 0 && yVelocity > 0) {
            return 'downright';
        } else if (xVelocity > 0 && yVelocity < 0) {
            return 'upright';
        } else if (xVelocity < 0 && yVelocity > 0) {
            return 'downleft';
        } else if (xVelocity < 0 && yVelocity < 0) {
            return 'upleft';
        } else if (xVelocity > 0) {
            return 'right';
        } else if (xVelocity < 0) {
            return 'left';
        } else if (yVelocity > 0) {
            return 'down';
        } else if (yVelocity < 0) {
            return 'up';
        } else {
            return 'down';
        }
    }
    public static loadSpriteSheets(scene: Phaser.Scene) {
        const frameWidth = 32;
        const frameHeight = 31;
        const margin = 0;
        scene.load.spritesheet('up', 'assets/character/Character_Up.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('upleft', 'assets/character/Character_UpLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('upright', 'assets/character/Character_UpRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('down', 'assets/character/Character_Down.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('downleft', 'assets/character/Character_DownLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('downright', 'assets/character/Character_DownRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('left', 'assets/character/Character_Left.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('right', 'assets/character/Character_Right.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('slashup', 'assets/character/Character_SlashUpRight', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin })
        scene.load.spritesheet('slashupleft', 'assets/character/Character_SlashUpLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('slashupright', 'assets/character/Character_SlashUpRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('slashdown', 'assets/character/Character_SlashDownLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin })
        scene.load.spritesheet('slashdownleft', 'assets/character/Character_SlashDownLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('slashdownright', 'assets/character/Character_SlashDownRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('slashleft', 'assets/character/Character_SlashUpLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin })
        scene.load.spritesheet('slashright', 'assets/character/Character_SlashDownRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
    }
    private setupAnimations() {
        const frameRate = 10;
        // create animation called up that uses frames 0, 1, 2, 3 of /assets/character/Character_Up.png
        this.scene.anims.create({
            key: 'up',
            frames: this.scene.anims.generateFrameNumbers('up', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'upleft',
            frames: this.scene.anims.generateFrameNumbers('upleft', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'upright',
            frames: this.scene.anims.generateFrameNumbers('upright', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'down',
            frames: this.scene.anims.generateFrameNumbers('down', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'downleft',
            frames: this.scene.anims.generateFrameNumbers('downleft', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'downright',
            frames: this.scene.anims.generateFrameNumbers('downright', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'left',
            frames: this.scene.anims.generateFrameNumbers('left', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'right',
            frames: this.scene.anims.generateFrameNumbers('right', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        // slash animations
        this.scene.anims.create({
            key: 'slashup',
            frames: this.scene.anims.generateFrameNumbers('slashup', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashupleft',
            frames: this.scene.anims.generateFrameNumbers('slashupleft', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashupright',
            frames: this.scene.anims.generateFrameNumbers('slashupright', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashdown',
            frames: this.scene.anims.generateFrameNumbers('slashdown', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashdownleft',
            frames: this.scene.anims.generateFrameNumbers('slashdownleft', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashdownright',
            frames: this.scene.anims.generateFrameNumbers('slashdownright', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashleft',
            frames: this.scene.anims.generateFrameNumbers('slashleft', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'slashright',
            frames: this.scene.anims.generateFrameNumbers('slashright', { start: 0, end: 3 }),
            frameRate: frameRate*2,
            repeat: -1
        });



    }
}