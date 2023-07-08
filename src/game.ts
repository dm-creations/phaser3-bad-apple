import * as Phaser from 'phaser';
import Snake from './Snake';

export default class Demo extends Phaser.Scene
{
    private snake!: Snake;
    private worldIterations = 0
    private bonusesPositions: any[] = []
    private penaltyPositions: any[] = []
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    
    
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

        // input
        this.cursors = this.input.keyboard.createCursorKeys()
        this.addEventListeners()
        
    }
    update (time, delta)
    {
        const snakeMoveIterationsRange = 15 // - Math.floor(this.timer.getSeconds() / 4)
        const bonusIterationsRange = 50
    
        this.worldIterations += 1
    
        if (this.worldIterations % snakeMoveIterationsRange === 0) {
            this.handleInput()
            this.snake.move()
    
            this.checkCollision()
        }
    
        // this.fpsText.setText(this.getFPS())
    
        if (!this.snake.isAlive()) {
            this.onDead()
            // pause game
            // this.scene.pause();
        }
    }
    public handleInput (): void {
        const wantMoveDir = this.getDirByInput()
    
        this.snake.setDir(wantMoveDir)
    }
    
    public getDirByInput (presedKey?) {
        const input = {
          // Format: [button]: key
            [this.snake.DIRECTIONS.UP]: ['w', 'ArrowUp'],
            [this.snake.DIRECTIONS.RIGHT]: ['d', 'ArrowRight'],
            [this.snake.DIRECTIONS.DOWN]: ['s', 'ArrowDown'],
            [this.snake.DIRECTIONS.LEFT]: ['a', 'ArrowLeft']
        }
    
        // Same as below:
        for (const [button, keys] of Object.entries(input)) {
            if ((this.cursors[button] && this.cursors[button].isDown) || keys.includes(presedKey)) {
                return button
            }
        }
        // Same as above:
        // switch (true) {
        //   case (this.cursors.up && this.cursors.up.isDown) || presedKey === 'w':
        //     return this.snake.DIRECTIONS.UP
        //   case (this.cursors.right && this.cursors.right.isDown) || presedKey === 'd':
        //     return this.snake.DIRECTIONS.RIGHT
        //   case (this.cursors.down && this.cursors.down.isDown) || presedKey === 's':
        //     return this.snake.DIRECTIONS.DOWN
        //   case (this.cursors.left && this.cursors.left.isDown) || presedKey === 'a':
        //     return this.snake.DIRECTIONS.LEFT
        // }
    }
    private checkTaran () {
        const taran = this.snake.bodyPartsPositions
            .slice(0, -1)
            .find(i =>
                i.x === this.snake.snakeHeadX && i.y === this.snake.snakeHeadY
            )
    
        this.snake.setDead(taran)
    }
    
    private checkApplyBonus () {
        const snakeHalfSize = this.snake.snakeLength / 2
    
        const bonusPos = this.bonusesPositions.find(({ x: bonusX, y: bonusY }) =>
            this.snake.bodyPartsPositions.some(({ x: bodyX, y: bodyY }: any) =>
                bonusX >= bodyX - snakeHalfSize &&
                bonusY >= bodyY - snakeHalfSize &&
                bonusX <= bodyX + snakeHalfSize &&
                bonusY <= bodyY + snakeHalfSize
            )
        )
    
        if (bonusPos) {
            const bonus = bonusPos.bonus
            const randomSoundKey = 1 + Math.round(Math.random() * (5 - 1))
        
            this.bonusesPositions = this.bonusesPositions.filter(i => i !== bonusPos)
        
            bonus.onCollisionWithSnake()
            this.snake.onTakenBonus(bonus)
            // this.soundManager.play('eat' + randomSoundKey)
        }
    }
    private checkCollision (): void {
        this.checkApplyBonus()
        this.checkTaran()
    }
    private addEventListeners () {
        this.input.keyboard.on('keydown', ({ key }) => {
            this.snake.setDir(
                this.getDirByInput(key)
            )
        })
        // this.events.on('pause', () => {
        //     this.timer.pause()
        // })
        // this.events.on('resume', () => {
        //     this.timer.resume()
        // })
        // mobile controls
        // window.game.events.on('swipe', (dir) => {
        //     this.snake.setDir(dir)
        // })
        // window.game.events.on('app_toggle_debug', (isDebug: boolean) => {
        //     this.fpsText.setVisible(isDebug)
        // })
    }
    private onDead () {
        // const score = this.overlay.getApplesCounter()
        // const maxScore = this.storage.get('max-score')
    
        // if (score > maxScore || maxScore === undefined) {
        //   this.storage.set('max-score', score)
        // }
    
        // this.soundManager.play('dead')
        // this.scene.start('MainMenuScene')
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
