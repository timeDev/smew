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
    renderloop = require('./renderloop');

console.log("SMEW Version", require('./version').versionString);

var toolsSize = 150, propertiesSize = 300,
    viewHeight = window.innerHeight / 2,
    viewWidth = (window.innerWidth - toolsSize - propertiesSize) / 2;

var scene = new THREE.Scene();
var cameraFP = new THREE.PerspectiveCamera(75, viewWidth / viewHeight, 0.1, 1000);
var cameraTop = new THREE.OrthographicCamera(viewWidth / -2, viewWidth / 2, viewHeight / 2, viewHeight / -2, 1, 1000);
var cameraFront = new THREE.OrthographicCamera(viewWidth / -2, viewWidth / 2, viewHeight / 2, viewHeight / -2, 1, 1000);
var cameraSide = new THREE.OrthographicCamera(viewWidth / -2, viewWidth / 2, viewHeight / 2, viewHeight / -2, 1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(viewWidth, viewHeight);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);
scene.add(cube);

cameraFP.position.z = 5;

renderloop(function () {
    cube.rotation.x += 0.1;
    cube.rotation.y += 0.1;

    renderer.render(scene, cameraFP);
}).start();

function initDom() {
    document.body.appendChild(renderer.domElement);
}

window.addEventListener('resize', function () {
    viewHeight = window.innerHeight / 2;
    viewWidth = (window.innerWidth - toolsSize - propertiesSize) / 2;
    renderer.setSize(viewWidth, viewHeight);
    cameraFP.aspect = viewWidth / viewHeight;
    cameraFP.updateProjectionMatrix();
});

if (document.readyState === 'interactive') {
    initDom();
} else {
    document.addEventListener('DOMContentLoaded', initDom);
}
