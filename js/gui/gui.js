/* --- Gui --- */
class Gui {
    constructor() {
        this.asynchronizer = new Blockly.Gamepad.Asynchronizer(
            GUI,
            function (stage) {
                // bind to this because of the asynchronizer
                this.Three = Three
                this.Three.clear()

                this.holes = stage.holes
                this.width = stage.dimension.width
                this.height = stage.dimension.height

                this.grid = new Array(this.width)
                this.translucentGrid = new Array(this.width)

                // create the grid
                for (let i = 0; i < this.width; i++) {
                    this.grid[i] = new Array(this.height)
                    this.translucentGrid[i] = new Array(this.height)

                    for (let j = 0; j < this.height; j++) {
                        this.grid[i][j] = []
                        this.translucentGrid[i][j] = []
                    }
                }

                this.createGrid()

                // load the blocks (start)
                for (const column of stage.start) {
                    let x = column.x,
                        y = column.y,
                        z
                    for (z = 0; z < column.blocks.length; z++)
                        this.createBlock(
                            x,
                            z,
                            y,
                            column.blocks[z],
                            false
                        )
                }

                // create the airplane
                this.createAirPlane(
                    stage.aviator.x,
                    this.grid[stage.aviator.x][stage.aviator.y].length,
                    stage.aviator.y,
                    stage.aviator.direction,
                    stage.aviator.taken
                )

                // load the blocks (end)
                for (const column of stage.end) {
                    let x = column.x,
                        y = column.y,
                        z
                    for (z = 0; z < column.blocks.length; z++)
                        this.createBlock(
                            x,
                            z,
                            y,
                            column.blocks[z],
                            true
                        )
                }

                // render the canvas
                this.render()
            })

        // loading promise
        this.loading = Blockly.Gamepad.utils.promiseWrapper()
        this.loading.resolve()
    }

    // manage the requests
    manageRequest(request, back) {
        let ac = this.asynchronizer.async

        return new Promise(async resolve => {
            // if the game is resetting the current request is skipped
            const skipRequest = this.loading.isPending()
            // await game resetting
            await this.loading
            // skip the request
            if(skipRequest) return resolve()           

            // surrounded with try and catch because the GUI crashes when it is resetted
            try {
                if (request && ['MOVE', 'TURN', 'TAKE', 'RELEASE'].includes(request.method))
                    // load the animation
                    await ac[request.method].apply(ac, [back].concat(request.data))
                else
                    // await some time
                    await ac.timer()
            } catch (error) { Blockly.Gamepad.utils.errorHandler(error) }

            resolve()
        })
    }

    // load a stage
    load(stage) {
        // if it is resetting return
        if (this.loading.isPending()) return

        // set loading promise
        this.loading = Blockly.Gamepad.utils.promiseWrapper()
        // load the gui
        this.asynchronizer.reset()
        this.asynchronizer.run(stage)
        // solve the promise
        this.loading.resolve()
    }

    // remove animation
    removeAnimation() {
        let ac = this.asynchronizer.async, tid

        // if the user click the forward/backward buttons 2 or more times within 
        // 'clickTime' milliseconds of each other the animation will not show
        ac.tid = tid = setTimeout(() => {
            if (ac.tid !== tid) {
                guiData.time = 0
                ac.animations && ac.animations.complete()
            }else{
                guiData.time = 1
            }
        }, guiData.clickTime)
    }
}

/* --- GUI --- */
class GUI {
    // timer
    timer() {
        return new Promise(resolve => setTimeout(resolve, this.duration * 400))
    }
    // render the scene
    render() {
        try {
            // update the sprites
            this.airPlane.updatePropeller()
            this.airPlane.pilot.updateHairs()
            this.Three.render()

            // render
            requestAnimationFrame(() => this.render())
        } catch (error) {
            Blockly.Gamepad.utils.errorHandler(error)
        }
    }

    // easing
    get ease() {
        return (guiData.speed < 4) ?
            Power2.easeInOut :
            Power0.easeNone
    }
    // duration
    get duration() {
        return guiData.time / guiData.speed
    }

    // half floor width
    get hfw() {
        return this.width * guiData.size / 2
    }
    // half floor height
    get hfh() {
        return this.height * guiData.size / 2
    }
    // get the y of block or airPlane
    getHeight(blocks, ofAirPlane) {
        return ofAirPlane
            ? blocks * (guiData.blockSpace + guiData.blockSize) + guiData.airPlaneDistance + guiData.blockSpace
            : (blocks + 1) * (guiData.blockSpace + guiData.blockSize) - guiData.blockSize / 2
    }
    // get the rotation angle
    getRotation(direction) {
        return (Math.PI / 2) * (3 - direction)
    }
    // get the position { x, z }
    getCoordinates(x, z) {
        return {
            z: z * guiData.size - this.hfh + guiData.size / 2,
            x: x * guiData.size - this.hfw + guiData.size / 2
        }
    }
    // get the angle of the rearing
    getAngle(newY, oldY, up) {
        let delta = (newY || 1) - (oldY || 1)
        return Math.atan(delta * (up ? 1 : -1)) / 2
    }

    // create the floor grid
    createGrid() {
        let group = new THREE.Group(),
            cube, x, z, type, coords

        for (x = 0; x < this.width; x++) {
            for (z = 0; z < this.height; z++) {
                // if there isn't a hole
                if (this.holes.find(c => (c[0] == x) && (c[1] == z)) == undefined) {

                    // generate the cell
                    type = ((x + z % 2) % 2 == 1) ? 1 : 2
                    cube = new Textures.Cell(type)

                    // set the position
                    coords = this.getCoordinates(x, z)
                    cube.mesh.position.set(
                        coords.x,
                        -guiData.floorDepth / 2,
                        coords.z)

                    // add the mesh
                    group.add(cube.mesh)
                }
            }
        }

        this.Three.scene.add(group)
    }
    // create a block
    createBlock(x, y, z, block, translucent) {
        let cube = new Textures.Block(block.color, translucent),
            coords = this.getCoordinates(x, z)

        // add the mesh in the grid
        translucent
            ? this.translucentGrid[x][z].push(cube.mesh)
            : this.grid[x][z].push(cube.mesh)

        // set the position
        cube.mesh.position.set(coords.x, this.getHeight(y), coords.z)

        this.Three.scene.add(cube.mesh)
    }
    // create the airPlane
    createAirPlane(x, y, z, direction, taken) {
        this.airPlane = new Textures.AirPlane()

        // set the position
        let coord = this.getCoordinates(x, z)
        this.airPlane.mesh.position.set(coord.x, this.getHeight(y || 1, true), coord.z)

        // generate the taken block
        if (taken) {
            let { mesh } = new Textures.Block(taken.color, false)
            mesh.scale.set(guiData.takenScale, guiData.takenScale, guiData.takenScale)

            this.airPlane.setBlock(mesh)

            mesh.position.x = -guiData.carrX
            mesh.position.y = -guiData.carrY
            mesh.position.z = 0
        }

        this.airPlane.mesh.rotation.y = this.getRotation(direction)
        this.Three.scene.add(this.airPlane.mesh)
    }

    /* --- methods --- */

    MOVE(back, canMove, up, offX, offZ, oldY, newY) {
        offX *= guiData.size
        offZ *= guiData.size

        if (canMove) {
            // animations
            return this.animations = Animations.animate(
                [
                    [this.airPlane.mesh.position, this.duration, {
                        x: this.airPlane.mesh.position.x + offX * (back ? -1 : 1),
                        y: this.getHeight((back ? oldY : newY) || 1, true),
                        z: this.airPlane.mesh.position.z + offZ * (back ? -1 : 1),
                        ease: this.ease
                    }],
                    [this.airPlane.mesh.rotation, this.duration * .40, {
                        z: this.getAngle(newY, oldY, up),
                        ease: Power0.easeIn
                    }, '-=' + this.duration],
                    [this.airPlane.mesh.rotation, this.duration * .60, {
                        z: 0,
                        ease: Power1.easeOut
                    }, '-=' + this.duration * .40]
                ]
            )
        } else {
            // crash animation
            return this.animations = Animations.animate([
                [
                    this.airPlane.mesh.position, this.duration / 2, {
                        x: this.airPlane.mesh.position.x + offX / 2,
                        z: this.airPlane.mesh.position.z + offZ / 2,
                        ease: this.ease
                    }
                ],
                [
                    this.airPlane.mesh.position, this.duration / 2, {
                        x: this.airPlane.mesh.position.x,
                        z: this.airPlane.mesh.position.z,
                        ease: this.ease
                    }
                ]
            ])
        }
    }
    TURN(back, clockwise) {
        clockwise = back ? !clockwise : clockwise

        // animations vector        
        let rotationMatrix = new THREE.Matrix4().extractRotation(this.airPlane.mesh.matrixWorld),
            vector = new THREE.Vector3(Math.PI / 20 * (clockwise ? 1 : -1), 0, Math.PI / 20),
            y = this.airPlane.mesh.rotation.y,
            delta = 2 / 3

        // normalize the vector
        vector.applyMatrix4(rotationMatrix)

        // animations
        return this.animations = Animations.animate([
            [
                this.airPlane.mesh.rotation, this.duration, {
                    y: y + Math.PI / 2 * (clockwise ? -1 : 1),
                    ease: this.ease
                }
            ],
            [
                this.airPlane.mesh.rotation, this.duration * delta, {
                    x: vector.x,
                    ease: Power2.easeOut
                }, "-=" + this.duration
            ],
            [
                this.airPlane.mesh.rotation, this.duration * (1 - delta), {
                    x: 0,
                    z: 0,
                    ease: Power1.easeInOut
                }, "-=" + this.duration * (1 - delta)
            ]
        ])
    }
    TAKE(back, x, y, z, block, oldBlock) {
        // The opposite animation is .RELEASE()
        if (back) return this.RELEASE(false, x, y, z, block, oldBlock)

        // animations vector
        let mesh = this.grid[x][z].pop(),
            rotationMatrix = new THREE.Matrix4().extractRotation(this.airPlane.mesh.matrixWorld),
            vector = new THREE.Vector3(-guiData.carrX, guiData.airPlaneDistance - guiData.blockSize / 2 - guiData.carrY, 0)

        // normalize the vector
        vector.applyMatrix4(rotationMatrix)

        let animations = [[{}, this.duration, {}]]

        // animations
        if (block != undefined)
            animations = [
                [mesh.scale, this.duration, {
                    y: guiData.takenScale,
                    x: guiData.takenScale,
                    z: guiData.takenScale,
                    ease: this.ease
                }],
                [mesh.position, this.duration, {
                    x: mesh.position.x + vector.x,
                    y: mesh.position.y + vector.y,
                    z: mesh.position.z + vector.z,
                    ease: this.ease
                }, "-=" + this.duration,],
                [this.airPlane.mesh.position, this.duration, {
                    y: this.getHeight(y, true),
                    ease: this.ease,
                    onComplete: () => {
                        try {
                            // hang the block on the plane
                            this.airPlane.setBlock(mesh)
                            mesh.position.x = -guiData.carrX
                            mesh.position.y = -guiData.carrY
                            mesh.position.z = 0
                        } catch (error) { }
                    }
                }, "-=" + this.duration]
            ]

        // animations to remove the old block
        if (oldBlock != undefined)
            animations.push([this.airPlane.block.scale, this.duration / 3, {
                y: guiData.minScale,
                x: guiData.minScale,
                z: guiData.minScale,
                ease: Power0.easeOut,
                onComplete: () => {
                    try {
                        this.airPlane.popBlock()
                    } catch (error) { }
                }
            }, "-=" + this.duration])

        // animations
        if (y == 0 && block)
            animations.push([this.airPlane.mesh.position, this.duration / 2, {
                y: this.getHeight(1, true),
                ease: this.ease,
            }])

        return this.animations = Animations.animate(animations)
    }
    RELEASE(back, x, y, z, block, oldBlock) {
        // The opposite animation is .TAKE()
        if (back) return this.TAKE(false, x, y, z, block, oldBlock)

        let wf = x * guiData.size - this.hfw + guiData.size / 2,
            hf = z * guiData.size - this.hfh + guiData.size / 2,
            hy = this.getHeight(y),
            mesh = this.airPlane.block,
            // animation vector
            rotationMatrix = new THREE.Matrix4().extractRotation(this.airPlane.mesh.matrixWorld),
            vector = new THREE.Vector3(-guiData.carrX, guiData.airPlaneDistance - guiData.blockSize / 2 - guiData.carrY, 0)

        // normalize the vector
        vector.applyMatrix4(rotationMatrix)

        if (oldBlock) {
            // generate the old block
            oldBlock = new Textures.Block(oldBlock.color, false).mesh
            oldBlock.scale.set(guiData.minScale, guiData.minScale, guiData.minScale)
        }

        let animations = []

        // animations
        if (y == 0 && block)
            animations.push([this.airPlane.mesh.position, this.duration / 2, {
                y: this.getHeight(0, true),
                ease: this.ease
            }])

        if (block)
            animations.push(
                [{}, .1, {
                    onStart: () => {
                        try {
                            this.airPlane.popBlock()
                            mesh.position.set(
                                wf + vector.x,
                                hy + vector.y,
                                hf + vector.z
                            )

                            this.grid[x][z].push(mesh)
                            this.Three.scene.add(mesh)
                        } catch (error) { }
                    }
                }],
                [
                    mesh.scale, this.duration, {
                        y: 1,
                        x: 1,
                        z: 1,
                        ease: this.ease
                    }
                ],
                [
                    mesh.position, this.duration, {
                        x: wf,
                        y: hy,
                        z: hf,
                        ease: this.ease
                    }, "-=" + this.duration
                ],
                [
                    this.airPlane.mesh.position, this.duration, {
                        y: this.getHeight(y + 1, true),
                        ease: this.ease
                    }, "-=" + this.duration
                ])

        // animations to restore the old block     
        if (oldBlock)
            animations.push([oldBlock.scale, this.duration / 3, {
                y: guiData.takenScale,
                x: guiData.takenScale,
                z: guiData.takenScale,
                ease: Power0.easeIn,
                onStart: () => {
                    this.airPlane.setBlock(oldBlock)
                    oldBlock.position.x = -guiData.carrX
                    oldBlock.position.y = -guiData.carrY
                    oldBlock.position.z = 0
                }
            }, "-=" + (block ? this.duration / 3 : 0)])

        return this.animations = Animations.animate(animations)
    }
}

/* --- data --- */
const guiData = {
    time: 1,
    speed: 1,
    clickTime: 350,
    size: 108,
    blockSize: 52,
    blockSpace: 8,
    airPlaneDistance: 50,
    carrX: 25,
    carrY: 30,
    crashDistance: 22,
    floorDepth: 4,
    takenScale: .4,
    minScale: .1
}