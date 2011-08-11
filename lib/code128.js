/*!
 * Barc - Code 128
 * Copyright (c) 2011 Peter Magnusson <kmpm@birchroad.net>
 * MIT Licensed
 */

var Graphics = require('./graphics-canvas').Graphics;

var CHAR_TILDE=126;
var CODE_FNC1=102;

var SET_STARTA = 103;
var SET_STARTB = 104;
var SET_STARTC = 105;
var SET_SHIFT=98;
var SET_CODEA=101;
var SET_CODEB=100;
var SET_STOP = 106;


var REPLACE_CODES = {
    CHAR_TILDE:CODE_FNC1 //~ corresponds to FNC1 in GS1-128 standard
}

var CODESET_ANY=1;
var CODESET_AB=2;
var CODESET_A=3;
var CODESET_B=4;
var CODESET_C=5;

String.prototype.getBytes = function(){
        var bytes=[];
        for(i=0; i<this.length; i++){
            bytes.push(this.charCodeAt(i));
        }
        return bytes;
    }

exports.code128 = function(text, width, height, angle, callback){
    width = parseInt(width);
    height = parseInt(height);
    angle = typeof angle !== 'undefined' ? angle:0;
    angle=parseInt(angle);
    var useCallback = typeof callback != "undefined";
    //TODO:validate the values or err

	var codes = stringToCode128(text);

    var g = new Graphics(width, height, this.border, this.padding
        , this.font, this.fontsize);



    var barWeight = g.area.width / ((codes.length -3) * 11 + 35);
    var x = g.area.left;
    for(var i = 0; i<codes.length; i++){
        var c = codes[i];
        //two bars at a time: 1 black and 1 white
        for(var bar=0; bar < 8; bar+=2 ){
            var barW = PATTERNS[c][bar] * barWeight;
            var spcW = PATTERNS[c][bar +1] * barWeight;

            //no need to draw if 0 width
            if(barW >0){
                g.fillFgRect(x, 0, barW, height);
            }
            
            x += barW + spcW;
        }
    }

    if(this.hri){
        g.fillText(text, width/2, height);
    }

    if(angle>0){
        g.rotate(angle);
    }


    var buf = g.toBuffer();
    if(useCallback){
        //called with callback
        callback(null, buf, codes, bits);
        return buf;
    }
    else{
        //regular return
        return buf;
    }
    
}


function stringToCode128(text){
	var bytes=text.getBytes();
    //decide starting codeset
    var index = bytes[0] == CHAR_TILDE ? 1 : 0;


    var csa1 = bytes.length > 0 ? codeSetAllowedFor(bytes[index++]) : CODESET_AB;
    var csa2 = bytes.length > 0 ? codeSetAllowedFor(bytes[index++]) : CODESET_AB;
    this.currcs = getBestStartSet(csa1, csa2);
    this.currcs = perhapsCodeC(bytes, currcs);
    //if no codeset changes this will end up with bytes.length+3
    //start, checksum and stop
    codes = new Array(); 

    switch(this.currcs){
        case CODESET_A:
            codes.push(SET_STARTA);
            break;
        case CODESET_B:
            codes.push(SET_STARTB);
            break;
        default:
            codes.push(SET_STARTC);
            break;
    }
    

    for(i=0;i<bytes.length;i++){
        var b1 = bytes[i]; //get the first of a pair
        //should we translate/replace
        if(b1 in REPLACE_CODES){
            codes.push(REPLACE_CODES[b1]);
            i++ //jump to next
            b1 = bytes[i];
        }
        
        //get the next in the pair if possible
        var b2 = bytes.length > (i+1) ? bytes[i+1]: -1; 
        
        codes = codes.concat(codesForChar(b1,b2, this.currcs));
        //code C takes 2 chars each time
        if(this.currcs == CODESET_C) i++;
    }

    //calculate checksum according to Code 128 standards
    var checksum = codes[0];
    for(weight=1; weight<codes.length; weight++){
        checksum += (weight * codes[weight]);
    }
    codes.push(checksum % 103);

    codes.push(SET_STOP);

    //encoding should now be complete
    return codes;
    


    function getBestStartSet(csa1, csa2){
        //tries to figure out the best codeset
        //to start with to get the most compact code
        var vote = 0;
        vote += csa1 == CODESET_A ? 1 : 0;
        vote += csa1 == CODESET_B ? -1 : 0;
        vote += csa2 == CODESET_A ? 1 : 0;
        vote += csa2 == CODESET_B ? -1 : 0;
        //tie goes to B due to my own predudices
        return vote>0 ? CODESET_A: CODESET_B;
    }

    function perhapsCodeC(bytes, codeset){
        for(i =0; i<bytes.length; i++){
            var b = bytes[i]
            if( (b<48 || b>57) && b!=CHAR_TILDE)
                return codeset;
        }
        return CODESET_C;
    }

    //chr1 is current byte
    //chr2 is the next byte to process. looks ahead.
    function codesForChar(chr1, chr2, currcs){
        var result = [];
        var shifter = -1;
        
        if(charCompatible(chr1, currcs)){
            if(currcs == CODESET_C){
                if(chr2 == -1){
                    shifter = SET_CODEB;
                    currcs = CODESET_B;
                }
                else if ( (chr2 != -1) && !charCompatible(chr2, currcs)){
                    //need to check ahead as well
                    if(charCompatible(chr2, CODESET_A)){
                        shifter = SET_CODEA;
                        currcs = CODESET_A;
                    }
                    else{
                        shifter = SET_CODEB;
                        currcs = CODESET_B;
                    }
                }
            }
        }
        else{
            //if there is a next char AND that next char is also not compatible
            if( (chr2 != -1) && !charCompatible(chr2, currcs)){
                //need to switch code sets
                switch(currcs){
                    case CODESET_A:
                        shifter = SET_CODEB;
                        currcs = CODESET_B;
                        break;
                    case CODESET_B:
                        shifter = SET_CODEA;
                        currcs = CODESET_A;
                        break;
                }
            }
            else{
                //no need to shift code sets, a temporary SHIFT will suffice
                shifter = SET_SHIFT;
            }
        }

        //ok some type of shift is nessecary
        if(shifter != -1){
            result.push(shifter);
            result.push(codeValue(chr2));
        }
        else{
            if(currcs == CODESET_C){
                //include next as well
                result.push(codeValue(chr1, chr2));
            }
            else{
                result.push(codeValue(chr1));
            }
        }
        this.currcs=currcs;

        return result;
    }
    
}


//reduce the ascii code to fit into the Code128 char table
function codeValue(chr1, chr2){
    if(typeof chr2 == "undefined"){
        return chr1 >= 32 ? chr1 - 32: chr1 + 64;
    }
    else{
        return parseInt(String.fromCharCode(chr1) + String.fromCharCode(chr2));
    }
}

function charCompatible(chr, codeset){
    var csa = codeSetAllowedFor(chr);
    if (csa == CODESET_ANY) return true;
    //if we need to change from current
    if (csa == CODESET_AB) return true;
    if (csa == CODESET_A && codeset == CODESET_A) return true;
    if (csa == CODESET_B && codeset == CODESET_B) return true;
    return false;
}

function codeSetAllowedFor(chr){
    if(chr >= 48 && chr <= 57){
        //0-9
        return CODESET_ANY;
    } 
    else if (chr >= 32 && chr <= 95){
        //0-9 A-Z
        return CODESET_AB;
    }
    else{
        //if non printable 
        return chr<32 ? CODESET_A:CODESET_B;
    }
} 


var PATTERNS = [
	[2,1,2,2,2,2,0,0],  // 0
    [2,2,2,1,2,2,0,0],  // 1
    [2,2,2,2,2,1,0,0],  // 2
    [1,2,1,2,2,3,0,0],  // 3
    [1,2,1,3,2,2,0,0],  // 4
    [1,3,1,2,2,2,0,0],  // 5
    [1,2,2,2,1,3,0,0],  // 6
    [1,2,2,3,1,2,0,0],  // 7
    [1,3,2,2,1,2,0,0],  // 8
    [2,2,1,2,1,3,0,0],  // 9
    [2,2,1,3,1,2,0,0],  // 10
    [2,3,1,2,1,2,0,0],  // 11
    [1,1,2,2,3,2,0,0],  // 12
    [1,2,2,1,3,2,0,0],  // 13
    [1,2,2,2,3,1,0,0],  // 14
    [1,1,3,2,2,2,0,0],  // 15
    [1,2,3,1,2,2,0,0],  // 16
    [1,2,3,2,2,1,0,0],  // 17
    [2,2,3,2,1,1,0,0],  // 18
    [2,2,1,1,3,2,0,0],  // 19
    [2,2,1,2,3,1,0,0],  // 20
    [2,1,3,2,1,2,0,0],  // 21
    [2,2,3,1,1,2,0,0],  // 22
    [3,1,2,1,3,1,0,0],  // 23
    [3,1,1,2,2,2,0,0],  // 24
    [3,2,1,1,2,2,0,0],  // 25
    [3,2,1,2,2,1,0,0],  // 26
    [3,1,2,2,1,2,0,0],  // 27
    [3,2,2,1,1,2,0,0],  // 28
    [3,2,2,2,1,1,0,0],  // 29
    [2,1,2,1,2,3,0,0],  // 30
    [2,1,2,3,2,1,0,0],  // 31
    [2,3,2,1,2,1,0,0],  // 32
    [1,1,1,3,2,3,0,0],  // 33
    [1,3,1,1,2,3,0,0],  // 34
    [1,3,1,3,2,1,0,0],  // 35
    [1,1,2,3,1,3,0,0],  // 36
    [1,3,2,1,1,3,0,0],  // 37
    [1,3,2,3,1,1,0,0],  // 38
    [2,1,1,3,1,3,0,0],  // 39
    [2,3,1,1,1,3,0,0],  // 40
    [2,3,1,3,1,1,0,0],  // 41
    [1,1,2,1,3,3,0,0],  // 42
    [1,1,2,3,3,1,0,0],  // 43
    [1,3,2,1,3,1,0,0],  // 44
    [1,1,3,1,2,3,0,0],  // 45
    [1,1,3,3,2,1,0,0],  // 46
    [1,3,3,1,2,1,0,0],  // 47
    [3,1,3,1,2,1,0,0],  // 48
    [2,1,1,3,3,1,0,0],  // 49
    [2,3,1,1,3,1,0,0],  // 50
    [2,1,3,1,1,3,0,0],  // 51
    [2,1,3,3,1,1,0,0],  // 52
    [2,1,3,1,3,1,0,0],  // 53
    [3,1,1,1,2,3,0,0],  // 54
    [3,1,1,3,2,1,0,0],  // 55
    [3,3,1,1,2,1,0,0],  // 56
    [3,1,2,1,1,3,0,0],  // 57
    [3,1,2,3,1,1,0,0],  // 58
    [3,3,2,1,1,1,0,0],  // 59
    [3,1,4,1,1,1,0,0],  // 60
    [2,2,1,4,1,1,0,0],  // 61
    [4,3,1,1,1,1,0,0],  // 62
    [1,1,1,2,2,4,0,0],  // 63
    [1,1,1,4,2,2,0,0],  // 64
    [1,2,1,1,2,4,0,0],  // 65
    [1,2,1,4,2,1,0,0],  // 66
    [1,4,1,1,2,2,0,0],  // 67
    [1,4,1,2,2,1,0,0],  // 68
    [1,1,2,2,1,4,0,0],  // 69
    [1,1,2,4,1,2,0,0],  // 70
    [1,2,2,1,1,4,0,0],  // 71
    [1,2,2,4,1,1,0,0],  // 72
    [1,4,2,1,1,2,0,0],  // 73
    [1,4,2,2,1,1,0,0],  // 74
    [2,4,1,2,1,1,0,0],  // 75
    [2,2,1,1,1,4,0,0],  // 76
    [4,1,3,1,1,1,0,0],  // 77
    [2,4,1,1,1,2,0,0],  // 78
    [1,3,4,1,1,1,0,0],  // 79
    [1,1,1,2,4,2,0,0],  // 80
    [1,2,1,1,4,2,0,0],  // 81
    [1,2,1,2,4,1,0,0],  // 82
    [1,1,4,2,1,2,0,0],  // 83
    [1,2,4,1,1,2,0,0],  // 84
    [1,2,4,2,1,1,0,0],  // 85
    [4,1,1,2,1,2,0,0],  // 86
    [4,2,1,1,1,2,0,0],  // 87
    [4,2,1,2,1,1,0,0],  // 88
    [2,1,2,1,4,1,0,0],  // 89
    [2,1,4,1,2,1,0,0],  // 90
    [4,1,2,1,2,1,0,0],  // 91
    [1,1,1,1,4,3,0,0],  // 92
    [1,1,1,3,4,1,0,0],  // 93
    [1,3,1,1,4,1,0,0],  // 94
    [1,1,4,1,1,3,0,0],  // 95
    [1,1,4,3,1,1,0,0],  // 96
    [4,1,1,1,1,3,0,0],  // 97
    [4,1,1,3,1,1,0,0],  // 98
    [1,1,3,1,4,1,0,0],  // 99
    [1,1,4,1,3,1,0,0],  // 100
    [3,1,1,1,4,1,0,0],  // 101
    [4,1,1,1,3,1,0,0],  // 102
    [2,1,1,4,1,2,0,0],  // 103
    [2,1,1,2,1,4,0,0],  // 104
    [2,1,1,2,3,2,0,0],  // 105
    [2,3,3,1,1,1,2,0]   // 106
]

