"use strict";
(() => {

function input_pointer_lock(game2) {
game2.Ui.addEventListener("click", () => game2.Ui.requestPointerLock());
}


var GL_DEPTH_BUFFER_BIT = 256;
var GL_COLOR_BUFFER_BIT = 16384;
var GL_POINTS = 0;
var GL_LINE_LOOP = 2;
var GL_TRIANGLES = 4;
var GL_SRC_ALPHA = 770;
var GL_ONE_MINUS_SRC_ALPHA = 771;
var GL_STATIC_DRAW = 35044;
var GL_DYNAMIC_DRAW = 35048;
var GL_ARRAY_BUFFER = 34962;
var GL_ELEMENT_ARRAY_BUFFER = 34963;
var GL_CULL_FACE = 2884;
var GL_BLEND = 3042;
var GL_DEPTH_TEST = 2929;
var GL_CW = 2304;
var GL_DATA_UNSIGNED_BYTE = 5121;
var GL_DATA_UNSIGNED_INT = 5125;
var GL_DATA_FLOAT = 5126;
var GL_DEPTH_COMPONENT = 6402;
var GL_RGBA = 6408;
var GL_FRAGMENT_SHADER = 35632;
var GL_VERTEX_SHADER = 35633;
var GL_NEAREST = 9728;
var GL_LINEAR = 9729;
var GL_TEXTURE_MAG_FILTER = 10240;
var GL_TEXTURE_MIN_FILTER = 10241;
var GL_TEXTURE_WRAP_S = 10242;
var GL_TEXTURE_WRAP_T = 10243;
var GL_TEXTURE_2D = 3553;
var GL_TEXTURE0 = 33984;
var GL_TEXTURE1 = 33985;
var GL_TEXTURE2 = 33986;
var GL_TEXTURE3 = 33987;
var GL_CLAMP_TO_EDGE = 33071;
var GL_FRAMEBUFFER = 36160;
var GL_RGBA8 = 32856;
var GL_TEXTURE_COMPARE_MODE = 34892;
var GL_COMPARE_REF_TO_TEXTURE = 34894;
var GL_RGBA32F = 34836;
var GL_RGBA16F = 34842;
var GL_DEPTH_COMPONENT24 = 33190;
var GL_UNSIGNED_SHORT = 5123;
var GL_FLOAT = 5126;


var WorldImpl = class {
Capacity;
Signature = [];
Graveyard = [];
constructor(capacity = 1e4) {
this.Capacity = capacity;
}
};
function create_entity(world) {
if (world.Graveyard.length > 0) {
return world.Graveyard.pop();
}
if (false) {
throw new Error("No more entities available.");
}
return world.Signature.push(0) - 1;
}
function destroy_entity(world, entity) {
world.Signature[entity] = 0;
if (false) {
throw new Error("Entity already in graveyard.");
}
world.Graveyard.push(entity);
}
function first_having(world, query, start_at = 0) {
for (let i = start_at; i < world.Signature.length; i++) {
if ((world.Signature[i] & query) === query) {
return i;
}
}
}


var update_span = document.getElementById("update");
var delta_span = document.getElementById("delta");
var fps_span = document.getElementById("fps");
var step = 1 / 60;
var GameImpl = class {
Running = 0;
Now = 0;
ViewportWidth = window.innerWidth;
ViewportHeight = window.innerHeight;
ViewportResized = true;


InputState = {
MouseX: 0,
MouseY: 0
};


InputDelta = {
MouseX: 0,
MouseY: 0
};

InputDistance = {
Mouse: 0,
Mouse0: 0,
Mouse1: 0,
Mouse2: 0,
Touch0: 0,
Touch1: 0
};


InputTouches = {};
Ui = document.querySelector("main");
constructor() {
document.addEventListener(
"visibilitychange",
() => document.hidden ? this.Stop() : this.Start()
);
this.Ui.addEventListener("contextmenu", (evt) => evt.preventDefault());
this.Ui.addEventListener("mousedown", (evt) => {
this.InputState[`Mouse${evt.button}`] = 1;
this.InputDelta[`Mouse${evt.button}`] = 1;
});
this.Ui.addEventListener("mouseup", (evt) => {
this.InputState[`Mouse${evt.button}`] = 0;
this.InputDelta[`Mouse${evt.button}`] = -1;
});
this.Ui.addEventListener("mousemove", (evt) => {
this.InputState["MouseX"] = evt.clientX;
this.InputState["MouseY"] = evt.clientY;
this.InputDelta["MouseX"] = evt.movementX;
this.InputDelta["MouseY"] = evt.movementY;
});
this.Ui.addEventListener("wheel", (evt) => {
evt.preventDefault();
this.InputDelta["WheelY"] = evt.deltaY;
});
this.Ui.addEventListener("touchstart", (evt) => {
if (evt.target === this.Ui) {
evt.preventDefault();
}
if (evt.touches.length === 1) {
this.InputTouches = {};
}
for (let i = 0; i < evt.touches.length; i++) {
let touch = evt.touches[i];
this.InputTouches[touch.identifier] = i;
}
for (let i = 0; i < evt.changedTouches.length; i++) {
let touch = evt.changedTouches[i];
let index = this.InputTouches[touch.identifier];
this.InputState[`Touch${index}`] = 1;
this.InputState[`Touch${index}X`] = touch.clientX;
this.InputState[`Touch${index}Y`] = touch.clientY;
this.InputDelta[`Touch${index}`] = 1;
this.InputDelta[`Touch${index}X`] = 0;
this.InputDelta[`Touch${index}Y`] = 0;
}
});
this.Ui.addEventListener("touchmove", (evt) => {
if (evt.target === this.Ui) {
evt.preventDefault();
}
for (let i = 0; i < evt.changedTouches.length; i++) {
let touch = evt.changedTouches[i];
let index = this.InputTouches[touch.identifier];
this.InputDelta[`Touch${index}X`] = touch.clientX - this.InputState[`Touch${index}X`];
this.InputDelta[`Touch${index}Y`] = touch.clientY - this.InputState[`Touch${index}Y`];
this.InputState[`Touch${index}X`] = touch.clientX;
this.InputState[`Touch${index}Y`] = touch.clientY;
}
});
this.Ui.addEventListener("touchend", (evt) => {
if (evt.target === this.Ui) {
evt.preventDefault();
}
for (let i = 0; i < evt.changedTouches.length; i++) {
let touch = evt.changedTouches[i];
let index = this.InputTouches[touch.identifier];
this.InputState[`Touch${index}`] = 0;
this.InputDelta[`Touch${index}`] = -1;
}
});
this.Ui.addEventListener("touchcancel", (evt) => {
for (let i = 0; i < evt.changedTouches.length; i++) {
let touch = evt.changedTouches[i];
let index = this.InputTouches[touch.identifier];
this.InputState[`Touch${index}`] = 0;
this.InputDelta[`Touch${index}`] = -1;
}
});
window.addEventListener("keydown", (evt) => {
if (!evt.repeat) {
this.InputState[evt.code] = 1;
this.InputDelta[evt.code] = 1;
}
});
window.addEventListener("keyup", (evt) => {
this.InputState[evt.code] = 0;
this.InputDelta[evt.code] = -1;
});
}
Start() {
let last = performance.now();
let tick = (now) => {
let delta = (now - last) / 1e3;
last = now;
this.Running = requestAnimationFrame(tick);
this.FrameSetup(delta);
this.FrameUpdate(delta);
this.FrameReset(delta);
};
requestAnimationFrame(tick);
}
Stop() {
cancelAnimationFrame(this.Running);
this.Running = 0;
}
FrameSetup(delta) {
this.Now = performance.now();
let mouse_distance = Math.abs(this.InputDelta["MouseX"]) + Math.abs(this.InputDelta["MouseY"]);
this.InputDistance["Mouse"] += mouse_distance;
if (this.InputState["Mouse0"] === 1) {
this.InputDistance["Mouse0"] += mouse_distance;
}
if (this.InputState["Mouse1"] === 1) {
this.InputDistance["Mouse1"] += mouse_distance;
}
if (this.InputState["Mouse2"] === 1) {
this.InputDistance["Mouse2"] += mouse_distance;
}
if (this.InputState["Touch0"] === 1) {
this.InputDistance["Touch0"] += Math.abs(this.InputDelta["Touch0X"]) + Math.abs(this.InputDelta["Touch0Y"]);
}
if (this.InputState["Touch1"] === 1) {
this.InputDistance["Touch1"] += Math.abs(this.InputDelta["Touch1X"]) + Math.abs(this.InputDelta["Touch1Y"]);
}
}
FrameUpdate(delta) {
}
FrameReset(delta) {
this.ViewportResized = false;
if (this.InputDelta["Mouse0"] === -1) {
this.InputDistance["Mouse0"] = 0;
}
if (this.InputDelta["Mouse1"] === -1) {
this.InputDistance["Mouse1"] = 0;
}
if (this.InputDelta["Mouse2"] === -1) {
this.InputDistance["Mouse2"] = 0;
}
if (this.InputDelta["Touch0"] === -1) {
this.InputDistance["Touch0"] = 0;
}
if (this.InputDelta["Touch1"] === -1) {
this.InputDistance["Touch1"] = 0;
}
for (let name in this.InputDelta) {
this.InputDelta[name] = 0;
}
let update22 = performance.now() - this.Now;
if (update_span) {
update_span.textContent = update22.toFixed(1);
}
if (delta_span) {
delta_span.textContent = (delta * 1e3).toFixed(1);
}
if (fps_span) {
fps_span.textContent = (1 / delta).toFixed();
}
}
};
var Game3D = class extends GameImpl {
BackgroundCanvas = document.querySelector("#background");
BackgroundContext = this.BackgroundCanvas.getContext("2d");
ForegroundCanvas = document.querySelector("#foreground");
ForegroundContext = this.ForegroundCanvas.getContext("2d");
SceneCanvas = document.querySelector("#scene");
Gl = this.SceneCanvas.getContext("webgl2");
Audio = new AudioContext();
Cameras = [];
Targets = {};
constructor() {
super();
this.Gl.enable(GL_DEPTH_TEST);
this.Gl.enable(GL_CULL_FACE);
this.Gl.blendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
}
};
function instantiate(game2, blueprint) {
let entity = create_entity(game2.World);
for (let mixin of blueprint) {
mixin(game2, entity);
}
return entity;
}


var World = class extends WorldImpl {
Animate = [];
AudioSource = [];
Camera = [];
Children = [];
Collide = [];
ControlAlways = [];
ControlPlayer = [];
Draw = [];
EmitParticles = [];
Lifespan = [];
Light = [];
Mimic = [];
Move = [];
Named = [];
Render = [];
RigidBody = [];
Shake = [];
Spawn = [];
Task = [];
Toggle = [];
Transform = [];
Trigger = [];
};


function children(...blueprints) {
return (game2, entity) => {
if (game2.World.Signature[entity] & 16 /* Children */) {
} else {
game2.World.Signature[entity] |= 16 /* Children */;
game2.World.Children[entity] = {
Children: []
};
}
let child_entities = game2.World.Children[entity].Children;
for (let blueprint of blueprints) {
let child = instantiate(game2, blueprint);
child_entities.push(child);
}
};
}
function* query_down(world, entity, mask) {
if ((world.Signature[entity] & mask) === mask) {
yield entity;
}
if (world.Signature[entity] & 16 /* Children */) {
for (let child of world.Children[entity].Children) {
yield* query_down(world, child, mask);
}
}
}
function destroy_all(world, entity) {
if (world.Signature[entity] & 16 /* Children */) {
for (let child of world.Children[entity].Children) {
destroy_all(world, child);
}
}
if (world.Signature[entity] === 0 /* None */) {
} else {
destroy_entity(world, entity);
}
}


function dispatch(game2, action, payload) {
switch (action) {
case 0 /* ToggleFullscreen */: {
if (document.fullscreenElement) {
document.exitFullscreen();
} else {
document.body.requestFullscreen();
}
break;
}
case 1 /* CollectItem */: {
let [item_entity] = payload;
destroy_all(game2.World, item_entity);
game2.ItemsCollected++;
break;
}
case 2 /* ExpireItem */: {
game2.ItemsMissed++;
break;
}
}
}


var MAX_FORWARD_LIGHTS = 8;
var INCLUDE_GAMMA_CORRECTION = `




vec3 GAMMA_DECODE(vec3 rgb) {
return pow(rgb, vec3(2.2));
}


vec4 GAMMA_DECODE(vec4 color) {
return vec4(pow(color.rgb, vec3(2.2)), color.a);
}






vec3 GAMMA_ENCODE(vec3 rgb) {
return pow(rgb, vec3(1.0 / 2.2));
}


vec4 GAMMA_ENCODE(vec4 color) {
return vec4(pow(color.rgb, vec3(1.0 / 2.2)), color.a);
}
`;


function link(gl, vertex4, fragment4) {
let program = gl.createProgram();
gl.attachShader(program, compile(gl, GL_VERTEX_SHADER, vertex4));
gl.attachShader(program, compile(gl, GL_FRAGMENT_SHADER, fragment4));
gl.linkProgram(program);
if (false) {
throw new Error(gl.getProgramInfoLog(program));
}
return program;
}
function compile(gl, type, source) {
let shader = gl.createShader(type);
gl.shaderSource(shader, source);
gl.compileShader(shader);
if (false) {
throw new Error(gl.getShaderInfoLog(shader));
}
return shader;
}


var vertex = `#version 300 es

uniform mat4 pv;
uniform mat4 world;
uniform mat4 self;

layout(location=${0 /* Position */}) in vec4 attr_position;
layout(location=${1 /* Normal */}) in vec3 attr_normal;

out vec4 vert_position;
out vec3 vert_normal;

void main() {
vert_position = world * attr_position;
vert_normal = (vec4(attr_normal, 0.0) * self).xyz;
gl_Position = pv * vert_position;
}
`;
var fragment = `#version 300 es

precision mediump float;

uniform vec3 eye;
uniform vec4 diffuse_color;
uniform vec4 specular_color;
uniform vec4 emissive_color;
uniform vec4 light_positions[${MAX_FORWARD_LIGHTS}];
uniform vec4 light_details[${MAX_FORWARD_LIGHTS}];

in vec4 vert_position;
in vec3 vert_normal;

out vec4 frag_color;

${INCLUDE_GAMMA_CORRECTION}

void main() {
vec3 world_normal = normalize(vert_normal);

vec3 view_dir = eye - vert_position.xyz;
vec3 view_normal = normalize(view_dir);


vec3 light_acc = GAMMA_DECODE(diffuse_color.rgb) * 0.1;

for (int i = 0; i < ${MAX_FORWARD_LIGHTS}; i++) {
int light_kind = int(light_positions[i].w);
if (light_kind == ${0 /* Inactive */}) {
break;
}

vec3 light_rgb = GAMMA_DECODE(light_details[i].rgb);
float light_intensity = light_details[i].a;

vec3 light_normal;
if (light_kind == ${2 /* Directional */}) {
light_normal = light_positions[i].xyz;
} else if (light_kind == ${3 /* Point */}) {
vec3 light_dir = light_positions[i].xyz - vert_position.xyz;
float light_dist = length(light_dir);
light_normal = light_dir / light_dist;

light_intensity /= (light_dist * light_dist);
}

float diffuse_factor = dot(world_normal, light_normal);
if (diffuse_factor > 0.0) {

light_acc += GAMMA_DECODE(diffuse_color.rgb) * diffuse_factor * light_rgb * light_intensity;

if (specular_color.a > 0.0) {






vec3 h = normalize(light_normal + view_normal);
float specular_angle = max(dot(h, world_normal), 0.0);
float specular_factor = pow(specular_angle, specular_color.a);


light_acc += GAMMA_DECODE(specular_color.rgb) * specular_factor * light_rgb * light_intensity;
}
}
}

vec3 emissive_rgb = GAMMA_DECODE(emissive_color.rgb) * emissive_color.a;
frag_color = vec4(GAMMA_ENCODE(light_acc + emissive_rgb), diffuse_color.a);
}
`;
function mat_forward_colored_phong(gl) {
let program = link(gl, vertex, fragment);
return {
Mode: GL_TRIANGLES,
Program: program,
Locations: {
Pv: gl.getUniformLocation(program, "pv"),
World: gl.getUniformLocation(program, "world"),
Self: gl.getUniformLocation(program, "self"),
DiffuseColor: gl.getUniformLocation(program, "diffuse_color"),
SpecularColor: gl.getUniformLocation(program, "specular_color"),
EmissiveColor: gl.getUniformLocation(program, "emissive_color"),
Eye: gl.getUniformLocation(program, "eye"),
LightPositions: gl.getUniformLocation(program, "light_positions"),
LightDetails: gl.getUniformLocation(program, "light_details")
}
};
}


var vertex2 = `#version 300 es

uniform mat4 pv;
uniform mat4 world;

layout(location=${0 /* Position */}) in vec4 attr_position;

void main() {
gl_Position = pv * world * attr_position;
}
`;
var fragment2 = `#version 300 es

precision mediump float;

uniform vec4 color;

out vec4 frag_color;

void main() {
frag_color = color;
}
`;
function mat_forward_colored_unlit(gl, mode = GL_TRIANGLES) {
let program = link(gl, vertex2, fragment2);
return {
Mode: mode,
Program: program,
Locations: {
Pv: gl.getUniformLocation(program, "pv"),
World: gl.getUniformLocation(program, "world"),
Color: gl.getUniformLocation(program, "color")
}
};
}
function mat_forward_colored_wireframe(gl) {
return mat_forward_colored_unlit(gl, GL_LINE_LOOP);
}


var vertex3 = `#version 300 es

uniform mat4 pv;
uniform vec4 color_start;
uniform vec4 color_end;

uniform vec4 details;


in vec4 attr_origin_age;
in vec3 attr_direction;

out vec4 vert_color;

void main() {

vec3 velocity = attr_direction * details.y;
gl_Position = pv * vec4(attr_origin_age.xyz + velocity * attr_origin_age.w, 1.0);


float t = attr_origin_age.w / details.x;
gl_PointSize = mix(details.z, details.w, t);
vert_color = mix(color_start, color_end, t);
}
`;
var fragment3 = `#version 300 es

precision mediump float;

in vec4 vert_color;

out vec4 frag_color;

void main() {
frag_color = vert_color;
}
`;
function mat_forward_particles_colored(gl) {
let program = link(gl, vertex3, fragment3);
return {
Mode: GL_POINTS,
Program: program,
Locations: {
Pv: gl.getUniformLocation(program, "pv"),
ColorStart: gl.getUniformLocation(program, "color_start"),
ColorEnd: gl.getUniformLocation(program, "color_end"),
Details: gl.getUniformLocation(program, "details"),
OriginAge: gl.getAttribLocation(program, "attr_origin_age"),
Direction: gl.getAttribLocation(program, "attr_direction")
}
};
}


function mesh_cube(gl) {
let vao = gl.createVertexArray();
gl.bindVertexArray(vao);
let vertex_buf = gl.createBuffer();
gl.bindBuffer(GL_ARRAY_BUFFER, vertex_buf);
gl.bufferData(GL_ARRAY_BUFFER, vertex_arr, GL_STATIC_DRAW);
gl.enableVertexAttribArray(0 /* Position */);
gl.vertexAttribPointer(0 /* Position */, 3, GL_FLOAT, false, 0, 0);
let normal_buf = gl.createBuffer();
gl.bindBuffer(GL_ARRAY_BUFFER, normal_buf);
gl.bufferData(GL_ARRAY_BUFFER, normal_arr, GL_STATIC_DRAW);
gl.enableVertexAttribArray(1 /* Normal */);
gl.vertexAttribPointer(1 /* Normal */, 3, GL_FLOAT, false, 0, 0);
let texcoord_buf = gl.createBuffer();
gl.bindBuffer(GL_ARRAY_BUFFER, texcoord_buf);
gl.bufferData(GL_ARRAY_BUFFER, texcoord_arr, GL_STATIC_DRAW);
gl.enableVertexAttribArray(2 /* TexCoord */);
gl.vertexAttribPointer(2 /* TexCoord */, 2, GL_FLOAT, false, 0, 0);
let weights_buf = gl.createBuffer();
gl.bindBuffer(GL_ARRAY_BUFFER, weights_buf);
gl.bufferData(GL_ARRAY_BUFFER, weights_arr, GL_STATIC_DRAW);
gl.enableVertexAttribArray(5 /* Weights */);
gl.vertexAttribPointer(5 /* Weights */, 4, GL_FLOAT, false, 0, 0);
let index_buf = gl.createBuffer();
gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER, index_buf);
gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, index_arr, GL_STATIC_DRAW);
gl.bindVertexArray(null);
return {
Vao: vao,
VertexBuffer: vertex_buf,
VertexArray: vertex_arr,
NormalBuffer: normal_buf,
NormalArray: normal_arr,
TexCoordBuffer: texcoord_buf,
TexCoordArray: texcoord_arr,
WeightsBuffer: weights_buf,
WeightsArray: weights_arr,
IndexBuffer: index_buf,
IndexArray: index_arr,
IndexCount: index_arr.length
};
}
var vertex_arr = Float32Array.from([
-0.5,
-0.5,
0.5,
-0.5,
-0.5,
0.5,
-0.5,
-0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5,
-0.5,
-0.5,
-0.5,
-0.5,
-0.5,
-0.5,
-0.5,
-0.5,
-0.5,
0.5,
-0.5,
-0.5,
0.5,
-0.5,
-0.5,
0.5,
-0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
0.5,
-0.5,
-0.5,
0.5,
-0.5,
-0.5,
0.5,
-0.5,
-0.5,
0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5,
0.5,
0.5,
-0.5
]);
var normal_arr = Float32Array.from([
-1,
0,
0,
0,
-1,
0,
0,
0,
1,
-1,
0,
0,
0,
0,
1,
0,
1,
0,
-1,
0,
0,
0,
-1,
0,
0,
0,
-1,
-1,
0,
0,
0,
0,
-1,
0,
1,
0,
0,
-1,
0,
0,
0,
1,
1,
0,
0,
0,
0,
1,
0,
1,
0,
1,
0,
0,
0,
-1,
0,
0,
0,
-1,
1,
0,
0,
0,
0,
-1,
0,
1,
0,
1,
0,
0
]);
var texcoord_arr = Float32Array.from([
0.67,
0.67,
1,
1,
0.67,
0.33,
0.33,
0.67,
0.67,
0.67,
0,
0,
0.67,
1,
1,
0.67,
0.33,
0.33,
0.33,
1,
0,
0.33,
0.33,
0,
0.67,
1,
0.33,
0.33,
0.33,
1,
0.33,
0.67,
0,
0.33,
0,
1,
0.67,
0.67,
0.33,
0.67,
0.33,
0.67,
0,
0.67,
0.33,
0.33,
0,
0.67
]);
var weights_arr = Float32Array.from([]);
var index_arr = Uint16Array.from([
16,
5,
22,
5,
11,
22,
1,
12,
7,
12,
18,
7,
2,
4,
13,
4,
15,
13,
14,
17,
20,
17,
23,
20,
19,
21,
8,
21,
10,
8,
6,
9,
0,
9,
3,
0
]);


var EPSILON = 1e-6;
var DEG_TO_RAD = Math.PI / 180;
var RAD_TO_DEG = 180 / Math.PI;


function clamp(min, max, num) {
return Math.max(min, Math.min(max, num));
}


function vec3_set(out, x, y, z) {
out[0] = x;
out[1] = y;
out[2] = z;
return out;
}
function vec3_copy(out, a2) {
out[0] = a2[0];
out[1] = a2[1];
out[2] = a2[2];
return out;
}
function vec3_add(out, a2, b) {
out[0] = a2[0] + b[0];
out[1] = a2[1] + b[1];
out[2] = a2[2] + b[2];
return out;
}
function vec3_subtract(out, a2, b) {
out[0] = a2[0] - b[0];
out[1] = a2[1] - b[1];
out[2] = a2[2] - b[2];
return out;
}
function vec3_scale(out, a2, b) {
out[0] = a2[0] * b;
out[1] = a2[1] * b;
out[2] = a2[2] * b;
return out;
}
function vec3_negate(out, a2) {
out[0] = -a2[0];
out[1] = -a2[1];
out[2] = -a2[2];
return out;
}
function vec3_normalize(out, a2) {
let x = a2[0];
let y = a2[1];
let z = a2[2];
let len = x * x + y * y + z * z;
if (len > 0) {
len = 1 / Math.sqrt(len);
}
out[0] = a2[0] * len;
out[1] = a2[1] * len;
out[2] = a2[2] * len;
return out;
}
function vec3_dot(a2, b) {
return a2[0] * b[0] + a2[1] * b[1] + a2[2] * b[2];
}
function vec3_cross(out, a2, b) {
let ax = a2[0], ay = a2[1], az = a2[2];
let bx = b[0], by = b[1], bz = b[2];
out[0] = ay * bz - az * by;
out[1] = az * bx - ax * bz;
out[2] = ax * by - ay * bx;
return out;
}
function vec3_transform_position(out, a2, m) {
let x = a2[0];
let y = a2[1];
let z = a2[2];
let w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
return out;
}
function vec3_transform_direction(out, a2, m) {
let x = a2[0];
let y = a2[1];
let z = a2[2];
out[0] = m[0] * x + m[4] * y + m[8] * z;
out[1] = m[1] * x + m[5] * y + m[9] * z;
out[2] = m[2] * x + m[6] * y + m[10] * z;
return out;
}
function vec3_length(a2) {
let x = a2[0];
let y = a2[1];
let z = a2[2];
return Math.hypot(x, y, z);
}
function vec3_lerp(out, a2, b, t) {
let ax = a2[0];
let ay = a2[1];
let az = a2[2];
out[0] = ax + t * (b[0] - ax);
out[1] = ay + t * (b[1] - ay);
out[2] = az + t * (b[2] - az);
return out;
}


function quat_set(out, x, y, z, w) {
out[0] = x;
out[1] = y;
out[2] = z;
out[3] = w;
return out;
}
function quat_copy(out, a2) {
out[0] = a2[0];
out[1] = a2[1];
out[2] = a2[2];
out[3] = a2[3];
return out;
}
function quat_normalize(out, a2) {
let x = a2[0];
let y = a2[1];
let z = a2[2];
let w = a2[3];
let len = x * x + y * y + z * z + w * w;
if (len > 0) {
len = 1 / Math.sqrt(len);
}
out[0] = x * len;
out[1] = y * len;
out[2] = z * len;
out[3] = w * len;
return out;
}
function quat_multiply(out, a2, b) {
let ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
let bx = b[0], by = b[1], bz = b[2], bw = b[3];
out[0] = ax * bw + aw * bx + ay * bz - az * by;
out[1] = ay * bw + aw * by + az * bx - ax * bz;
out[2] = az * bw + aw * bz + ax * by - ay * bx;
out[3] = aw * bw - ax * bx - ay * by - az * bz;
return out;
}
function quat_from_euler(out, x, y, z) {
let sx = Math.sin(x / 2 * DEG_TO_RAD);
let cx = Math.cos(x / 2 * DEG_TO_RAD);
let sy = Math.sin(y / 2 * DEG_TO_RAD);
let cy = Math.cos(y / 2 * DEG_TO_RAD);
let sz = Math.sin(z / 2 * DEG_TO_RAD);
let cz = Math.cos(z / 2 * DEG_TO_RAD);
out[0] = sx * cy * cz + cx * sy * sz;
out[1] = cx * sy * cz - sx * cy * sz;
out[2] = cx * cy * sz - sx * sy * cz;
out[3] = cx * cy * cz + sx * sy * sz;
return out;
}
function quat_get_pitch(quat) {
let x = quat[0];
let y = quat[1];
let z = quat[2];
let w = quat[3];
let m23 = 2 * (y * z - w * x);
return Math.asin(-clamp(-1, 1, m23)) * RAD_TO_DEG;
}
function quat_from_axis(out, axis, angle) {
let half = angle / 2;
out[0] = Math.sin(half) * axis[0];
out[1] = Math.sin(half) * axis[1];
out[2] = Math.sin(half) * axis[2];
out[3] = Math.cos(half);
return out;
}
var quat_rotation_to = function() {
let tmpvec3 = [0, 0, 0];
let xUnitVec3 = [1, 0, 0];
let yUnitVec3 = [0, 1, 0];
return function(out, a2, b) {
let d = vec3_dot(a2, b);
if (d < -0.999999) {
vec3_cross(tmpvec3, xUnitVec3, a2);
if (vec3_length(tmpvec3) < 1e-6)
vec3_cross(tmpvec3, yUnitVec3, a2);
vec3_normalize(tmpvec3, tmpvec3);
quat_from_axis(out, tmpvec3, Math.PI);
return out;
} else if (d > 0.999999) {
out[0] = 0;
out[1] = 0;
out[2] = 0;
out[3] = 1;
return out;
} else {
vec3_cross(tmpvec3, a2, b);
out[0] = tmpvec3[0];
out[1] = tmpvec3[1];
out[2] = tmpvec3[2];
out[3] = 1 + d;
return quat_normalize(out, out);
}
};
}();
function quat_slerp(out, a2, b, t) {
let ax = a2[0], ay = a2[1], az = a2[2], aw = a2[3];
let bx = b[0], by = b[1], bz = b[2], bw = b[3];
let omega, cosom, sinom, scale0, scale1;
cosom = ax * bx + ay * by + az * bz + aw * bw;
if (cosom < 0) {
cosom = -cosom;
bx = -bx;
by = -by;
bz = -bz;
bw = -bw;
}
if (1 - cosom > EPSILON) {
omega = Math.acos(cosom);
sinom = Math.sin(omega);
scale0 = Math.sin((1 - t) * omega) / sinom;
scale1 = Math.sin(t * omega) / sinom;
} else {
scale0 = 1 - t;
scale1 = t;
}
out[0] = scale0 * ax + scale1 * bx;
out[1] = scale0 * ay + scale1 * by;
out[2] = scale0 * az + scale1 * bz;
out[3] = scale0 * aw + scale1 * bw;
return out;
}


function animate(clips) {
return (game2, entity) => {
let States = {};
for (let name in clips) {
let { Keyframes, Flags = 7 /* Default */ } = clips[name];
let duration = Keyframes[Keyframes.length - 1].Timestamp;
States[name] = {





Keyframes: Keyframes.map((keyframe) => ({ ...keyframe })),
Flags,
Duration: duration,
Time: 0
};
}
game2.World.Signature[entity] |= 1 /* Animate */;
game2.World.Animate[entity] = {
States,
Current: States["idle"]
};
};
}


var QUERY = 4194304 /* Transform */ | 1 /* Animate */;
function sys_animate(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY) === QUERY) {
update(game2, i, delta);
}
}
}
function update(game2, entity, delta) {
let transform2 = game2.World.Transform[entity];
let animate2 = game2.World.Animate[entity];
if (animate2.Trigger) {
let next = animate2.States[animate2.Trigger];
if (next && next !== animate2.Current) {
if (animate2.Current.Time === 0) {
animate2.Current = next;
} else if (animate2.Current.Flags & 1 /* EarlyExit */) {
animate2.Current.Time = 0;
animate2.Current = next;
}
}
animate2.Trigger = void 0;
}
let current_keyframe = null;
let next_keyframe = null;
for (let keyframe of animate2.Current.Keyframes) {
if (animate2.Current.Time < keyframe.Timestamp) {
next_keyframe = keyframe;
break;
} else {
current_keyframe = keyframe;
}
}
if (current_keyframe && next_keyframe) {
let keyframe_duration = next_keyframe.Timestamp - current_keyframe.Timestamp;
let current_keyframe_time = animate2.Current.Time - current_keyframe.Timestamp;
let interpolant = current_keyframe_time / keyframe_duration;
if (next_keyframe.Ease) {
interpolant = next_keyframe.Ease(interpolant);
}
if (current_keyframe.Translation && next_keyframe.Translation) {
vec3_lerp(
transform2.Translation,
current_keyframe.Translation,
next_keyframe.Translation,
interpolant
);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
if (current_keyframe.Rotation && next_keyframe.Rotation) {
quat_slerp(
transform2.Rotation,
current_keyframe.Rotation,
next_keyframe.Rotation,
interpolant
);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
if (current_keyframe.Scale && next_keyframe.Scale) {
vec3_lerp(transform2.Scale, current_keyframe.Scale, next_keyframe.Scale, interpolant);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
}
let new_time = animate2.Current.Time + delta;
if (new_time < animate2.Current.Duration) {
animate2.Current.Time = new_time;
return;
} else {
animate2.Current.Time = 0;
}
if (animate2.Current.Flags & 4 /* Alternate */) {
for (let keyframe of animate2.Current.Keyframes.reverse()) {
keyframe.Timestamp = animate2.Current.Duration - keyframe.Timestamp;
}
}
if (!(animate2.Current.Flags & 2 /* Loop */)) {
animate2.Current = animate2.States["idle"];
}
}


function mat4_create() {
return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}
function mat4_copy(out, a2) {
out[0] = a2[0];
out[1] = a2[1];
out[2] = a2[2];
out[3] = a2[3];
out[4] = a2[4];
out[5] = a2[5];
out[6] = a2[6];
out[7] = a2[7];
out[8] = a2[8];
out[9] = a2[9];
out[10] = a2[10];
out[11] = a2[11];
out[12] = a2[12];
out[13] = a2[13];
out[14] = a2[14];
out[15] = a2[15];
return out;
}
function mat4_invert(out, a2) {
let a00 = a2[0], a01 = a2[1], a02 = a2[2], a03 = a2[3];
let a10 = a2[4], a11 = a2[5], a12 = a2[6], a13 = a2[7];
let a20 = a2[8], a21 = a2[9], a22 = a2[10], a23 = a2[11];
let a30 = a2[12], a31 = a2[13], a32 = a2[14], a33 = a2[15];
let b00 = a00 * a11 - a01 * a10;
let b01 = a00 * a12 - a02 * a10;
let b02 = a00 * a13 - a03 * a10;
let b03 = a01 * a12 - a02 * a11;
let b04 = a01 * a13 - a03 * a11;
let b05 = a02 * a13 - a03 * a12;
let b06 = a20 * a31 - a21 * a30;
let b07 = a20 * a32 - a22 * a30;
let b08 = a20 * a33 - a23 * a30;
let b09 = a21 * a32 - a22 * a31;
let b10 = a21 * a33 - a23 * a31;
let b11 = a22 * a33 - a23 * a32;
let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
if (!det) {
return null;
}
det = 1 / det;
out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
return out;
}
function mat4_multiply(out, a2, b) {
let a00 = a2[0], a01 = a2[1], a02 = a2[2], a03 = a2[3];
let a10 = a2[4], a11 = a2[5], a12 = a2[6], a13 = a2[7];
let a20 = a2[8], a21 = a2[9], a22 = a2[10], a23 = a2[11];
let a30 = a2[12], a31 = a2[13], a32 = a2[14], a33 = a2[15];
let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
b0 = b[4];
b1 = b[5];
b2 = b[6];
b3 = b[7];
out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
b0 = b[8];
b1 = b[9];
b2 = b[10];
b3 = b[11];
out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
b0 = b[12];
b1 = b[13];
b2 = b[14];
b3 = b[15];
out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
return out;
}
function mat4_compose(out, q, v, s) {
let x = q[0], y = q[1], z = q[2], w = q[3];
let x2 = x + x;
let y2 = y + y;
let z2 = z + z;
let xx = x * x2;
let xy = x * y2;
let xz = x * z2;
let yy = y * y2;
let yz = y * z2;
let zz = z * z2;
let wx = w * x2;
let wy = w * y2;
let wz = w * z2;
let sx = s[0];
let sy = s[1];
let sz = s[2];
out[0] = (1 - (yy + zz)) * sx;
out[1] = (xy + wz) * sx;
out[2] = (xz - wy) * sx;
out[3] = 0;
out[4] = (xy - wz) * sy;
out[5] = (1 - (xx + zz)) * sy;
out[6] = (yz + wx) * sy;
out[7] = 0;
out[8] = (xz + wy) * sz;
out[9] = (yz - wx) * sz;
out[10] = (1 - (xx + yy)) * sz;
out[11] = 0;
out[12] = v[0];
out[13] = v[1];
out[14] = v[2];
out[15] = 1;
return out;
}
function mat4_from_perspective(out, fovy, aspect, near, far) {
let f = 1 / Math.tan(fovy / 2), nf;
out[0] = f / aspect;
out[1] = 0;
out[2] = 0;
out[3] = 0;
out[4] = 0;
out[5] = f;
out[6] = 0;
out[7] = 0;
out[8] = 0;
out[9] = 0;
out[11] = -1;
out[12] = 0;
out[13] = 0;
out[15] = 0;
if (far != null && far !== Infinity) {
nf = 1 / (near - far);
out[10] = (far + near) * nf;
out[14] = 2 * far * near * nf;
} else {
out[10] = -1;
out[14] = -2 * near;
}
return out;
}
function mat4_from_ortho(out, top, right, bottom, left, near, far) {
let lr = 1 / (left - right);
let bt = 1 / (bottom - top);
let nf = 1 / (near - far);
out[0] = -2 * lr;
out[1] = 0;
out[2] = 0;
out[3] = 0;
out[4] = 0;
out[5] = -2 * bt;
out[6] = 0;
out[7] = 0;
out[8] = 0;
out[9] = 0;
out[10] = 2 * nf;
out[11] = 0;
out[12] = (left + right) * lr;
out[13] = (top + bottom) * bt;
out[14] = (far + near) * nf;
out[15] = 1;
return out;
}
function mat4_get_up(out, mat) {
out[0] = mat[4];
out[1] = mat[5];
out[2] = mat[6];
return vec3_normalize(out, out);
}
function mat4_get_forward(out, mat) {
out[0] = mat[8];
out[1] = mat[9];
out[2] = mat[10];
return vec3_normalize(out, out);
}
function mat4_get_translation(out, mat) {
out[0] = mat[12];
out[1] = mat[13];
out[2] = mat[14];
return out;
}
function mat4_get_scaling(out, mat) {
let m11 = mat[0];
let m12 = mat[1];
let m13 = mat[2];
let m21 = mat[4];
let m22 = mat[5];
let m23 = mat[6];
let m31 = mat[8];
let m32 = mat[9];
let m33 = mat[10];
out[0] = Math.hypot(m11, m12, m13);
out[1] = Math.hypot(m21, m22, m23);
out[2] = Math.hypot(m31, m32, m33);
return out;
}
function mat4_get_rotation(out, mat) {
let scaling = mat4_get_scaling([0, 0, 0], mat);
let is1 = 1 / scaling[0];
let is2 = 1 / scaling[1];
let is3 = 1 / scaling[2];
let sm11 = mat[0] * is1;
let sm12 = mat[1] * is2;
let sm13 = mat[2] * is3;
let sm21 = mat[4] * is1;
let sm22 = mat[5] * is2;
let sm23 = mat[6] * is3;
let sm31 = mat[8] * is1;
let sm32 = mat[9] * is2;
let sm33 = mat[10] * is3;
let trace = sm11 + sm22 + sm33;
let S = 0;
if (trace > 0) {
S = Math.sqrt(trace + 1) * 2;
out[3] = 0.25 * S;
out[0] = (sm23 - sm32) / S;
out[1] = (sm31 - sm13) / S;
out[2] = (sm12 - sm21) / S;
} else if (sm11 > sm22 && sm11 > sm33) {
S = Math.sqrt(1 + sm11 - sm22 - sm33) * 2;
out[3] = (sm23 - sm32) / S;
out[0] = 0.25 * S;
out[1] = (sm12 + sm21) / S;
out[2] = (sm31 + sm13) / S;
} else if (sm22 > sm33) {
S = Math.sqrt(1 + sm22 - sm11 - sm33) * 2;
out[3] = (sm31 - sm13) / S;
out[0] = (sm12 + sm21) / S;
out[1] = 0.25 * S;
out[2] = (sm23 + sm32) / S;
} else {
S = Math.sqrt(1 + sm33 - sm11 - sm22) * 2;
out[3] = (sm12 - sm21) / S;
out[0] = (sm31 + sm13) / S;
out[1] = (sm23 + sm32) / S;
out[2] = 0.25 * S;
}
return out;
}
function mat4_distance_squared_from_point(m, v) {
let x = m[12] - v[0];
let y = m[13] - v[1];
let z = m[14] - v[2];
return x * x + y * y + z * z;
}


var QUERY2 = 2 /* AudioListener */ | 4194304 /* Transform */;
function sys_audio_listener(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY2) === QUERY2) {
update2(game2, i);
}
}
}
var position = [0, 0, 0];
var forward = [0, 0, 0];
var up = [0, 0, 0];
function update2(game2, entity) {
let transform2 = game2.World.Transform[entity];
mat4_get_translation(position, transform2.World);
mat4_get_forward(forward, transform2.World);
mat4_get_up(up, transform2.World);
let listener = game2.Audio.listener;
if (listener.positionX) {
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
listener.setPosition(...position);
listener.setOrientation(...forward, ...up);
}
}


var seed = 1;
function rand() {
seed = seed * 16807 % 2147483647;
return (seed - 1) / 2147483646;
}
function float(min = 0, max = 1) {
return rand() * (max - min) + min;
}


function play_note(audio, panner, instr, note, offset) {
let time = audio.currentTime + offset;
let total_duration = 0;
if (panner) {
panner.connect(audio.destination);
}
let master = audio.createGain();
master.gain.value = (instr[0 /* MasterGainAmount */] / 9) ** 3;
let lfa, lfo;
if (instr[5 /* LFOType */]) {
lfo = audio.createOscillator();
lfo.type = instr[5 /* LFOType */];
lfo.frequency.value = (instr[7 /* LFOFreq */] / 3) ** 3;
lfa = audio.createGain();
lfa.gain.value = (instr[6 /* LFOAmount */] + 3) ** 3;
lfo.connect(lfa);
}
if (instr[1 /* FilterType */]) {
let filter = audio.createBiquadFilter();
filter.type = instr[1 /* FilterType */];
filter.frequency.value = 2 ** instr[2 /* FilterFreq */];
filter.Q.value = instr[3 /* FilterQ */] ** 1.5;
if (lfa && instr[4 /* FilterDetuneLFO */]) {
lfa.connect(filter.detune);
}
master.connect(filter);
if (panner) {
filter.connect(panner);
} else {
filter.connect(audio.destination);
}
} else if (panner) {
master.connect(panner);
} else {
master.connect(audio.destination);
}
for (let source of instr[8 /* Sources */]) {
let amp = audio.createGain();
amp.connect(master);
let gain_amount = (source[1 /* GainAmount */] / 9) ** 3;
let gain_attack = (source[2 /* GainAttack */] / 9) ** 3;
let gain_sustain = (source[3 /* GainSustain */] / 9) ** 3;
let gain_release = (source[4 /* GainRelease */] / 6) ** 3;
let gain_duration = gain_attack + gain_sustain + gain_release;
amp.gain.setValueAtTime(0, time);
amp.gain.linearRampToValueAtTime(gain_amount, time + gain_attack);
amp.gain.setValueAtTime(gain_amount, time + gain_attack + gain_sustain);
amp.gain.exponentialRampToValueAtTime(1e-5, time + gain_duration);
if (source[0]) {
let hfo = audio.createOscillator();
hfo.type = source[0 /* SourceType */];
hfo.connect(amp);
hfo.detune.value = 3 * (source[5 /* DetuneAmount */] - 7.5) ** 3;
if (lfa && source[6 /* DetuneLFO */]) {
lfa.connect(hfo.detune);
}
let freq = 440 * 2 ** ((note - 69) / 12);
if (source[7 /* FreqEnabled */]) {
let freq_attack = (source[8 /* FreqAttack */] / 9) ** 3;
let freq_sustain = (source[9 /* FreqSustain */] / 9) ** 3;
let freq_release = (source[10 /* FreqRelease */] / 6) ** 3;
hfo.frequency.linearRampToValueAtTime(0, time);
hfo.frequency.linearRampToValueAtTime(freq, time + freq_attack);
hfo.frequency.setValueAtTime(freq, time + freq_attack + freq_sustain);
hfo.frequency.exponentialRampToValueAtTime(
1e-5,
time + freq_attack + freq_sustain + freq_release
);
} else {
hfo.frequency.setValueAtTime(freq, time);
}
hfo.start(time);
hfo.stop(time + gain_duration);
} else {
let noise = audio.createBufferSource();
noise.buffer = lazy_noise_buffer(audio);
noise.loop = true;
noise.connect(amp);
noise.start(time);
noise.stop(time + gain_duration);
}
if (gain_duration > total_duration) {
total_duration = gain_duration;
}
}
if (lfo) {
lfo.start(time);
lfo.stop(time + total_duration);
}
}
var noise_buffer;
function lazy_noise_buffer(audio) {
if (!noise_buffer) {
noise_buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
let channel = noise_buffer.getChannelData(0);
for (let i = 0; i < channel.length; i++) {
channel[i] = Math.random() * 2 - 1;
}
}
return noise_buffer;
}
function play_synth_clip(audio, panner, clip) {
let spb = 60 / (clip.BPM || 120);
let interval = spb / 4;
for (let track of clip.Tracks) {
for (let i = 0; i < track.Notes.length; i++) {
if (track.Notes[i]) {
play_note(audio, panner, track.Instrument, track.Notes[i], i * interval);
}
}
}
}
function play_buffer_clip(audio, panner, clip) {
let source = audio.createBufferSource();
source.buffer = clip.Buffer;
if (panner) {
source.connect(panner);
panner.connect(audio.destination);
} else {
source.connect(audio.destination);
}
source.start();
}


var QUERY3 = 4 /* AudioSource */ | 4194304 /* Transform */;
function sys_audio_source(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY3) === QUERY3) {
update3(game2, i, delta);
}
}
}
function update3(game2, entity, delta) {
let audio_source2 = game2.World.AudioSource[entity];
let transform2 = game2.World.Transform[entity];
if (audio_source2.Current) {
audio_source2.Time += delta;
if (audio_source2.Time > audio_source2.Current.Exit) {
audio_source2.Current = void 0;
} else if (audio_source2.Panner) {
update_panner(audio_source2.Panner, transform2);
}
}
if (audio_source2.Trigger && !audio_source2.Current) {
switch (audio_source2.Trigger.Kind) {
case 0 /* Buffer */:
play_buffer_clip(game2.Audio, audio_source2.Panner, audio_source2.Trigger);
break;
case 1 /* Synth */:
play_synth_clip(game2.Audio, audio_source2.Panner, audio_source2.Trigger);
break;
}
audio_source2.Current = audio_source2.Trigger;
audio_source2.Time = 0;
if (audio_source2.Panner) {
update_panner(audio_source2.Panner, transform2);
}
}
audio_source2.Trigger = audio_source2.Idle;
}
var position2 = [0, 0, 0];
var forward2 = [0, 0, 0];
function update_panner(panner, transform2) {
mat4_get_translation(position2, transform2.World);
mat4_get_forward(forward2, transform2.World);
if (panner.positionX) {
panner.positionX.value = position2[0];
panner.positionY.value = position2[1];
panner.positionZ.value = position2[2];
panner.orientationX.value = forward2[0];
panner.orientationY.value = forward2[1];
panner.orientationZ.value = forward2[2];
} else {
panner.setPosition(...position2);
panner.setOrientation(...forward2);
}
}


function camera_canvas(projection, clear_color = [0.9, 0.9, 0.9, 1], clear_mask = GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT) {
return (game2, entity) => {
game2.World.Signature[entity] |= 8 /* Camera */;
game2.World.Camera[entity] = {
Kind: 0 /* Canvas */,
Projection: projection,
World: mat4_create(),
ViewportWidth: 0,
ViewportHeight: 0,
Pv: mat4_create(),
Position: [0, 0, 0],
FogColor: clear_color,
FogDistance: projection.Far,
ClearColor: clear_color,
ClearMask: clear_mask
};
};
}


var QUERY4 = 4194304 /* Transform */ | 8 /* Camera */;
function sys_camera(game2, delta) {
game2.Cameras = [];
for (let ent = 0; ent < game2.World.Signature.length; ent++) {
if ((game2.World.Signature[ent] & QUERY4) === QUERY4) {
let camera = game2.World.Camera[ent];
let transform2 = game2.World.Transform[ent];
mat4_copy(camera.World, transform2.World);
switch (camera.Kind) {
case 0 /* Canvas */:
case 1 /* Target */:
update_camera(game2, ent, camera);
game2.Cameras.push(ent);
break;
}
}
}
}
function update_camera(game2, entity, camera) {
let transform2 = game2.World.Transform[entity];
let projection = camera.Projection;
mat4_multiply(camera.Pv, projection.Projection, transform2.Self);
mat4_get_translation(camera.Position, transform2.World);
}


var BOX = [
[0.5, 0.5, 0.5],
[0.5, 0.5, -0.5],
[-0.5, 0.5, -0.5],
[-0.5, 0.5, 0.5],
[0.5, -0.5, 0.5],
[0.5, -0.5, -0.5],
[-0.5, -0.5, -0.5],
[-0.5, -0.5, 0.5]
];
function compute_aabb(world, aabb) {
mat4_get_translation(aabb.Center, world);
let min_x, min_y, min_z, max_x, max_y, max_z;
min_x = max_x = aabb.Center[0];
min_y = max_y = aabb.Center[1];
min_z = max_z = aabb.Center[2];
let world_vertex = [0, 0, 0];
for (let i = 0; i < 8; i++) {
let bb_vertex = BOX[i];
world_vertex[0] = bb_vertex[0] * aabb.Size[0];
world_vertex[1] = bb_vertex[1] * aabb.Size[1];
world_vertex[2] = bb_vertex[2] * aabb.Size[2];
vec3_transform_position(world_vertex, world_vertex, world);
if (world_vertex[0] < min_x) {
min_x = world_vertex[0];
}
if (world_vertex[0] > max_x) {
max_x = world_vertex[0];
}
if (world_vertex[1] < min_y) {
min_y = world_vertex[1];
}
if (world_vertex[1] > max_y) {
max_y = world_vertex[1];
}
if (world_vertex[2] < min_z) {
min_z = world_vertex[2];
}
if (world_vertex[2] > max_z) {
max_z = world_vertex[2];
}
}
aabb.Min = [min_x, min_y, min_z];
aabb.Max = [max_x, max_y, max_z];
aabb.Half[0] = (max_x - min_x) / 2;
aabb.Half[1] = (max_y - min_y) / 2;
aabb.Half[2] = (max_z - min_z) / 2;
}
function penetrate_aabb(a2, b) {
let distance_x = a2.Center[0] - b.Center[0];
let penetration_x = a2.Half[0] + b.Half[0] - Math.abs(distance_x);
let distance_y = a2.Center[1] - b.Center[1];
let penetration_y = a2.Half[1] + b.Half[1] - Math.abs(distance_y);
let distance_z = a2.Center[2] - b.Center[2];
let penetration_z = a2.Half[2] + b.Half[2] - Math.abs(distance_z);
if (penetration_x < penetration_y && penetration_x < penetration_z) {
return [penetration_x * Math.sign(distance_x), 0, 0];
} else if (penetration_y < penetration_z) {
return [0, penetration_y * Math.sign(distance_y), 0];
} else {
return [0, 0, penetration_z * Math.sign(distance_z)];
}
}
function intersect_aabb(a2, b) {
return a2.Min[0] < b.Max[0] && a2.Max[0] > b.Min[0] && a2.Min[1] < b.Max[1] && a2.Max[1] > b.Min[1] && a2.Min[2] < b.Max[2] && a2.Max[2] > b.Min[2];
}


var QUERY5 = 4194304 /* Transform */ | 32 /* Collide */;
function sys_collide(game2, delta) {
let static_colliders = [];
let dynamic_colliders = [];
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY5) === QUERY5) {
let transform2 = game2.World.Transform[i];
let collider = game2.World.Collide[i];
collider.Collisions = [];
if (collider.New) {
collider.New = false;
compute_aabb(transform2.World, collider);
} else if (collider.Dynamic) {
compute_aabb(transform2.World, collider);
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
function check_collisions(collider, colliders, length) {
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
Hit: hit
});
}
if (other_can_intersect) {
other.Collisions.push({
Other: collider.EntityId,
Hit: vec3_negate([0, 0, 0], hit)
});
}
}
}
}
}


var QUERY6 = 64 /* ControlAlways */ | 4194304 /* Transform */ | 16384 /* Move */;
function sys_control_always(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY6) === QUERY6) {
update4(game2, i);
}
}
}
function update4(game2, entity) {
let control = game2.World.ControlAlways[entity];
let move2 = game2.World.Move[entity];
if (control.Direction) {
vec3_add(move2.Direction, move2.Direction, control.Direction);
}
if (control.Rotation) {
quat_multiply(move2.LocalRotation, move2.LocalRotation, control.Rotation);
}
if (control.Animation) {
for (let ent of query_down(game2.World, entity, 1 /* Animate */)) {
let animate2 = game2.World.Animate[ent];
animate2.Trigger = control.Animation;
}
}
}


var QUERY7 = 128 /* ControlPlayer */ | 131072 /* RigidBody */;
function sys_control_jump(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY7) === QUERY7) {
update5(game2, i);
}
}
}
function update5(game2, entity) {
let control = game2.World.ControlPlayer[entity];
let rigid_body2 = game2.World.RigidBody[entity];
if (control.Move) {
if (game2.InputState["Space"]) {
if (rigid_body2.IsGrounded) {
rigid_body2.Acceleration[1] = 300;
for (let ent of query_down(game2.World, entity, 1 /* Animate */)) {
game2.World.Animate[ent].Trigger = "jump";
}
}
}
}
}


var QUERY8 = 16384 /* Move */ | 128 /* ControlPlayer */;
function sys_control_keyboard(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY8) === QUERY8) {
update6(game2, i);
}
}
}
function update6(game2, entity) {
let control = game2.World.ControlPlayer[entity];
if (control.Move) {
let move2 = game2.World.Move[entity];
if (game2.InputState["KeyW"]) {
move2.Direction[2] += 1;
}
if (game2.InputState["KeyA"]) {
move2.Direction[0] += 1;
}
if (game2.InputState["KeyS"]) {
move2.Direction[2] -= 1;
}
if (game2.InputState["KeyD"]) {
move2.Direction[0] -= 1;
}
}
if (control.Yaw) {
let move2 = game2.World.Move[entity];
if (game2.InputState["ArrowLeft"]) {
quat_multiply(move2.LocalRotation, move2.LocalRotation, [0, 1, 0, 0]);
}
if (game2.InputState["ArrowRight"]) {
quat_multiply(move2.LocalRotation, move2.LocalRotation, [0, -1, 0, 0]);
}
}
if (control.Pitch) {
let transform2 = game2.World.Transform[entity];
let move2 = game2.World.Move[entity];
let current_pitch = quat_get_pitch(transform2.Rotation);
if (game2.InputState["ArrowUp"] && current_pitch > control.MinPitch) {
quat_multiply(move2.SelfRotation, move2.SelfRotation, [-1, 0, 0, 0]);
}
if (game2.InputState["ArrowDown"] && current_pitch < control.MaxPitch) {
quat_multiply(move2.SelfRotation, move2.SelfRotation, [1, 0, 0, 0]);
}
}
}


var QUERY9 = 4194304 /* Transform */ | 16384 /* Move */ | 128 /* ControlPlayer */;
var AXIS_X = [1, 0, 0];
var AXIS_Y = [0, 1, 0];
function sys_control_mouse_move(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY9) === QUERY9) {
update7(game2, i);
}
}
}
var rotation = [0, 0, 0, 0];
function update7(game2, entity) {
let control = game2.World.ControlPlayer[entity];
let transform2 = game2.World.Transform[entity];
if (control.Yaw && game2.InputDelta.MouseX) {
let amount = game2.InputDelta.MouseX * control.Yaw * DEG_TO_RAD;
quat_from_axis(rotation, AXIS_Y, -amount);
quat_multiply(transform2.Rotation, rotation, transform2.Rotation);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
if (control.Pitch && game2.InputDelta.MouseY) {
let current_pitch = quat_get_pitch(transform2.Rotation);
let min_amount = control.MinPitch - current_pitch;
let max_amount = control.MaxPitch - current_pitch;
let amount = clamp(min_amount, max_amount, game2.InputDelta.MouseY * control.Pitch);
quat_from_axis(rotation, AXIS_X, amount * DEG_TO_RAD);
quat_multiply(transform2.Rotation, transform2.Rotation, rotation);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
}


var QUERY10 = 16384 /* Move */ | 128 /* ControlPlayer */;
var AXIS_Y2 = [0, 1, 0];
var AXIS_X2 = [1, 0, 0];
var DEAD_ZONE = 0.01;
var TOUCH_SENSITIVITY = 10;
var joystick = [0, 0];
var rotation2 = [0, 0, 0, 0];
function sys_control_touch_move(game2, delta) {
if (game2.InputDelta["Touch0"] === 1) {
joystick[0] = game2.InputState["Touch0X"];
joystick[1] = game2.InputState["Touch0Y"];
}
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY10) === QUERY10) {
update8(game2, i);
}
}
}
function update8(game2, entity) {
let transform2 = game2.World.Transform[entity];
let control = game2.World.ControlPlayer[entity];
let move2 = game2.World.Move[entity];
if (control.Move && game2.InputState["Touch0"] === 1) {
let divisor = Math.min(game2.ViewportWidth, game2.ViewportHeight) / 4;
let amount_x = (game2.InputState["Touch0X"] - joystick[0]) / divisor;
let amount_y = (game2.InputState["Touch0Y"] - joystick[1]) / divisor;
if (Math.abs(amount_x) > DEAD_ZONE) {
move2.Direction[0] += clamp(-1, 1, -amount_x);
}
if (Math.abs(amount_y) > DEAD_ZONE) {
move2.Direction[2] += clamp(-1, 1, -amount_y);
}
}
if (control.Yaw && game2.InputDelta["Touch1X"]) {
let amount = game2.InputDelta["Touch1X"] * control.Yaw * TOUCH_SENSITIVITY * DEG_TO_RAD;
quat_from_axis(rotation2, AXIS_Y2, -amount);
quat_multiply(transform2.Rotation, rotation2, transform2.Rotation);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
if (control.Pitch && game2.InputDelta["Touch1Y"]) {
let current_pitch = quat_get_pitch(transform2.Rotation);
let min_amount = control.MinPitch - current_pitch;
let max_amount = control.MaxPitch - current_pitch;
let amount = clamp(
min_amount,
max_amount,
game2.InputDelta["Touch1Y"] * control.Pitch * TOUCH_SENSITIVITY
);
quat_from_axis(rotation2, AXIS_X2, amount * DEG_TO_RAD);
quat_multiply(transform2.Rotation, transform2.Rotation, rotation2);
game2.World.Signature[entity] |= 256 /* Dirty */;
}
}


var QUERY11 = 16384 /* Move */ | 128 /* ControlPlayer */;
var AXIS_Y3 = [0, 1, 0];
var AXIS_X3 = [1, 0, 0];
var DEAD_ZONE2 = 0.1;
function sys_control_xbox(game2, delta) {
for (let pad of navigator.getGamepads()) {
if (pad) {
game2.InputDelta[`pad${pad.index}_axis_1`] = pad.axes[0];
game2.InputDelta[`pad${pad.index}_axis_2`] = pad.axes[1];
game2.InputDelta[`pad${pad.index}_axis_3`] = pad.axes[2];
game2.InputDelta[`pad${pad.index}_axis_4`] = pad.axes[3];
}
}
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY11) === QUERY11) {
update9(game2, i);
}
}
}
function update9(game2, entity) {
let control = game2.World.ControlPlayer[entity];
if (control.Move) {
let move2 = game2.World.Move[entity];
if (Math.abs(game2.InputDelta["pad0_axis_1"]) > DEAD_ZONE2) {
move2.Direction[0] -= game2.InputDelta["pad0_axis_1"];
}
if (Math.abs(game2.InputDelta["pad0_axis_2"]) > DEAD_ZONE2) {
move2.Direction[2] -= game2.InputDelta["pad0_axis_2"];
}
}
if (control.Yaw && Math.abs(game2.InputDelta["pad0_axis_3"]) > DEAD_ZONE2) {
let move2 = game2.World.Move[entity];
let amount = game2.InputDelta["pad0_axis_3"] * Math.PI;
quat_multiply(
move2.LocalRotation,
move2.LocalRotation,
quat_from_axis([0, 0, 0, 1], AXIS_Y3, -amount)
);
}
if (control.Pitch && Math.abs(game2.InputDelta["pad0_axis_4"]) > DEAD_ZONE2) {
let transform2 = game2.World.Transform[entity];
let move2 = game2.World.Move[entity];
let amount = game2.InputDelta["pad0_axis_4"] * Math.PI;
let current_pitch = quat_get_pitch(transform2.Rotation);
if (amount < 0 && current_pitch > control.MinPitch || amount > 0 && current_pitch < control.MaxPitch) {
quat_multiply(
move2.SelfRotation,
move2.SelfRotation,
quat_from_axis([0, 0, 0, 1], AXIS_X3, amount)
);
}
}
}


function render_colored_shaded(material, mesh, diffuse_color, shininess = 0, emission = 0, specular_rgb = [1, 1, 1], front_face = GL_CW) {
return (game2, entity) => {
game2.World.Signature[entity] |= 65536 /* Render */;
game2.World.Render[entity] = {
Kind: 1 /* ColoredShaded */,
Material: material,
Mesh: mesh,
Phase: diffuse_color[3] < 1 ? 1 /* Transparent */ : 0 /* Opaque */,
FrontFace: front_face,
DiffuseColor: diffuse_color,
SpecularColor: [...specular_rgb, shininess],
EmissiveColor: [diffuse_color[0], diffuse_color[1], diffuse_color[2], emission]
};
};
}
var FLOATS_PER_PARTICLE = 8;
var MAX_PARTICLES = 200;
function render_particles_colored(material, start_color, start_size, end_color, end_size) {
return (game2, entity) => {
let buffer = game2.Gl.createBuffer();
game2.Gl.bindBuffer(GL_ARRAY_BUFFER, buffer);
game2.Gl.bufferData(
GL_ARRAY_BUFFER,
MAX_PARTICLES * FLOATS_PER_PARTICLE * 4,
GL_DYNAMIC_DRAW
);
game2.World.Signature[entity] |= 65536 /* Render */;
game2.World.Render[entity] = {
Kind: 8 /* ParticlesColored */,
Material: material,
Phase: start_color[3] < 1 || end_color[3] < 1 ? 1 /* Transparent */ : 0 /* Opaque */,
Buffer: buffer,
ColorStart: start_color,
ColorEnd: end_color,
Size: [start_size, end_size],
FrontFace: GL_CW
};
};
}


function transform(translation = [0, 0, 0], rotation3 = [0, 0, 0, 1], scale = [1, 1, 1], is_gyroscope = false) {
return (game2, entity) => {
game2.World.Signature[entity] |= 4194304 /* Transform */ | 256 /* Dirty */;
game2.World.Transform[entity] = {
World: mat4_create(),
Self: mat4_create(),
Translation: translation,
Rotation: rotation3,
Scale: scale,
IsGyroscope: is_gyroscope
};
};
}
function set_position(x, y, z) {
return (game2, entity) => {
let local = game2.World.Transform[entity];
local.Translation[0] = x;
local.Translation[1] = y;
local.Translation[2] = z;
};
}
function copy_position(translation) {
return (game2, entity) => {
let local = game2.World.Transform[entity];
vec3_copy(local.Translation, translation);
};
}
function set_rotation(x, y, z) {
return (game2, entity) => {
let local = game2.World.Transform[entity];
quat_from_euler(local.Rotation, x, y, z);
};
}
function copy_rotation(rotation3) {
return (game2, entity) => {
let local = game2.World.Transform[entity];
quat_copy(local.Rotation, rotation3);
};
}
function set_scale(x, y, z) {
return (game2, entity) => {
let local = game2.World.Transform[entity];
local.Scale[0] = x;
local.Scale[1] = y;
local.Scale[2] = z;
};
}


var QUERY12 = 4194304 /* Transform */ | 512 /* Draw */;
function sys_draw(game2, delta) {
game2.ForegroundContext.resetTransform();
game2.ForegroundContext.clearRect(0, 0, game2.ViewportWidth, game2.ViewportHeight);
let position3 = [0, 0, 0];
let camera_entity = game2.Cameras[0];
let main_camera = game2.World.Camera[camera_entity];
if (!main_camera || main_camera.Kind === 2 /* Xr */) {
return;
}
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY12) == QUERY12) {
mat4_get_translation(position3, game2.World.Transform[i].World);
vec3_transform_position(position3, position3, main_camera.Pv);
if (position3[2] < -1 || position3[2] > 1) {
continue;
}
game2.ForegroundContext.setTransform(
1,
0,
0,
1,
0.5 * (position3[0] + 1) * game2.ViewportWidth,
0.5 * (-position3[1] + 1) * game2.ViewportHeight
);
let draw = game2.World.Draw[i];
switch (draw.Kind) {
case 0 /* Text */:
draw_text(game2, draw);
break;
case 3 /* Selection */:
draw_selection(game2, draw);
break;
}
}
}
}
function draw_text(game2, draw) {
game2.ForegroundContext.textAlign = "center";
game2.ForegroundContext.font = draw.Font;
game2.ForegroundContext.fillStyle = draw.FillStyle;
game2.ForegroundContext.fillText(draw.Text, 0, 0);
}
function draw_selection(game2, draw) {
game2.ForegroundContext.strokeStyle = draw.Color;
game2.ForegroundContext.strokeRect(-draw.Size / 2, -draw.Size / 2, draw.Size, draw.Size);
}


var QUERY13 = 2048 /* Lifespan */;
function sys_lifespan(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY13) == QUERY13) {
update10(game2, i, delta);
}
}
}
function update10(game2, entity, delta) {
let lifespan2 = game2.World.Lifespan[entity];
lifespan2.Remaining -= delta;
if (lifespan2.Remaining < 0) {
if (lifespan2.Action) {
dispatch(game2, lifespan2.Action, entity);
}
destroy_all(game2.World, entity);
}
}


var QUERY14 = 4194304 /* Transform */ | 4096 /* Light */;
function sys_light(game2, delta) {
game2.LightPositions.fill(0);
game2.LightDetails.fill(0);
let counter = 0;
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY14) === QUERY14) {
update11(game2, i, counter++);
}
}
}
var world_pos = [0, 0, 0];
function update11(game2, entity, idx) {
let light = game2.World.Light[entity];
let transform2 = game2.World.Transform[entity];
if (light.Kind === 2 /* Directional */) {
mat4_get_forward(world_pos, transform2.World);
} else {
mat4_get_translation(world_pos, transform2.World);
}
game2.LightPositions[4 * idx + 0] = world_pos[0];
game2.LightPositions[4 * idx + 1] = world_pos[1];
game2.LightPositions[4 * idx + 2] = world_pos[2];
game2.LightPositions[4 * idx + 3] = light.Kind;
game2.LightDetails[4 * idx + 0] = light.Color[0];
game2.LightDetails[4 * idx + 1] = light.Color[1];
game2.LightDetails[4 * idx + 2] = light.Color[2];
game2.LightDetails[4 * idx + 3] = light.Intensity;
}


var QUERY15 = 4194304 /* Transform */ | 8192 /* Mimic */;
function sys_mimic(game2, delta) {
for (let ent = 0; ent < game2.World.Signature.length; ent++) {
if ((game2.World.Signature[ent] & QUERY15) === QUERY15) {
update12(game2, ent);
}
}
}
var target_position = [0, 0, 0];
var target_rotation = [0, 0, 0, 1];
function update12(game2, entity) {
let transform2 = game2.World.Transform[entity];
let mimic2 = game2.World.Mimic[entity];
let target_transform = game2.World.Transform[mimic2.Target];
mat4_get_translation(target_position, target_transform.World);
mat4_get_rotation(target_rotation, target_transform.World);
vec3_lerp(transform2.Translation, transform2.Translation, target_position, mimic2.Stiffness);
quat_slerp(transform2.Rotation, transform2.Rotation, target_rotation, mimic2.Stiffness);
game2.World.Signature[entity] |= 256 /* Dirty */;
}


var QUERY16 = 4194304 /* Transform */ | 16384 /* Move */;
function sys_move(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY16) === QUERY16) {
update13(game2, i, delta);
}
}
}
function update13(game2, entity, delta) {
let transform2 = game2.World.Transform[entity];
let move2 = game2.World.Move[entity];
if (move2.Direction[0] !== 0 || move2.Direction[1] !== 0 || move2.Direction[2] !== 0) {
let amount = Math.min(1, vec3_length(move2.Direction));
vec3_transform_direction(move2.Direction, move2.Direction, transform2.World);
if (transform2.Parent !== void 0) {
let parent = game2.World.Transform[transform2.Parent];
vec3_transform_direction(move2.Direction, move2.Direction, parent.Self);
}
vec3_normalize(move2.Direction, move2.Direction);
vec3_scale(move2.Direction, move2.Direction, amount * move2.MoveSpeed * delta);
vec3_add(transform2.Translation, transform2.Translation, move2.Direction);
game2.World.Signature[entity] |= 256 /* Dirty */;
vec3_set(move2.Direction, 0, 0, 0);
}
if (move2.LocalRotation[3] < 1) {
quat_multiply(move2.LocalRotation, move2.LocalRotation, transform2.Rotation);
let t = Math.min(1, move2.RotationSpeed / Math.PI * delta);
quat_slerp(transform2.Rotation, transform2.Rotation, move2.LocalRotation, t);
game2.World.Signature[entity] |= 256 /* Dirty */;
quat_set(move2.LocalRotation, 0, 0, 0, 1);
}
if (move2.SelfRotation[3] < 1) {
quat_multiply(move2.SelfRotation, transform2.Rotation, move2.SelfRotation);
let t = Math.min(1, move2.RotationSpeed / Math.PI * delta);
quat_slerp(transform2.Rotation, transform2.Rotation, move2.SelfRotation, t);
game2.World.Signature[entity] |= 256 /* Dirty */;
quat_set(move2.SelfRotation, 0, 0, 0, 1);
}
}


var QUERY17 = 4194304 /* Transform */ | 1024 /* EmitParticles */;
function sys_particles(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY17) == QUERY17) {
update14(game2, i, delta);
}
}
}
var origin = [0, 0, 0];
var forward3 = [0, 0, 0];
function update14(game2, entity, delta) {
let emitter = game2.World.EmitParticles[entity];
let transform2 = game2.World.Transform[entity];
emitter.SinceLast += delta;
if (emitter.SinceLast > emitter.Frequency) {
emitter.SinceLast = 0;
mat4_get_translation(origin, transform2.World);
mat4_get_forward(forward3, transform2.World);
emitter.Instances.push(...origin, 0);
emitter.Instances.push(...forward3, Math.random());
}
for (let i = 0; i < emitter.Instances.length; ) {
emitter.Instances[i + 3] += delta;
if (emitter.Instances[i + 3] > emitter.Lifespan) {
emitter.Instances.splice(i, FLOATS_PER_PARTICLE);
} else {
i += FLOATS_PER_PARTICLE;
}
}
}


function rigid_body(kind, bounciness = 0.5) {
return (game2, entity) => {
game2.World.Signature[entity] |= 131072 /* RigidBody */;
game2.World.RigidBody[entity] = {
Kind: kind,
ColliderId: entity,
Bounciness: bounciness,
Acceleration: [0, 0, 0],
VelocityLinear: [0, 0, 0],
VelocityResolved: [0, 0, 0],
LastPosition: [0, 0, 0],
IsGrounded: false
};
};
}


var QUERY18 = 4194304 /* Transform */ | 131072 /* RigidBody */;
var GRAVITY = -9.81;
function sys_physics_integrate(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY18) === QUERY18) {
update15(game2, i, delta);
}
}
}
var velocity_delta = [0, 0, 0];
function update15(game2, entity, delta) {
let transform2 = game2.World.Transform[entity];
let rigid_body2 = game2.World.RigidBody[entity];
if (rigid_body2.Kind === 1 /* Dynamic */) {
rigid_body2.VelocityLinear[1] += GRAVITY * delta;
vec3_scale(rigid_body2.Acceleration, rigid_body2.Acceleration, delta);
vec3_add(rigid_body2.VelocityLinear, rigid_body2.VelocityLinear, rigid_body2.Acceleration);
vec3_scale(velocity_delta, rigid_body2.VelocityLinear, delta);
vec3_add(transform2.Translation, transform2.Translation, velocity_delta);
game2.World.Signature[entity] |= 256 /* Dirty */;
vec3_set(rigid_body2.Acceleration, 0, 0, 0);
}
}


var QUERY19 = 4194304 /* Transform */ | 131072 /* RigidBody */;
function sys_physics_kinematic(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY19) === QUERY19) {
update16(game2, i, delta);
}
}
}
var current_position = [0, 0, 0];
var movement_delta = [0, 0, 0];
function update16(game2, entity, delta) {
let transform2 = game2.World.Transform[entity];
let rigid_body2 = game2.World.RigidBody[entity];
mat4_get_translation(current_position, transform2.World);
if (rigid_body2.Kind === 2 /* Kinematic */) {
vec3_subtract(movement_delta, current_position, rigid_body2.LastPosition);
vec3_scale(rigid_body2.VelocityLinear, movement_delta, 1 / delta);
}
vec3_copy(rigid_body2.LastPosition, current_position);
}


var QUERY20 = 4194304 /* Transform */ | 32 /* Collide */ | 131072 /* RigidBody */;
function sys_physics_resolve(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY20) === QUERY20) {
update17(game2, i);
}
}
for (let ent = 0; ent < game2.World.Signature.length; ent++) {
if ((game2.World.Signature[ent] & QUERY20) === QUERY20) {
let rigid_body2 = game2.World.RigidBody[ent];
if (rigid_body2.Kind === 1 /* Dynamic */) {
vec3_copy(rigid_body2.VelocityLinear, rigid_body2.VelocityResolved);
}
}
}
}
var a = [0, 0, 0];
var response = [0, 0, 0];
function update17(game2, entity) {
let transform2 = game2.World.Transform[entity];
let rigid_body2 = game2.World.RigidBody[entity];
let collide2 = game2.World.Collide[rigid_body2.ColliderId];
if (rigid_body2.Kind === 1 /* Dynamic */) {
rigid_body2.IsGrounded = false;
vec3_set(response, 0, 0, 0);
for (let i = 0; i < collide2.Collisions.length; i++) {
let collision = collide2.Collisions[i];
if (game2.World.Signature[collision.Other] & 131072 /* RigidBody */) {
let other_body = game2.World.RigidBody[collision.Other];
switch (other_body.Kind) {
case 0 /* Static */:
vec3_extend(response, collision.Hit, response);
vec3_normalize(a, collision.Hit);
vec3_scale(a, a, -2 * vec3_dot(rigid_body2.VelocityLinear, a));
vec3_add(rigid_body2.VelocityResolved, rigid_body2.VelocityLinear, a);
break;
case 1 /* Dynamic */:
case 2 /* Kinematic */:
vec3_extend(response, response, collision.Hit);
vec3_copy(rigid_body2.VelocityResolved, other_body.VelocityLinear);
break;
}
vec3_scale(
rigid_body2.VelocityResolved,
rigid_body2.VelocityResolved,
rigid_body2.Bounciness
);
if (collision.Hit[1] > 0) {
rigid_body2.IsGrounded = true;
}
}
}
if (response[0] || response[1] || response[2]) {
if (Math.abs(response[0]) < 0.1) {
response[0] = 0;
}
if (Math.abs(response[2]) < 0.1) {
response[2] = 0;
}
vec3_add(transform2.Translation, transform2.Translation, response);
game2.World.Signature[entity] |= 256 /* Dirty */;
} else {
vec3_copy(rigid_body2.VelocityResolved, rigid_body2.VelocityLinear);
}
}
}
function vec3_extend(out, a2, b) {
if (a2[0] >= 0 && b[0] >= 0) {
out[0] = Math.max(a2[0], b[0]);
} else if (a2[0] <= 0 && b[0] <= 0) {
out[0] = Math.min(a2[0], b[0]);
} else {
out[0] = a2[0];
}
if (a2[1] >= 0 && b[1] >= 0) {
out[1] = Math.max(a2[1], b[1]);
} else if (a2[1] <= 0 && b[1] <= 0) {
out[1] = Math.min(a2[1], b[1]);
} else if (a2[1] > b[1]) {
out[1] = a2[1];
}
if (a2[2] >= 0 && b[2] >= 0) {
out[2] = Math.max(a2[2], b[2]);
} else if (a2[0] <= 0 && b[0] <= 0) {
out[2] = Math.min(a2[2], b[2]);
} else {
out[2] = a2[2];
}
}


function task_delay(duration) {
return (game2, entity) => {
game2.World.Signature[entity] |= 1048576 /* Task */;
game2.World.Task[entity] = {
Kind: 1 /* Delay */,
Remaining: duration
};
};
}
function task_then(callback2) {
return (game2, entity) => {
game2.World.Signature[entity] |= 1048576 /* Task */;
game2.World.Task[entity] = {
Kind: 2 /* Then */,
Callback: callback2
};
};
}


var QUERY21 = 1048576 /* Task */;
function sys_poll(game2, delta) {
let tasks_to_complete = [];
for (let ent = 0; ent < game2.World.Signature.length; ent++) {
if ((game2.World.Signature[ent] & QUERY21) === QUERY21) {
if (has_blocking_dependencies(game2.World, ent)) {
continue;
}
let task = game2.World.Task[ent];
switch (task.Kind) {
case 0 /* When */: {
if (task.Predicate(ent)) {
tasks_to_complete.push(ent);
}
break;
}
case 1 /* Delay */: {
task.Remaining -= delta;
if (task.Remaining < 0) {
tasks_to_complete.push(ent);
}
break;
}
case 2 /* Then */: {
tasks_to_complete.push(ent);
break;
}
}
}
}
for (let ent of tasks_to_complete) {
let task = game2.World.Task[ent];
switch (task.Kind) {
case 2 /* Then */:
task.Callback(ent);
case 0 /* When */:
case 1 /* Delay */:
destroy_entity(game2.World, ent);
}
delete game2.World.Task[ent];
}
}
function has_blocking_dependencies(world, entity) {
if (world.Signature[entity] & 16 /* Children */) {
let children2 = world.Children[entity];
for (let child of children2.Children) {
if (world.Signature[child] & 1048576 /* Task */) {
return true;
}
}
}
return false;
}


function resize_texture_rgba8(gl, texture, width, height) {
gl.bindTexture(GL_TEXTURE_2D, texture);
gl.texImage2D(
GL_TEXTURE_2D,
0,
GL_RGBA8,
width,
height,
0,
GL_RGBA,
GL_DATA_UNSIGNED_BYTE,
null
);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
return texture;
}
function resize_texture_rgba16f(gl, texture, width, height) {
gl.bindTexture(GL_TEXTURE_2D, texture);
gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA16F, width, height, 0, GL_RGBA, GL_DATA_FLOAT, null);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
return texture;
}
function resize_texture_rgba32f(gl, texture, width, height) {
gl.bindTexture(GL_TEXTURE_2D, texture);
gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA32F, width, height, 0, GL_RGBA, GL_DATA_FLOAT, null);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
return texture;
}
function resize_texture_depth24(gl, texture, width, height) {
gl.bindTexture(GL_TEXTURE_2D, texture);
gl.texImage2D(
GL_TEXTURE_2D,
0,
GL_DEPTH_COMPONENT24,
width,
height,
0,
GL_DEPTH_COMPONENT,
GL_DATA_UNSIGNED_INT,
null
);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_COMPARE_MODE, GL_COMPARE_REF_TO_TEXTURE);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
return texture;
}


function resize_forward_target(gl, target, width, height) {
target.Width = width;
target.Height = height;
resize_texture_rgba8(gl, target.ColorTexture, target.Width, target.Height);
resize_texture_depth24(gl, target.DepthTexture, target.Width, target.Height);
}
function resize_hdr_target(gl, target, width, height) {
target.Width = width;
target.Height = height;
resize_texture_rgba16f(gl, target.ColorTexture, target.Width, target.Height);
resize_texture_depth24(gl, target.DepthTexture, target.Width, target.Height);
}
function resize_deferred_target(gl, target, width, height) {
target.Width = width;
target.Height = height;
resize_texture_rgba32f(gl, target.DiffuseTexture, target.Width, target.Height);
resize_texture_rgba32f(gl, target.SpecularTexture, target.Width, target.Height);
resize_texture_rgba32f(gl, target.PositionTexture, target.Width, target.Height);
resize_texture_rgba32f(gl, target.NormalTexture, target.Width, target.Height);
resize_texture_depth24(gl, target.DepthTexture, target.Width, target.Height);
}


var QUERY22 = 4194304 /* Transform */ | 65536 /* Render */;
function sys_render_forward(game2, delta) {
for (let camera_entity of game2.Cameras) {
let camera = game2.World.Camera[camera_entity];
switch (camera.Kind) {
case 0 /* Canvas */:
game2.Gl.bindFramebuffer(GL_FRAMEBUFFER, null);
game2.Gl.viewport(0, 0, camera.ViewportWidth, camera.ViewportHeight);
game2.Gl.clearColor(...camera.ClearColor);
game2.Gl.clear(camera.ClearMask);
render_all(game2, camera);
break;
case 1 /* Target */:
if (camera.Target.Kind === 0 /* Forward */) {
game2.Gl.bindFramebuffer(GL_FRAMEBUFFER, camera.Target.Framebuffer);
game2.Gl.viewport(0, 0, camera.Target.Width, camera.Target.Height);
game2.Gl.clearColor(...camera.ClearColor);
game2.Gl.clear(camera.ClearMask);
render_all(game2, camera, camera.Target.ColorTexture);
}
break;
}
}
}
function render_all(game2, eye, current_target) {
let current_material = null;
let current_front_face = null;
let transparent_entities = [];
for (let ent = 0; ent < game2.World.Signature.length; ent++) {
if ((game2.World.Signature[ent] & QUERY22) === QUERY22) {
let render = game2.World.Render[ent];
if (render.Phase === 1 /* Transparent */) {
transparent_entities.push(ent);
continue;
}
if (render.Material !== current_material) {
current_material = render.Material;
use_material(game2, render, eye);
}
if (render.FrontFace !== current_front_face) {
current_front_face = render.FrontFace;
game2.Gl.frontFace(render.FrontFace);
}
draw_entity(game2, ent, current_target);
}
}
transparent_entities.sort((a2, b) => {
let transform_a = game2.World.Transform[a2];
let transform_b = game2.World.Transform[b];
return mat4_distance_squared_from_point(transform_b.World, eye.Position) - mat4_distance_squared_from_point(transform_a.World, eye.Position);
});
game2.Gl.enable(GL_BLEND);
for (let i = 0; i < transparent_entities.length; i++) {
let ent = transparent_entities[i];
let render = game2.World.Render[ent];
if (render.Material !== current_material) {
current_material = render.Material;
use_material(game2, render, eye);
}
if (render.FrontFace !== current_front_face) {
current_front_face = render.FrontFace;
game2.Gl.frontFace(render.FrontFace);
}
draw_entity(game2, ent, current_target);
}
game2.Gl.disable(GL_BLEND);
}
function use_material(game2, render, eye) {
switch (render.Kind) {
case 0 /* ColoredUnlit */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
break;
case 1 /* ColoredShaded */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
game2.Gl.uniform3fv(render.Material.Locations.Eye, eye.Position);
game2.Gl.uniform4fv(render.Material.Locations.LightPositions, game2.LightPositions);
game2.Gl.uniform4fv(render.Material.Locations.LightDetails, game2.LightDetails);
break;
case 2 /* ColoredShadows */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
game2.Gl.uniform3fv(render.Material.Locations.Eye, eye.Position);
game2.Gl.uniform4fv(render.Material.Locations.LightPositions, game2.LightPositions);
game2.Gl.uniform4fv(render.Material.Locations.LightDetails, game2.LightDetails);
game2.Gl.activeTexture(GL_TEXTURE0);
game2.Gl.bindTexture(GL_TEXTURE_2D, game2.Targets.Sun.DepthTexture);
game2.Gl.uniform1i(render.Material.Locations.ShadowMap, 0);
let light_entity = first_having(game2.World, 8 /* Camera */ | 4096 /* Light */);
if (light_entity) {
let light_camera = game2.World.Camera[light_entity];
if (light_camera.Kind === 2 /* Xr */) {
throw new Error("XR cameras cannot be shadow sources.");
}
game2.Gl.uniformMatrix4fv(
render.Material.Locations.ShadowSpace,
false,
light_camera.Pv
);
}
break;
case 4 /* TexturedUnlit */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
break;
case 5 /* TexturedShaded */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
game2.Gl.uniform3fv(render.Material.Locations.Eye, eye.Position);
game2.Gl.uniform4fv(render.Material.Locations.LightPositions, game2.LightPositions);
game2.Gl.uniform4fv(render.Material.Locations.LightDetails, game2.LightDetails);
break;
case 6 /* MappedShaded */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
game2.Gl.uniform3fv(render.Material.Locations.Eye, eye.Position);
game2.Gl.uniform4fv(render.Material.Locations.LightPositions, game2.LightPositions);
game2.Gl.uniform4fv(render.Material.Locations.LightDetails, game2.LightDetails);
break;
case 7 /* Vertices */:
case 8 /* ParticlesColored */:
case 9 /* ParticlesTextured */:
game2.Gl.useProgram(render.Material.Program);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Pv, false, eye.Pv);
break;
}
}
function draw_entity(game2, entity, current_target) {
let transform2 = game2.World.Transform[entity];
let render = game2.World.Render[entity];
switch (render.Kind) {
case 0 /* ColoredUnlit */:
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniform4fv(render.Material.Locations.Color, render.Color);
game2.Gl.bindVertexArray(render.Mesh.Vao);
game2.Gl.drawElements(
render.Material.Mode,
render.Mesh.IndexCount,
GL_UNSIGNED_SHORT,
0
);
game2.Gl.bindVertexArray(null);
break;
case 1 /* ColoredShaded */:
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform2.Self);
game2.Gl.uniform4fv(render.Material.Locations.DiffuseColor, render.DiffuseColor);
game2.Gl.uniform4fv(render.Material.Locations.SpecularColor, render.SpecularColor);
game2.Gl.uniform4fv(render.Material.Locations.EmissiveColor, render.EmissiveColor);
game2.Gl.bindVertexArray(render.Mesh.Vao);
game2.Gl.drawElements(
render.Material.Mode,
render.Mesh.IndexCount,
GL_UNSIGNED_SHORT,
0
);
game2.Gl.bindVertexArray(null);
break;
case 2 /* ColoredShadows */:
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform2.Self);
game2.Gl.uniform4fv(render.Material.Locations.DiffuseColor, render.DiffuseColor);
game2.Gl.uniform4fv(render.Material.Locations.SpecularColor, render.SpecularColor);
game2.Gl.uniform4fv(render.Material.Locations.EmissiveColor, render.EmissiveColor);
game2.Gl.bindVertexArray(render.Mesh.Vao);
game2.Gl.drawElements(
render.Material.Mode,
render.Mesh.IndexCount,
GL_UNSIGNED_SHORT,
0
);
game2.Gl.bindVertexArray(null);
break;
case 4 /* TexturedUnlit */:
if (render.Texture === current_target) {
break;
}
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniform4fv(render.Material.Locations.Color, render.Color);
game2.Gl.activeTexture(GL_TEXTURE0);
game2.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
game2.Gl.uniform1i(render.Material.Locations.TextureMap, 0);
game2.Gl.bindVertexArray(render.Mesh.Vao);
game2.Gl.drawElements(
render.Material.Mode,
render.Mesh.IndexCount,
GL_UNSIGNED_SHORT,
0
);
game2.Gl.bindVertexArray(null);
break;
case 5 /* TexturedShaded */:
if (render.Texture === current_target) {
break;
}
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform2.Self);
game2.Gl.uniform4fv(render.Material.Locations.DiffuseColor, render.DiffuseColor);
game2.Gl.uniform4fv(render.Material.Locations.SpecularColor, render.SpecularColor);
game2.Gl.uniform4fv(render.Material.Locations.EmissiveColor, render.EmissiveColor);
game2.Gl.activeTexture(GL_TEXTURE0);
game2.Gl.bindTexture(GL_TEXTURE_2D, render.Texture);
game2.Gl.uniform1i(render.Material.Locations.DiffuseMap, 0);
game2.Gl.bindVertexArray(render.Mesh.Vao);
game2.Gl.drawElements(
render.Material.Mode,
render.Mesh.IndexCount,
GL_UNSIGNED_SHORT,
0
);
game2.Gl.bindVertexArray(null);
break;
case 6 /* MappedShaded */:
if (render.DiffuseMap === current_target) {
break;
}
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniformMatrix4fv(render.Material.Locations.Self, false, transform2.Self);
game2.Gl.uniform4fv(render.Material.Locations.DiffuseColor, render.DiffuseColor);
game2.Gl.activeTexture(GL_TEXTURE1);
game2.Gl.bindTexture(GL_TEXTURE_2D, render.DiffuseMap);
game2.Gl.uniform1i(render.Material.Locations.DiffuseMap, 1);
game2.Gl.activeTexture(GL_TEXTURE2);
game2.Gl.bindTexture(GL_TEXTURE_2D, render.NormalMap);
game2.Gl.uniform1i(render.Material.Locations.NormalMap, 2);
game2.Gl.activeTexture(GL_TEXTURE3);
game2.Gl.bindTexture(GL_TEXTURE_2D, render.RoughnessMap);
game2.Gl.uniform1i(render.Material.Locations.RoughnessMap, 3);
game2.Gl.bindVertexArray(render.Mesh.Vao);
game2.Gl.drawElements(
render.Material.Mode,
render.Mesh.IndexCount,
GL_UNSIGNED_SHORT,
0
);
game2.Gl.bindVertexArray(null);
break;
case 7 /* Vertices */:
game2.Gl.uniformMatrix4fv(render.Material.Locations.World, false, transform2.World);
game2.Gl.uniform4fv(render.Material.Locations.Color, render.Color);
game2.Gl.bindBuffer(GL_ARRAY_BUFFER, render.VertexBuffer);
game2.Gl.enableVertexAttribArray(0 /* Position */);
game2.Gl.vertexAttribPointer(0 /* Position */, 3, GL_FLOAT, false, 0, 0);
game2.Gl.drawArrays(render.Material.Mode, 0, render.IndexCount);
break;
case 8 /* ParticlesColored */: {
let emitter = game2.World.EmitParticles[entity];
game2.Gl.uniform4fv(render.Material.Locations.ColorStart, render.ColorStart);
game2.Gl.uniform4fv(render.Material.Locations.ColorEnd, render.ColorEnd);
game2.Gl.uniform4f(
render.Material.Locations.Details,
emitter.Lifespan,
emitter.Speed,
...render.Size
);
let instances = Float32Array.from(emitter.Instances);
game2.Gl.bindBuffer(GL_ARRAY_BUFFER, render.Buffer);
game2.Gl.bufferSubData(GL_ARRAY_BUFFER, 0, instances);
game2.Gl.enableVertexAttribArray(render.Material.Locations.OriginAge);
game2.Gl.vertexAttribPointer(
render.Material.Locations.OriginAge,
4,
GL_FLOAT,
false,
FLOATS_PER_PARTICLE * 4,
0
);
game2.Gl.enableVertexAttribArray(render.Material.Locations.Direction);
game2.Gl.vertexAttribPointer(
render.Material.Locations.Direction,
3,
GL_FLOAT,
false,
FLOATS_PER_PARTICLE * 4,
4 * 4
);
game2.Gl.drawArrays(
render.Material.Mode,
0,
emitter.Instances.length / FLOATS_PER_PARTICLE
);
break;
}
}
}


function orthographic(radius, near, far) {
return {
Kind: 1 /* Orthographic */,
Radius: radius,
Near: near,
Far: far,
Projection: mat4_create(),
Inverse: mat4_create()
};
}


var QUERY23 = 8 /* Camera */;
function sys_resize(game2, delta) {
if (game2.ViewportWidth != window.innerWidth || game2.ViewportHeight != window.innerHeight) {
game2.ViewportResized = true;
}
if (game2.ViewportResized) {
game2.ViewportWidth = game2.BackgroundCanvas.width = game2.SceneCanvas.width = game2.ForegroundCanvas.width = window.innerWidth;
game2.ViewportHeight = game2.BackgroundCanvas.height = game2.SceneCanvas.height = game2.ForegroundCanvas.height = window.innerHeight;
for (let target of Object.values(game2.Targets)) {
if (target.ResizeToViewport) {
switch (target.Kind) {
case 0 /* Forward */:
resize_forward_target(
game2.Gl,
target,
game2.ViewportWidth,
game2.ViewportHeight
);
break;
case 1 /* Hdr */:
resize_hdr_target(game2.Gl, target, game2.ViewportWidth, game2.ViewportHeight);
break;
case 2 /* Deferred */:
resize_deferred_target(
game2.Gl,
target,
game2.ViewportWidth,
game2.ViewportHeight
);
break;
}
}
}
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY23) === QUERY23) {
let camera = game2.World.Camera[i];
switch (camera.Kind) {
case 0 /* Canvas */:
camera.ViewportWidth = game2.ViewportWidth;
camera.ViewportHeight = game2.ViewportHeight;
update_projection(
camera.Projection,
game2.ViewportWidth / game2.ViewportHeight
);
break;
case 1 /* Target */:
camera.ViewportWidth = game2.ViewportWidth;
camera.ViewportHeight = game2.ViewportHeight;
update_projection(
camera.Projection,
camera.Target.Width / camera.Target.Height
);
break;
case 2 /* Xr */:
break;
}
}
}
}
}
function update_projection(projection, aspect) {
switch (projection.Kind) {
case 0 /* Perspective */: {
if (aspect < 1) {
mat4_from_perspective(
projection.Projection,
projection.FovY / aspect,
aspect,
projection.Near,
projection.Far
);
} else {
mat4_from_perspective(
projection.Projection,
projection.FovY,
aspect,
projection.Near,
projection.Far
);
}
break;
}
case 1 /* Orthographic */:
let target_aspect = projection.Radius[0] / projection.Radius[1];
if (aspect < target_aspect) {
mat4_from_ortho(
projection.Projection,
projection.Radius[0] / aspect,
projection.Radius[0],
-projection.Radius[0] / aspect,
-projection.Radius[0],
projection.Near,
projection.Far
);
} else {
mat4_from_ortho(
projection.Projection,
projection.Radius[1],
projection.Radius[1] * aspect,
-projection.Radius[1],
-projection.Radius[1] * aspect,
projection.Near,
projection.Far
);
}
break;
}
mat4_invert(projection.Inverse, projection.Projection);
}


var QUERY24 = 4194304 /* Transform */ | 262144 /* Shake */;
function sys_shake(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY24) == QUERY24) {
update18(game2, i);
}
}
}
function update18(game2, entity) {
let shake2 = game2.World.Shake[entity];
let transform2 = game2.World.Transform[entity];
transform2.Translation[0] = (Math.random() - 0.5) * shake2.Radius * 2;
transform2.Translation[1] = (Math.random() - 0.5) * shake2.Radius * 2;
transform2.Translation[2] = (Math.random() - 0.5) * shake2.Radius * 2;
game2.World.Signature[entity] |= 256 /* Dirty */;
}


var QUERY25 = 4194304 /* Transform */ | 524288 /* Spawn */;
function sys_spawn(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY25) == QUERY25) {
update19(game2, i, delta);
}
}
}
var world_position = [0, 0, 0];
var world_rotation = [0, 0, 0, 0];
function update19(game2, entity, delta) {
let spawn2 = game2.World.Spawn[entity];
spawn2.SinceLast += delta;
if (spawn2.SinceLast > spawn2.Interval) {
spawn2.SinceLast = 0;
let entity_transform = game2.World.Transform[entity];
mat4_get_translation(world_position, entity_transform.World);
mat4_get_rotation(world_rotation, entity_transform.World);
instantiate(game2, [
...spawn2.Creator(game2),
copy_position(world_position),
copy_rotation(world_rotation)
]);
}
}


var QUERY26 = 2097152 /* Toggle */;
function sys_toggle(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY26) == QUERY26) {
update20(game2, i, delta);
}
}
}
function update20(game2, entity, delta) {
let toggle2 = game2.World.Toggle[entity];
toggle2.SinceLast += delta;
if (toggle2.SinceLast > toggle2.Frequency) {
toggle2.SinceLast = 0;
if ((game2.World.Signature[entity] & toggle2.Mask) === toggle2.Mask) {
game2.World.Signature[entity] &= ~toggle2.Mask;
} else {
game2.World.Signature[entity] |= toggle2.Mask;
}
}
}


var QUERY27 = 4194304 /* Transform */ | 256 /* Dirty */;
function sys_transform(game2, delta) {
for (let ent = 0; ent < game2.World.Signature.length; ent++) {
if ((game2.World.Signature[ent] & QUERY27) === QUERY27) {
let transform2 = game2.World.Transform[ent];
update_transform(game2.World, ent, transform2);
}
}
}
var world_position2 = [0, 0, 0];
function update_transform(world, entity, transform2) {
world.Signature[entity] &= ~256 /* Dirty */;
mat4_compose(transform2.World, transform2.Rotation, transform2.Translation, transform2.Scale);
if (transform2.Parent !== void 0) {
let parent_transform = world.Transform[transform2.Parent];
mat4_multiply(transform2.World, parent_transform.World, transform2.World);
if (transform2.IsGyroscope) {
mat4_get_translation(world_position2, transform2.World);
mat4_compose(transform2.World, transform2.Rotation, world_position2, transform2.Scale);
}
}
mat4_invert(transform2.Self, transform2.World);
if (world.Signature[entity] & 16 /* Children */) {
let children2 = world.Children[entity];
for (let i = 0; i < children2.Children.length; i++) {
let child = children2.Children[i];
if (world.Signature[child] & 4194304 /* Transform */) {
let child_transform = world.Transform[child];
child_transform.Parent = entity;
update_transform(world, child, child_transform);
}
}
}
}


var QUERY28 = 4194304 /* Transform */ | 32 /* Collide */ | 8388608 /* Trigger */;
function sys_trigger(game2, delta) {
for (let i = 0; i < game2.World.Signature.length; i++) {
if ((game2.World.Signature[i] & QUERY28) === QUERY28) {
update21(game2, i);
}
}
}
function update21(game2, entity) {
let collide2 = game2.World.Collide[entity];
let trigger2 = game2.World.Trigger[entity];
for (let collision of collide2.Collisions) {
let other_collide = game2.World.Collide[collision.Other];
if (trigger2.Mask & other_collide.Layers) {
dispatch(game2, trigger2.Action, [entity, collision.Other]);
}
}
}


function shift(values) {
let value = values.shift();
if (typeof value === "boolean" || value == void 0) {
return "";
} else if (Array.isArray(value)) {
return value.join("");
} else {
return value;
}
}
function html(strings, ...values) {
return strings.reduce((out, cur) => out + shift(values) + cur);
}


function Fullscreen() {
return html`
<div
style="
position: absolute;
top: 1vmin;
left: 1vmin;
background: #000;
color: #fff;
font: 13px Arial;
"
>
<button
onclick="$(${0 /* ToggleFullscreen */})"
style="
padding: 1vmin;
background: #000;
color: #fff;
border: none;
"
>
${document.fullscreenElement ? "Exit Fullscreen" : "Enter Fullscreen"}
</button>
</div>
`;
}


function Score(game2) {
return html`
<div
style="
position: absolute;
right: 0;
bottom: 0;
left: 0;
height: 10vmin;

display: flex;
justify-content: space-around;
align-items: center;

background: rgba(0, 0, 0, 0.5);
color: #fff;
font: 24px Impact;
font-style: italic;
"
>
<div>Collected: ${game2.ItemsCollected}</div>
<div>Missed: ${game2.ItemsMissed}</div>
</div>
`;
}


function App(game2) {
return html`<div>${Fullscreen()} ${Score(game2)}</div>`;
}


var prev;
function sys_ui(game2, delta) {
let next = App(game2);
if (next !== prev) {
game2.Ui.innerHTML = prev = next;
}
}


var Game = class extends Game3D {
World = new World();
MaterialWireframe = mat_forward_colored_wireframe(this.Gl);
MaterialColoredShaded = mat_forward_colored_phong(this.Gl);
MaterialParticlesColored = mat_forward_particles_colored(this.Gl);
MeshCube = mesh_cube(this.Gl);
LightPositions = new Float32Array(4 * MAX_FORWARD_LIGHTS);
LightDetails = new Float32Array(4 * MAX_FORWARD_LIGHTS);
ItemsCollected = 0;
ItemsMissed = 0;
FrameUpdate(delta) {
sys_poll(this, delta);
sys_physics_integrate(this, delta);
sys_transform(this, delta);
sys_physics_kinematic(this, delta);
sys_collide(this, delta);
sys_physics_resolve(this, delta);
sys_transform(this, delta);
sys_trigger(this, delta);
sys_resize(this, delta);
sys_camera(this, delta);
sys_control_keyboard(this, delta);
sys_control_mouse_move(this, delta);
sys_control_touch_move(this, delta);
sys_control_xbox(this, delta);
sys_control_jump(this, delta);
sys_control_always(this, delta);
sys_animate(this, delta);
sys_move(this, delta);
sys_mimic(this, delta);
sys_lifespan(this, delta);
sys_shake(this, delta);
sys_toggle(this, delta);
sys_spawn(this, delta);
sys_particles(this, delta);
sys_transform(this, delta);
if (false) {
sys_debug(this, delta);
}
sys_audio_listener(this, delta);
sys_audio_source(this, delta);
sys_light(this, delta);
sys_render_forward(this, delta);
sys_draw(this, delta);
sys_ui(this, delta);
}
};


function mimic(target, stiffness = 0.1) {
return (game2, entity) => {
game2.World.Signature[entity] |= 8192 /* Mimic */;
game2.World.Mimic[entity] = {
Target: target,
Stiffness: stiffness
};
};
}


function named(name) {
return (game2, entity) => {
game2.World.Signature[entity] |= 32768 /* Named */;
game2.World.Named[entity] = { Name: name };
};
}
function first_named(world, name, start_at = 0) {
for (let i = start_at; i < world.Signature.length; i++) {
if (world.Signature[i] & 32768 /* Named */ && world.Named[i].Name === name) {
return i;
}
}
throw `No entity named ${name}.`;
}


function blueprint_camera_follow(game2) {
return [
transform(),
mimic(first_named(game2.World, "camera anchor")),
children([
transform(
[50, 50, 50],

[-0.28, 0.364, 0.116, 0.88]
),
camera_canvas(orthographic([7, 7], 1, 200), [0.1, 0.5, 0.8, 1])
])
];
}


function collide(dynamic, layers, mask, size = [1, 1, 1]) {
return (game2, entity) => {
game2.World.Signature[entity] |= 32 /* Collide */;
game2.World.Collide[entity] = {
EntityId: entity,
New: true,
Dynamic: dynamic,
Layers: layers,
Mask: mask,
Size: size,
Min: [0, 0, 0],
Max: [0, 0, 0],
Center: [0, 0, 0],
Half: [0, 0, 0],
Collisions: []
};
};
}


function blueprint_ground(game2) {
return [
transform(),
collide(false, 2 /* Terrain */, 0 /* None */),
rigid_body(0 /* Static */),
children([
transform([0, float(-0.2, 0.2), 0]),
render_colored_shaded(game2.MaterialColoredShaded, game2.MeshCube, [0, 1, 0.1, 1])
])
];
}


function audio_source(spatial, idle) {
return (game2, entity) => {
let panner = spatial ? game2.Audio.createPanner() : void 0;
game2.World.Signature[entity] |= 4 /* AudioSource */;
game2.World.AudioSource[entity] = {
Panner: panner,
Idle: idle,
Time: 0
};
};
}


function callback(fn) {
return (game2, entity) => {
fn(game2, entity);
};
}


function control_always(direction, rotation3, animation) {
return (game2, entity) => {
game2.World.Signature[entity] |= 64 /* ControlAlways */;
game2.World.ControlAlways[entity] = {
Direction: direction,
Rotation: rotation3,
Animation: animation
};
};
}


function disable(mask) {
return (game2, entity) => {
game2.World.Signature[entity] &= ~mask;
};
}


function emit_particles(lifespan2, frequency, speed) {
return (game2, entity) => {
game2.World.Signature[entity] |= 1024 /* EmitParticles */;
game2.World.EmitParticles[entity] = {
Lifespan: lifespan2,
Frequency: frequency,
Speed: speed,
Instances: [],
SinceLast: 0
};
};
}


function lifespan(remaining, action) {
return (game2, entity) => {
game2.World.Signature[entity] |= 2048 /* Lifespan */;
game2.World.Lifespan[entity] = {
Remaining: remaining,
Action: action
};
};
}


function light_directional(color = [1, 1, 1], intensity = 1) {
return (game2, entity) => {
game2.World.Signature[entity] |= 4096 /* Light */;
game2.World.Light[entity] = {
Kind: 2 /* Directional */,
Color: color,
Intensity: intensity
};
};
}
function light_point(color = [1, 1, 1], intensity = 1) {
return (game2, entity) => {
game2.World.Signature[entity] |= 4096 /* Light */;
game2.World.Light[entity] = {
Kind: 3 /* Point */,
Color: color,
Intensity: intensity
};
};
}


function move(move_speed, rotation_speed) {
return (game2, entity) => {
game2.World.Signature[entity] |= 16384 /* Move */;
game2.World.Move[entity] = {
MoveSpeed: move_speed,
RotationSpeed: rotation_speed,
Direction: [0, 0, 0],
LocalRotation: [0, 0, 0, 1],
SelfRotation: [0, 0, 0, 1]
};
};
}


function shake(radius) {
return (game2, entity) => {
game2.World.Signature[entity] |= 262144 /* Shake */;
game2.World.Shake[entity] = {
Radius: radius
};
};
}


function toggle(mask, frequency) {
return (game2, entity) => {
game2.World.Signature[entity] |= 2097152 /* Toggle */;
game2.World.Toggle[entity] = {
Mask: mask,
Frequency: frequency,
SinceLast: 0
};
};
}


function trigger(mask, action) {
return (game2, entity) => {
game2.World.Signature[entity] |= 8388608 /* Trigger */;
game2.World.Trigger[entity] = {
Mask: mask,
Action: action
};
};
}


function blueprint_item(game2) {
let item_entity;
let shaker_entity;
let particles_entity;
return [
transform(),
callback((game3, entity) => item_entity = entity),
collide(true, 8 /* Collectable */, 2 /* Terrain */ | 1 /* Player */),
trigger(1 /* Player */, 1 /* CollectItem */),
rigid_body(1 /* Dynamic */, 0.3),
audio_source(true),
lifespan(5, 2 /* ExpireItem */),
disable(2048 /* Lifespan */),
children(
[
callback((game3, entity) => shaker_entity = entity),
transform(void 0, void 0, [0.5, 0.7, 0.1]),
control_always(null, [0, 1, 0, 0]),
move(0, 0.2),
shake(0.05),
toggle(262144 /* Shake */, 1),
disable(262144 /* Shake */ | 2097152 /* Toggle */),
children([
transform([0, 1, 0]),
render_colored_shaded(game2.MaterialColoredShaded, game2.MeshCube, [5, 3, 0, 1]),
children([transform([0, 1, 0]), light_point([1, 0.5, 0], 3)])
])
],
[
transform([0, 1.5, 0]),
control_always(null, [0, 1, 0, 0]),
move(0, 2),
children([
transform([0, 0, 0.2], quat_from_euler([0, 0, 0, 1], -90, 0, 0)),
children([
callback((game3, entity) => particles_entity = entity),
transform(),
shake(0.05),
emit_particles(2, 0.2, 1),
render_particles_colored(
game2.MaterialParticlesColored,
[1, 1, 1, 1],
5,
[1, 1, 1, 0],
1
)
])
])
],
[
children([task_delay(10)]),
task_then(() => {
game2.World.Signature[item_entity] |= 2048 /* Lifespan */;
game2.World.Signature[shaker_entity] |= 262144 /* Shake */ | 2097152 /* Toggle */;
let particles_shake = game2.World.Shake[particles_entity];
particles_shake.Radius = 0.1;
let particles_emit = game2.World.EmitParticles[particles_entity];
particles_emit.Lifespan = 1;
particles_emit.Frequency = 0.1;
let particles_render = game2.World.Render[particles_entity];
particles_render.ColorStart = [1, 1, 0, 1];
particles_render.ColorEnd = [1, 0, 0, 0];
particles_render.Size = [10, 5];
})
]
)
];
}


function blueprint_obstacle(game2) {
return [
transform(),
collide(true, 4 /* Obstacle */, 2 /* Terrain */ | 1 /* Player */),
rigid_body(1 /* Dynamic */, 0.3),
children([
transform(),
render_colored_shaded(game2.MaterialColoredShaded, game2.MeshCube, [0.5, 0.5, 0.5, 0.3])
])
];
}


function ease_in_quad(t) {
return t * t;
}
function ease_out_quad(t) {
return 1 - (1 - t) ** 2;
}
function ease_in_out_quad(t) {
return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}


function audio_listener() {
return (game2, entity) => {
game2.World.Signature[entity] |= 2 /* AudioListener */;
};
}


function control_player(move2, yaw, pitch, min_pitch = 0, max_pitch = 0) {
return (game2, entity) => {
game2.World.Signature[entity] |= 128 /* ControlPlayer */;
game2.World.ControlPlayer[entity] = {
Move: move2,
Yaw: yaw,
Pitch: pitch,
MinPitch: min_pitch,
MaxPitch: max_pitch
};
};
}


function blueprint_player(game2) {
return [
transform(),
control_player(true, 0.2, 0),
move(10, 3),
collide(true, 1 /* Player */, 2 /* Terrain */),
rigid_body(1 /* Dynamic */),
audio_source(false),
audio_listener(),
children(

[
transform(),
render_colored_shaded(game2.MaterialColoredShaded, game2.MeshCube, [1, 0.3, 0.2, 1]),
animate({
idle: {
Keyframes: [
{
Timestamp: 0,
Rotation: quat_from_euler([0, 0, 0, 1], 0, -5, 0),
Ease: ease_in_out_quad
},
{
Timestamp: 1,
Rotation: quat_from_euler([0, 0, 0, 1], 0, 5, 0),
Ease: ease_in_out_quad
}
]
},
jump: {
Keyframes: [
{
Timestamp: 0,
Rotation: [0, 0, 0, 1]
},
{
Timestamp: 0.5,
Rotation: [1, 0, 0, 0],
Ease: ease_in_quad
},
{
Timestamp: 1,
Rotation: [0, 0, 0, -1],
Ease: ease_out_quad
}
],
Flags: 0 /* None */
}
})
],

[transform(void 0, void 0, void 0, true), named("camera anchor")],

[transform([0, 2, 0]), light_point([1, 1, 1], 5)]
)
];
}


function spawn(creator, interval) {
return (game2, entity) => {
game2.World.Signature[entity] |= 524288 /* Spawn */;
game2.World.Spawn[entity] = {
Creator: creator,
Interval: interval,
SinceLast: interval
};
};
}


function scene_stage(game2) {
game2.World = new World();
game2.ViewportResized = true;
let map_size = 10;
let tile_size = 5;
for (let z = 0; z < map_size; z++) {
for (let x = 0; x < map_size; x++) {
instantiate(game2, [
...blueprint_ground(game2),
set_position(tile_size * (x - map_size / 2), 0, tile_size * (z - map_size / 2)),
set_scale(tile_size, 1, tile_size)
]);
}
}
instantiate(game2, [transform(), set_rotation(-30, 30, 0), light_directional([1, 1, 1], 0.1)]);
instantiate(game2, [...blueprint_player(game2), set_position(0, 1, 0)]);
instantiate(game2, [...blueprint_camera_follow(game2), set_position(-100, 0, -100)]);
instantiate(game2, [
transform([0, 15, 0]),
control_always(null, [0, 1, 0, 0]),
move(0, 1),
children([
transform([0, 0, 10]),
children([transform(), shake(10), spawn(blueprint_item, 3)])
])
]);
for (let i = 0; i < 100; i++) {
instantiate(game2, [
...blueprint_obstacle(game2),
set_position(float(-10, 10), 1, float(-10, 10)),
set_scale(float(0.5, 1.5), float(0.5, 1.5), float(0.5, 1.5))
]);
}
}


var game = new Game();
input_pointer_lock(game);
scene_stage(game);
game.Start();
window.$ = dispatch.bind(null, game);
window.game = game;
})();
