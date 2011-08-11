var Barc= require ('../lib/barc')
	,fs = require('fs');;



generate('defaults', 'Wikipedia', new Barc());
generate('automatic border', 'PJJ123C', new Barc({border:'auto'}));
generate('big font', '5760466961738', new Barc({fontsize:20}));
generate('rotated', 'Wikipedia', new Barc({fontsize:20, border:'auto'}), 45);


function generate(title, text, barc, angle){
	var buf = barc.code128(text, 300, 100, angle);
	var filename = 'code128-' + title + '.png';
	fs.writeFile(__dirname + '/' + filename, buf, function(){
		console.log('Created code128 and saved it as ', filename);
	})
}