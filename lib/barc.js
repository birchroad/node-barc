/*!
 * Barc
 * Copyright (c) 2011 Peter Magnusson <kmpm@birchroad.net>
 * MIT Licensed
 */



var Barc = module.exports = function Barc(options){
	if (typeof options == 'undefined') options = {};
	this.font = 'FreeMono';
	if ('font' in options){
		this.font = options.font
	}
	
	this.hri = true;
	if('hri' in options){
		this.hri = options.hri
	}

	this.fontsize=0;
	if('fontsize' in options)
		this.fontsize = parseInt(options.fontsize);

	this.border = 0;
	if ('border' in options){
		var b = options.border
		//auto is the only allowed string
		if (typeof b == 'string' && b=="auto") {
			this.border = function(width, height){
				return Math.round(height / 30);
			}
		}
		else if (typeof b == 'function'){
			//TODO:check signature if possible
			this.border = b;
		}
	}

	this.padding=0;
	if('padding' in options){
		var p = options.padding
		//auto is the only allowed string
		if (typeof p == 'string' && p=="auto") {
			this.padding = function(width, height){
				return this.border*2;
			}
		}
		else if (typeof b == 'function'){
			//TODO:check signature if possible
			this.border = b;
		}
	}
	
	this.checksum = false;
	if ('checksum' in options){
	  this.checksum = options.checksum;
	}
}

Barc.prototype.code128 = require('./code128').code128;
Barc.prototype.code2of5 = require('./code2of5').code2of5;