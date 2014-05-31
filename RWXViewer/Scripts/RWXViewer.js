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
define(["require", "exports", "jquery", "./viewer/Renderer", './viewer/ObjectPathItemLoader'], function(require, exports, $, Renderer, PathObjectLoader) {
    var renderer;

    $(function () {
        renderer = new Renderer.Renderer($('#viewport')[0]);

        (function () {
            var mousedown = false;
            var lastMouseX = null;
            var lastMouseY = null;

            $("#viewport").mousedown(function () {
                mousedown = true;
                lastMouseX = null;
                lastMouseY = null;
            });

            $(document).mouseup(function () {
                return mousedown = false;
            });

            $(document).mousemove(function (event) {
                if (mousedown) {
                    if (lastMouseX && lastMouseY) {
                        var deltaX = event.pageX - lastMouseX;
                        var deltaY = event.pageY - lastMouseY;

                        renderer.setMouseDeltas(deltaX, deltaY);
                    }

                    lastMouseX = event.pageX;
                    lastMouseY = event.pageY;
                }
            });
        })();

        $.when(renderer.initialize(), PathObjectLoader.loadModel(1)).done(function (_, model) {
            renderer.setCurrentModel(model);

            function tick() {
                renderer.draw();

                window.requestAnimationFrame(tick);
            }

            tick();
        });
    });
});
//# sourceMappingURL=RWXViewer.js.map