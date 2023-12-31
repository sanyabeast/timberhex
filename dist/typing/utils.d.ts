export declare function printd(...args: any[]): void;
export declare function getNearestMultiple(num: number, div?: number): number;
export declare function getNearestMultipleUp(num: number, div?: number): number;
export declare function getAlpha(a: any, b: any, test: any): number;
export declare function clamp(value: number, min: number, max: number): number;
export declare function lerp(start: number, end: number, t: number): number;
export declare function logd(tag: string, ...args: any[]): void;
export declare function getChunkId(cx: number, cz: number): string;
export declare function getRandomHexColor(): number;
export declare function distance(ax: any, ay: any, bx: any, by: any): number;
export declare function isMobileDevice(): boolean;
export declare function waitForCallback(callback: (resolve: (value: unknown) => void) => void): Promise<unknown>;
export declare function getPixelBrightness(imageElement: any, x: any, y: any): number;
export declare function getPixelBrightness2(imageElement: any, x: any, y: any): number;
export declare function slide(from: number, to: number, delta: number): number;
