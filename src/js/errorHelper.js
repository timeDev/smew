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

var queue = [], enabled = false, waiting = false;

exports.queue = function (msg, duration, html) {
    queue.push({msg: msg || "An error has occurred", duration: duration || 3000, html: html || ''});

    if (enabled && !waiting) {
        exports.show();
    }
};

exports.show = function () {
    enabled = true;

    if (queue.length < 1 || waiting) {
        return;
    }
    waiting = true;
    // Take the next one off the queue
    var err = queue.pop();
    var toast = document.createElement('paper-toast');
    toast.setAttribute('text', err.msg);
    toast.setAttribute('duration', err.duration.toString());
    toast.insertAdjacentHTML('afterbegin', err.html);
    toast.addEventListener('core-overlay-close-completed', function () {
        document.body.removeChild(toast);
        waiting = false;
        // as one closes, show the next
        exports.show();
    }, false);
    document.body.appendChild(toast);
};
