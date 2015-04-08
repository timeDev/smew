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
var THREE = require('./vendor/three'),
    renderloop = require('./renderloop'),
    PointerLockControls = require('./pointerLockControls');

console.log("SMEW Version", require('./version').versionString);

var scene = new THREE.Scene();
var cameraFirst = new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
    cameraTop = new THREE.OrthographicCamera(-150, 150, 150, -150, 1, 1000),
    cameraFront = new THREE.OrthographicCamera(-150, 150, 150, -150, 1, 1000),
    cameraSide = new THREE.OrthographicCamera(-150, 150, 150, -150, 1, 1000);

scene.add(cameraTop);
scene.add(cameraSide);
scene.add(cameraFront);

var ctxFirst, ctxTop, ctxSide, ctxFront;

var renderer = new THREE.WebGLRenderer();

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

var controls;

cameraTop.position.y = 5;
cameraTop.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * 1.5);
cameraSide.position.x = -5;
cameraSide.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI * 1.5);
cameraFront.position.z = 5;

function addGrids() {
    var gridXZ = new THREE.GridHelper(100, 0.5),
        gridXY = new THREE.GridHelper(100, 0.5),
        gridYZ = new THREE.GridHelper(100, 0.5);

    gridXZ.setColors(0xff0000, 0xaa0000);
    gridXY.setColors(0x00ff00, 0x00aa00);
    gridYZ.setColors(0x0000ff, 0x0000aa);

    gridXY.rotation.x = Math.PI / 2;
    gridYZ.rotation.z = Math.PI / 2;

    scene.add(gridXZ);
    scene.add(gridXY);
    scene.add(gridYZ);
}

addGrids();

var loop = renderloop(function () {
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    var canvas, w, h;

    // First person view
    // Get size from parent
    canvas = ctxFirst.canvas;
    w = canvas.parentElement.clientWidth;
    h = canvas.parentElement.clientHeight;
    canvas.width = w;
    canvas.height = h;
    if (w > 0 && h > 0) {
        // Resize camera
        cameraFirst.aspect = w / h;
        cameraFirst.updateProjectionMatrix();

        // Resize renderer
        renderer.setSize(w, h);

        // Render scene
        renderer.render(scene, cameraFirst);

        // Update canvas
        ctxFirst.drawImage(renderer.domElement, 0, 0);
    }

    var viewSize = 10;

    // Top view
    renderUpdateCanvas(ctxTop, cameraTop, viewSize);

    // Side view
    renderUpdateCanvas(ctxSide, cameraSide, viewSize);

    // Front view
    renderUpdateCanvas(ctxFront, cameraFront, viewSize);

    controls.update();
});

function renderUpdateCanvas(ctx, camera, viewSize) {
    var canvas = ctx.canvas,
        w = canvas.parentElement.clientWidth,
        h = canvas.parentElement.clientHeight;
    canvas.width = w;
    canvas.height = h;
    if (w > 0 && h > 0) {
        // Resize camera
        var aspect = w / h;
        camera.left = aspect * viewSize / -2;
        camera.right = aspect * viewSize / 2;
        camera.top = viewSize / 2;
        camera.bottom = viewSize / -2;
        camera.updateProjectionMatrix();

        // Resize renderer
        renderer.setSize(w, h);

        // Render scene
        renderer.render(scene, camera);

        // Update canvas
        ctx.drawImage(renderer.domElement, 0, 0);
    }
}

function initDom() {
    var vFirst = document.getElementById('v-first');
    ctxFirst = vFirst.getContext('2d');
    ctxTop = document.getElementById('v-top').getContext('2d');
    ctxSide = document.getElementById('v-side').getContext('2d');
    ctxFront = document.getElementById('v-front').getContext('2d');

    vFirst.addEventListener('click', function (e) {
        if (e.button === 0) {
            // right-click
            controls.lockPointer();
            e.preventDefault();
            return false;
        }
    }, false);

    controls = new PointerLockControls(cameraFirst, {element: vFirst});
    scene.add(controls.getObject());

    window.addEventListener('polymer-ready', function () {
        require('./errorHelper').show();
        require('./console').init();
        loop.start();
    });
}

if (document.readyState === 'interactive') {
    initDom();
} else {
    document.addEventListener('DOMContentLoaded', initDom);
}
