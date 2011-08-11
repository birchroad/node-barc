/*!
 * Barc - Geometry
 * Copyright (c) 2011 Peter Magnusson <kmpm@birchroad.net>
 * MIT Licensed
 */


//rotate a {x:, y:} point
function rotatePoint(p, rad){
	return {
		x:p.x*Math.cos(rad)+p.y*Math.sin(rad) 
		,y:p.y*Math.cos(rad)-p.x*Math.sin(rad)
	}
}


//get the new width and height of a rotated image
exports.getRotatedBounds = function (width, height, rad){
	//inspiration from
	//http://www.leunen.com/cbuilder/rotbmp.html
	var p0 = {x:0, y:0}
		,p1 = {x:width, y:0}
		,p2 = {x:0, y:height}
		,p3 = {x:width, y:height};
	var points = [p0,p1,p2,p3];

	
	var newPoints = []
	points.forEach(function(p){
		newPoints.push(rotatePoint(p, rad));	
	});

	var minx=Math.min(0,newPoints[1].x,newPoints[2].x,newPoints[3].x); 
	var miny=Math.min(0,newPoints[1].y,newPoints[2].y,newPoints[3].y); 
	var maxx=Math.max(newPoints[1].x,newPoints[2].x,newPoints[3].x); 
	var maxy=Math.max(newPoints[1].y,newPoints[2].y,newPoints[3].y); 

	return {width:Math.ceil(maxx-minx)
		,height:Math.ceil(maxy-miny)
		,points:newPoints};
	
}

	