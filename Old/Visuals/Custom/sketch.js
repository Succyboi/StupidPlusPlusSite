var canvas;
var canvasSize = {
	get width() {
		return canvas.clientWidth;
	},

	get height() {
		return canvas.clientHeight;
	}
}
var framerate = 60;
var globalTime = 0;

var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

let font;
let smallFont;

let backgroundColorPicker;
let backgroundTextColorPicker;
let textColorPicker;
let backgroundAlphaSlider;
let backgroundTextInput;
let backgroundSubTextInput;
let boxTextInput;
let spawnBoxButton;

var fontSize = 42; //14 * 2 * 1.5
var smallFontSize = 21;
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
	createCanvas(256, 256);
	colorMode(HSB, 255);
	rectMode(CENTER);

	//get canvas
	canvas = document.getElementById("defaultCanvas0");
	
	//Initialize Matter
	engine = Engine.create();
	world = engine.world;
	world.gravity.scale = 0;
	
	//Spawn walls
	hits.push(new Hit(-wallThickness / 2, canvasSize.height / 2, wallThickness, canvasSize.height + wallThickness)); //L
	hits.push(new Hit(wallThickness / 2 + canvasSize.width, canvasSize.height / 2, wallThickness, canvasSize.height + wallThickness)); //R
	hits.push(new Hit(canvasSize.width / 2, -wallThickness / 2, canvasSize.width + wallThickness, wallThickness)); //T
	hits.push(new Hit(canvasSize.width / 2, wallThickness / 2 + canvasSize.height, canvasSize.width + wallThickness, wallThickness)); //B

	//create gui
	backgroundColorPicker = createColorPicker("#ffffff");
	backgroundTextColorPicker = createColorPicker("#e5e5ea");
	textColorPicker = createColorPicker("#000000");
	backgroundAlphaSlider = createSlider(0, 255, 255);
	backgroundTextInput = createInput("stupid++");
	backgroundSubTextInput = createInput("make software silly again");
	boxTextInput = createInput("s");
	spawnBoxButton = createButton("Spawn");
	spawnBoxButton.mousePressed(handleSpawnButtonPressed);

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
	
	//clear everything
	clear();

	//background
	background(backgroundColorPicker.color(), backgroundAlphaSlider.value());
	
	//background text
	push();
	
	textFont(font);
	textSize(fontSize);
	var titleText = backgroundTextInput.value();
	var titleTextHeight = textAscent();
	textFont(smallFont);
	textSize(smallFontSize);
	var subTitleText = backgroundSubTextInput.value();
	var subTitleTextHeight = textAscent();
	var heightOffset = (titleTextHeight - subTitleTextHeight);
	
	fill(backgroundTextColorPicker.color());
	textAlign(CENTER);
	textFont(font);
	textSize(fontSize);
	text(titleText, canvasSize.width / 2, canvasSize.height / 2 - titleTextHeight / 2 + heightOffset);
	textFont(smallFont);
	textSize(smallFontSize);
	text(subTitleText, canvasSize.width / 2, canvasSize.height / 2 + subTitleTextHeight / 2 + heightOffset);
	
	pop();
	
	//letters
	for (let i=0; i< boxes.length;i++)  {
		boxes[i].move();
		boxes[i].draw();
	}
}

function windowResized() {
	for (let i=0; i< hits.length;i++)  {
		World.remove(world, hits[i].body);
	}

	hits = [];

	hits.push(new Hit(-wallThickness / 2, canvasSize.height / 2, wallThickness, canvasSize.height + wallThickness)); //L
	hits.push(new Hit(wallThickness / 2 + canvasSize.width, canvasSize.height / 2, wallThickness, canvasSize.height + wallThickness)); //R
	hits.push(new Hit(canvasSize.width / 2, -wallThickness / 2, canvasSize.width + wallThickness, wallThickness)); //T
	hits.push(new Hit(canvasSize.width / 2, wallThickness / 2 + canvasSize.height, canvasSize.width + wallThickness, wallThickness)); //B
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
	if(playing) { return; }
	
	togglePlay();
}

function mouseReleased() {
	if(!playing) { return; }
	
	togglePlay();
}

function mouseWheel(event) {
	shoveAll(event.deltaX, event.deltaY);
}

function handleSpawnButtonPressed() {
	if(boxTextInput.value().length <= 0) { return; }

	boxes.push(new Box(boxTextInput.value(), //contents
		font, //Font
		width / 2, //Pos x
		height / 2, //Pos y
		fontSize, //Font size
		textColorPicker.color())); //Color
}

function Box(contents, font, xPosition, yPosition, fontSize, textColor) {
	this.contents = contents;
	this.font = font;
	this.xPosition = xPosition;
	this.yPosition = yPosition;
	this.fontSize = fontSize;
	this.textColor = textColor;
	this.pos = { x: 0, y: 0 };
	this.startPos = { x: this.xPosition, y: this.yPosition };
	this.angle = 0;
	this.scale = 1;	
	
  	textSize(fontSize);
  	this.body = Bodies.rectangle(xPosition, yPosition, textWidth(this.contents) * colliderScale, textAscent() * fontScalar * colliderScale, {restitution:1});

	World.add(world, this.body);
	
	this.move = function() {
		this.pos = this.body.position;
		this.angle = this.body.angle;
		var center = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
		var mousePos = { x: winMouseX, y: winMouseY };
		var delta = GetDelta();
		var jitter = random(0, 1) < jitterChance * delta;
		
		var targetAngle = Matter.Vector.angle(this.body.position, center);
		
		if(this.pos.x < -worldEdgePadding || this.pos.x > canvasSize.width + worldEdgePadding || this.pos.y < -worldEdgePadding || this.pos.y > canvasSize.height + worldEdgePadding) {
			Matter.Body.setPosition(this.body, 
				{ x: constrain(this.pos.x, -worldEdgePadding, canvasSize.width + worldEdgePadding), y: constrain(this.pos.y, -worldEdgePadding, canvasSize.height + worldEdgePadding) }, 
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
		push();
		
		translate(this.pos.x, this.pos.y);
		fill(this.textColor);
		rotate(this.angle);
		textSize(fontSize * this.scale);
		textFont(this.font);
		textAlign(CENTER);
		text(this.contents, 0, fontSize * this.scale / 2);
		
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