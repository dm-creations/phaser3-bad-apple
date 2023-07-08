import * as Phaser from 'phaser';

export default class Demo extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.spritesheet('applee', 'assets/character/Character_Down.png', { frameWidth: 16, frameHeight: 19, margin: 8 });

        this.load.glsl('stars', 'assets/starfields.glsl.js');
    }

    create ()
    {
        this.cameras.main.centerOn(0, 0);
        // this.add.shader('RGB Shift Field', -400, -300, 800, 600).setOrigin(0);

        const applee = this.physics.add.sprite(0, 0, 'applee')
            .setCircle(8).setScale(4);

        
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#125555',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { debug: true }
    },
    scene: Demo
};

const game = new Phaser.Game(config);
