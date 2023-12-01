import { InstancedBufferGeometry } from "three";
export type FSiblingIteratee = (dx: number, dy: number, dz: number, sibling: Block) => void;
export type FBlocksGridIteratee = (x: number, y: number, z: number, block?: Block) => void;
export type FBlocksGridIterateeXZ = (x: number, z: number) => void;
export type FChunkGridIteratee = (x: number, y: number, z: number, block?: Block) => void;
export type FChunkGridIterateeXZ = (x: number, z: number) => void;
export declare enum EBlockShape {
    Cube = 0,
    Prism6 = 1,
    Tree01 = 2,
    House01 = 3,
    Ship01 = 4
}
export declare const BLOCK_SHAPES: EBlockShape[];
export declare enum EBlockType {
    None = 0,
    Bedrock = 1,
    Rock = 2,
    Dirt = 3,
    Grass = 4,
    Sand = 5,
    Water = 6,
    Tree = 7,
    House = 8,
    Ship = 9
}
export interface IBlockDescriptor {
    tile: number[];
    light?: boolean;
    animation?: boolean;
    tangibility: number;
}
export interface IBlockTable {
    [x: string]: IBlockDescriptor;
}
export declare const blockTable: IBlockTable;
export declare class Block {
    static get_shape_geometry(block_shape: EBlockShape): Promise<InstancedBufferGeometry>;
    bx: number;
    by: number;
    bz: number;
    bid: string;
    btype: EBlockType;
    shape: EBlockShape;
    lightness: number;
    serial: number;
    needsUpdate: boolean;
    get tileX(): number;
    get tileY(): number;
    get isLightSource(): boolean;
    get tangibility(): number;
    constructor({ x, y, z, chunk, lightness, blockType, shape }: {
        x: any;
        y: any;
        z: any;
        chunk: any;
        lightness: any;
        blockType: any;
        shape: any;
    });
    kill(): void;
    iterateSiblings(distance: number, iteratee: FSiblingIteratee): void;
    update({ lightness, blockType }: {
        lightness: any;
        blockType: any;
    }): boolean;
}
export declare class BlockManager {
    static instance: BlockManager;
    static getInstance(): BlockManager;
    blocks: {
        [x: string]: Block;
    };
    constructor();
    setBlock(block: Block): void;
    removeBlock(block: Block): void;
    removeBlockAt(x: number, y: number, z: number): boolean;
    getBlockAt(x: number, y: number, z: number): Block;
    getBlockId(...args: number[]): string;
    getMostElevatedBlockAt(x: number, z: number): Block;
    getElevationAt(x: number, z: number): number;
    getElevationAtPosition(x: number, y: number, z: number, minTangibility?: number): number;
    getTangibilityAtPosition(x: number, y: number, z: number): number;
    get maxBlocksPerChunk(): number;
    iterateGridXZ(fx: number, fz: number, tx: number, tz: number, iteratee: FBlocksGridIterateeXZ): void;
    traverse_chunk(cx: number, cz: number, iteratee: FChunkGridIteratee): void;
    traverseChunk2D(cx: number, cz: number, iteratee: FChunkGridIterateeXZ): void;
    markBlocksUpdated(cx: number, cz: number): void;
    countBlocksNeedUpdate(cx: number, cz: number): number;
}
export declare const blockManager: BlockManager;
