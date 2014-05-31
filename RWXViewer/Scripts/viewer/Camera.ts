﻿// Copyright 2014 Joshua R. Rodgers
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//    http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var ZOOM_FACTOR: number = 0.95;
var DEFAULT_RADIUS_SCALE: number = 1.0;
var DEFAULT_CAMERA_DISTANCE: number = 5.0;
var ROTATION_SPEED: number = 0.5;

export class Camera {
    private _cameraMatrix: Mat4Array;
    private _offset: Vec3Array;
    private _position: Vec3Array;
    private _target: Vec3Array;
    private _pan: Vec3Array;
    private _panOffset: Vec3Array;
    private _up: Vec3Array;

    private _thetaDelta: number;
    private _phiDelta: number;
    private _scale: number;

    private _viewportWidth: number;
    private _viewportHeight: number;

    constructor(viewportWidth: number, viewportHeight: number) {
        this.reset();
        this.setViewpowerSize(viewportWidth, viewportHeight);
    }

    setViewpowerSize(width: number, height: number) {
        this._viewportWidth = width;
        this._viewportHeight = height;
    }

    reset() {
        this._cameraMatrix = mat4.create();
        this._offset = vec3.create();
        this._position = vec3.fromValues(0, 0, -DEFAULT_CAMERA_DISTANCE);
        this._target = vec3.create();
        this._pan = vec3.create();
        this._panOffset = vec3.create();
        this._up = vec3.fromValues(0, 1, 0);

        this._thetaDelta = 0;
        this._phiDelta = 0;
        this._scale = DEFAULT_RADIUS_SCALE;
    }

    rotate(deltaX: number, deltaY: number) {
        this._thetaDelta -= 2 * Math.PI * deltaX / this._viewportWidth * ROTATION_SPEED;
        this._phiDelta -= 2 * Math.PI * deltaY / this._viewportHeight * ROTATION_SPEED;
    }

    zoomIn(zoomFactor?: number) {
        this._scale *= (zoomFactor || ZOOM_FACTOR);
    }

    zoomOut(zoomFactor?: number) {
        this._scale /= (zoomFactor || ZOOM_FACTOR);
    }

    pan(deltaX: number, deltaY: number) {
        vec3.sub(this._offset, this._position, this._target);
        var distance = vec3.length(this._offset);

        //TODO: Replace 45 with FOV constant.
        distance *= Math.tan(45 / 2 * Math.PI / 180.0);

        var xDistance: number = 2 * -deltaX * distance / this._viewportHeight;
        vec3.set(this._panOffset, this._cameraMatrix[0], this._cameraMatrix[1], this._cameraMatrix[2]);
        vec3.scale(this._panOffset, this._panOffset, xDistance);
        vec3.add(this._pan, this._pan, this._panOffset);

        var yDistance: number = 2 * deltaY * distance / this._viewportHeight;
        vec3.set(this._panOffset, this._cameraMatrix[4], this._cameraMatrix[5], this._cameraMatrix[6]);
        vec3.scale(this._panOffset, this._panOffset, yDistance);
        vec3.add(this._pan, this._pan, this._panOffset);
    }

    get matrix(): Mat4Array {
        vec3.sub(this._offset, this._position, this._target);

        var offsetX = this._offset[0];
        var offsetY = this._offset[1];
        var offsetZ = this._offset[2];

        var theta = Math.atan2(offsetX, offsetZ);
        var phi = Math.atan2(Math.sqrt(offsetX * offsetX + offsetZ * offsetZ), offsetY);

        theta += this._thetaDelta;
        phi += this._phiDelta;

        var radius = vec3.length(this._offset) * this._scale;
        this._scale = 1;

        this._offset[0] = radius * Math.sin(phi) * Math.sin(theta);
        this._offset[1] = radius * Math.cos(phi);
        this._offset[2] = radius * Math.sin(phi) * Math.cos(theta);

        vec3.add(this._target, this._target, this._pan);
        vec3.add(this._position, this._target, this._offset);

        this._thetaDelta = 0;
        this._phiDelta = 0;
        vec3.set(this._pan, 0, 0, 0);

        return mat4.lookAt(this._cameraMatrix, this._position, this._target, this._up);
    }
}