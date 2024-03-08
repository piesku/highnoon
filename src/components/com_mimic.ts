/**
 * # Mimic
 *
 * The `Mimic` component allows an entity to mimic another entity, i.e. match
 * the target entity's position and rotation with a small lag.
 *
 * `Mimic` is different from `Follow` in that `Follow` only follows the
 * position, but not the rotation of the target entity.
 */

import {Entity} from "../../lib/world.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

export interface Mimic {
    /** Entity whose transform to mimic. */
    Target: Entity;
    /** The stiffness of the follower, eased exponentially. */
    Stiffness: number;
}

/**
 * Add `Mimic` to an entity.
 *
 * @param target Entity whose transform to mimic.
 * @param stiffness The time in seconds that it takes the followers to get closer to the target by a factor of e.
 */
export function mimic(target: Entity, stiffness: number = 1) {
    return (game: Game, entity: Entity) => {
        game.World.Signature[entity] |= Has.Mimic;
        game.World.Mimic[entity] = {
            Target: target,
            Stiffness: stiffness,
        };
    };
}
