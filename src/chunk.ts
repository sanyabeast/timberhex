import { Group, InstancedMesh, InstancedBufferGeometry, InstancedBufferAttribute, Object3D, Material, GridHelper } from "three"
import { logd } from "./utils"
import { state } from "./state"
import { getBlockBaseMaterial as get_block_base_material } from "./shaders"
import { Task } from "./tasker"
import { BLOCK_SHAPES, Block, EBlockShape, blockManager as block_manager, blockTable as block_table } from "./blocks"
import { worldManager } from "./world"
import { monitoringData } from "./gui"
import { debounce, isUndefined } from "lodash"

// Pool of chunk objects for reusability
const _chunks_pool: Chunk[] = []

// Maximum size limit of the chunk pool
const _chunks_pool_limit = 100

/**
 * Represents a single chunk in the world.
 */
export class Chunk extends Group {

    static _chunksCounter = 0;
    static _base_instanced_meshes: { [key in EBlockShape]?: InstancedMesh } = {}
    static _base_block_material: Material = null

    cx: number = null
    cz: number = null
    serial: number = null
    _buildTask: Task = null
    _built: boolean = false
    _instance_data_attribute: { [key in EBlockShape]?: InstancedBufferAttribute } = {}
    _instance_extra_data_attribute: { [key in EBlockShape]?: InstancedBufferAttribute } = {}
    _instanced_meshes: { [key in EBlockShape]?: InstancedMesh } = {}
    _gridHelper: GridHelper

    /**
     * The x-coordinate of the first block in the chunk.
     */
    get bx0() {
        return this.cx * state.chunkSize
    }

    /**
     * The z-coordinate of the first block in the chunk.
     */
    get bz0() {
        return this.cz * state.chunkSize
    }

    /**
     * Create a new Chunk object.
     * @param {Object} options - Options object containing the x and z coordinates of the chunk.
     */
    constructor({ cx, cz }) {
        logd('Chunk', `new [${cx}, ${cz}]}`)
        super()
        this._init(cx, cz)
    }

    /**
     * Synchronize the chunk with the world.
     */
    sync() {
        logd('Chunk.sync', this.toString())
        this._updateGeometry(true)
    }

    async _init(cx: number, cz: number) {
        this.serial = Chunk._chunksCounter
        Chunk._chunksCounter++
        this.matrixAutoUpdate = false

        BLOCK_SHAPES.forEach(async block_shape => {
            this._instanced_meshes[block_shape] = await Chunk._create_instanced_mesh(block_shape)

            this._instance_data_attribute[block_shape] = this._instanced_meshes[block_shape].geometry.attributes['instanceData'] as InstancedBufferAttribute
            this._instance_extra_data_attribute[block_shape] = this._instanced_meshes[block_shape].geometry.attributes['instanceExtraData'] as InstancedBufferAttribute
            this.add(this._instanced_meshes[block_shape])
        })

        console.log(this)


        // Create grid helper for visual debugging
        this._gridHelper = new GridHelper(state.chunkSize, state.chunkSize, 0x999999, 0x999999)
        this._gridHelper.position.set(state.chunkSize / 2 - 0.5, 0, state.chunkSize / 2 - 0.5)
        this.add(this._gridHelper)
        this.setup(cx, cz)
        this._updateGeometry = debounce(this._updateGeometry.bind(this), 1000)
    }
    /**
     * Update the geometry of the chunk.
     * @param {boolean} updateAttrs - Whether to update the attributes.
     */
    _updateGeometry(updateAttrs: boolean = false) {
        if (updateAttrs) {
            let _blocks_in_chunk = 0
            block_manager.traverse_chunk(this.cx, this.cz, (x, y, z, block) => {
                let isntance_index = this._compute_instance_index(x, y, z);
                BLOCK_SHAPES.forEach(block_shape => {
                    this._instance_extra_data_attribute[block_shape].setX(isntance_index, 0)
                })
            })
            block_manager.traverse_chunk(this.cx, this.cz, (x, y, z, block) => {
                let isntance_index = this._compute_instance_index(x, y, z);
                if (block) {
                    _blocks_in_chunk++
                    this._instance_extra_data_attribute[block.shape].setX(isntance_index, 1)
                    let animSpeed = block_table[block.btype].animation === true ? 1 : 0
                    this._instance_extra_data_attribute[block.shape].setY(isntance_index, animSpeed)
                    this._instance_data_attribute[block.shape].setXYZ(isntance_index, block.tileX, block.tileY, block.lightness)
                }
            })

            BLOCK_SHAPES.forEach(block_shape => {
                this._instance_extra_data_attribute[block_shape].needsUpdate = true
                this._instance_data_attribute[block_shape].needsUpdate = true
            })
        }

        BLOCK_SHAPES.forEach(block_shape => {
            this._instanced_meshes[block_shape].instanceMatrix.needsUpdate = true
            this.updateMatrix()
        })
    }

    /**
     * Compute the instance index based on the block coordinates.
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {number} z - The z-coordinate of the block.
     * @returns {number} - The computed instance index.
     */
    _compute_instance_index(x, y, z): number {
        return Chunk.compute_instance_index(this.bx0, this.bz0, x, y, z)
    }

    /**
     * Deallocate resources and clean up the chunk.
     */
    kill() {
        for (let block_shape in EBlockShape) {
            this.remove(this._instanced_meshes[block_shape])
            this._instanced_meshes[block_shape].geometry.dispose()
            this._instanced_meshes[block_shape].material.dispose()
        }
    }

    /**
     * Set up the chunk at the specified coordinates.
     * @param {number} cx - The x-coordinate of the chunk.
     * @param {number} cz - The z-coordinate of the chunk.
     */
    setup(cx: number, cz: number) {
        let isWorldReady = worldManager.checkChunkGeneration(cx, cz)
        this.cx = cx
        this.cz = cz
        this.position.set(this.bx0, 0, this.bz0)

        if (isWorldReady) {
            this.sync()
        } else {
            this._updateGeometry(true)
        }
    }

    /**
     * Get a string representation of the chunk.
     * @returns {string} - A string representation of the chunk.
     */
    override toString() {
        return `Chunk(cx=${this.cx}, cz=${this.cz})`
    }

    /**
     * Compute the instance index based on the block coordinates.
     * @param {number} bx0 - The x-coordinate of the first block in the chunk.
     * @param {number} bz0 - The z-coordinate of the first block in the chunk.
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {number} z - The z-coordinate of the block.
     * @returns {number} - The computed instance index.
     */
    static compute_instance_index(bx0, bz0, x, y, z): number {
        return Math.floor((x - bx0) + state.chunkSize * (y + state.worldHeight * (z - bz0)))
    }

    /**
     * Load a chunk with the specified coordinates.
     * @param {number} cx - The x-coordinate of the chunk.
     * @param {number} cz - The z-coordinate of the chunk.
     * @returns {Chunk} - The loaded chunk object.
     */
    static load(cx: number, cz: number) {
        let chunk: Chunk = _chunks_pool.pop()
        if (chunk === undefined) {
            chunk = new Chunk({ cx, cz })
            logd('Chunk:load    ', `loading new chunk ${chunk.toString()}`)
        } else {
            chunk.setup(cx, cz)
            logd('Chunk:load', `loading from pool ${chunk.toString()}`)
        }

        chunk.visible = true
        monitoringData.chunksPoolSize = _chunks_pool.length.toString()
        return chunk
    }

    /**
     * Unload a chunk and return it to the chunk pool.
     * @param {Chunk} chunk - The chunk object to unload.
     */
    static unload(chunk: Chunk) {
        if (_chunks_pool.length < _chunks_pool_limit) {
            logd('Chunk:unload', `unloading to pool ${chunk.toString()}`)
            _chunks_pool.push(chunk)
        }

        chunk.visible = true
        monitoringData.chunksPoolSize = _chunks_pool.length.toString()
    }

    /**
     * Create the base instanced mesh for rendering blocks.
     * @returns {InstancedMesh} - The instanced mesh.
     */
    static async _create_instanced_mesh(block_shape: EBlockShape): Promise<InstancedMesh> {
        if (isUndefined(Chunk._base_instanced_meshes[block_shape])) {
            // Create base instanced block geometry and attributes
            const _instanced_block_geometry = new InstancedBufferGeometry().copy(await Block.get_shape_geometry(block_shape));
            const _instance_data_array = new Float32Array(block_manager.maxBlocksPerChunk * 3)
            const _instance_data_attribute = new InstancedBufferAttribute(_instance_data_array, 3);

            const _instance_extra_data_array = new Float32Array(block_manager.maxBlocksPerChunk * 3)
            const _instance_extra_data_attribute = new InstancedBufferAttribute(_instance_extra_data_array, 3);


            // Get the base block material
            Chunk._base_block_material = Chunk._base_block_material || get_block_base_material()

            for (let i = 0; i < block_manager.maxBlocksPerChunk; i++) {
                _instance_data_attribute.setXYZ(i, 0, 0, 1);
                _instance_extra_data_attribute.setX(i, 0)
            }

            // Set instance attributes to the instanced geometry
            _instanced_block_geometry.setAttribute('instanceData', _instance_data_attribute);
            _instanced_block_geometry.setAttribute('instanceExtraData', _instance_extra_data_attribute);

            // Create the base instanced mesh
            Chunk._base_instanced_meshes[block_shape] = new InstancedMesh(_instanced_block_geometry, Chunk._base_block_material, block_manager.maxBlocksPerChunk);

            for (let x = 0; x < state.chunkSize; x++) {
                for (let z = 0; z < state.chunkSize; z++) {
                    for (let y = 0; y < state.worldHeight; y++) {
                        let dummy = new Object3D()

                        switch (block_shape) {
                            case EBlockShape.Cube: {
                                dummy.position.set(x, y, z)
                            }
                            default: {
                                let dx = x
                                if (z % 2 == 0) {
                                    dx += 0.5
                                }
                                dummy.position.set(dx, y * 0.5, z)
                                if (block_shape != EBlockShape.Prism6){
                                    dummy.rotation.set(0, (Math.random() * Math.PI * 2), 0)
                                }
                                break;
                            }
                        }
                        
                        dummy.updateMatrix()
                        Chunk._base_instanced_meshes[block_shape].setMatrixAt(Chunk.compute_instance_index(0, 0, x, y, z), dummy.matrix)
                    }
                }
            }

            Chunk._base_instanced_meshes[block_shape].matrixAutoUpdate = false
            Chunk._base_instanced_meshes[block_shape].updateMatrix()
            return Chunk._create_instanced_mesh(block_shape)
        } else {
            // Clone the base instanced mesh
            let clonedInstancedMesh = Chunk._base_instanced_meshes[block_shape].clone()
            clonedInstancedMesh.geometry = Chunk._base_instanced_meshes[block_shape].geometry.clone()

            clonedInstancedMesh.matrixAutoUpdate = false
            clonedInstancedMesh.updateMatrix()

            return clonedInstancedMesh
        }
    }
}