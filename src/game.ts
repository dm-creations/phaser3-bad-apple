import * as Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import YouWonScene from './scenes/YouWonScene';
import Snake from './Snake';
import Aplee from './Aplee';
import Overlay from './overlay/Overlay'
import { canvasContainer, gameWidth, gameHeight, pauseBtn, restartBtn, debugGrid, debugBtn, reverseBtn, gameContainer, overlay } from './config'
// import MainMenuScene from './scenes/MainMenuScene';

export default class Demo extends Phaser.Scene
{
    public snake!: Snake
    public aplee!: Aplee
    public inControl: 'snake' | 'aplee' 
    public overlay!: Overlay
    private worldIterations = 0
    private bonusesPositions: any[] = []
    private penaltyPositions: any[] = []
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
    
    
    //  Direction consts
    
    constructor ()
    {
        super('demo');
        this.inControl = 'aplee'
    }

    preload ()
    {
        // create a function that preloads all the assets inside assets/character
        // this.load.setPath('assets/character');
        // this.load.image('down', 'assets/character/Character_Down.png');
        // Aplee.loadSpriteSheets(this)

        // this.load.glsl('stars', 'assets/starfields.glsl.js');

        // this.load.spritesheet("snake-normal", "assets/snake-normal.png", {
        //     frameWidth: 64
        // });

        this.load.spritesheet('boom', 'assets/explosion.png', { frameWidth: 64, frameHeight: 64, endFrame: 23 });
    }

    create ()
    {
        this.anims.create({
            key: 'explode',
            frames: 'boom',
            frameRate: 20,
            showOnStart: true,
            hideOnComplete: true
        });
        this.overlay = new Overlay(this)
        // this.cameras.main.centerOn(0, 0);
        // this.add.shader('RGB Shift Field', -400, -300, 800, 600).setOrigin(0);

        // input
        this.cursors = this.input.keyboard.createCursorKeys()
        this.addEventListeners()

        this.snake = new Snake(this, -gameWidth + 290, 300);
        this.aplee = new Aplee(this, 300, 0);
        // play the Aplee animation
        // this.aplee.anims.play('up');
        // this.physics.add.collider(this.snake.bodyPartsSprites, this.aplee.apleeSprite);
        this.physics.add.overlap(this.snake.bodyPartsSprites, this.aplee.apleeSprite, this.handleCollision, undefined, this);
        
    }
    update (time, delta)
    {
        const snakeMoveIterationsRange = 15 // - Math.floor(this.timer.getSeconds() / 4)
        const bonusIterationsRange = 50
    
        this.worldIterations += 1
    
        if (this.worldIterations % snakeMoveIterationsRange === 0) {
            if (this.inControl === 'snake') {
                this.handleInput()
                this.snake.move()
            } else {
                if (this.snake.bodyPartsSprites.length === 0) {this.scene.start('YouWonScene') }
                this.snake.autoMove();
            }
            // this.checkCollision()
        }
        if (this.inControl === 'aplee') { // not affected by world iterations
            this.aplee.handleInput(delta)
            this.aplee.animateDirection()
        }
    
        // this.fpsText.setText(this.getFPS())
    
        if (!this.snake.isAlive()) {
            this.onDead()
            // pause game
            this.scene.pause();
        }

        if (this.aplee.isBoosting) {
            // Enable collision between aplee and snake
            this.physics.collide(this.aplee.apleeSprite, this.snake.bodyPartsSprites, this.breakSnake, undefined, this);
        }

        // console.log('check', this.snake.bodyPartsSprites[0], this.aplee)
        
    }
    public breakSnake (aplee, snake) {
        console.log('%cbreak', 'color: red')
        snake.setTintFill()
        // wait 1000ms and then run explosion animation in its place
        this.time.delayedCall(500, () =>
            {
                snake.clearTint();
                this.add.sprite(snake.x, snake.y, 'boom').play('explode');
            });
        
        // subtract 3 from snake length
        this.snake.shrinkSnake()
    }
    public handleInput (): void {
        const wantMoveDir = this.getDirByInput()

        // if snake-mounted is true, play apple-slap animation
        // if (this.snake.isMounted()) {
        //     this.snake.playAppleSlapAnimation(wantMoveDir)
        // }
    
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
    public handleCollision (snake, aplee) {
        // make snake flash for a second

        aplee.setTintFill()
        this.time.delayedCall(500, () =>
            {
                aplee.clearTint();
            });
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

if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        const scene = game.scene.getScene('demo')
        const method = scene.sys.isPaused() ? 'resume' : 'pause'
        const datasetKey = scene.sys.isPaused() ? 'pause' : 'resume'
  
        if (pauseBtn) {
            pauseBtn.textContent = pauseBtn.dataset[datasetKey] || null
        }
  
        scene.sys[method]()
    })
  }
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
        game.scene.start('demo')
        })
    }
if (debugBtn) {
    debugBtn.addEventListener('click', () => {
    if (debugGrid) {
        const isDebug = [undefined, '0'].includes(debugGrid.dataset.hide)

        // '0' or '1'
        debugGrid.dataset.hide = (+isDebug).toString()
        debugGrid.classList.toggle('game__grid--hidden', !isDebug)

        game.events.emit('app_toggle_debug', isDebug)
    }
        if (debugBtn) {
            debugBtn.textContent = debugBtn.textContent === 'Debug' ? 'Debugging' : 'Debug'
        }
    })
  }
    if (reverseBtn) {
        reverseBtn.addEventListener('click', () => {
            const scene = game.scene.getScene('demo')
            const inControl = scene.inControl
        
            scene.inControl = inControl === 'snake' ? 'aplee' : 'snake'
        })
    }

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#FFC107',
    width: gameWidth,
    height: gameHeight,
    parent: canvasContainer || undefined,
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: [BootScene, Demo, YouWonScene ]
};

const game = new Phaser.Game(config);
