import { Camera, PerspectiveCamera, Plane, Raycaster, Vector2, Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { state } from './state';
import { blockManager } from './blocks';
import { lerp, printd, slide } from './utils';
import { clamp, throttle } from 'lodash';

export enum EBrickscapeControlsType {
    Eagle,
    Hero
}

export interface IBrickscapeControls {
    infoWidget: string
    getAnchorPosition(): Vector3
    setAnchorPosition(pos: Vector3): void
    update()
    camera: PerspectiveCamera
    setAspectRatio(value: number)
    enabled: boolean
}

export class BrickscapeEagleControls extends MapControls implements IBrickscapeControls {
    static instance?: IBrickscapeControls
    static getInstance(): IBrickscapeControls {
        BrickscapeEagleControls.instance = BrickscapeEagleControls.instance ?? new BrickscapeEagleControls();
        return BrickscapeEagleControls.instance;
    }

    constructor() {
        let camera = new PerspectiveCamera(70, 1, 0.1, 1000)
        super(camera, state.renderer.canvas)

        this.camera = camera
        this.screenSpacePanning = false;
        this.minDistance = 1;
        this.maxDistance = 24;
        this.maxPolarAngle = (Math.PI / 2.25);
        // this.maxPolarAngle = (Math.PI);
        this.enableDamping = false
        this.dampingFactor = 0.005
        this.panSpeed = 0.5

        this.enabled = false
    }

    camera: PerspectiveCamera;
    override enabled: boolean = false
    _groundPlane = new Plane(new Vector3(0, 1, 0), 0);
    _intersection = new Vector3();
    _raycaster = new Raycaster();
    _nearClip = 0.1
    _farClip = 1000
    infoWidget: string = "eagle";

    setAspectRatio(value: number) {
        this.camera.aspect = value
        this.camera.updateProjectionMatrix()
    }

    getAnchorPosition(): Vector3 {
        return this._getCameraLookIntersection(this.camera);
    }
    setAnchorPosition(pos: Vector3): void {
        this.target.copy(pos)
        this.object.position.set(pos.x, state.worldHeight, pos.z - state.worldHeight)
        this.object.position.y = state.worldHeight
        console.log(this)
        // throw new Error('Method not implemented.');
    }

    _getCameraLookIntersection(camera) {
        this._raycaster.setFromCamera(new Vector2(0, 0), camera);
        this._raycaster.ray.intersectPlane(this._groundPlane, this._intersection);
        return this._intersection;
    }
}


export function getControlsOfType(type: EBrickscapeControlsType) {
    return BrickscapeEagleControls.getInstance()
}

export function setActiveControls(type: EBrickscapeControlsType): void {
    let prevAnchorPosition: Vector3 = new Vector3(0, 0, 0)
    if (state.controls) {
        prevAnchorPosition = state.controls.getAnchorPosition()
        state.controls.enabled = false
        state.controls.update()
    }

    printd(`setActiveControls: ${type}`)

    let controls = state.controls = getControlsOfType(type)
    controls.setAnchorPosition(prevAnchorPosition)
    state.renderer.reset()

    document.querySelectorAll('.help-box').forEach((el: HTMLElement) => { el.style.visibility = "hidden"; });
    (document.querySelector(`.help-box.${controls.infoWidget}`) as HTMLElement).style.visibility = 'visible';

    state.controls.enabled = true
}