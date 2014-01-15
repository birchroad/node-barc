/*!
 * Barc - Code39
 * Copyright (c) 2013 optikfluffel <optikfluffel@gmail.com>
 * WTFPL Licensed
 */

var Graphics = require('./graphics-canvas').Graphics;
/*
angle - in degrees
callback(null, code, buf, encodedCode)
*/
exports.code39 = function(code, width, height, angle, callback){

  width = parseInt(width);
  height = parseInt(height);
  angle = typeof angle !== 'undefined' ? angle : 0;
  angle = parseInt(angle);

  var useCallback = typeof callback != "undefined";
  //TODO:validate the values or err

  if(angle>=360)angle = 0;

  var MULTIPLE = 2.5;

  /*
  encoding as described in http://en.wikipedia.org/wiki/Code39

  W: wide black
  N: narrow black

  w: wide white
  n: narrow white
  */
  var START_END_ENCODING = 'NwNnWnWnN'

  var VALUE_ENCODINGS = {
    '0': 'NnNwWnWnN',
    '1': 'WnNwNnNnW',
    '2': 'NnWwNnNnW',
    '3': 'WnWwNnNnN',
    '4': 'NnNwWnNnW',
    '5': 'WnNwWnNnN',
    '6': 'NnWwWnNnN',
    '7': 'NnNwNnWnW',
    '8': 'WnNwNnWnN',
    '9': 'NnWwNnWnN',
    'A': 'WnNnNwNnW',
    'B': 'NnWnNwNnW',
    'C': 'WnWnNwNnN',
    'D': 'NnNnWwNnW',
    'E': 'WnNnWwNnN',
    'F': 'NnWnWwNnN',
    'G': 'NnNnNwWnW',
    'H': 'WnNnNwWnN',
    'I': 'NnWnNwWnN',
    'J': 'NnNnWwWnN',
    'K': 'WnNnNnNwW',
    'L': 'NnWnNnNwW',
    'M': 'WnWnNnNwN',
    'N': 'NnNnWnNwW',
    'O': 'WnNnWnNwN',
    'P': 'NnWnWnNwN',
    'Q': 'NnNnNnWwW',
    'R': 'WnNnNnWwN',
    'S': 'NnWnNnWwN',
    'T': 'NnNnWnWwN',
    'U': 'WwNnNnNnW',
    'V': 'NwWnNnNnW',
    'W': 'WwWnNnNnN',
    'X': 'NwNnWnNnW',
    'Y': 'WwNnWnNnN',
    'Z': 'NwWnWnNnN',
    '-': 'NwNnNnWnW',
    '.': 'WwNnNnWnN',
    ' ': 'NwWnNnWnN',
    '$': 'NwNwNwNnN',
    '/': 'NwNwNnNwN',
    '+': 'NwNnNwNwN',
    '%': 'NnNwNwNwN'
  };

  var encodedCode = makeCode(code);

  var g = new Graphics(width, height, this.border, this.padding
    , this.font, this.fontsize);

  //get the width of a narrow bar dynamically
  //depending on the size of the code
  //and the available width
  var narrow_width = getnarrow(code, g.area.width);
  var wide_width = narrow_width * MULTIPLE;

  var x=g.area.left;
  for(var bit = 0; bit < encodedCode.length; bit++){
    var chr = encodedCode[bit];
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
    callback(null, buf, code, encodedCode);
    return buf;
  }
  else{
    //regular return
    return buf;
  }

  function makeCode(code){
    code = code.toUpperCase();
    var strCode = START_END_ENCODING;
    for(var i = 0; i < code.length; i++){
      strCode += 'n'; // In between each character there is a thin space
      strCode += VALUE_ENCODINGS[code[i]];
      if (i == code.length - 1) {
        strCode += 'n';
      };
    }
    strCode += START_END_ENCODING;
    return strCode;
  }

  function getnarrow(code, width){
    // returns narrow width in pixels (used wolfram alpha to get the algorithm)
    return (width - code.length) / ((3 * MULTIPLE * (code.length + 2) + 6 * code.length) + 13)
  }
}
