let scene;
let add_sprite = true;

let ironman_sprite;
let c_america_sprite;
let c_marvel_sprite;
let cursor_sprite;

let face_image;
let face_video;
let tile_size = 10;
let loc_arr = [];
let tile_sprite_arr = [];
let speed_arr = [];
let start = false;

let wall1;
let wall2;
let wall3;
let wall4;

let video;

function preload(){
  ironman = loadImage('ironman.png');
	c_america = loadImage('captain_america.png');
	c_marvel = loadImage('captain_marvel.png');
	bg1 = loadImage('background1.jpg');
	bg2 = loadImage('background2.jpg');
	cursor = loadImage('cursor.png');
	cursor1 = loadImage('gauntlet_open.png');
	cursor2 = loadImage('gauntlet_snap.png');
}

function setup() {
	createCanvas(600,600);
	noCursor();
	pixelDensity(1);
	video = createCapture(VIDEO);
  video.size(100, 100);
	face_video = createImage(40, 65);
	video.hide();
	
	scene = 1;
	
	wall1 = new Sprite(0,300,5,595,'kinematic');
	wall2 = new Sprite(300,0,600,5,'kinematic');
	wall3 = new Sprite(300,600,595,5,'kinematic');
	wall4 = new Sprite(600,300,5,600,'kinematic');
	
	createSpeedArr();
	
	//print("Press space to take a picture")
	
}

function draw() {
	if (scene == 1) {
		background(bg1)
		scene1_setup();
		cursor_sprite.x = mouseX;
		cursor_sprite.y = mouseY;
		c_america_sprite.scale = 0.8;
		c_marvel_sprite.scale = 0.8;
		ironman_sprite.scale = 0.8;
		if (cursor_sprite.overlapping(ironman_sprite)) {
			ironman_sprite.scale = 0.9;
			if (mouseIsPressed) {
				scene2_setup(ironman);
			}
		} else if (cursor_sprite.overlapping(c_america_sprite)) {
			c_america_sprite.scale = 0.9;
			if (mouseIsPressed) {
				scene2_setup(c_america);
			}
		} else if (cursor_sprite.overlapping(c_marvel_sprite)) {
			c_marvel_sprite.scale = 0.9;
			if (mouseIsPressed) {
				scene2_setup(c_marvel);
			}
		}
	 	
	} //END OF SCENE 1 (SETUP SCENE)
	else if (scene == 2) {
		background(bg2);
		
		//Pixels will swarm and follow mouse during mouse press
		if (mouseIsPressed) {
			for(let i=0; i<tile_sprite_arr.length; i++) {
				tile_sprite_arr[i].direction = tile_sprite_arr[i].angleTo(mouseX+random(-50,50),mouseY+random(-50,50))
				tile_sprite_arr[i].speed = speed_arr[i];
				tile_sprite_arr[i].draw();
			}
			image(cursor2,mouseX,mouseY,50,100);
		}
		//Pixels will have normal sprite physics 
		//and will go to original positions when mouse not pressed
		else {
			if (start) {
				wall1.collider = 'dynamic';
				wall2.collider = 'dynamic';
				wall3.collider = 'dynamic';
				wall4.collider = 'dynamic';
				for(let i=0; i<tile_sprite_arr.length; i++) {
					//'Bounce' toward original pos when wall is hit
					if (tile_sprite_arr[i].overlaps(wall1) || tile_sprite_arr[i].overlaps(wall2)
								|| tile_sprite_arr[i].overlaps(wall3) || tile_sprite_arr[i].overlaps(wall4)) {
						tile_sprite_arr[i].direction = tile_sprite_arr[i].angleTo(loc_arr[i][0],loc_arr[i][1])
					}
					//Set to original pos
					if ((tile_sprite_arr[i].x > loc_arr[i][0]-10 && tile_sprite_arr[i].x < loc_arr[i][0]+10) &&
							(tile_sprite_arr[i].y > loc_arr[i][1]-10 && tile_sprite_arr[i].y < loc_arr[i][1]+10)) {
						tile_sprite_arr[i].x = loc_arr[i][0];
						tile_sprite_arr[i].y = loc_arr[i][1];
					}

					tile_sprite_arr[i].draw();
				}
			}
			image(cursor1,mouseX,mouseY,80,80);
		} //End of mouse not pressed condition
	}	//END OF SCENE 2 (MAIN SCENE)
	
	
	//Display video of face
	// video.loadPixels();
	// face_video.loadPixels();
	// for(let y = 30; y < 85; y++){
	// for(let x = 30; x < 70; x++){
	// let vid_pix = (x + (y * video.width)) * 4;
	// 		let face_vid_pix = ((x-30) + ((y-30) * face_video.width)) * 4;
			
	// 		face_video.pixels[face_vid_pix] = video.pixels[vid_pix];
	// 		face_video.pixels[face_vid_pix + 1] = video.pixels[vid_pix + 1];
	// 		face_video.pixels[face_vid_pix + 2] = video.pixels[vid_pix + 2];
	// 		face_video.pixels[face_vid_pix + 3] = 255;
		
			
	// 	}
	// }
	// face_video.updatePixels();
	// image(face_video,295,105);
	
}	//End of draw loop


//FUNCTION DEFINITIONS-------------------
function mouseClicked() {
	start = true;
}

function keyPressed() {
	if (keyCode == 32 || keyCode == 49) {
		print("capturing image");
		
	}
}

function scene1_setup() {
	if (add_sprite) {
			ironman_sprite = new Sprite(100,300);
			ironman_sprite.img = ironman;
			ironman_sprite.collider = 'static';
			ironman_sprite.scale = 0.8;
			c_america_sprite = new Sprite(500,300);
			c_america_sprite.img = c_america;
			c_america_sprite.collider = 'static';
			c_america_sprite.scale = 0.8;
			c_marvel_sprite = new Sprite(300,300);
			c_marvel_sprite.img = c_marvel;
			c_marvel_sprite.collider = 'static';
			c_marvel_sprite.scale = 0.8;
			cursor_sprite = new Sprite(100,100);
			cursor_sprite.img = cursor;
			cursor_sprite.scale = 0.05;
			add_sprite = false;
		}
}

function scene2_setup(hero_img) {
	ironman_sprite.remove();
	c_america_sprite.remove();
	c_marvel_sprite.remove();
	cursor_sprite.remove();
	createSpriteArr(hero_img);
	scene = 2;
}

function createSpriteArr(hero_img) {
	//Create array of tile sprites
	for(let y=0; y<hero_img.height; y+=tile_size) {
		for(let x=0; x<hero_img.width; x+=tile_size) {
			let tile = hero_img.get(x,y,tile_size,tile_size);
			let tile_sprite = new Sprite(x+210,y+110,20,20,'kinematic');
			tile_sprite.img = tile;
			tile_sprite_arr.push(tile_sprite)
			
			//Save tile location
			loc_arr.push([x+210,y+110]);
		}
	}
}

function createSpeedArr() {
	//Create random speed array for sprites
	for(let i=0; i<800; i++) {
		let speed_ = random(0.5,8);
		speed_arr.push(speed_);
	}
}



