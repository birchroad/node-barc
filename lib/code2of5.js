/*!
 * Barc - Code 2 of 5
 * Copyright (c) 2011 Peter Magnusson <kmpm@birchroad.net>
 * MIT Licensed
 */

var Graphics = require('./graphics-canvas').Graphics;
/*
angle - in degrees
callback(null, code, buf, bits)
*/
exports.code2of5 = function(code, width, height, angle, callback){
  
  width = parseInt(width);
  height = parseInt(height);
  angle = typeof angle !== 'undefined' ? angle:0;
  angle=parseInt(angle);

  var useCallback = typeof callback != "undefined";
  //TODO:validate the values or err

  if(angle>=360)angle = 0;

  var MULTIPLE = 2.5;
  var VALUE_ENCODINGS = {
    '0':"nnWWn",
    '1':"WnnnW",
      '2':"nWnnW",
      '3':"WWnnn",
      '4':"nnWnW",
      '5':"WnWnn",
      '6':"nWWnn",
      '7':"nnnWW",
      '8':"WnnWn",
      '9':"nWnWn",
      ' ':"12470",
      'START':"NnNn",
      'STOP':"WnNn",
  };

  var c = makeCode(code, this.checksum);
  code = c[0];
  var bits = c[1];

  var g = new Graphics(width, height, this.border, this.padding
    , this.font, this.fontsize);

  //get the width of a narrow bar dynamically 
  //depending on the size of the code
  //and the available width
  var narrow_width = getnarrow(code, g.area.width);
  var wide_width = narrow_width * MULTIPLE;
  
  var x=g.area.left;
  for(var bit =0, len = bits.length; bit<len; bit++){
    var chr = bits[bit];
    var chr_l = chr.toLowerCase();
    var x2 =0; //the far x
    var current_width = wide_width;
    if(chr_l == 'n'){
      x2 = x+narrow_width;
      current_width = narrow_width;
    }
    x2 = x+current_width;
    if(chr =='N' || chr == 'W'){
      //if bar and not space
      g.fillFgRect(Math.round(x), 0, current_width, height);
    }
    x = x2;
  }
  

  if(this.hri==true){
    //** and print the hri
    g.fillText(code, width/2, height);
  }

    if(angle>0){
      g.rotate(angle);
  }
  

  
  var buf = g.toBuffer();
  if(useCallback){
    //called with callback
    callback(null, buf, code, bits);
    return buf;
  }
  else{
    //regular return
    return buf;
  }

  function makeCode(code, checksum){
    if (checksum) {
      code += getChecksum(code);
    }
    if((code.length % 2) != 0){
      //the length of an 2of5 code must be even
      code = "0" +code;
    }
    var strCode = VALUE_ENCODINGS['START'];
    var bar = true
    var values = [];
    for(var i = 0, len=code.length; i<len;i++){
      var encoding = VALUE_ENCODINGS[code[i]];
      if (bar){
        encoding = encoding.toUpperCase();
      }
      else {
        encoding = encoding.toLowerCase();
      }
      values.push(encoding);
      bar = !bar;
      if(values.length == 2){
        for(var j=0; j<5;j++){
          strCode += values[0][j] + values[1][j];
        }
        values = [];
        bar=true;
      }
    }
    strCode += VALUE_ENCODINGS['STOP'];
    return [code, strCode];
  }

  function getnarrow(code, width){
          //returns narrow width in pixels
          /*
          L = (C (2N + 3) + 6 + N)X
          L = length of symbol (not counting quiet zone)
          C = number of code characters
          X = X-dimension
          N = wide-to-narrow MULTIPLE
          */
          narrow = code.length * (2.0*MULTIPLE+3.0)+6.0+MULTIPLE
          return width/narrow
  }
  
  function getChecksum(code) {
    var idx, weight, sum = 0;
    for (idx = 0; idx < code.length; idx++) {
      weight = idx % 2 ? 1 : 3;
      sum += weight * parseInt(code.charAt(idx));
    }
    return sum % 10;
  }
}
