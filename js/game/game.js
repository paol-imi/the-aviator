/* ---- Game ---- */
const Game = class {
    constructor(gamepad, gui) {
        // link the gamepad
        gamepad.setGame(this, this.manageRequest)

        this.gamepad = gamepad
        this.gui = gui
    }

    // init the states
    init() {
        // current focused level index
        this.currentLevel = 0
        // current showing level index
        this.showingLevel = 0
        // moves done
        this.moves = 0

        // auto show next/prior level in the gui
        // on START/FINISHED requests
        this.autoShowing = true

        // update the gameboard
        this.updateGameboard()
    }

    // update the gameboard
    updateGameboard() {
        // moves
        Gameboard.setMoves(this.moves)
        // taken color
        Gameboard.setTaken(this.aviator.taken)
        // over color
        Gameboard.setOver(this.getCell().blocks.slice(-1)[0])
        // level
        Gameboard.setLevel(this.showingLevel, this.levels.length)
    }

    /* ---- Request management ---- */

    // manage the requests
    manageRequest(request, back, old) {
        let result

        if (['MOVE', 'TURN', 'TAKE', 'RELEASE', 'TAKEN', 'OVER'].includes(request.method) && !old)
            // update the game
            result = this[request.method].apply(this, [].concat(request.args, request))

        // check the game status
        // update the result if the level has failed
        result = this.checkGameState(request, back, old) || result

        // update the gui
        return this.currentIsShowing
            ? this.gui.manageRequest(request, back).then(() => result)
            : this.gui.manageRequest().then(() => result)
    }

    /* ---- Level loading ---- */

    // reset the code
    reset() {
        // reset the gamepad (and the gampead.level)
        this.gamepad.load(this.levels.length)
        // load the gui
        this.gui.load(this.level)
        // load the first request
        this.gamepad.forward()
        // init
        this.init()
    }
    // load the levels
    load(levels) {
        this.levels = levels
        // load the gui
        this.gui.load(this.level)
        // init
        this.init()
    }
    // load next level
    next() {
        if (this.currentLevel < this.levels.length - 1) {
            this.currentLevel++

            // if autoShowing is enabled load the next level in the gui
            if (this.autoShowing) {
                this.showingLevel = this.currentLevel
                Gameboard.setLevel(this.currentLevel)
                return this.gui.load(this.level)
            }
        }
    }
    // load prior level
    prior() {
        if (this.currentLevel > 0) {
            this.currentLevel--

            // if autoShowing is enabled load the next level in the gui
            if (this.autoShowing) {
                this.showingLevel = this.currentLevel
                Gameboard.setLevel(this.currentLevel)
                return this.gui.load(this.level)
            }
        }
    }

    /* ---- Level showing ---- */

    // get if the current level is showing
    get currentIsShowing() {
        return this.showingLevel == this.currentLevel
    }
    // show next level in the gui
    showNext() {
        // disable autoShowing
        this.autoShowing = false

        // update the showingLevel
        if (this.showingLevel < this.levels.length - 1) {
            this.showingLevel++
            // update the gameboard
            this.updateGameboard()
            return this.gui.load(this.levels[this.showingLevel])
        }
    }
    // show prior level in the gui
    showPrior() {
        // disable autoShowing
        this.autoShowing = false

        // update the showingLevel
        if (this.showingLevel > 0) {
            this.showingLevel--
            // update the gameboard
            this.updateGameboard()
            return this.gui.load(this.levels[this.showingLevel])
        }
    }

    /* ---- Game state ---- */

    // return Blockly.Gamepad['STATES']['FINISHED'] if the current level is finished 
    // otherwhise undefined
    get state() {
        for (let eCell of this.level.end) {
            // get the cell
            let sCell = this.level.start.find(c => (c.x == eCell.x) && (c.y == eCell.y))

            // check if the cells are equals
            if ((sCell == undefined) || (sCell.blocks.length < eCell.blocks.length)) return
            for (let i = 0; i < eCell.blocks.length; i++)
                if (eCell.blocks[i].color != sCell.blocks[i].color) return
        }

        return Blockly.Gamepad['STATES']['FINISHED']
    }
    // check the game state
    checkGameState(request, back, old) {
        // if the level has failed
        if (this.state != Blockly.Gamepad['STATES']['FINISHED'] && request.method == Blockly.Gamepad['STATES']['FINISHED'] && !old) {
            // show to the user
            swal.fire({
                type: 'error',
                title: 'Level failed!'
            })

            // end the code
            return {
                completed: true
            }
        }

        // if the level is completed
        if (this.currentLevel == this.levels.length - 1 && request.method == Blockly.Gamepad['STATES']['FINISHED'] && !old)
            // show to the user
            swal.fire({
                type: 'success',
                title: 'Level completed!',
            })

        // if the current level is finished and there's a forward request load the next level
        // the level is loaded with the start event
        // if there's only one level this method is never triggered
        if (request.method == Blockly.Gamepad['STATES']['STARTED'] &&
            (this.gamepad.state == Blockly.Gamepad['STATES']['FINISHED'] || this.gamepad.state == Blockly.Gamepad['STATES']['COMPLETED']) &&
            !back) this.next();

        // if the current level is started and there's a backward request load the prior level
        // the level is loaded with the finished event
        // if there's only one level this method is never triggered
        if ((request.method == Blockly.Gamepad['STATES']['FINISHED'] || request.method == Blockly.Gamepad['STATES']['COMPLETED']) &&
            this.gamepad.state == Blockly.Gamepad['STATES']['STARTED'] &&
            back) this.prior();

        if (['MOVE', 'TURN', 'TAKE', 'RELEASE', 'TAKEN', 'OVER'].includes(request.method))
            // update moves
            this.moves += back ? -1 : 1
            
        // update the gameboard
        this.updateGameboard()
    }

    /* ---- Game shortcuts ---- */

    get levels() {
        return this.gamepad.levels
    }
    get level() {
        return this.gamepad.level
    }
    get start() {
        return this.level.start
    }
    get end() {
        return this.level.end
    }
    get aviator() {
        return this.level.aviator
    }
    get width() {
        return this.level.dimension.width
    }
    get height() {
        return this.level.dimension.height
    }
    get holes() {
        return this.level.holes
    }

    set levels(levels) {
        this.gamepad.levels = levels
    }

    /* ---- Game utils ---- */

    // update the direction of the aviator
    getDirection(direction) {
        return (this.aviator.direction + direction) % 4
    }
    // get the position offset
    getOffset(direction) {
        return [{
            x: 0,
            y: 1
        },
        {
            x: -1,
            y: 0
        },
        {
            x: 0,
            y: -1
        },
        {
            x: 1,
            y: 0
        }
        ][direction]
    }
    // get the cell under the aviator
    getCell() {
        return this.start.find(cell => (cell.x == this.aviator.x) && (cell.y == this.aviator.y)) || this.createCell()
    }
    // create a cell under the aviator
    createCell() {
        let cell = {
            x: this.aviator.x,
            y: this.aviator.y,
            blocks: []
        }

        this.start.push(cell)
        return cell
    }
    // get if the aviator can move
    canMove(offset) {
        let {
            x,
            y
        } = offset

        return (x + this.aviator.x >= 0) &&
            (y + this.aviator.y >= 0) &&
            (x + this.aviator.x < this.width) &&
            (y + this.aviator.y < this.height) &&
            (this.holes.find(hole => (x + this.aviator.x == hole[0]) && (y + this.aviator.y == hole[1])) == undefined)
    }

    /* ---- Game methods ---- */

    MOVE(direction, request) {
        let relativeDirection = this.getDirection(direction),
            offset = this.getOffset(relativeDirection),
            canMove = this.canMove(offset),
            oldY = this.getCell().blocks.length

        // update aviator position
        if (canMove) {
            this.aviator.x += offset.x
            this.aviator.y += offset.y
        }

        request.data = [
            canMove, // can move
            direction == Blockly.Gamepad['INPUTS']['FORWARD'],
            offset.x, // x
            offset.y, // z
            oldY, // old y
            this.getCell().blocks.length // new y
        ]
    }
    TURN(direction, request) {
        // update the direction
        this.aviator.direction = this.getDirection(direction)

        request.data = [
            direction == Blockly.Gamepad['INPUTS']['RIGHT'] // if clockwise
        ]
    }
    TAKE(request) {
        let cell = this.getCell(),
            block = cell.blocks.pop(),
            oldBlock = this.aviator.taken,
            blocks = cell.blocks.length

        // update the taken block
        this.aviator.taken = block

        request.data = [
            cell.x, // x
            blocks, // y
            cell.y, // z
            block, // block
            oldBlock // old block
        ]
    }
    RELEASE(request) {
        let cell = this.getCell(),
            block = this.aviator.taken,
            blocks = cell.blocks.length

        // update the taken block
        if (block != undefined) {
            this.aviator.taken = undefined
            cell.blocks.push(block)
        }

        request.data = [
            cell.x, // x
            blocks, // y
            cell.y, // z
            block, // the released block
        ]
    }
    TAKEN(color) {
        let block = this.aviator.taken

        // return true if the block exist and it is of the choosen color 
        // or the choosen color is the jollycolor
        return {
            return: block && (block.color === color || color === JollyColor)
        }
    }
    OVER(color) {
        let block = this.getCell().blocks.slice(-1)[0]

        // return true if the block exist and it is of the choosen color 
        // or the choosen color is the jollycolor
        return {
            return: block && (block.color === color || color === JollyColor)
        }
    }
}