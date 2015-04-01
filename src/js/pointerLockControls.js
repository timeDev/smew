/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Oskar Homburg
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*global require, module, exports */

// Originally made by mrdoob, significantly changed

var THREE = require('./vendor/three'),
    errorHelper = require('./errorHelper');

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if (!havePointerLock) {
    errorHelper.queue("Pointer lock not supported! Please get a better browser.");
}

module.exports = function (camera, params) {
    params = params || {};

    var scope = this;

    camera.rotation.set(0, 0, 0);

    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position = params.position || new THREE.Vector3(0, 10, 0);
    yawObject.add(pitchObject);

    var PI_2 = Math.PI / 2;

    var sensX = params.sensitivityX || params.sensitivity || 0.002,
        sensY = params.sensitivityY || params.sensitivity || 0.002;

    var onMouseMove = function (event) {
        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * sensX;
        pitchObject.rotation.x -= movementY * sensY;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    };

    document.addEventListener('mousemove', onMouseMove, false);

    var element = params.element || document.body;

    var pointerlockchange = function () {
        scope.enabled = !!(document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element);
        if (params.callback) {
            params.callback(scope.enabled);
        }
    };

    var pointerlockerror = function (e) {
        errorHelper.queue("Error requesting pointer lock, details in console");
    };

    document.addEventListener('pointerlockchange', pointerlockchange, false);
    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

    document.addEventListener('pointerlockerror', pointerlockerror, false);
    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

    this.lockPointer = function () {
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
    };

    this.unlockPointer = function () {
        document.exitPointerLock = document.exitPointerLock || document.webkitExitPointerLock || document.mozExitPointerLock;
        document.exitPointerLock();
    };

    var timestamp = window.performance.now();
    var movement = {forward: 0, left: 0, back: 0, right: 0};

    var onKeyDown = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                movement.forward = 1;
                break;
            case 37: // left
            case 65: // a
                movement.left = 1;
                break;
            case 40: // down
            case 83: // s
                movement.back = 1;
                break;
            case 39: // right
            case 68: // d
                movement.right = 1;
                break;
        }
    };

    var onKeyUp = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                movement.forward = 0;
                break;
            case 37: // left
            case 65: // a
                movement.left = 0;
                break;
            case 40: // down
            case 83: // s
                movement.back = 0;
                break;
            case 39: // right
            case 68: // d
                movement.right = 0;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    this.enabled = false;

    var velocity = params.velocity || 5;

    var v1 = new THREE.Vector3(),
        axis = new THREE.Vector3(0, 0, 1);

    var translateZ = function (distance) {
        v1.copy(axis).applyQuaternion(pitchObject.quaternion).applyQuaternion(yawObject.quaternion);

        yawObject.position.add(v1.multiplyScalar(distance));
    };

    this.update = function () {
        var dt = (performance.now() - timestamp) / 1000;
        timestamp = performance.now();
        if (this.enabled) {
            var distance = dt * velocity;
            translateZ(distance * (movement.back - movement.forward));
            yawObject.translateX(distance * (movement.right - movement.left));
        }
    };

    this.getObject = function () {
        return yawObject;
    };

    this.getDirection = function () {
        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function (v) {
            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;
        }
    }();
};