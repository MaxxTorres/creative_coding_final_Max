
/*
---------------------------------------------------------------
Max Torres Final Project
This ONLY runs on OpenProcessing because of the needed libraries
Webcam is recommended

Issues: Inconsistent hand tracking - fixed by having mouse alternative

References & Libraries: 
	p5play - https://p5play.org/learn/
	ML5 - https://learn.ml5js.org/#/reference/handpose
	ML5 hand pose - phttps://www.youtube.com/watch?v=A2yFBDBq9UY
---------------------------------------------------------------
Instructions:
	Hold palm around 2 FEET from webcam. CLOSE hand to interact
	Otherwise, you may use the mouse
	Wait for hand model loaded notification
---------------------------------------------------------------
*/


//Scene Variables
let scene;
let add_sprite = true;
let start = false;
let flash_repeat = true;
let change_loc = false;
let flashAlpha = 0;
let selected_hero;
let angle = 0;

//Location Variables
let x_loc;
let y_loc;

//Sprite Variables
let ironman_sprite;
let c_america_sprite;
let c_marvel_sprite;
let cursor_sprite;
let wall1;
let wall2;
let wall3;
let wall4;
let tile_size = 20;
let loc_arr = [];
let tile_sprite_arr = [];
let speed_arr = [];
let red_val = 0;

//Hand Tracking Variables
let video;
let hand_is_closed = false;
let predictions = [];

function preload(){
  ironman = loadImage('ironman.png');
	ironman_logo = loadImage('im_logo.png')
	c_america = loadImage('captain_america2.png');
	c_am_logo = loadImage('c_am_logo.png')
	c_marvel = loadImage('captain_marvel.png');
	c_ma_logo = loadImage('c_ma_logo.png')
	bg1 = loadImage('background1.jpg');
	bg2 = loadImage('city_bg.jpeg');
	cursor = loadImage('cursor.png');
	cursor1 = loadImage('gauntlet_open.png');
	cursor2 = loadImage('gauntlet_snap.png');
	avengers_sound = loadSound('avengers_sound.mp3')
}

function setup() {
	createCanvas(600,600);
	noCursor();
	pixelDensity(1);
	frameRate(45);

	scene = 1;
	createSpeedArr();
	
	//Hand Tracking (ML5) Setup---------
	video = createCapture(VIDEO);
  	video.size(600, 600);	//Not sure how to change aspect ratio of webcam for more accurate tracking
  	handpose = ml5.handpose(video, modelReady); //Create handpose object
  	handpose.on("predict", results => {
    	predictions = results;	//Setting array of predictions
	});
	video.hide();
	//-----------------------------------
	
	//Instructions
	print("INSTRUCTIONS:")
	print("Hold palm around 2 FEET from webcam. CLOSE hand to interact");
	print("Otherwise, you may use the mouse");
	print("Wait for hand model loaded notification");
}

function draw() {
	
	//Check if hand is presesnt. Otherwise, use mouse.
	if (predictions.length > 0) {
    	hand_is_closed = check_closed();	//Check if hand is closed
			let prediction = predictions[0];
			let index = prediction.annotations.indexFinger[0]
			
			//Use base of index finger for x and y tracking
			x_loc = (600-index[0]); 							//To mirror in x direction
			y_loc = map(index[1],100,500,0,600);	//To fix inconsistent aspect ratios in y direction
		
  } else {
			hand_is_closed = false;
			x_loc = mouseX;
			y_loc = mouseY;
	}
	
	//SCENE 1 START (CHARACTER SELECT)
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
			tint(255,100);
			image(ironman,10,120);
			noTint();
			if (mouseIsPressed || hand_is_closed) {
				selected_hero = "ironman";
				scene15_setup();
				scene = 1.5;
			}
		} else if (cursor_sprite.overlapping(c_america_sprite)) {
			c_america_sprite.scale = 0.9;
			tint(255,100);
			image(c_america,390,120);
			noTint();
			if (mouseIsPressed || hand_is_closed) {
				selected_hero = "c_america";
				scene15_setup();
				scene = 1.5
			}
		} else if (cursor_sprite.overlapping(c_marvel_sprite)) {
			c_marvel_sprite.scale = 0.9;
			tint(255,100);
			image(c_marvel,200,120);
			noTint();
			if (mouseIsPressed || hand_is_closed) {
				selected_hero = "c_marvel";
				scene15_setup();
				scene = 1.5;
			}
		}
	 	
	} //END OF SCENE 1
	
	//SCENE 1.5 START (Transition)
	else if (scene == 1.5) {
		background(0);
		push();
		if(selected_hero == "ironman"){
			ironman_logo.resize(300,0);
			translate(width / 2, height / 2);
  			rotate(angle);
			angle += 10;
			image(ironman_logo,-150,-150);
			if (angle > 300) {
				pop();
				scene2_setup(ironman);
			}
		} else if (selected_hero == "c_america") {
			c_am_logo.resize(300,0);
			translate(width / 2, height / 2);
  			rotate(angle);
			angle += 10;
			image(c_am_logo,-150,-150);
			if (angle > 300) {
				pop();
				scene2_setup(c_america);
			}
			
		} else if (selected_hero == "c_marvel") {
			c_ma_logo.resize(300,0);
			translate(width / 2, height / 2);
  			rotate(angle);
			angle += 10;
			image(c_ma_logo,-150,-150);
			if (angle > 300) {
				pop();
				scene2_setup(c_marvel);
			}
		}
	}	//END OF SCENE 1.5 (Transition)
	
	//SCENE 2 START (MAIN SCENE)
	else if (scene == 2) {
		background(bg2);
		
		if (hand_is_closed) {
			start = true;
			change_loc = true;
			flash_once();
		} else {
			flash_repeat = true;
			changeLoc();
			if(!mouseIsPressed) {
				scale = 1;
				red_val = 0;
			}
		}
		
		//Flash effect
		if (flashAlpha > 0) {
			flashAlpha -= 10;
			fill(255, flashAlpha);
			rect(0, 0, width, height);
  	}
		
		//Pixels will swarm and follow mouse/hand
		if (mouseIsPressed || hand_is_closed) {
			for(let i=0; i<tile_sprite_arr.length; i++) {
				tile_sprite_arr[i].direction = tile_sprite_arr[i].angleTo(x_loc+random(-300,300),y_loc+random(-300,300))
				tile_sprite_arr[i].speed = speed_arr[i];
				tile_sprite_arr[i].scale = scale;
				tile_sprite_arr[i].draw();	//Draw now so cursor appears on top
			}
			if (red_val < 200){
				red_val += 1.2;	//Turn gauntlet red
			}
			if (scale > 0.1){
				scale -= 0.008;	//Shrink tiles
			}
			
			image(cursor2,x_loc,y_loc,50,100);
			tint(255, 0, 0, red_val);
			image(cursor2,x_loc,y_loc,50,100);
			noTint();
		}
		//Pixels will change location based on mouse/hand
		else {
			//Start condition to prevent initial glitches
			if (start) {
				//Make walls dynamic for 'overlap' method to work
				wall1.collider = 'dynamic';
				wall2.collider = 'dynamic';
				wall3.collider = 'dynamic';
				wall4.collider = 'dynamic';
				
				//Update and check each tile
				for(let i=0; i<tile_sprite_arr.length; i++) {
					//'Bounce' toward original pos when wall is hit
					if (tile_sprite_arr[i].overlaps(wall1) || tile_sprite_arr[i].overlaps(wall2)
								|| tile_sprite_arr[i].overlaps(wall3) || tile_sprite_arr[i].overlaps(wall4)) {
						tile_sprite_arr[i].direction = tile_sprite_arr[i].angleTo(loc_arr[i][0],loc_arr[i][1])
					}
					//Set to original pos when near set position
					if ((tile_sprite_arr[i].x > loc_arr[i][0]-10 && tile_sprite_arr[i].x < loc_arr[i][0]+10) &&
							(tile_sprite_arr[i].y > loc_arr[i][1]-10 && tile_sprite_arr[i].y < loc_arr[i][1]+10)) {
						tile_sprite_arr[i].x = loc_arr[i][0];
						tile_sprite_arr[i].y = loc_arr[i][1];
						tile_sprite_arr[i].speed = 0;
					}
					tile_sprite_arr[i].draw();
				}
			}
			image(cursor1,x_loc,y_loc,80,80);
		}
	}	//END OF SCENE 2 (MAIN SCENE)
	
	
}	//END OF DRAW LOOP



//////////////////////////////////////////
//FUNCTION DEFINITIONS-------------------
//////////////////////////////////////////

//Mouse Functionality-----------------
function mouseClicked() {
	start = true;
}
function mouseReleased() {
	if(scene == 2 && start){
		let x_difference = mouseX - loc_arr[25][0];
		let y_difference = mouseY - loc_arr[25][1];
		for(var i=0; i<loc_arr.length; i++) {
			loc_arr[i][0] += x_difference;
			loc_arr[i][1] += y_difference;
		}
	}
}
function mousePressed() {
  if(scene == 2){
		flashAlpha = 255;
		red_val = 0;
		scale = 1;
	}
}
//---------------------------------

//Hand Tracking Functionality------
function modelReady() {
  console.log("(Hand Tracking Model Ready!)");
}
function flash_once() {
	if(flash_repeat) {
		flashAlpha = 255;
		flash_repeat = false;
	}
}
function check_closed() {
	let prediction = predictions[0];
	let palm = prediction.annotations.palmBase[0];
	let index_tip = prediction.annotations.indexFinger[3];
	y_palm = palm[1];				//y loc point on palm
	y_index = index_tip[1];	//y loc point on index tip
	let distance = y_palm - y_index;	//Compare vertical distance of finger tip and palm
	
	//Calibrate threshhold to prevent issues
	if(distance <= 80 && distance >= 20) {
		return true;	//hand is closed
	} else {
		return false;	//hand is open
	}
}
function changeLoc() {
	//Change location of sprites
	if(scene == 2 && start && change_loc){
		let x_difference = x_loc - loc_arr[25][0];	//Use sprite on chest as reference
		let y_difference = y_loc - loc_arr[25][1];
		for(var i=0; i<loc_arr.length; i++) {
			loc_arr[i][0] += x_difference;
			loc_arr[i][1] += y_difference;
		}
		change_loc = false;
	}
}
//-----------------------------

//Scene setups-----------------
function scene1_setup() {
	if (add_sprite) {	//To prevent continuously adding sprites
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
function scene15_setup() {
	ironman_sprite.remove();
	c_america_sprite.remove();
	c_marvel_sprite.remove();
	cursor_sprite.remove();
}
function scene2_setup(hero_img) {
	wall1 = new Sprite(0,300,5,595,'kinematic');
	wall1.opacity = 0;
	wall2 = new Sprite(300,0,600,5,'kinematic');
	wall2.opacity = 0;
	wall3 = new Sprite(300,600,595,5,'kinematic');
	wall3.opacity = 0;
	wall4 = new Sprite(600,300,5,600,'kinematic');
	wall4.opacity = 0;
	createSpriteArr(hero_img);
	avengers_sound.play();
	avengers_sound.loop();
	avengers_sound.amp(0.1);
	scene = 2;
}
//-----------------------------

//Sprite Functionality-----------
function createSpriteArr(hero_img) {
	//Create array of tile sprites
	for(let y=0; y<hero_img.height; y+=tile_size) {
		for(let x=0; x<hero_img.width; x+=tile_size) {
			let tile = hero_img.get(x,y,tile_size,tile_size);
			let tile_sprite = new Sprite(x+210,y+110,20,20,'kinematic');
			tile_sprite.img = tile;
			tile_sprite_arr.push(tile_sprite)
			
			loc_arr.push([x+210,y+110]); //Save tile location
		}
	}
}
function createSpeedArr() {
	//Create random speed array for sprites
	for(let i=0; i<200; i++) {
		let speed_ = random(2,8);
		speed_arr.push(speed_);
	}
}
//------------------------------------



