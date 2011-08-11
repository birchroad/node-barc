var gd = require('node-gd')
	,geo = require('./geometry');

//color =  {r:, g:, b: }

var Graphics = function(width, height){
	this.width = width;
	this.height = height;
	this.frame_width=Math.round(width / 30);
	if (this.frame_width<9) { this.frame_width=9;}
	this.font_size=this.frame_width;
	this.client_size ={width:width-this.frame_width*6, height:height-this.frame_width*2};
	this.img = gd.createTrueColor(width, height);
	this.fg = this.img.colorAllocate(0,0,0);
	this.bg = this.img.colorAllocate(255,255,255);
	this.font = "/usr/share/cups/fonts/FreeMono.ttf";
	//create border
	this.fillBgRect(this.frame_width,this.frame_width
			, width-this.frame_width*2, height-this.frame_width*2);
}

Graphics.prototype._measureText = function(text, size){
	//font = "/usr/share/cups/fonts/FreeMono.ttf"
	var bounds = this.img.stringFT(this.fg, this.font, 
				size, 0,0,0, text, true);
	return {width:bounds[2]-bounds[0], height:bounds[1]-bounds[7]};
}

//writes a fg colored text on a bg colored box, centered
//y is bottom left
Graphics.prototype.fillText = function(text, x, y){
	var b = this._measureText(text,this.font_size,this.font);
	var left = Math.round(x-b.width/2) ;
	var top = this.height - this.font_size;

	this.fillBgRect(left, top, b.width, this.font_size);
	this.img = this.img.stringFT(this.fg, this.font, 
				this.font_size, 0, left, y, text);
}

//use native color
Graphics.prototype._fillRect = function(x,y, width, height,color){
	this.img = this.img.filledRectangle(Math.round(x), Math.round(y)
		, Math.round(x+width), Math.round(y+height), color);
}

Graphics.prototype.fillFgRect = function(x,y, width, height){
	this._fillRect(x,y,width,height, this.fg);
}

Graphics.prototype.fillBgRect = function(x,y, width, height){
	this._fillRect(x,y,width, height, this.bg);
}


Graphics.prototype.rotate = function(angle){
	var rad = (angle/360) * 2 * Math.PI;
	var bounds = geo.getRotatedBounds(this.width, this.height, rad);

	var rot = gd.createTrueColor(bounds.width, bounds.height);
	rot = rot.filledRectangle(0,0, bounds.width, bounds.height, this.bg);
	this.img.copyRotated(rot, Math.round(bounds.width/2), Math.round(bounds.height/2)
		, 0,0,this.width,this.height, 360-angle);
	this.img = rot;
}

Graphics.prototype.toBuffer = function(){
	return new Buffer(this.img.pngPtr(), encoding='binary');
}

exports.Graphics = Graphics;