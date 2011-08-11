var Barc= require ('../lib/barc')
	fs = require('fs');



generate('defaults', new Barc());
generate('automatic border', new Barc({border:'auto'}));
generate('big font', new Barc({fontsize:40}));
generate('rotated', new Barc({fontsize:40, border:'auto'}), 45);
generate('flipped', new Barc({fontsize:40 }), 90);


function generate(title, barc, angle){
	var buf = barc.code2of5('1122100017', 300, 200, angle);
	var filename = 'code2of5-' + title + '.png';
	fs.writeFile(__dirname + '/' + filename, buf, function(){
		console.log('Created code2of5 and saved it as ', filename);
	})
}