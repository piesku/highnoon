/**
 * # sys_draw
 *
 * Draw 2D [primitives](com_draw.html) in the 3D scene using the Context2D API.
 */

import {mat4_get_translation} from "../../lib/mat4.js";
import {Vec3} from "../../lib/math.js";
import {vec3_transform_position} from "../../lib/vec3.js";
import {CameraKind} from "../components/com_camera.js";
import {DrawKind, DrawSelection, DrawText} from "../components/com_draw.js";
import {Game} from "../game.js";
import {Has} from "../world.js";

const QUERY = Has.Transform | Has.Draw;

export function sys_draw(game: Game, delta: number) {
    game.ForegroundContext.resetTransform();
    game.ForegroundContext.clearRect(0, 0, game.ViewportWidth, game.ViewportHeight);
    let position = <Vec3>[0, 0, 0];

    let camera_entity = game.Cameras[0];
    let main_camera = game.World.Camera[camera_entity];
    if (!main_camera || main_camera.Kind === CameraKind.Xr) {
        return;
    }

    for (let i = 0; i < game.World.Signature.length; i++) {
        if ((game.World.Signature[i] & QUERY) == QUERY) {
            // World position.
            mat4_get_translation(position, game.World.Transform[i].World);
            // NDC position.
            vec3_transform_position(position, position, main_camera.Pv);

            if (position[2] < -1 || position[2] > 1) {
                // The entity is outside the frustum. Only consider the Z axis
                // which allows us to discard all positions in front of the near
                // plane (behind the camera) and behind the far plane. We still
                // draw the remaining XY positions outside NDC in case the
                // drawing is wide or tall enough to be visible.
                continue;
            }

            game.ForegroundContext.setTransform(
                1,
                0,
                0,
                1,
                0.5 * (position[0] + 1) * game.ViewportWidth,
                0.5 * (-position[1] + 1) * game.ViewportHeight,
            );

            let draw = game.World.Draw[i];
            switch (draw.Kind) {
                case DrawKind.Text:
                    draw_text(game, draw);
                    break;
                case DrawKind.Selection:
                    draw_selection(game, draw);
                    break;
            }
        }
    }
}

function draw_text(game: Game, draw: DrawText) {
    game.ForegroundContext.textAlign = "center";
    game.ForegroundContext.font = draw.Font;
    game.ForegroundContext.fillStyle = draw.FillStyle;
    game.ForegroundContext.fillText(draw.Text, 0, 0);
}

function draw_selection(game: Game, draw: DrawSelection) {
    game.ForegroundContext.strokeStyle = draw.Color;
    game.ForegroundContext.strokeRect(-draw.Size / 2, -draw.Size / 2, draw.Size, draw.Size);
}
