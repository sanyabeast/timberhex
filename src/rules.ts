import { Block, EBlockShape, EBlockType } from "./blocks"
import { state } from "./state"
import { structures } from "./structures"

export enum EBlockReplacingStrategy {
    DontReplace,
    Replace,
    OnlyReplace
}

export interface IBlockPlacement {
    blockType: EBlockType
    block_shape: EBlockShape
    offset: number[]
}

export interface IBlocksGenerationRule {
    name?: string
    structure: IBlockPlacement[]
    create: IBlockCreationRule[]
}

export enum EBlockCreationSource {
    Constant,
    Simplex,
    Perlin
}

export interface IBlockCreationSourceParams {
    seed?: number
    scale?: number
    iterations?: number
    scaleStep?: number,
    multiplier?: number
    addent?: number
}

export interface IBlockCreationLevels {
    min: number
    max: number
}

export interface IBlockCreationRule {

    source: EBlockCreationSource
    params: IBlockCreationSourceParams
    replace: EBlockReplacingStrategy
    stack?: boolean
    replaceInclude?: EBlockType[]
    replaceExclude?: EBlockType[]
    levels: IBlockCreationLevels[]
}

function getSingleBlockStructure(blockType: EBlockType, block_shape: EBlockShape): IBlockPlacement[] {
    return [{
        blockType,
        offset: [0, 0, 0],
        block_shape
    }]
}

export const rules: IBlocksGenerationRule[] = [
    // Bedrock
    {
        structure: getSingleBlockStructure(EBlockType.Bedrock, EBlockShape.Prism6),
        create: [
            {
                source: EBlockCreationSource.Constant,
                replace: EBlockReplacingStrategy.Replace,
                levels: [{
                    min: 0,
                    max: 1
                }],
                params: {}
            }
        ]
    },

    {
        structure: getSingleBlockStructure(EBlockType.Sand, EBlockShape.Prism6),
        create: [
            {
                source: EBlockCreationSource.Perlin,
                replace: EBlockReplacingStrategy.DontReplace,
                levels: [{
                    min: 1,
                    max: 3
                }],
                stack: true,
                params: { scale: 0.05, iterations: 1, scaleStep: 0.5, seed: 10, addent: -0.5, multiplier: 2 }
            },
        ]
    },


    {
        structure: getSingleBlockStructure(EBlockType.Grass, EBlockShape.Prism6),
        create: [
            {
                source: EBlockCreationSource.Perlin,
                replace: EBlockReplacingStrategy.DontReplace,
                levels: [{
                    min: 1,
                    max: 6
                }],
                stack: true,
                params: { scale: 0.1, iterations: 1, scaleStep: 0.5, seed: 10, addent: -0.4, multiplier: 2 }
            },
        ]
    },

    {
        structure: getSingleBlockStructure(EBlockType.Water, EBlockShape.Prism6),
        create: [
            {
                source: EBlockCreationSource.Constant,
                replace: EBlockReplacingStrategy.DontReplace,
                levels: [{
                    min: 1,
                    max: 2
                }],
                params: {}
            }
        ]
    },

    {
        structure: getSingleBlockStructure(EBlockType.Tree, EBlockShape.Tree01),
        create: [
            {
                source: EBlockCreationSource.Perlin,
                replace: EBlockReplacingStrategy.DontReplace,
                replaceInclude: [EBlockType.Grass],
                stack: true,
                levels: [
                {
                    min: 5,
                    max: 6
                },
                {
                    min: 4,
                    max: 5
                }],
                params: { scale: 0.5, iterations: 1, scaleStep: 0.5, seed: 10, addent: -0.4, multiplier: 2 }
            },
        ]
    },

    {
        structure: getSingleBlockStructure(EBlockType.House, EBlockShape.House01),
        create: [
            {
                source: EBlockCreationSource.Perlin,
                replace: EBlockReplacingStrategy.DontReplace,
                replaceInclude: [EBlockType.Grass],
                replaceExclude: [EBlockType.Tree],
                stack: true,
                levels: [
                {
                    min: 4,
                    max: 5
                }],
                params: { scale: 0.5, iterations: 1, scaleStep: 0.5, seed: 10, addent: -0.3, multiplier: 2 }
            },
        ]
    },

    {
        structure: getSingleBlockStructure(EBlockType.House, EBlockShape.House01),
        create: [
            {
                source: EBlockCreationSource.Perlin,
                replace: EBlockReplacingStrategy.DontReplace,
                replaceInclude: [EBlockType.Grass],
                replaceExclude: [EBlockType.Tree],
                stack: true,
                levels: [
                {
                    min: 3,
                    max: 4
                }],
                params: { scale: 0.5, iterations: 1, scaleStep: 0.5, seed: 10, addent: -0.6, multiplier: 2 }
            },
        ]
    },

    {
        structure: getSingleBlockStructure(EBlockType.Ship, EBlockShape.Ship01),
        create: [
            {
                source: EBlockCreationSource.Perlin,
                replace: EBlockReplacingStrategy.DontReplace,
                replaceInclude: [EBlockType.Water],
                stack: true,
                levels: [
                {
                    min: 0,
                    max: 3
                }],
                params: { scale: 0.5, iterations: 1, scaleStep: 0.5, seed: 10, addent: -0.6, multiplier: 2 }
            },
        ]
    },
]