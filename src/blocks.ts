import { BoxGeometry, CylinderGeometry, InstancedBufferGeometry, Mesh, Object3D } from "three"
import { state } from "./state"
import { Chunk } from "./chunk"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"

const loader = new OBJLoader()

let _blocksCounter = 0
let _blockManager: BlockManager = null

export type FSiblingIteratee = (dx: number, dy: number, dz: number, sibling: Block) => void

export type FBlocksGridIteratee = (x: number, y: number, z: number, block?: Block) => void
export type FBlocksGridIterateeXZ = (x: number, z: number) => void

export type FChunkGridIteratee = (x: number, y: number, z: number, block?: Block) => void
export type FChunkGridIterateeXZ = (x: number, z: number) => void

export enum EBlockShape {
    Cube,
    Prism6,
    Tree01,
    House01,
    Ship01
}

export const BLOCK_SHAPES: EBlockShape[] = [
    EBlockShape.Cube,
    EBlockShape.Prism6,
    EBlockShape.Tree01,
    EBlockShape.House01,
    EBlockShape.Ship01
]

export enum EBlockType {
    None,
    Bedrock,
    Rock,
    Dirt,
    Grass,
    Sand,
    Water,
    Tree,
    House,
    Ship
}


export interface IBlockDescriptor {
    tile: number[]
    light?: boolean
    animation?: boolean
    tangibility: number
}

export interface IBlockTable {
    [x: string]: IBlockDescriptor
}


export const blockTable: IBlockTable = {
    [EBlockType.None]: {
        tile: [0, 0],
        tangibility: 1
    },
    [EBlockType.Rock]: {
        tile: [0, 1],
        tangibility: 1
    },
    [EBlockType.Dirt]: {
        tile: [2, 0],
        tangibility: 1
    },
    [EBlockType.Grass]: {
        tile: [1, 0],
        tangibility: 1
    },
    [EBlockType.Sand]: {
        tile: [2, 1],
        tangibility: 1
    },
    [EBlockType.Tree]: {
        tile: [0, 3],
        tangibility: 1
    },
    [EBlockType.Ship]: {
        tile: [2, 3],
        tangibility: 1
    },
    [EBlockType.House]: {
        tile: [2, 3],
        tangibility: 1
    },
    [EBlockType.Bedrock]: {
        tile: [1, 1],
        tangibility: 1
    },
    [EBlockType.Water]: {
        tile: [15, 13],
        tangibility: 0.5,
        animation: true,
    },
}

export class Block {
    static async get_shape_geometry(block_shape: EBlockShape): Promise<InstancedBufferGeometry> {
        switch (block_shape) {
            // case EBlockShape.Prism6: {
            //     let g = new CylinderGeometry(1, 1, 0.5, 6) as any as InstancedBufferGeometry
            //     g.scale(1 / 1.732, 1, 1 / 1.5);
            //     return g;
            // }
            case EBlockShape.Prism6: {
                let g = await new Promise<InstancedBufferGeometry>((resolve, reject) => {
                    loader.load('assets/models/prism6.obj', (obj) => {
                        let g = (obj.children[0] as Mesh).geometry as any as InstancedBufferGeometry
                        resolve(g)
                    })
                })

                return g;
            }
            case EBlockShape.Tree01: {
                let g = await new Promise<InstancedBufferGeometry>((resolve, reject) => {
                    loader.load('assets/models/tree_01.obj', (obj) => {
                        let g = (obj.children[0] as Mesh).geometry as any as InstancedBufferGeometry
                        resolve(g)
                    })
                })

                return g;
            }
            case EBlockShape.House01: {
                let g = await new Promise<InstancedBufferGeometry>((resolve, reject) => {
                    loader.load('assets/models/house_01.obj', (obj) => {
                        let g = (obj.children[0] as Mesh).geometry as any as InstancedBufferGeometry
                        resolve(g)
                    })
                })

                return g;
            }
            case EBlockShape.Ship01: {
                let g = await new Promise<InstancedBufferGeometry>((resolve, reject) => {
                    loader.load('assets/models/ship_01.obj', (obj) => {
                        let g = (obj.children[0] as Mesh).geometry as any as InstancedBufferGeometry
                        resolve(g)
                    })
                })

                return g;
            }
            default: {
                let g = new BoxGeometry(1, 1, 1) as any as InstancedBufferGeometry
                console.log(g)
                g.translate(0, 0.5, 0)
                return g
            }
        }
    }


    bx: number = null
    by: number = null
    bz: number = null
    bid: string = null
    btype: EBlockType = EBlockType.None
    shape: EBlockShape = EBlockShape.Cube
    // instanceIndex: number = null
    lightness: number = 1
    serial: number = null
    needsUpdate: boolean = true

    get tileX(): number {
        return blockTable[this.btype].tile[0]
    }

    get tileY(): number {
        return blockTable[this.btype].tile[1]
    }

    get isLightSource(): boolean {
        return blockTable[this.btype].light === true
    }

    get tangibility() {
        return blockTable[this.btype].tangibility
    }

    constructor({ x, y, z, chunk, lightness, blockType, shape }) {

        // if (_blockManager.getBlockAt(x, y, z)) {
        //     // return BlocksManager.getBlockAt(x, y, z)
        // }
        this.bx = x;
        this.by = y;
        this.bz = z;
        this.bid = _blockManager.getBlockId(x, y, z);

        this.shape = shape

        this.serial = _blocksCounter
        _blocksCounter++

        _blockManager.setBlock(this)
        this.update({ lightness, blockType })
        this.needsUpdate = true
    }

    kill() {
        delete _blockManager.blocks[this.bid]
    }

    iterateSiblings(distance: number = 1, iteratee: FSiblingIteratee) {
        distance = Math.round(distance)
        for (let x = -distance; x <= distance; x++) {
            for (let y = -distance; y <= distance; y++) {
                for (let z = -distance; z <= distance; z++) {
                    iteratee(x, y, z, _blockManager.getBlockAt(x + this.bx, y + this.by, z + this.bz))
                }
            }
        }
    }
    update({ lightness, blockType }): boolean {
        let changed = (lightness !== this.lightness) || (blockType !== this.btype)
        this.lightness = lightness
        this.btype = blockType
        this.needsUpdate = changed
        return changed
    }
}


export class BlockManager {

    static instance: BlockManager = null
    static getInstance(): BlockManager {
        if (BlockManager.instance === null) {
            BlockManager.instance = new BlockManager()
        }

        return BlockManager.instance
    }

    blocks: {
        [x: string]: Block
    } = {}

    constructor() {
        _blockManager = this
    }

    setBlock(block: Block): void {
        if (block.by < state.worldHeight && block.by >= 0) {
            this.blocks[block.bid] = block
        }

    }
    removeBlock(block: Block) {
        delete this.blocks[block.bid]
    }
    removeBlockAt(x: number, y: number, z: number): boolean {
        let block = this.getBlockAt(x, y, z)
        if (block) {
            this.removeBlock(block)
        }
        return !!block
    }
    getBlockAt(x: number, y: number, z: number): Block {
        x = Math.floor(x)
        y = Math.floor(y)
        z = Math.floor(z)

        return this.blocks[this.getBlockId(x, y, z)]
    }
    getBlockId(...args: number[]): string {
        return args.join('_')
    }
    getMostElevatedBlockAt(x: number, z: number): Block {
        x = Math.floor(x)
        z = Math.floor(z)

        let r: Block = null

        for (let i = 0; i < state.worldHeight; i++) {
            let b = this.getBlockAt(x, i, z)
            if (b) {
                r = b
            }
        }

        return r
    }
    getElevationAt(x: number, z: number): number {
        x = Math.floor(x)
        z = Math.floor(z)

        let r: number = -1

        for (let i = 0; i < state.worldHeight; i++) {
            let b = this.getBlockAt(x, i, z)
            if (b) {
                r = i
            }
        }

        return r
    }

    getElevationAtPosition(x: number, y: number, z: number, minTangibility: number = 1): number {
        x = Math.floor(x)
        y = Math.floor(y)
        z = Math.floor(z)

        let r: number = -1

        for (let i = 0; i < Math.min(y, state.worldHeight); i++) {
            let b = this.getBlockAt(x, i, z)
            if (b && b.tangibility > minTangibility) {
                r = i
            }
        }

        return r
    }

    getTangibilityAtPosition(x: number, y: number, z: number) {
        if (y < 0) return 1
        if (y > state.worldHeight) return 0

        x = Math.floor(x)
        y = Math.floor(y)
        z = Math.floor(z)

        let r: number = 0
        let b = this.getBlockAt(x, y, z)

        if (b) {
            r = b.tangibility
        }

        return r
    }


    get maxBlocksPerChunk(): number {
        return state.chunkSize * state.chunkSize * state.worldHeight
    }

    iterateGridXZ(fx: number, fz: number, tx: number, tz: number, iteratee: FBlocksGridIterateeXZ) {
        for (let z = fz; z < tz; z++) {
            for (let x = fx; x < tx; x++) {
                iteratee(x, z)
            }
        }
    }

    traverse_chunk(cx: number, cz: number, iteratee: FChunkGridIteratee) {
        for (let z = 0; z < state.chunkSize; z++) {
            for (let x = 0; x < state.chunkSize; x++) {
                for (let y = 0; y < state.worldHeight; y++) {
                    iteratee(x + (cx * state.chunkSize), y, z + (cz * state.chunkSize), this.getBlockAt(x + (cx * state.chunkSize), y, z + (cz * state.chunkSize)))
                }
            }
        }
    }

    traverseChunk2D(cx: number, cz: number, iteratee: FChunkGridIterateeXZ) {
        this.iterateGridXZ(
            cx * state.chunkSize,
            cz * state.chunkSize,
            cx * state.chunkSize + state.chunkSize,
            cz * state.chunkSize + state.chunkSize,
            iteratee
        );
    }

    markBlocksUpdated(cx: number, cz: number): void {
        blockManager.traverse_chunk(cx, cz, (x, y, z, block) => {
            if (block) {
                block.needsUpdate = false
            }
        })
    }


    countBlocksNeedUpdate(cx: number, cz: number): number {
        let i = 0;
        blockManager.traverse_chunk(cx, cz, (x, y, z, block) => {
            if (block && block.needsUpdate) {
                i++
            }
        })
        return i
    }

}


export const blockManager: BlockManager = BlockManager.getInstance()