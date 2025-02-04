import * as Phaser from 'phaser';
import { snakeSize, ceilsXCount, ceilsYCount } from './config'
// import Demo from './game';
export default class Snake {

    // this might need exporting
    public gameContainer: HTMLElement = document.querySelector('#game') || document.body
    public gameContainerBCR = this.gameContainer.getBoundingClientRect()
    public gameContainerW = this.gameContainerBCR.width // window.innerWidth
    public gameContainerH = this.gameContainerBCR.height
    public snakeHeadX: number
    public snakeHeadY: number
    // public bodyPartsSprites: Phaser.Physics.Arcade.Sprite[] = []
    public bodyPartsSprites: Phaser.Physics.Arcade.Group[] = []
    public bodyPartsPositions: any[]
    public bodyPartsBonuses: any[] = []
    public snakeLength: number // size
    public readonly DIRECTIONS = {
        UP: 'up',
        RIGHT: 'right',
        DOWN: 'down',
        LEFT: 'left'
    }
    public lives: number
    private initialLength: number = 20
    public alive: boolean = true
    private currentDir: string = this.DIRECTIONS.RIGHT
    private lastMoveDir: string = this.currentDir
    private scene: Phaser.Scene
    private ceil: number

    

    // initialize the snake
    constructor(scene, x, y) {
        this.scene = scene
        this.snakeHeadX = x
        this.snakeHeadY = y
        this.ceil = 32
        this.snakeLength = 32 // this.scene.ceil * this.snakeCeilsSize
        this.bodyPartsPositions = this.getInitialSnakeBody()

        // build snake
        this.buildSnake()
    }
    public getCeilsCountByPixelsCount (pixelsCount) {
        return Math.floor(pixelsCount / this.ceil)
    }
    public getCeilXPos (index: number): number {
        return index * this.ceil - (this.ceil / 2)
    }

    public getCeilYPos (index: number): number {
        return index * this.ceil - (this.ceil / 2)
    }
    public isAlive (): boolean {
        return this.alive
    }
    public setDead (status: boolean): void {
        this.alive = status
    }
    public getTail () {
        return this.bodyPartsPositions[0]
    }
    
    public getHead () {
        return this.bodyPartsPositions[this.getSnakeLength() - 1]
    }
    public setDir (wantMoveDir) {
        const oldDir = this.lastMoveDir
    
        if (!oldDir || !wantMoveDir || wantMoveDir === this.getDirOpposite(oldDir)) {
            return
        }
    
        this.currentDir = wantMoveDir
    }
    public move (): void {
        const pos = {
            x: this.snakeHeadX,
            y: this.snakeHeadY
        }
        const dir = this.currentDir
    
        // changes pos variable
        this.changePosByDir(dir, pos)
        this.snakeHeadX = pos.x
        this.snakeHeadY = pos.y
    
        this.bodyPartsPositions.shift()
        this.bodyPartsPositions.push({
            ...pos,
            dir
        })
    
        // Border Movement
        this.moveRegardingWorldBoundaries()
    
        this.updateBodyPartsPositions()
        this.updateBodyPartsSpritesFrames()
        // this.updateBodyPartsBonuses()
    
        this.lastMoveDir = this.currentDir
    }
    public autoMove (): void {
        if (!this.bodyPartsPositions.length) {
            // load you won scene
            this.scene.scene.start('YouWonScene')
            return
        }
        const pos = {
            x: this.snakeHeadX,
            y: this.snakeHeadY
        }
        const dir = this.currentDir

        // every 10 moves, grow the snake
        if (this.scene.worldIterations % 10 === 0) {
            // this.growSnake()
        }

        // every 3 moves, change direction
        if (false && this.scene.worldIterations % 5 === 0) {
            this.currentDir = this.getRandomDirection(dir)
        } else if (this.scene.worldIterations % 2 === 0) {
            this.moveTowardsAplee(this.scene.aplee)
        }
        // changes pos variable
        this.changePosByDir(dir, pos)
        this.snakeHeadX = pos.x
        this.snakeHeadY = pos.y
    
        this.bodyPartsPositions.shift()
        this.bodyPartsPositions.push({
            ...pos,
            dir
        })
    
        // Border Movement
        this.moveRegardingWorldBoundaries()
    
        this.updateBodyPartsPositions()
        this.updateBodyPartsSpritesFrames()
        // this.updateBodyPartsBonuses()
    
        this.lastMoveDir = this.currentDir
    }
    public moveRegardingWorldBoundaries () {
        const head = this.getHead()
        const xStartPos = this.getCeilXPos(1)
        const yStartPos = this.getCeilYPos(1)
        const xEndPos = this.getCeilXPos(ceilsXCount)
        const yEndPos = this.getCeilYPos(ceilsYCount)
    
        let x
        let y
    
        if (head.x < xStartPos) {
            // console.log(this.bodyPartsSprites)
            // console.log(this.scene.aplee.aplee)
          x = xEndPos
        }
        if (head.x > xEndPos) {
          x = xStartPos
        }
        if (head.y < yStartPos) {
          y = yEndPos
        }
        if (head.y > yEndPos) {
          y = yStartPos
        }
    
        this.setSnakeHeadPos(x, y)
    }
    public setSnakeHeadPos (x, y) {
        const head = this.getHead()
    
        // x === undefined || x === null
        if (!x && x !== 0) {
            x = head.x
        }
        if (!y && y !== 0) {
            y = head.y
        }
    
        head.x = this.snakeHeadX = x
        head.y = this.snakeHeadY = y
    }
    public onTakenBonus (bonus) {
        // this.growSnake()
    
        const posIndex = this.getSnakeLength() - 2 // "- 1" — head
        const { x, y } = this.bodyPartsPositions[posIndex]
        const sprite = this.addBodyBonusSprite(x, y)
    
        this.bodyPartsBonuses.push({
            posIndex,
            sprite
        })
    }
    
    public growSnake () {
        const tail = this.getTail()
        const newDir = this.getDirOpposite(tail.dir)
        const newTailPos = {
            ...tail,
            dir: newDir
        }
        this.changePosByDir(newDir, newTailPos)
    
        this.bodyPartsPositions.unshift({
            ...newTailPos
        })
        this.bodyPartsSprites.unshift(
            this.addSprite(newTailPos.x, newTailPos.y)
        )
    
        // end of tail (0 - tail index)
        this.updateBodyPartsSpritesFrames(0)
        // and subsequent element
        this.updateBodyPartsSpritesFrames(1)
    
        // as a new element is added to the beginning of the array (end of the tail),
        // it is necessary to shift the elements by one position so that there is no correspondence
        this.bodyPartsBonuses = this.bodyPartsBonuses.map(k => ({ ...k, posIndex: ++k.posIndex }))
    }
    public shrinkSnake () {
        // take the this.bodyPartsSprites and remove the last one

        this.bodyPartsSprites.pop().destroy()
        this.bodyPartsPositions.pop()
        // probably need to rebuild the snake
        console.log(this.bodyPartsSprites)

        // const tail = this.getTail()
        // const newDir = this.getDirOpposite(tail.dir)
        // const newTailPos = {
        //     ...tail,
        //     dir: newDir
        // }
        // this.changePosByDir(newDir, newTailPos)
        
        // this.bodyPartsPositions.shift()
        // this.bodyPartsSprites.shift()

        // // pause the game
        // this.scene.scene.pause()

        // // end of tail (0 - tail index)
        // this.updateBodyPartsSpritesFrames(0)
        // // and subsequent element
        // this.updateBodyPartsSpritesFrames(1)

        // // as an element is removed from the beginning of the array (end of the tail),
        // // it is necessary to shift the elements by one position and delete the sprite associated with the bonus
        // this.bodyPartsBonuses = this.bodyPartsBonuses.map(k => ({ ...k, posIndex: --k.posIndex }))
        // this.bodyPartsBonuses.shift().sprite.destroy()
    }
    public getSnakeLength () {
        return this.bodyPartsPositions.length
    }
    private updateBodyPartsPositions () {
        if (!this.bodyPartsPositions.length) {
            // load you won scene
            this.scene.scene.start('YouWonScene')
            return
        }
        this.bodyPartsPositions.forEach((pos, i) => {
            if (!this.bodyPartsPositions.length) {
                // load you won scene
                this.scene.scene.start('YouWonScene')
                return
            }
            const sprite = this.bodyPartsSprites[i]
        
            sprite.x = pos.x
            sprite.y = pos.y
        })
    }
    private getInitialSnakeBody () {
        const body: any[] = []
        const partsCount = this.initialLength
    
        for (let i = 0; i < partsCount; i++) {
            body.unshift({
                x: this.snakeHeadX,
                y: this.snakeHeadY + this.snakeLength * i,
                dir: this.currentDir
            })
        }
    
        return body
    }
    private changePosByDir (dir, pos) {
        switch (dir) {
            case this.DIRECTIONS.UP:
                pos.y -= this.snakeLength
                break
            case this.DIRECTIONS.RIGHT:
                pos.x += this.snakeLength
                break
            case this.DIRECTIONS.DOWN:
                pos.y += this.snakeLength
                break
            case this.DIRECTIONS.LEFT:
                pos.x -= this.snakeLength
                break
        }
    
        return pos
    }
    private buildSnake (): void {
        let i = 0
        for (const bodyPart of this.bodyPartsPositions) {
            this.bodyPartsSprites.push(
                this.addSprite(bodyPart.x, bodyPart.y, i)
            )
            i++
        }
    
        this.updateBodyPartsSpritesFrames()
    }
    private addSprite (x, y, i) {
        // const sprite = this.scene.add.sprite(x, y, 'snake-normal', 4)
        const sprite = this.scene.physics.add.sprite(x, y, 'snake-normal', 4)
    
        sprite.setDisplaySize(this.snakeLength, this.snakeLength)
    
        return sprite
    }
    private updateBodyPartsSpritesFrames (specificPosIndex: number | null = null) {
        const HEAD = {
          up: 3,
          right: 4,
          down: 9,
          left: 8
        }
        const TAIL = {
          up: 13,
          right: 14,
          down: 19,
          left: 18
        }
        const MIDDLE = {
          vertical: 7,
          horizontal: 1
        }
    
        const process = (pos, i) => {
          const sprite = this.bodyPartsSprites[i]
          const dir = pos.dir
          const next = this.bodyPartsPositions[i + 1]
    
          const setTex = (frame) => {
            sprite.setTexture('snake-normal', frame)
          }
    
          // head
          if (i === this.getSnakeLength() - 1) {
            setTex(HEAD[dir])
          } else if (!i) { // tail
            // tail not turning
            if (dir === next.dir) {
              setTex(TAIL[dir])
            } else { // Tail 
              setTex(TAIL[next.dir])
            }
          } else if (dir !== next.dir) { // corners
            // for example, turnAndReverseTurn('up', 'left', 2) is equivalent to:
            // "if (dir === 'up' && next.dir === 'left' || dir === 'right' && next.dir === 'down') {"
            const turnAndReverseTurn = (dirStart, dirTurn, frame) => {
              if ((dir === dirStart && next.dir === dirTurn)
                || (dir === this.getDirOpposite(dirTurn) && next.dir === this.getDirOpposite(dirStart))
              ) {
                setTex(frame)
              }
            }
    
            turnAndReverseTurn(this.DIRECTIONS.UP, this.DIRECTIONS.LEFT, 2)
            turnAndReverseTurn(this.DIRECTIONS.UP, this.DIRECTIONS.RIGHT, 0)
            turnAndReverseTurn(this.DIRECTIONS.RIGHT, this.DIRECTIONS.UP, 12)
            turnAndReverseTurn(this.DIRECTIONS.LEFT, this.DIRECTIONS.UP, 5)
          } else { // middle part
            // ['right', 'left'].includes(dir)
            // const frame = ['up', 'down'].includes(dir) ? MIDDLE.vertical : MIDDLE.horizontal
    
            setTex([
                MIDDLE.horizontal,
                MIDDLE.vertical
                ][
                    +[this.DIRECTIONS.UP, this.DIRECTIONS.DOWN].includes(dir)
                ])
            }
        }
    
        if (specificPosIndex !== null) {
            process(
                this.bodyPartsPositions[specificPosIndex],
                specificPosIndex
            )
        } else {
            this.bodyPartsPositions.forEach(process)
        }
    }
    private getDirOpposite (dir) {
        const dirs = [
            [this.DIRECTIONS.UP, this.DIRECTIONS.DOWN],
            [this.DIRECTIONS.RIGHT, this.DIRECTIONS.LEFT]
        ]
        
        for (const dirArr of dirs) {
            if (dirArr.includes(dir)) {
                return dirArr.find((i: string) => i !== dir)
            }
        }
    }
    private getRandomDirection (dir) {
        // const dirs = Object.values(this.DIRECTIONS)
        const dirs = [
            this.DIRECTIONS.UP,
            this.DIRECTIONS.RIGHT,
            this.DIRECTIONS.DOWN,
            this.DIRECTIONS.LEFT
        ]
        // choose random direction
        const randomDir = dirs[Math.floor(Math.random() * dirs.length)]
        // if random direction is the same as current direction, choose another random direction
        if (randomDir === dir) {
            return this.getRandomDirection(dir)
        }
        // if random direction is the opposite of current direction, choose another random direction
        if (randomDir === this.getDirOpposite(dir)) {
            return this.getRandomDirection(dir)
        }
        // otherwise, return the random direction
        return randomDir
    }
    private moveTowardsAplee (aplee) {
        if (!this.bodyPartsPositions.length) {
            // load you won scene
            this.scene.scene.start('YouWonScene')
            return
        }
        const head = this.getHead()
        const xDiff = aplee.x - head.x
        const yDiff = aplee.y - head.y
        const xDiffAbs = Math.abs(xDiff)
        const yDiffAbs = Math.abs(yDiff)
        const dir = {
            x: xDiffAbs > yDiffAbs ? (xDiff > 0 ? this.DIRECTIONS.RIGHT : this.DIRECTIONS.LEFT) : null,
            y: xDiffAbs < yDiffAbs ? (yDiff > 0 ? this.DIRECTIONS.DOWN : this.DIRECTIONS.UP) : null
        }
    }
    private addBodyBonusSprite (x, y) {
        const sprite = this.scene.add.sprite(x, y, 'snake-normal', 16) // 15
    
        sprite.setDepth(3)
        sprite.setDisplaySize(this.snakeLength / 2, this.snakeLength / 2)
    
        return sprite
    }
}