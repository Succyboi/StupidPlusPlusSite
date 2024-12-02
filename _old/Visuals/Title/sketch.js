var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var framerate = 60;
var globalTime = 0;

var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

let font;
let smallFont;
var letters = ["s", "t", "u", "p", "i", "d", "+", "+"];
var smallLetters = ["make", "software", "silly", "again"];
var fontSize = 42; //14 * 2 * 1.5
var smallFontSize = 21;
var backgroundColor = "#ffffff";
var backgroundTextColor = "#e5e5ea";
var textColors = ['#000000',
									'#FF3B30',
							 		'#FF9500',
							 		'#FFCC00',
							 		'#34C759',
							 		'#007AFF'];
var visualJitterDuration = 0.125;
var textFadeOutDuration = 5;
var textFadeInDuration = 0.125;
var mouseLineStroke = 8;

var fontScalar = 0.7;
var colliderScale = 1;
var wallThickness = 1000;
var worldEdgePadding = 42;

var playing = true;
var clickTime = -5;
var moveTime = -2;
var moveDuration = 2;

var engine;
var world;

var boxes = [];
var hits = [];

var maxDeltaTimeMs = 100;
var gravity = 0.1;
var jitterChance = 0.25;
var jitterPower = 0.05;
var clickJitterMultiplier = 2;
var shovePower = 0.02;
var boxMinSize = 1;
var boxMaxSize = 2;

function preload() {
  font = loadFont('Inter-Black.otf');
	smallFont = loadFont('Inter-Regular.otf');
}

function setup() {
	//Initialize processing
	frameRate(framerate);
	createCanvas(windowWidth, windowHeight);
	colorMode(HSB, 255);
	rectMode(CENTER);
	
	//Set up visuals
	backgroundColor = color('#ffffff');
	
	//Initialize Matter
	engine = Engine.create();
	world = engine.world;
	world.gravity.scale = 0;
	
	//Spawn walls
	hits.push(new Hit(-wallThickness / 2, windowHeight / 2, wallThickness, windowHeight + wallThickness)); //L
	hits.push(new Hit(wallThickness / 2 + windowWidth, windowHeight / 2, wallThickness, windowHeight + wallThickness)); //R
	hits.push(new Hit(windowWidth / 2, -wallThickness / 2, windowWidth + wallThickness, wallThickness)); //T
	hits.push(new Hit(windowWidth / 2, wallThickness / 2 + windowHeight, windowWidth + wallThickness, wallThickness)); //B


	//Spawn letters
	for(let i = 0; i < letters.length; i++) {
		boxes.push(new Box(letters[boxes.length % letters.length], //Text
			font, //Font
			windowWidth / 2, //Pos x
			windowHeight / 2, //Pos y
			fontSize, //Font size
			0)); //Color
	}
	
	//Spawn small letters
	for(let i = 0; i < smallLetters.length; i++) {	
		boxes.push(new Box(smallLetters[boxes.length % smallLetters.length], //Text
			smallFont, //Font
			windowWidth / 2, //Pos x
			windowHeight / 2, //Pos y
			smallFontSize, //Font size
			0)); //Color
	}
	
	for (let i=0; i< boxes.length;i++)  {
		boxes[i].jitter();
	}
}

function draw() {
	//update physics
	Matter.Engine.update(engine, GetDeltaMs());
	
	//advance time
	globalTime += GetDelta();
	
	//toggle play
	if (!playing && (globalTime - clickTime) > textFadeOutDuration) {
		togglePlay();
	}
	
	//background
	background(backgroundColor);
	
	//cursor
	push();
	
	var moveT = constrain((globalTime - moveTime) / moveDuration, 0, 1);
	stroke(lerpColor(color(backgroundTextColor), color(backgroundColor), moveT));
	strokeWeight(mouseLineStroke);
	line(mouseX, mouseY, pmouseX, pmouseY);
	
	pop();
	
	//background text
	push();
	
	textFont(font);
	textSize(fontSize);
	var titleText = letters.join("");
	var titleTextHeight = textAscent();
	textFont(smallFont);
	textSize(smallFontSize);
	var subTitleText = smallLetters.join(" ");
	var subTitleTextHeight = textAscent();
	var heightOffset = (titleTextHeight - subTitleTextHeight);
	
	fill(color(backgroundTextColor));
	textAlign(CENTER);
	textFont(font);
	textSize(fontSize);
	text(titleText, windowWidth / 2, windowHeight / 2 - titleTextHeight / 2 + heightOffset);
	textFont(smallFont);
	textSize(smallFontSize);
	text(subTitleText, windowWidth / 2, windowHeight / 2 + subTitleTextHeight / 2 + heightOffset);
	
	pop();
	
	//letters
	for (let i=0; i< boxes.length;i++)  {
		boxes[i].move();
		boxes[i].draw();
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);

	for (let i=0; i< hits.length;i++)  {
		World.remove(world, hits[i].body);
	}

	hits = [];

	hits.push(new Hit(-wallThickness / 2, windowHeight / 2, wallThickness, windowHeight + wallThickness)); //L
	hits.push(new Hit(wallThickness / 2 + windowWidth, windowHeight / 2, wallThickness, windowHeight + wallThickness)); //R
	hits.push(new Hit(windowWidth / 2, -wallThickness / 2, windowWidth + wallThickness, wallThickness)); //T
	hits.push(new Hit(windowWidth / 2, wallThickness / 2 + windowHeight, windowWidth + wallThickness, wallThickness)); //B
}

function shoveAll(x, y) {
	for (let i=0; i< boxes.length;i++)  {
		boxes[i].applyForce(constrain(x, -1, 1), constrain(y, -1, 1), shovePower);
	}
}

function togglePlay() {
	playing = !playing;
	clickTime = globalTime;
	
	if(!playing) {
		for (let i=0; i< boxes.length;i++)  {
			boxes[i].jitter(clickJitterMultiplier);
		}
	}
}

function touchStarted()	{ mousePressed(); }
function mousePressed() {
	mouseDragged();
	
	if(playing) { return; }
	
	togglePlay();
}

function mouseReleased() {
	if(!playing) { return; }
	
	togglePlay();
}

function touchMoved() { mouseDragged(); }
function mouseDragged() {
	moveTime = globalTime;
}

function mouseWheel(event) {
	shoveAll(event.deltaX, event.deltaY);
}

function Box(tt, ff, xx, yy, ww, cc) {
	this.t = tt;
	this.f = ff;
	this.x = xx;
	this.y = yy;
	this.w = ww;
	this.c = cc;
	this.rc = cc;
	this.pos = { x: 0, y: 0 };
	this.startPos = { x: this.x, y: this.y };
	this.angle = 0;
	this.scale = 1;
	this.jitterTime = 0;
	
  textSize(ww);
  this.body = Bodies.rectangle(xx, yy, textWidth(this.t) * colliderScale, textAscent() * fontScalar * colliderScale, {restitution:1});

	World.add(world, this.body);
	
	this.move = function() {
		this.pos = this.body.position;
		this.angle = this.body.angle;
		var center = { x: windowWidth / 2, y: windowHeight / 2 };
		var mousePos = { x: winMouseX, y: winMouseY };
		var delta = GetDelta();
		var jitter = random(0, 1) < jitterChance * delta;
		var moveT = constrain((globalTime - moveTime) / moveDuration, 0, 1);
		var textT = constrain((globalTime - clickTime) / (playing ? textFadeInDuration : textFadeOutDuration), 0, 1);
		
		var targetAngle = Matter.Vector.angle(this.body.position, 
																					moveT < 1 ? mousePos : center);
		
		if(this.pos.x < -worldEdgePadding || this.pos.x > windowWidth + worldEdgePadding || this.pos.y < -worldEdgePadding || this.pos.y > windowHeight + worldEdgePadding) {
			Matter.Body.setPosition(this.body, 
				{ x: constrain(this.pos.x, -worldEdgePadding, windowWidth + worldEdgePadding), y: constrain(this.pos.y, -worldEdgePadding, windowHeight + worldEdgePadding) }, 
				true);
		}
		
		if(!playing) { return; }
		
		//Jitter
		if(jitter) {
			this.jitter();
		}
		
		//Gravity
		Matter.Body.applyForce(this.body, 
			this.body.position, 
			{
  			x: cos(targetAngle) * gravity * delta, 
  			y: sin(targetAngle) * gravity * delta
			});
	}
	
	this.jitter = function(m = 1) {
		this.rc = round(random(1, textColors.length - 1));
		this.jitterTime = globalTime;
		
		var randomAngle = random(0, 360);
		Matter.Body.applyForce(this.body, 
			this.body.position, 
			{
  			x: cos(randomAngle) * jitterPower * m, 
  			y: sin(randomAngle) * jitterPower * m
			});
	}
	
	this.applyForce = function(x, y, m) {
		Matter.Body.applyForce(this.body, 
			this.body.position, 
			{
  			x: x * m, 
  			y: y * m
			});
	}
	
	this.draw = function() {
		var textT = constrain((globalTime - clickTime) / (playing ? textFadeInDuration : textFadeOutDuration), 0, 1);
		var jitterT = floor(constrain((globalTime - this.jitterTime) / visualJitterDuration, 0, 1));
		let regularCol = lerpColor(color(textColors[this.c] ?? textColors[0]), color(backgroundTextColor), playing ? (1 - textT) : textT);
		let jitterCol = lerpColor(color(textColors[this.rc] ?? textColors[0]), color(regularCol), jitterT);
		
		push();
		
		translate(this.pos.x, this.pos.y);
		fill(jitterCol);
		rotate(this.angle);
		textSize(ww * this.scale);
		textFont(this.f);
		textAlign(CENTER);
		text(this.t, 0, ww * this.scale / 2);
		
		/*
		if(keyIsDown(32)){
			fill(0,(255 / 2));
			rect(0, 0, textWidth(this.t) * colliderScale, textAscent() * fontScalar * colliderScale)
		}
		*/
		
		pop();
	}
}

function Hit (xx,yy,ww,hh)  {
	this.x = xx;
	this.y = yy;
	this.w = ww;
	this.h = hh;
  	this.body = Bodies.rectangle(xx, yy, ww, hh,{ isStatic: true });

	World.add(world, this.body);
}

function Repeat(t, length) {
	return constrain(t - floor(t / length) * length, 0, length);
}
	
function GetDelta() {
	return GetDeltaMs() / 1000;
}

function GetDeltaMs() {
	return Math.min(deltaTime, maxDeltaTimeMs);
}