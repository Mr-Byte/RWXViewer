﻿import Model = require("Model")
import Drawable = require("Drawable");

export class DrawableBuilder {
    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
    }

    loadModel(model: Model.IModel): Drawable.IDrawable {
        return this.buildMeshDrawable(model, model.Clump);
    }

    private buildMeshDrawable(model: Model.IModel, geometry: Model.IMeshGeometry): Drawable.MeshDrawable {
        var vertexBuffer: Drawable.IVertexBuffer = this.buildVertexBuffer(geometry);
        var indexBuffers: Drawable.IIndexBuffer[] = this.buildIndexBuffers(geometry);

        var drawable = new Drawable.MeshDrawable(this.gl, vertexBuffer, indexBuffers);

        geometry.Children.forEach(child => {
            var childMeshDrawable = this.buildMeshDrawable(model, child);
            drawable.children.push(childMeshDrawable);
        });

        return drawable;
    }

    private buildVertexBuffer(geometry: Model.IMeshGeometry): Drawable.IVertexBuffer {
        var vertices: number[] = [];
        var uvs: number[] = [];
        var normals: number[] = [];

        geometry.Vertices.forEach((vertex: Model.IVertex) => {
            vertices.push(vertex.Position.X);
            vertices.push(vertex.Position.Y);
            vertices.push(vertex.Position.Z);

            uvs.push((<any>(vertex.Uv) || {}).U || 0);
            uvs.push((<any>(vertex.Uv) || {}).V || 0);

            normals.push(vertex.Normal.X);
            normals.push(vertex.Normal.Y);
            normals.push(vertex.Normal.Z);
        });

        var gl = this.gl;
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
    }

    private buildIndexBuffers(geometry: Model.IMeshGeometry): Drawable.IIndexBuffer[] {
        var trianglesByMaterial: Model.ITriangle[][] = Array();

        geometry.Faces.forEach((face: Model.IFace) => {
            face.Triangles.forEach((triangle: Model.ITriangle) => {
                if (face.MaterialId in trianglesByMaterial) {
                    trianglesByMaterial[face.MaterialId].push(triangle);
                } else {
                    trianglesByMaterial[face.MaterialId] = [triangle];
                }
            });
        });

        var indexBuffers: Drawable.IIndexBuffer[] = [];

        trianglesByMaterial.forEach((triangleGroup: Model.ITriangle[]) => {
            var indices: number[] = [];

            triangleGroup.forEach((triangle: Model.ITriangle) => {
                Array.prototype.push.apply(indices, triangle.Indices);
            });

            var gl = this.gl;
            var indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

            indexBuffers.push({
                indexBuffer: indexBuffer,
                indexCount: indices.length
            });
        });

        return indexBuffers;
    }
} 