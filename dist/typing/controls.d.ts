import { PerspectiveCamera, Plane, Raycaster, Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';
export declare enum EBrickscapeControlsType {
    Eagle = 0,
    Hero = 1
}
export interface IBrickscapeControls {
    infoWidget: string;
    getAnchorPosition(): Vector3;
    setAnchorPosition(pos: Vector3): void;
    update(): any;
    camera: PerspectiveCamera;
    setAspectRatio(value: number): any;
    enabled: boolean;
}
export declare class BrickscapeEagleControls extends MapControls implements IBrickscapeControls {
    static instance?: IBrickscapeControls;
    static getInstance(): IBrickscapeControls;
    constructor();
    camera: PerspectiveCamera;
    enabled: boolean;
    _groundPlane: Plane;
    _intersection: Vector3;
    _raycaster: Raycaster;
    _nearClip: number;
    _farClip: number;
    infoWidget: string;
    setAspectRatio(value: number): void;
    getAnchorPosition(): Vector3;
    setAnchorPosition(pos: Vector3): void;
    _getCameraLookIntersection(camera: any): Vector3;
}
export declare function getControlsOfType(type: EBrickscapeControlsType): IBrickscapeControls;
export declare function setActiveControls(type: EBrickscapeControlsType): void;
