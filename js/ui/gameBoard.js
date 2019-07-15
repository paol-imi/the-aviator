/* --- Gameboard --- */
const Gameboard = {
    // load the gameboard within a given container
    load(gameboard){
        this.OVER = gameboard['OVER']
        this.TAKEN = gameboard['TAKEN']
        this.MOVES = gameboard['MOVES']
        this.LEVEL = gameboard['LEVEL']
    },

    // set the color that represent the taken block color
    setTaken(block){
        this.TAKEN.style['background-color'] = block ? block.color : JollyColor
    },

    // set the color that represent the over block color
    setOver(block){
        this.OVER.style['background-color'] = block ? block.color : JollyColor
    },

    // set the number of moves
    setMoves(moves){
        this.MOVES.innerHTML = moves
    },

    // set the level number
    setLevel(level, levels){
        this.LEVEL.innerHTML = ++level + '/' + levels
    },
}