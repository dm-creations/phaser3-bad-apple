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
        // this.aplee.setVelocity(velocityX, velocityY);
    }
    public animateDirection() {
        // animate the aplee based on the 8 directions that the velocity is currently moving
        let direction = this.getDirection(this.aplee.body.velocity.x, this.aplee.body.velocity.y);
        this.aplee.anims.play(direction, true);
    }
    private getDirection(xVelocity: number, yVelocity: number): string {
        if (xVelocity > 0 && yVelocity > 0) {
            return 'downRight';
        } else if (xVelocity > 0 && yVelocity < 0) {
            return 'upRight';
        } else if (xVelocity < 0 && yVelocity > 0) {
            return 'downLeft';
        } else if (xVelocity < 0 && yVelocity < 0) {
            return 'upLeft';
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
        scene.load.spritesheet('upLeft', 'assets/character/Character_UpLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('upRight', 'assets/character/Character_UpRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('down', 'assets/character/Character_Down.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('downLeft', 'assets/character/Character_DownLeft.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('downRight', 'assets/character/Character_DownRight.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('left', 'assets/character/Character_Left.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
        scene.load.spritesheet('right', 'assets/character/Character_Right.png', { frameWidth: frameWidth, frameHeight: frameHeight, margin: margin });
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
            key: 'upLeft',
            frames: this.scene.anims.generateFrameNumbers('upLeft', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'upRight',
            frames: this.scene.anims.generateFrameNumbers('upRight', { start: 0, end: 3 }),
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
            key: 'downLeft',
            frames: this.scene.anims.generateFrameNumbers('downLeft', { start: 0, end: 3 }),
            frameRate: frameRate,
            repeat: -1
        });
        this.scene.anims.create({
            key: 'downRight',
            frames: this.scene.anims.generateFrameNumbers('downRight', { start: 0, end: 3 }),
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

    }
}