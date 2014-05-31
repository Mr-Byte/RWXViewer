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
define(["require", "exports", "Drawable"], function(require, exports, Drawable) {
    var DrawableBuilder = (function () {
        function DrawableBuilder(gl) {
            this._gl = gl;
        }
        DrawableBuilder.prototype.loadModel = function (model) {
            return this.buildMeshDrawable(model, model.Clump);
        };

        DrawableBuilder.prototype.buildMeshDrawable = function (model, geometry) {
            var _this = this;
            var vertexBuffer = this.buildVertexBuffer(geometry);
            var indexBuffers = this.buildIndexBuffers(geometry);

            var drawable = new Drawable.MeshDrawable(vertexBuffer, indexBuffers);

            geometry.Children.forEach(function (child) {
                var childMeshDrawable = _this.buildMeshDrawable(model, child);
                drawable.children.push(childMeshDrawable);
            });

            return drawable;
        };

        DrawableBuilder.prototype.buildVertexBuffer = function (geometry) {
            var vertices = [];
            var uvs = [];
            var normals = [];

            geometry.Vertices.forEach(function (vertex) {
                vertices.push(vertex.Position.X);
                vertices.push(vertex.Position.Y);
                vertices.push(vertex.Position.Z);

                uvs.push(((vertex.Uv) || {}).U || 0);
                uvs.push(((vertex.Uv) || {}).V || 0);

                normals.push(vertex.Normal.X);
                normals.push(vertex.Normal.Y);
                normals.push(vertex.Normal.Z);
            });

            var gl = this._gl;
            var vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

            var uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

            var normalBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

            return {
                vertexPositions: vertexBuffer,
                vertexUVs: uvBuffer,
                vertexNormals: normalBuffer,
                vertexCount: geometry.Vertices.length
            };
        };

        DrawableBuilder.prototype.buildIndexBuffers = function (geometry) {
            var _this = this;
            var trianglesByMaterial = Array();

            geometry.Faces.forEach(function (face) {
                face.Triangles.forEach(function (triangle) {
                    if (face.MaterialId in trianglesByMaterial) {
                        trianglesByMaterial[face.MaterialId].push(triangle);
                    } else {
                        trianglesByMaterial[face.MaterialId] = [triangle];
                    }
                });
            });

            var indexBuffers = [];

            trianglesByMaterial.forEach(function (triangleGroup) {
                var indices = [];

                triangleGroup.forEach(function (triangle) {
                    Array.prototype.push.apply(indices, triangle.Indices);
                });

                var gl = _this._gl;
                var indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

                indexBuffers.push({
                    indexBuffer: indexBuffer,
                    indexCount: indices.length
                });
            });

            return indexBuffers;
        };
        return DrawableBuilder;
    })();
    exports.DrawableBuilder = DrawableBuilder;
});
//# sourceMappingURL=DrawableBuilder.js.map
