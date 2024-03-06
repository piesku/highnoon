import {orthographic} from "../../lib/projection.js";
import {camera_canvas} from "../components/com_camera.js";
import {children} from "../components/com_children.js";
import {mimic} from "../components/com_mimic.js";
import {first_named} from "../components/com_named.js";
import {transform} from "../components/com_transform.js";
import {Game} from "../game.js";

export function blueprint_camera_follow(game: Game) {
    return [
        transform(),
        mimic(first_named(game.World, "camera anchor")),
        children([
            transform(
                [50, 50, 50],
                // Isometric projection: Y 45°, X -35.264°, Z 0°
                [-0.28, 0.364, 0.116, 0.88],
            ),
            camera_canvas(orthographic([7, 7], 1, 200), [0.1, 0.5, 0.8, 1]),
        ]),
    ];
}
