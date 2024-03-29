/**
 * # sys_audio_listener
 *
 * Update the position and orientation of `game.Audio`'s listener.
 */

import {mat4_get_forward, mat4_get_translation, mat4_get_up} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.AudioListener | Has.Transform;

export function sys_audio_listener(game: Game, delta: number) {
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            update(game, i);
        }
    }
}

let position: Vec3 = [0, 0, 0];
let forward: Vec3 = [0, 0, 0];
let up: Vec3 = [0, 0, 0];

function update(game: Game, entity: Entity) {
    let transform = game.World.Transform[entity];
    mat4_get_translation(position, transform.World);
    mat4_get_forward(forward, transform.World);
    mat4_get_up(up, transform.World);

    let listener = game.Audio.listener;
    if (listener.positionX) {
        // The new AudioListener API.
        listener.positionX.value = position[0];
        listener.positionY.value = position[1];
        listener.positionZ.value = position[2];
        listener.forwardX.value = forward[0];
        listener.forwardY.value = forward[1];
        listener.forwardZ.value = forward[2];
        listener.upX.value = up[0];
        listener.upY.value = up[1];
        listener.upZ.value = up[2];
    } else {
        // Firefox & Safari.
        listener.setPosition(...position);
        listener.setOrientation(...forward, ...up);
    }
}
