import * as Phaser from 'phaser';
import Snake from './Snake';

export default class Demo extends Phaser.Scene
{
    private snake!: Snake;
    private worldIterations = 0
    private cursors;
    
    //  Direction consts
    
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.spritesheet('applee', 'assets/character/Character_Down.png', { frameWidth: 16, frameHeight: 19, margin: 8 });

        this.load.glsl('stars', 'assets/starfields.glsl.js');

        this.load.image('snake-body-1bit', 'assets/snake-body-1bit.png');
    }

    create ()
    {
        this.cameras.main.centerOn(0, 0);
        // this.add.shader('RGB Shift Field', -400, -300, 800, 600).setOrigin(0);

        const applee = this.physics.add.sprite(0, 0, 'applee')
            .setCircle(8).setScale(4);

        this.snake = new Snake(this, -1, 0);
        
    }
    update (time, delta)
    {
        const snakeMoveIterationsRange = 15 // - Math.floor(this.timer.getSeconds() / 4)
        const bonusIterationsRange = 50
    
        this.worldIterations += 1
    
        if (this.worldIterations % snakeMoveIterationsRange === 0) {
        //   this.handleInput()
          this.snake.move()
    
        //   this.checkCollision()
        }
    
        // this.fpsText.setText(this.getFPS())
    
        // if (!this.snake.alive()) {
        //   this.onDead()
        // pause game
        // this.scene.pause();
        // }
      }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#FFFFFF',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: Demo
};

const game = new Phaser.Game(config);
