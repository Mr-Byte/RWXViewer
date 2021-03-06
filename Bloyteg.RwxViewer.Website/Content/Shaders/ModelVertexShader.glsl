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

attribute vec3 a_vertexPosition;
attribute vec2 a_vertexUV;
attribute vec3 a_vertexNormal;
    
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_normalMatrix;
uniform bool u_isBillboard;
uniform float u_ambientFactor;
uniform float u_diffuseFactor;
uniform vec3 u_lightPosition;

varying vec2 v_textureCoordinates;
varying float v_lightWeighting;
        
void main(void) {
	v_textureCoordinates = a_vertexUV;

	if(u_isBillboard) {
		v_lightWeighting = 1.0;
		mat4 worldView = (u_viewMatrix * u_modelMatrix);
		gl_Position = u_projectionMatrix * (vec4(a_vertexPosition, 1.0) + vec4(worldView[3].xyz, 0.0));
	} else {
		vec3 normal = u_normalMatrix * a_vertexNormal;
		v_lightWeighting = clamp(u_ambientFactor + clamp(dot(normal, normalize(u_lightPosition)), 0.0, 1.0) * u_diffuseFactor, 0.0, 1.0);
		gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);
	}
}