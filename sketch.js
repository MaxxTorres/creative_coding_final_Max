let ironman;
let tile_size = 10;
let loc_arr = [];
let tile_sprite_arr = [];
let speed_arr = [];
let start = false;

function preload(){
  ironman = loadImage('ironman.png');
	//pixelDensity(1);
}

function setup() {
  createCanvas(600,600);
	image(ironman,200,100,200,400);
	
	//Create array of tile sprites (20x20 pixels)
	for(let y=0; y<ironman.height; y+=tile_size) {
		for(let x=0; x<ironman.width; x+=tile_size) {
			let tile = ironman.get(x,y,tile_size,tile_size);
			let tile_sprite = new Sprite(x+210,y+110,20,20,'kinematic');
			tile_sprite.img = tile;
			tile_sprite_arr.push(tile_sprite)
			
			//Save tile location
			loc_arr.push([x+210,y+110]);
		}
	}
	
	//Create speed array for sprites
	for(let i=0; i<tile_sprite_arr.length; i++) {
		let speed = random(0.5,8);
		speed_arr.push(speed);
	}
	
  let wall1 = new Sprite(0,300,5,600,'kinematic');
	let wall2 = new Sprite(300,0,600,5,'kinematic');
	let wall3 = new Sprite(300,600,600,5,'kinematic');
	let wall4 = new Sprite(600,300,5,600,'kinematic');
}

function draw() {
	background(255);
	if (mouseIsPressed) {
		for(let i=0; i<tile_sprite_arr.length; i++) {
			tile_sprite_arr[i].collider = 'kinematic';
			//tile_sprite_arr[i].moveTowards(mouse,movement_arr[i]);
			tile_sprite_arr[i].direction = tile_sprite_arr[i].angleTo(mouseX+random(-50,50),mouseY+random(-50,50))
			tile_sprite_arr[i].speed = speed_arr[i];
		}
	} else {
		if (start) {
			for(let i=0; i<tile_sprite_arr.length; i++) {
				tile_sprite_arr[i].moveTowards(loc_arr[i][0],loc_arr[i][1],random(0.01,0.1));
			}
		}
	}
	
}

function mouseClicked() {
	start = true;
}



