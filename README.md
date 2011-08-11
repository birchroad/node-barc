# node-barc
 Barc is a barcode library for 1D barcodes rendered using node-canvas.
 The plan is to suport at least Code2of5, Code39 and Code128

## Authors

 - Peter Magnusson

## Installation
    $ npm install barc

[node-canvas](http://github.com/LearnBoost/node-canvas) might have some dependencies to look out for. 



## Example

```javascript
var Barc = require('barc')
	,barc = new Barc()
	,fs = require('fs');

//create a 300x200 px image with the barcode 1234
var buf = barc.code2op5('1234', 300, 200);
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
 - border - Default to 0. The number of pixels black border. Could be a function with (width, height) signature. If the string "auto" is given as border it is calculated to 1/30 of the image width.
 - padding Defaults to border width * 3. Padding inside any border before barcode starts. Can be a function with the signature (width, height).
 - font - Defaults to 'FreeMono'. That font must be available to the graphics library
 - fontsize - Defaults to border width or min 12px. Number in pixels of the font size for hri.



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