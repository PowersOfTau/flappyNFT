// Create our 'main' state that will contain the game
var mainState = {
    preload: function() { 
        game.input.mouse.capture = true;

        //generate a bird gaming spritesheet asset based on bird DNA and add into the game
        url = buildBird(ContractState.token_mds[activeBird]);
        game.load.spritesheet('bird', url, 70, 50, 40);

		game.load.spritesheet('holePipe', 'assets/diamond.png', 32, 24, 5);
		game.load.spritesheet('FlappyNFTTxt', 'assets/FlappyNFT.png', 200, 63, 2);
		game.load.spritesheet('GameRestartBtn', 'assets/restartBtn.png', 180.5, 72, 2);
		game.load.spritesheet('GameStartBtn', 'assets/startBtn.png', 154.5, 72, 2);
		game.load.spritesheet('ConnectBtn', 'assets/connectBtn.png', 259.5, 72, 2);
		game.load.spritesheet('ChangeBirdBtn', 'assets/changeBtnf.png', 200, 61, 2);
        game.load.image('strtbtn', 'assets/strtbtn.png');
        game.load.image('stpbtn', 'assets/stpbtn.png');
        game.load.image('pipe0', 'assets/zillogo.png');
        game.load.image('pipe1', 'assets/zilswaplogo.png');
        game.load.image('pipe2', 'assets/scillalogo.png');
        game.load.image('pipe3', 'assets/xcadlogo.png');
        game.load.image('pipe4', 'assets/xsgdlogo.png');
        game.load.image('pipe5', 'assets/packageportallogo.png');
        game.load.audio('dies', 'assets/die.wav'); 
        game.load.audio('wings', 'assets/wing.wav'); 
        game.load.audio('points', 'assets/point.wav'); 
        game.load.audio('btnclk', 'assets/btnclk.mp3'); 
        game.load.image('backgroundsky','assets/fbg.png')


        console.log("perload end")
    },
    loadBird: async function(){
    	await loadNFTContract()
    	console.log("Contract Loaded")
		addr = ("0xb2684b4192ed878b3c7009d1bc5ae0c64b0508c0").toLowerCase()
		this.ownedToken = []
		console.log("list")
		for(i in ContractState.token_owners)
		    if(ContractState.token_owners[i] == addr) this.ownedToken.push(i)
		token = ContractState.token_mds[this.ownedToken[0]]
    	console.log(this.ownedToken.length + " NFT found")

 	    await fun(token);

		aa = game.load.spritesheet('bird', url, 70, 50, 40);
    },

    create: function() { 
        
        this.background = game.add.tileSprite(0,0,800,490,'backgroundsky');

        this.score = 0;
        this.pipes = game.add.group(); 
        this.holes = game.add.group(); 

        // Set the physics system
        game.physics.startSystem(Phaser.Physics.ARCADE);

        this.FlappyNFTTxt = game.add.sprite(game.world.centerX-100,16,'FlappyNFTTxt');
		var FlappyNFTAnim = this.FlappyNFTTxt.animations.add('FlappyNFTAnim');
		this.FlappyNFTTxt.animations.play('FlappyNFTAnim', 10, true);


		this.bird = game.add.sprite(300, 110, 'bird');
        this.bird.anchor.setTo(-0.2, 0.5); 
        this.bird.scale.setTo(0.75,0.75);
       	var fly = this.bird.animations.add('fly');


        // Call the 'jump' function when the spacekey is hit
        var spaceKey = game.input.keyboard.addKey(
                        Phaser.Keyboard.SPACEBAR);
        spaceKey.onDown.add(this.jump, this);  

        //var tap = game.input.onTap.add(this.jump,this);

        this.jumpSound = game.add.audio('wings');    
        this.dieSound = game.add.audio('dies');    
        this.pointSound = game.add.audio('points');    
        this.btnclkSound = game.add.audio('btnclk');    

        scoreText = game.add.text(game.world.centerX-24, 16, `${this.score}`, { fontSize: '48px', fill: '#000' }); 
        scoreText.visible = false;

        //startbutton = game.add.button(game.world.centerX - 95, 210, 'strtbtn', this.up, this, 2, 1, 0);
		//var GameStartAnim = this.GameStartBtn.animations.add('GameStartAnim');
        //startbutton.onInputDown.add(this.up,this);
        //game.input.mouse.mouseDownCallback = "";
		// button = game.add.button(game.world.centerX-96, game.world.centerY-35, 'button', this.actionOnClick, this, 2, 1, 0);
		// button.onInputOver.add(this.over, this);
	 //    button.onInputOut.add(this.out, this);
	 //    button.onInputUp.add(this.up, this);

       	if(window.zilPay.wallet.isConnect && window.zilPay.wallet.isEnable){
			//zpc = game.add.text(140, 240, `ZilPay Connected`, { fontSize: '16px', fill: '#000' }); 
        	this.GameStartBtn = game.add.button(game.world.centerX - 78, 210, 'GameStartBtn', this.up, this, 2, 1, 0);
        	this.ChangeBirdBtn = game.add.button(game.world.centerX - 100, 290, 'ChangeBirdBtn', this.changeBird, this, 2, 1, 0);
        }else{
			this.zpnc = game.add.text(game.world.centerX - 90, 170, `ZilPay Not Connected`, { fontSize: '16px', fill: '#000' }); 
        	this.ConnectBtn = game.add.button(game.world.centerX - 129.75, 210, 'ConnectBtn', this.connectWallet, this, 2, 1, 0);
       	}
        document.querySelector("#loadingBox").style.setProperty("visibility","hidden");
    },
    connectWallet: async function(){
    	a = await window.zilPay.wallet.connect();
    	if(a){
        	this.GameStartBtn = game.add.button(game.world.centerX - 78, 210, 'GameStartBtn', this.up, this, 2, 1, 0);
        	this.ChangeBirdBtn = game.add.button(game.world.centerX - 100, 290, 'ChangeBirdBtn', this.changeBird, this, 2, 1, 0);
    		this.ConnectBtn.visible = false;
    		this.zpnc.visible = false;
    	}
    },
    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic
 
        if (this.bird.y < 0 || this.bird.y > 490){
            this.hitPipe();
        }

        if (this.bird.angle < 20)
		    this.bird.angle += 1; 	

		game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
		game.physics.arcade.overlap(this.bird, this.holes, this.hitHole, null, this);
		scoreText.setText(`${this.score}`);
    },
    // Make the bird jump 
    jump: function() {
    	if (this.bird.alive == false)
    		return; 
		
		this.jumpSound.play();
		this.bird.animations.play('fly', 160, false);

        // Add a vertical velocity to the bird
        this.bird.body.velocity.y = -350;
        var animation = game.add.tween(this.bird);
		animation.to({angle: -20}, 100);
		animation.start();
    },

    // Restart the game
    restartGame: function() {
		this.btnclkSound.play();
        game.state.start('main');

    },
    changeBird: function(){
    	ChangeBirdMenu();
    },
    addOnePipe: function(x, y,r) {
        // Create a pipe at the position x and y
        var pipe = game.add.sprite(x, y, 'pipe'+r);

        // Add the pipe to our previously created group
        this.pipes.add(pipe);

        // Enable physics on the pipe 
        game.physics.arcade.enable(pipe);

        // Add velocity to the pipe to make it move left
        pipe.body.velocity.x = -200; 

        // Automatically kill the pipe when it's no longer visible 
        pipe.checkWorldBounds = true;
        pipe.outOfBoundsKill = true;
    },
    addOneHole: function(x, y) {
        // Create a pipe at the position x and y
        var hole = game.add.sprite(x, y, 'holePipe');

        // Add the pipe to our previously created group
        this.holes.add(hole);

        // Enable physics on the pipe 
        game.physics.arcade.enable(hole);

        // Add velocity to the pipe to make it move left
        hole.body.velocity.x = -200; 

        // Automatically kill the pipe when it's no longer visible 
        hole.checkWorldBounds = true;
        hole.outOfBoundsKill = true;
		var point = hole.animations.add('point');
	    hole.animations.play('point', 10, true);
    }, 
    addRowOfPipes: function() {
        // Randomly pick a number between 1 and 5
        // This will be the hole position
        var hole = Math.floor(Math.random() * 5) + 1;

        // Add the 6 pipes 
        // With one big hole at position 'hole' and 'hole + 1'
        r = Math.floor(Math.random() * 6);

        for (var i = 0; i < 8; i++){
            if (i != hole && i != hole + 1){
                this.addOnePipe(800, i * 60 + 10,r);   
            }else{
            	this.addOneHole(800, i * 60 + 19);
            }
        }
    },
    hitPipe: function() {
	    if (this.bird.alive == false)
	        return;

	    this.dieSound.play();
	    this.bird.alive = false;
//		stopbutton = game.add.button(game.world.centerX - 95, 210, 'stpbtn', this.restartGame, this, 2, 1, 0);
        //stopbutton.input.mouse.mouseDownCallback = this.restarts; 

   		this.GameRestartBtn = game.add.button(game.world.centerX - 91, 210, 'GameRestartBtn', this.restartGame, this, 2, 1, 0);
		//var GameRestartAnim = this.GameRestartBtn.animations.add('GameOverAnim');

	    game.time.events.remove(this.timer);

	    this.pipes.forEach(function(p){
	        p.body.velocity.x = 0;
	    }, this);
	    this.holes.forEach(function(p){
	        p.body.velocity.x = 0;
	    }, this);
	},
	hitHole: function(a,b) {
	    if (this.bird.alive == false)
	        return;
	    this.pointSound.play();
	    b.destroy();
	    this.score += 1;
	},
	up: function(){
		console.log("Up");
		this.btnclkSound.play();
		game.physics.arcade.enable(this.bird);
        this.bird.body.gravity.y = 1000;  
		this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);  
		this.FlappyNFTTxt.destroy();
        scoreText.visible = true;
        this.GameStartBtn.visible = false;
        this.ChangeBirdBtn.visible = false;

	},
	actionOnClick: function() {
	    //background.visible =! background.visible;
	    console.log("asdert")
	},
};

var game;
var color = ["SlateBlue","coral","fuchsia","gold","grey","lime","indigo","navy","OrangeRed","olive","SeaGreen","SkyBlue","crimson","teal","wheat","Sienna"];

function loadGame(){
    document.querySelector("#loadingBox").style.setProperty("visibility","visible")
    document.querySelector("#loadingBox").innerHTML = "<h1>Loading Game....</h1>";

	if(activeBird){
		console.log("OnLoad called")
		document.querySelector("#gallery-container").innerHTML = "";
		// Initialize Phaser, and create a 400px by 490px game
		game = new Phaser.Game(800, 490,Phaser.AUTO,"gallery-container");

		// Add the 'mainState' and call it 'main'
		game.state.add('main', mainState); 

		// Start the state to actually start the game
		game.state.start('main');
	}else{
		alert("You dont own any NFT, Pl own one to play");
	}
}

function getG(x,y,r){
    return `<g xmlns="http://www.w3.org/2000/svg" width="70" height="50" transform="translate(${x},${y})">
            <circle style="stroke: rgb(0, 0, 0); fill: url(#body)" cx="41.7" cy="25" r="20"/>
            <circle style="stroke: rgb(0, 0, 0); fill: white" cx="58.047" cy="12.53" r="5.949"/>
            <circle xmlns="http://www.w3.org/2000/svg" style="stroke: rgb(0, 0, 0); fill: url(#eye);" cx="59" cy="12" r="2"/>
            <g transform-origin="35 21.8" transform="rotate(${r})">
                <rect x="5" y="10" width="34" height="8.5" style="fill: url(#wing); stroke: rgb(0, 0, 0);" rx="5" ry="5"/>
                <rect x="10" y="17.5" width="29" height="8.5" style="fill: url(#wing); stroke: rgb(0, 0, 0);" rx="5" ry="5"/>
                <rect x="15" y="25" width="24" height="8.5" style="fill: url(#wing); stroke: rgb(0, 0, 0);" rx="5" ry="5"/>    
            </g>
            <rect x="52.097" y="34.07" width="11.77" height="4.225" style="stroke: rgb(0, 0, 0); fill: rgb(247, 0, 0);" rx="10.566" ry="10.566"/>
        </g>`;
}

function buildBird(token){
	console.log("Build Bird", token)
	b = parseInt("0x"+token[3]);
	w = parseInt("0x"+token[5]);
	e = parseInt("0x"+token[7]);

    lst = []
    x=20;
    j=-2;
    for(i=0;i<40;i++){
        lst.push(x);
        x = x+j;
        if(x<=-20) j=2;
    }

	svg = `
    <svg xmlns="http://www.w3.org/2000/svg" id="svg" viewBox="0 0 700 200" width="700" height="200">
		<defs xmlns="http://www.w3.org/2000/svg">
			<linearGradient id="body">
				<stop id="bodyC" stop-color="${color[b]}"/>
			</linearGradient>
			<linearGradient id="eye">
				<stop id="eyeC" stop-color="${color[e]}"/>
			</linearGradient>
			<linearGradient id="wing">
				<stop id="wingC" stop-color="${color[w]}"/>
			</linearGradient>
		</defs>
    `;

    for(y=0;y<4;y++){
        for(x=0;x<10;x++){
            svg += getG(x*70,y*50,lst[y*10+x]);
        }
    }

    svg += "</svg>";

    blob = new Blob([svg],{type: 'image/svg+xml'});
    
    console.log("blob")
    url = URL.createObjectURL(this.blob);
    console.log("url")
    
    return url;
}
