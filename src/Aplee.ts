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
        this.aplee = this.scene.physics.add.sprite(300, 300, 'applee')
            .setCircle(8).setScale(4);
        this.aplee.anims.play('up');
    }
    private setupAnimations() {
        // create animation called up that uses frames 0, 1, 2, 3 of /assets/character/Character_Up.png
        this.scene.anims.create({
            key: 'up',
            frames: this.scene.anims.generateFrameNumbers('up', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
    }
    public static loadSpriteSheets(scene: Phaser.Scene) {
        scene.load.spritesheet('up', 'assets/character/Character_Up.png', { frameWidth: 32, frameHeight: 25, margin: 0 });
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
    public noKeysDown() {
        return !this.scene.cursors.up.isDown &&
        !this.scene.cursors.down.isDown &&
        !this.scene.cursors.left.isDown &&
        !this.scene.cursors.right.isDown;
    }
}