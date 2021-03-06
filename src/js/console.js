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
/*global require, module, exports:true */
var engine = require('./console/engine'),
    errorHelper = require('./errorHelper'),
    outElement;

if (!require('./console/builtins').registered) {
    console.warn("Built-in commands have not been registered!");
}

exports.mirrorConsole = true;
engine.registerCvar("host_mirror_console", exports, "mirrorConsole");

exports.init = function () {
    var inElement = document.querySelector('#console-input');
    outElement = document.querySelector('#console-output');

    inElement.addEventListener('keypress', function (e) {
        var which = e.which || e.charCode || e.keyCode;
        if (which === 13) {
            try {
                var line = inElement.value;
                exports.writeLine("<] " + line);
                var result = exports.execute(line);
                if (result !== undefined) {
                    exports.log(result);
                }
            } catch (e) {
                exports.error(e.toString());
            }
            inElement.value = "";
        }
    });
};

exports.execute = function (cmdString) {
    engine.executeString(cmdString, exports);
};

exports.write = function (str, color) {
    if (color) {
        str = '<span style="color: ' + color + '">' + str + '</span>';
    }
    outElement.insertAdjacentHTML('beforeend', str);
    outElement.scrollTop = outElement.scrollHeight;
};

exports.writeLine = function (str, color) {
    str = str || "";
    if (color) {
        str = '<span style="color: ' + color + '">' + str + '</span>';
    }
    outElement.insertAdjacentHTML('beforeend', str + "<br>");
    outElement.scrollTop = outElement.scrollHeight;
};

exports.log = function () {
    exports.writeLine(Array.prototype.join.call(arguments, " "));
    if (exports.mirrorConsole) {
        console.log.apply(console, arguments);
    }
};

exports.warn = function () {
    exports.writeLine(Array.prototype.join.call(arguments, " "), 'yellow');
    if (exports.mirrorConsole) {
        console.warn.apply(console, arguments);
    }
};

exports.error = function () {
    var str = Array.prototype.join.call(arguments, " ");
    exports.writeLine(str, 'red');
    // Also queue up an error toast
    errorHelper.queue(str, 2000);
};
