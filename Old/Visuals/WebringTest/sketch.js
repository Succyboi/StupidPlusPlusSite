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
let contents;
var contentsPath = "contents.json";
var pageSubTitle = "be cute do websites";
var fontSize = 42; //14 * 2 * 1.5
var smallFontSize = 21;
var backgroundColor = "#ffffff";
var textColor = "#000000";
var backgroundTextColor = "#e5e5ea";
var visualJitterDuration = 0.125;
var textFadeOutDuration = 5;
var textFadeInDuration = 0.125;
var mouseLineStroke = 8;

var fontScalar = 0.7;
var colliderScale = 1;
var wallThickness = 1000;
var worldEdgePadding = 42;

var moveTime = -2;
var moveDuration = 2;

var engine;
var world;

var boxes = [];
var hits = [];

var maxDeltaTimeMs = 100;
var gravity = 0.01;
var jitterChance = 0.25;
var jitterPower = 0.2;
var clickJitterMultiplier = 2;
var shovePower = 0.02;
var boxMinSize = 1;
var boxMaxSize = 2;

function preload() {
	font = loadFont('Inter-Black.otf');
	smallFont = loadFont('Inter-Regular.otf');
	contents = loadJSON(contentsPath);
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


	//Spawn items
	for(let i = 0; i < contents.items.length; i++) {
		for(let r = 0; r < contents.items[i].count; r++){
			boxes.push(new Box(contents.items[i], //item
				contents.items[i].font == 0 ? font : smallFont, //Font
				windowWidth / 2, //Pos x
				windowHeight / 2, //Pos y
				contents.items[i].font == 0 ? fontSize : smallFontSize, //Font size
				color(textColor))); //Color
		}
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
	var titleText = document.title;
	var titleTextHeight = textAscent();
	textFont(smallFont);
	textSize(smallFontSize);
	var subTitleText = pageSubTitle;
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

function touchStarted()	{ mousePressed(); }
function mousePressed() {
	mouseDragged();

	for (let i=0; i< boxes.length;i++)  {
		if(boxes[i].item.url.length > 0 && boxes[i].inBounds(mouseX, mouseY)) {
			window.open(boxes[i].item.url, "_blank");
		}
	}
}

function touchMoved() { mouseDragged(); }
function mouseDragged() {
	moveTime = globalTime;
}

function mouseWheel(event) {
	shoveAll(event.deltaX, event.deltaY);
}

function Box(item, font, xPosition, yPosition, fontSize, textColor) {
	this.item = item;
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
  	this.body = Bodies.rectangle(xPosition, yPosition, textWidth(this.item.name) * colliderScale, textAscent() * fontScalar * colliderScale, {restitution:1});

	World.add(world, this.body);
	
	this.move = function() {
		this.pos = this.body.position;
		this.angle = this.body.angle;
		var center = { x: windowWidth / 2, y: windowHeight / 2 };
		var mousePos = { x: winMouseX, y: winMouseY };
		var delta = GetDelta();
		var jitter = random(0, 1) < jitterChance * delta;
		var moveT = constrain((globalTime - moveTime) / moveDuration, 0, 1);
		
		var targetAngle = Matter.Vector.angle(this.body.position, moveT < 1 ? mousePos : center);
		
		if(this.pos.x < -worldEdgePadding || this.pos.x > windowWidth + worldEdgePadding || this.pos.y < -worldEdgePadding || this.pos.y > windowHeight + worldEdgePadding) {
			Matter.Body.setPosition(this.body, 
				{ x: constrain(this.pos.x, -worldEdgePadding, windowWidth + worldEdgePadding), y: constrain(this.pos.y, -worldEdgePadding, windowHeight + worldEdgePadding) }, 
				true);
		}
		
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
		text(this.item.name, 0, fontSize * this.scale / 2);
		
		pop();
	}

	this.inBounds = function(x, y) {
		return Matter.Bounds.contains(this.body.bounds,
			{
				x: x, 
				y: y
			});
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