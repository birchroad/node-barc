# node-barc
 Barc is a barcode library for 1D barcodes rendered using node-canvas.
 The plan is to suport at least Code2of5, Code39 and Code128 of whitch
 Code2of5 and Code128 are usable.
 It might not be 100% to specification in all cases but it works for
 most applications

## Authors

 - Peter Magnusson

## Installation
    $ npm install barc

### Dependencies
 [node-canvas](http://github.com/LearnBoost/node-canvas) might have some dependencies to look out for. 
 Node canvas is a [Cairo](http://cairographics.org/) backed Canvas 
 implementation for [NodeJS](http://nodejs.org).


## Usage

 This library let's you define the size of the resulting image and that might
 lead to unreadable barcodes if you don't make enough room for it.
 The same goes for border and padding. If the smallest bar don't fit the
 resolution used then you will defenitely have issues.
 This will also apply if you add rotation which makes it hard for the graphics
 library and any printers to draw well defined lines.
 Try and see what fit your requirements.


### Example

```javascript
var Barc = require('barc')
	,barc = new Barc()
	,fs = require('fs');

//create a 300x200 px image with the barcode 1234
var buf = barc.code2of5('1234', 300, 200);
fs.writeFile(__dirname + '/example.png', buf, function(){
	console.log('wrote it');
});
```

 More examples are placed in _./examples_. Most produce one or more png images.


## Reference

### Barc#(options)
Constructor which enables you to set common options for all generated barcodes.

 Valid options

 - hri - Defaults to __true__. If human readable information i.e. numbers are to be written as well.
 - border - Default to 0. The number of pixels black top and bottom border. Could be a function with (width, height) signature. If the string "auto" is given as border it is calculated to 1/30 of the image height.
 - padding Defaults to 0. Padding on the left and right edges. Can be a function with the signature (width, height).
 - font - Defaults to 'FreeMono'. That font must be available to the graphics library
 - fontsize - Defaults to border width or min 12px. Number in pixels of the font size for hri.
 - checksum - Defaults to false. If true, the checksum is appended, if the code varaiant supports it. __Note__: In case of 2of5, the input length increases by one. As a result, the input length switches from even to odd and vice versa.



## License 

(The MIT License)

Copyright (c) 2011 Peter Magnusson &lt;kmpm@birchroad.net&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.