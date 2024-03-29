/**
 * # sys_collide
 *
 * Detect collisions between static and dynamic [colliders](com_collide.html).
 *
 * Collision detection is done using axis-aligned bounding boxes (AABB).
 *
 * Static vs. dynamic collision detection is O(n*m). All dynamic colliders are
 * checked against all static colliders. This works great for a small number of
 * dynamic colliders and a large number of static colliders.
 *
 * Dynamic vs. dynamic collision detection is O(n^2). All dynamic colliders are
 * checked against all other dynamic colliders. This can become very expensive
 * if there are many dynamic colliders. In general, fewer than 100 dynamic
 * colliders is recommended.
 *
 * Static vs. static collisions are not checked at all.
 */

import {compute_aabb, intersect_aabb, penetrate_aabb} from "../../lib/aabb.js";
import {vec3_negate} from "../../lib/vec3.js";
import {Collide} from "../components/com_collide.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Collide;

export function sys_collide(game: Game, delta: number) {
    // Collect all colliders.
    let static_colliders: Collide[] = [];
    let dynamic_colliders: Collide[] = [];
    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) === QUERY) {
            let transform = game.World.Transform[i];
            let collider = game.World.Collide[i];

            // Prepare the collider for this tick's detection.
            collider.Collisions = [];
            if (collider.New) {
                collider.New = false;
                compute_aabb(transform.World, collider);
            } else if (collider.Dynamic) {
                compute_aabb(transform.World, collider);
                dynamic_colliders.push(collider);
            } else {
                static_colliders.push(collider);
            }
        }
    }

    for (let i = 0; i < dynamic_colliders.length; i++) {
        check_collisions(dynamic_colliders[i], static_colliders, static_colliders.length);
        check_collisions(dynamic_colliders[i], dynamic_colliders, i);
    }
}

/**
 * Check for collisions between a dynamic collider and other colliders.
 *
 * Length is used to control how many colliders to check against. For collisions
 * with static colliders, length should be equal to colliders.length, since we
 * want to consider all static colliders in the scene. For collisions with other
 * dynamic colliders, we only need to check a pair of colliders once.  Varying
 * length allows to skip half of the NxN checks matrix.
 *
 * @param game The game instance.
 * @param collider The current collider.
 * @param colliders Other colliders to test against.
 * @param length How many colliders to check.
 */
function check_collisions(collider: Collide, colliders: Collide[], length: number) {
    for (let i = 0; i < length; i++) {
        let other = colliders[i];
        let collider_can_intersect = collider.Mask & other.Layers;
        let other_can_intersect = other.Mask & collider.Layers;
        if (collider_can_intersect || other_can_intersect) {
            if (intersect_aabb(collider, other)) {
                let hit = penetrate_aabb(collider, other);
                if (collider_can_intersect) {
                    collider.Collisions.push({
                        Other: other.EntityId,
                        Hit: hit,
                    });
                }
                if (other_can_intersect) {
                    other.Collisions.push({
                        Other: collider.EntityId,
                        Hit: vec3_negate([0, 0, 0], hit),
                    });
                }
            }
        }
    }
}
