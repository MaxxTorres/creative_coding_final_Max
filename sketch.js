let scene;
let add_sprite = true;

let x_loc;
let y_loc;

let ironman_sprite;
let c_america_sprite;
let c_marvel_sprite;
let cursor_sprite;

let tile_size = 20;
let loc_arr = [];
let tile_sprite_arr = [];
let speed_arr = [];
let start = false;
let vol = 0.15;

let wall1;
let wall2;
let wall3;
let wall4;

let video;
let handpose;
let predictions = [];
let hand_open;

function preload(){
  ironman = loadImage('ironman.png');
	ironman_sound = loadSound('avengers_sound.mp3')
	c_america = loadImage('captain_america.png');
	c_marvel = loadImage('captain_marvel.png');
	bg1 = loadImage('background1.jpg');
	bg2 = loadImage('city_bg.jpeg');
	cursor = loadImage('cursor.png');
	cursor1 = loadImage('gauntlet_open.png');
	cursor2 = loadImage('gauntlet_snap.png');
}

function setup() {
	createCanvas(600,600);
	noCursor();
	//pixelDensity(1)	
	
	//Hand Tracking (ML5) Setup
	video = createCapture(VIDEO);
  video.size(width, height);

  handpose = ml5.handpose(video, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handpose.on("predict", results => {
    predictions = results;
  });

  video.hide();
	
	scene = 1;
	
	wall1 = new Sprite(0,300,5,595,'kinematic');
	wall2 = new Sprite(300,0,600,5,'kinematic');
	wall3 = new Sprite(300,600,595,5,'kinematic');
	wall4 = new Sprite(600,300,5,600,'kinematic');
	
	createSpeedArr();
	
	print("Hold one hand around 2ft from webcam. Close fingers to select");
	print("Otherwise, you may use the mouse");
}

function draw() {
	//Check if hand is present, otherwise, use mouse
	if (predictions.length > 0) {
    	hand_open = check_pose();	//Check if hand is open or closed (T or F)
			let prediction = predictions[0];
			let palm = prediction.annotations.palmBase[0]
			x_loc = palm[0];
			y_loc = palm[1];
  } else {
			x_loc = mouseX;
			y_loc = mouseY;
	}
	
	if (scene == 1) {
		background(bg1);
		scene1_setup();
		cursor_sprite.x = x_loc;
		cursor_sprite.y = y_loc;
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
		ironman_sound.amp(vol);
		
		//Pixels will swarm and follow mouse during mouse press
		if (mouseIsPressed) {
			//vol = 0
			for(let i=0; i<tile_sprite_arr.length; i++) {
				tile_sprite_arr[i].direction = tile_sprite_arr[i].angleTo(mouseX+random(-100,100),mouseY+random(-100,100))
				tile_sprite_arr[i].draw();
			}
			image(cursor2,x_loc,y_loc,50,100);
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
						//tile_sprite_arr[i].speed = 0;
						if (vol <= 0.2) {
							//vol += 0.00025;
						}
					}

					tile_sprite_arr[i].draw();
				}
			}
			image(cursor1,x_loc,y_loc,80,80);
		}
	}	//END OF SCENE 2 (MAIN SCENE)
	
	
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

function modelReady() {
  console.log("Model ready!");
}

function check_pose() {
	return true;
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
	ironman_sound.play();
	ironman_sound.loop();
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
	for(let i=0; i<tile_sprite_arr.length; i++) {
				tile_sprite_arr[i].speed = speed_arr[i];
	}
}

function createSpeedArr() {
	//Create random speed array for sprites
	for(let i=0; i<200; i++) {
		let speed_ = random(2,8);
		speed_arr.push(speed_);
	}
}



