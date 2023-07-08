import * as Phaser from 'phaser';
export default class Snake extends Phaser.Physics.Arcade.Group {

    private headPosition: Phaser.Geom.Point;
    // private body: what type should this be?
    public body: Phaser.Physics.Arcade.Body;
    public head: Phaser.GameObjects.Sprite;
    public alive: boolean;
    private speed: number;
    private moveTime: number;
    private heading: number;
    private direction: number;

    private UP = 0;
    private DOWN = 1;
    private LEFT = 2;
    private RIGHT = 3;

    // initialize the snake
    constructor(scene, x, y) {
        super(scene, 'snake');
        this.headPosition = new Phaser.Geom.Point(x, y);

        this.body = scene.add.group(); // group is 

        this.head = this.body.create(x * -16, y * 16, 'body');
        this.head.setOrigin(0);

        this.alive = true;

        this.speed = 100;

        this.moveTime = 0;

        this.heading = this.RIGHT;
        this.direction = this.RIGHT;
        console.log(this.headPosition);
    }
    move (time)
        {
            /**
            * Based on the heading property (which is the direction the pgroup pressed)
            * we update the headPosition value accordingly.
            * 
            * The Math.wrap call allow the snake to wrap around the screen, so when
            * it goes off any of the sides it re-appears on the other.
            */
            switch (this.heading)
            {
                case this.LEFT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x - 1, 0, 40); // this position should change based on the device
                    break;

                case this.RIGHT:
                    this.headPosition.x = Phaser.Math.Wrap(this.headPosition.x + 1, 0, 40);
                    break;

                case this.UP:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y - 1, 0, 30);
                    break;

                case this.DOWN:
                    this.headPosition.y = Phaser.Math.Wrap(this.headPosition.y + 1, 0, 30);
                    break;
            }

            this.direction = this.heading;

            //  Update the body segments
            Phaser.Actions.ShiftPosition(this.body.getChildren(), this.headPosition.x * 16, this.headPosition.y * 16, 1);

            //  Update the timer ready for the next movement
            this.moveTime = time + this.speed;

            return true;
        }

};