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

import Model = require("Model");

export function loadModel(worldId: number, modelName: string) {
    var deferred = $.Deferred<Model.IModel>();

    $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Models/" + modelName)
        .done(data => deferred.resolve(data))
        .fail(() => deferred.fail());

    return deferred.promise();
}

export interface IObjectPathWorld {
    worldId: number;
    name: string;
}

export interface IObjectPathModel {
    worldId: number;
    name: string;
    fileName: string;
    type: number;
}

export function getWorlds() {
    var deferred = $.Deferred<IObjectPathWorld>();

    $.getJSON("/api/ObjectPath/Worlds")
        .done(data => deferred.resolve(data))
        .fail(() => deferred.fail());

    return deferred.promise();
}

export function getModels(worldId: number) {
    var deferred = $.Deferred<IObjectPathModel>();

    $.getJSON("/api/ObjectPath/Worlds/" + worldId + "/Models")
        .done(data => deferred.resolve(data))
        .fail(() => deferred.fail());

    return deferred.promise();    
}