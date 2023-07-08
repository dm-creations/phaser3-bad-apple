import * as Phaser from 'phaser';
// import Demo from './game';
export default class Snake {

    // this might need exporting
    private gameContainer: HTMLElement = document.querySelector('#game') || document.body
    private gameContainerBCR = this.gameContainer.getBoundingClientRect()
    private  gameContainerW = this.gameContainerBCR.width // window.innerWidth
    private  gameContainerH = this.gameContainerBCR.height
    private ceilsXCount = this.getCeilsCountByPixelsCount(this.gameContainerW) // - 1 (if scroll)
    private ceilsYCount = this.getCeilsCountByPixelsCount(this.gameContainerH)
    private headPosition: Phaser.Geom.Point
    public snakeHeadX: number
    public snakeHeadY: number
    public bodyPartsSprites: Phaser.GameObjects.Sprite[] = []
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
    private currentDir: string = this.DIRECTIONS.UP
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
    public moveRegardingWorldBoundaries () {
        const head = this.getHead()
        const xStartPos = this.getCeilXPos(1)
        const yStartPos = this.getCeilYPos(1)
        const xEndPos = this.getCeilXPos(this.ceilsXCount)
        const yEndPos = this.getCeilYPos(this.ceilsYCount)
    
        let x
        let y
    
        if (head.x < xStartPos) {
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
    public getSnakeLength () {
        return this.bodyPartsPositions.length
    }
    private updateBodyPartsPositions () {
        this.bodyPartsPositions.forEach((pos, i) => {
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
        for (const bodyPart of this.bodyPartsPositions) {
            this.bodyPartsSprites.push(
                this.addSprite(bodyPart.x, bodyPart.y)
            )
        }
    
        this.updateBodyPartsSpritesFrames()
    }
    private addSprite (x, y) {
        const sprite = this.scene.add.sprite(x, y, 'snake', 4)
    
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
            sprite.setTexture('snake', frame)
          }
    
          // head
          if (i === this.getSnakeLength() - 1) {
            setTex(HEAD[dir])
          } else if (!i) { // tail
            // tail not turning
            if (dir === next.dir) {
              setTex(TAIL[dir])
            } else { // Tail in the process of turning
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
    private addBodyBonusSprite (x, y) {
        const sprite = this.scene.add.sprite(x, y, 'snake', 16) // 15
    
        sprite.setDepth(3)
        sprite.setDisplaySize(this.snakeLength / 2, this.snakeLength / 2)
    
        return sprite
    }
}