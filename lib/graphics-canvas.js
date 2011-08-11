/*!
 * Barc - Graphics
 * Copyright (c) 2011 Peter Magnusson <kmpm@birchroad.net>
 * MIT Licensed
 */

var Canvas = require('canvas')
	, Image = Canvas.Image
	,geo = require('./geometry');

//color =  {r:, g:, b: }

var Graphics = function(width, height, border, padding, font, fontsize){
	this.width = width;
	this.height = height;
	this.quiet = Math.round(this.width / 40);
	if(typeof border == 'function'){
		this.border_size = border(width, height);
	}
	else{
		this.border_size = border;
	}

	if(typeof padding == 'function'){
		this.padding_width = padding(width, height);
	}
	else{
		this.padding_width = padding;
	}

	
	if (this.border_size>12){
		this.font_size = this.border_size;
	}
	else{
		this.font_size=12;
	}
	if (fontsize != 0)
		this.font_size = fontsize;

	this.area ={
		width:width- this.padding_width *2 - this.quiet * 2
		, height:height - this.border_size * 2
		, top: this.border_size
		, left: this.padding_width + this.quiet };

	this.canvas = new Canvas(width, height);
	this.ctx = this.canvas.getContext('2d');
	this.fg = "#000";
	this.bg = "#fff";
	 
	this.ctx.font = "normal " + this.font_size + "px FreeMono";
	//fill background
	this.fillFgRect(0,0, width, height);
	//fill center to create border
	this.fillBgRect(0,this.border_size
			, width, height-this.border_size*2);
}


//writes a fg colored text on a bg colored box, centered
Graphics.prototype.fillText = function(text, x, y){
	var bounds = this.ctx.measureText(text);

	var left = Math.round(x-bounds.width/2) ;
	var top = this.height - this.font_size;

	//create a slightly wider background for the text
	this.fillBgRect(left-this.font_size, top, bounds.width+this.font_size*2, this.font_size);
	this.ctx.fillStyle = this.fg;
	this.ctx.fillText(text, left, this.height);
	
}

//use native color
Graphics.prototype._fillRect = function(x,y, width, height,color){
	this.ctx.fillStyle = color
	this.ctx.fillRect(x, y, width, height);
}

Graphics.prototype.fillFgRect = function(x,y, width, height){
	this._fillRect(x,y,width,height, this.fg);
}

Graphics.prototype.fillBgRect = function(x,y, width, height){
	this._fillRect(x,y,width, height, this.bg);
}


//Should always be called last since int messes up
//the canvas and context
Graphics.prototype.rotate = function(angle){
	var rad = (angle/360) * 2 * Math.PI;
	var bounds = geo.getRotatedBounds(this.width, this.height, rad);
	var img = new Image();
	img.src = this.canvas.toBuffer();
	var canvas = new Canvas(bounds.width, bounds.height);
	var ctx = canvas.getContext('2d');
	ctx.translate(bounds.width * 0.5, bounds.height * 0.5);
	ctx.rotate(rad);
	ctx.translate(-this.width * 0.5, - this.height*0.5);
	ctx.drawImage(img, 0, 0);

	this.ctx = ctx;
	this.canvas = canvas;
}

Graphics.prototype.toBuffer = function(){
	return this.canvas.toBuffer();
}

exports.Graphics = Graphics;