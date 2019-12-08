/* --- Parser --- */

// parse each stage with the level colors
const Parser = function (stage, colors) {

    // load the aviator
    function loadAviator(stage) {
        if (stage.aviator.taken !== undefined)
            stage.aviator.taken = createBlock(stage.aviator.taken)

        stage.aviator.direction = getDirection(stage.aviator.direction)
    }

    function getDirection(direction){
        switch(direction){
            case 'up': return 0
            case 'right': return 1
            case 'down': return 2
            case 'left': return 3
            default: return 0
        }
    }

    // create a block
    function createBlock(block) {
        return { color: colors[block].toLowerCase() }
    }

    // load all the blocks
    function loadBlocks(cells) {
        for (let cell of cells) {
            for (let i = 0; i < cell.blocks.length; i++)
                cell.blocks[i] = createBlock(cell.blocks[i])
        }
    }

    loadAviator(stage)
    loadBlocks(stage.end)
    loadBlocks(stage.start)

    // set the holes
    stage.holes = stage.holes || []

    return stage
}