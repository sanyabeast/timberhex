import { Group, InstancedMesh, InstancedBufferAttribute, Material, GridHelper } from "three";
import { Task } from "./tasker";
import { EBlockShape } from "./blocks";
/**
 * Represents a single chunk in the world.
 */
export declare class Chunk extends Group {
    static _chunksCounter: number;
    static _base_instanced_meshes: {
        [key in EBlockShape]?: InstancedMesh;
    };
    static _base_block_material: Material;
    cx: number;
    cz: number;
    serial: number;
    _buildTask: Task;
    _built: boolean;
    _instance_data_attribute: {
        [key in EBlockShape]?: InstancedBufferAttribute;
    };
    _instance_extra_data_attribute: {
        [key in EBlockShape]?: InstancedBufferAttribute;
    };
    _instanced_meshes: {
        [key in EBlockShape]?: InstancedMesh;
    };
    _gridHelper: GridHelper;
    /**
     * The x-coordinate of the first block in the chunk.
     */
    get bx0(): number;
    /**
     * The z-coordinate of the first block in the chunk.
     */
    get bz0(): number;
    /**
     * Create a new Chunk object.
     * @param {Object} options - Options object containing the x and z coordinates of the chunk.
     */
    constructor({ cx, cz }: {
        cx: any;
        cz: any;
    });
    /**
     * Synchronize the chunk with the world.
     */
    sync(): void;
    _init(cx: number, cz: number): Promise<void>;
    /**
     * Update the geometry of the chunk.
     * @param {boolean} updateAttrs - Whether to update the attributes.
     */
    _updateGeometry(updateAttrs?: boolean): void;
    /**
     * Compute the instance index based on the block coordinates.
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {number} z - The z-coordinate of the block.
     * @returns {number} - The computed instance index.
     */
    _compute_instance_index(x: any, y: any, z: any): number;
    /**
     * Deallocate resources and clean up the chunk.
     */
    kill(): void;
    /**
     * Set up the chunk at the specified coordinates.
     * @param {number} cx - The x-coordinate of the chunk.
     * @param {number} cz - The z-coordinate of the chunk.
     */
    setup(cx: number, cz: number): void;
    /**
     * Get a string representation of the chunk.
     * @returns {string} - A string representation of the chunk.
     */
    toString(): string;
    /**
     * Compute the instance index based on the block coordinates.
     * @param {number} bx0 - The x-coordinate of the first block in the chunk.
     * @param {number} bz0 - The z-coordinate of the first block in the chunk.
     * @param {number} x - The x-coordinate of the block.
     * @param {number} y - The y-coordinate of the block.
     * @param {number} z - The z-coordinate of the block.
     * @returns {number} - The computed instance index.
     */
    static compute_instance_index(bx0: any, bz0: any, x: any, y: any, z: any): number;
    /**
     * Load a chunk with the specified coordinates.
     * @param {number} cx - The x-coordinate of the chunk.
     * @param {number} cz - The z-coordinate of the chunk.
     * @returns {Chunk} - The loaded chunk object.
     */
    static load(cx: number, cz: number): Chunk;
    /**
     * Unload a chunk and return it to the chunk pool.
     * @param {Chunk} chunk - The chunk object to unload.
     */
    static unload(chunk: Chunk): void;
    /**
     * Create the base instanced mesh for rendering blocks.
     * @returns {InstancedMesh} - The instanced mesh.
     */
    static _create_instanced_mesh(block_shape: EBlockShape): Promise<InstancedMesh>;
}
