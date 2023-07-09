import * as Phaser from 'phaser';
import { canvasContainer, gameWidth, gameHeight, pauseBtn, restartBtn, debugGrid, debugBtn, reverseBtn, gameContainer, overlay } from '../config'
export default class YouWonScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'YouWonScene'
        });
    }
    init() {
        // show black background
        this.cameras.main.setBackgroundColor('#000000');
        // add white text "You Won!" to the center of the screen


    }
    create() {
        this.add.shader('RGB Shift Field', 0, 0, gameWidth, gameHeight).setOrigin(0);
        this.add.text(gameWidth / 2, gameHeight / 2, 'You Won', { fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif', fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        this.time.delayedCall(500, () =>
            {
                this.addEventListeners();
            });
        // this.highscore = this.storage.get('max-score') // || 'You have no record'
        // this.add.bitmapText(this.sys.canvas.width / 2 - 105, this.sys.canvas.height / 2 - 90, 'main-font', 'You Won!', 24);
        // let text = 'PRES ANY KEY';
        // if (this.highscore !== null) {
        //   text += '\n\n\n\n HIGHSCORE: ' + this.highscore
        // }
        // this.add.bitmapText(this.sys.canvas.width / 2 - 50, this.sys.canvas.height / 2 + 10, 'main-font', text, 8, 1);
    }
    addEventListeners() {
        const startScene = () => {
            this.scene.start('demo');
            this.sys.canvas.removeEventListener('click', startScene);
            //   this.sys.canvas.removeEventListener('touchstart', startScene)
        };
        this.input.keyboard.on('keydown', startScene);
        this.sys.canvas.addEventListener('click', startScene);
        // this.sys.canvas.addEventListener('touchstart', startScene)
    }
}