var ContractAddress;
var ContractObject;
var ContractState;
var ownedNFT;
var activeBird;

var color = ["SlateBlue","coral","fuchsia","gold","grey","lime","indigo","navy","OrangeRed","olive","SeaGreen","SkyBlue","crimson","teal","wheat","Sienna"];

function checkWallet(){
	if(window.zilPay){
		if(window.zilPay.wallet.net != 'testnet'){
			alert("Please chnage network to testnet and reload");
			return false;
		}
		return true;
	}else{
		alert("ZilPAy wallet not found!!")
		return false;
	}
}

async function connectWallet(){
	if(window.zilPay.wallet.isConnect && window.zilPay.wallet.isEnable){
		return true;
	}
	console.log("inconnect wallet")
	t = await window.zilPay.wallet.connect();
	console.log(t)
	if(t){
		window.location.reload();
	}else{
		alert("zilPay access denied");
	}
}

function loadContract(contractAddr){
	try{
		return window.zilPay.contracts.at(contractAddr);
	}catch(err){
		console.log(err.message);
		return false;
	}
}

function onloadInit(){
	connectAppToWallet();
	observer();
	console.clear();
	loadNFTContract();
}

function loadGallery(flag){
	document.querySelector("#loadingBox").style.setProperty("visibility","visible");
	document.querySelector("#loadingBox").innerHTML = "Loading Gallery....";
	if(!ContractObject){
		alert("Contract not loaded, please wait");
		document.querySelector("#loadingBox").style.setProperty("visibility","hidden");
		loadNFTContract();
		return;
	}

	var gallery = document.querySelector("#gallery-container");
	gallery.innerHTML = "";

	tokenOwners = ContractState.token_owners;
	tokenMds = ContractState.token_mds;

	galleryCode = "<h2 style='width:100%' class='HVCenter'>" + ((flag)?"Your ":"All Minted ") + ContractObject.init[1].value + "</h2>";

	var currentAccountAddress = window.zilPay.wallet.defaultAccount.base16;

	ownedNFT = [];
	for(i in tokenOwners){

		if(tokenOwners[i].toUpperCase() == currentAccountAddress.toUpperCase()){			
			ownedNFT.push(i);
		}else{
			if(flag){
				continue;
			}
		}

		var transferBtn = "";
		if(tokenOwners[i].toUpperCase() == currentAccountAddress.toUpperCase()){			
			transferBtn = "<button onclick='transferNFT(" + i + ")'>Transfer</button>"
		}		

		md1 = parseInt("0x"+tokenMds[i][3]);
		md2 = parseInt("0x"+tokenMds[i][5]);
		md3 = parseInt("0x"+tokenMds[i][7]);
		galleryCode += `
		<div id="nft-${i}" class="nft-card">
			<div class="nft-card-id HVCenter">NFT ID: ${i}&nbsp;${transferBtn}</div>
			<div class="nft-card-img-holder HVCenter">
				${buildBrd(md1,md2,md3,i)}
			</div>
			<div class="nft-card-owner">Owner:&nbsp;${tokenOwners[i]}</div>
		</div>
		`;
	}

	if(ContractState.total_supply <= 0){
		if(!flag)
			galleryCode += "<h3>No NFTs Minted So Far..</h3>";
	}

	if(ownedNFT.length > 0){
		activeBird = ownedNFT[0];
	}else{
		if(flag){
			galleryCode += "<h3>You Dont Own Any NFT</h3>"
		}
		activeBird = undefined;
	}

	gallery.innerHTML = galleryCode;
	
	document.querySelector("#loadingBox").style.setProperty("visibility","hidden");
}

function loadMarket(){
	document.querySelector("#loadingBox").style.setProperty("visibility","visible");
	console.log(document.querySelector("#loadingBox").style.visibility);
	document.querySelector("#loadingBox").innerHTML = "<h1>Loading Market....</h1>";

	if(!ContractObject){
		alert("Contract not loaded, please wait");
		document.querySelector("#loadingBox").style.setProperty("visibility","hidden");
		loadNFTContract()
		return;
	}


	var gallery = document.querySelector("#gallery-container");
	gallery.innerHTML = "Please wait while market is loaded";

	mdToId = ContractState.metadata_to_id;
	
	galleryCode = "<h2 style='width:100%' class='HVCenter'>flappyNFT Market</h2>";

	for (i = 0;i<=0xf; i++) {
		for (j = 0;j<=0xf; j++) {
			if(i == j) continue;
			for (k = 0;k<=0xf; k++) {
				if(k == j || i==k) continue;
					
					x=i.toString(16);
					y=j.toString(16);
					z=k.toString(16);

					var dna = `0x0${z}0${y}0${x}`;

					if(!mdToId[dna]){
						galleryCode += `
						<div class="nft-card">
							<div class="nft-card-id HVCenter">NFT DNA:&nbsp;${dna}</div>
							<div class="nft-card-img-holder HVCenter">
								${buildBrd(k,j,i,dna)}
							</div>
							<div class="nft-card-owner"><button onclick="buyNFT('${z}','${y}','${x}')"">Buy</button></div>
						</div>
						`;
					}
			}			
		}		
	}

	gallery.innerHTML = galleryCode;
	document.querySelector("#loadingBox").style.setProperty("visibility","hidden");
}


async function connectAppToWallet(){
	check1 = checkWallet();
	console.log("wait for check")
	check2 = await connectWallet();
	console.log("check after")

	if(check1 && check2){		
		//if successful hide button and show net and address
		document.querySelector("#wallet-address-container").style.display = "inline-block";
		document.querySelector("#connect-button-container").style.display = "none";

		//get and set network and address
		let networkName = window.zilPay.wallet.net;
		let currentAddress = window.zilPay.wallet.defaultAccount.bech32;
		document.querySelector("#wallet-network-span").innerHTML = networkName;
		document.querySelector("#wallet-address-span").innerHTML = currentAddress;
	}
}

function observer(){
	window.zilPay.wallet.observableAccount().subscribe(function (acc){
		//alert("Account Changed. Please Reload App..");
		if(acc) connectAppToWallet();
	});

	window.zilPay.wallet.observableNetwork().subscribe(function (net){
		if(net) connectAppToWallet();
		//alert("Network Changed. Please Reload App..");
	});
}


function loadNFTContract(){
	document.querySelector("#loadingBox").style.setProperty("visibility","visible")
	document.querySelector("#loadingBox").innerHTML = "<h1>Loading Contract....</h1>";

	var contractAddress = "zil133z8p0thl9chljaf5l42chpygceknyx6ycgl8a";
	
	ContractObject = loadContract(contractAddress);
	if(ContractObject){
		ContractObject.getState().then(function(stateData){
			ContractState = stateData;
			ContractAddress = contractAddress;
			// alert("Contract State Loaded Successfully!");
			document.querySelector("#gallery-container").innerHTML = "Building Gallery";
			ContractObject.getInit().then(function(x){
				document.querySelector("#loadingBox").style.setProperty("visibility","hidden");
				loadGallery(false);
			});

		});
	}else{
		ContractObject = undefined;
	}
}

function buyNFT(x,y,z){

	if(!ContractObject){
		alert("Please load contract first");
		return;
	}

	md1 = `0x0${x}`;
	md2 = `0x0${y}`;
	md3 = `0x0${z}`;

	/* Code for transaction call */
	const gasPrice = window.zilPay.utils.units.toQa('2000', window.zilPay.utils.units.Units.Li);

	var tx = ContractObject.call('Mint',[{
		vname: "md1",
		type: "ByStr1",
		value: md1
	},{
		vname: "md2",
		type: "ByStr1",
		value: md2
	},{
		vname: "md3",
		type: "ByStr1",
		value: md3
	}],
	{
		amount: 25000000000000,
		gasPrice: gasPrice,
		gasLimit: window.zilPay.utils.Long.fromNumber(10000)
	});
	/* Code for transaction call */

	//handle the promise accordingly
	tx.then(function(a){
		alert(`Transaction ID: ${a.ID}`);
		alert(`Please refresh when Minted.`)
	});
}


function transferNFT(nftid){

	var receiverAddress = prompt("Please enter the address you want to send NFT ID:" + nftid + " to");

	/* Code for transaction call */
	const gasPrice = window.zilPay.utils.units.toQa('2000', window.zilPay.utils.units.Units.Li);

	var tx = ContractObject.call('Transfer',[{
		vname: "to",
		type: "ByStr20",
		value: receiverAddress+""
	},{
		vname: "token_id",
		type: "Uint32",
		value: nftid+""
	}],
	{
		gasPrice: gasPrice,
		gasLimit: window.zilPay.utils.Long.fromNumber(10000)
	});
	/* Code for transaction call */

	//handle the promise accordingly
	tx.then(function(a){
		console.log(a);
	});
}

function buildBrd(md1,md2,md3,i){

	var brd = `
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 50" width="140" height="100">	
	<g xmlns="http://www.w3.org/2000/svg" width="70" height="50" transform="translate(0,0)">
		<circle style="stroke: rgb(0, 0, 0); fill: ${color[md1]}" cx="41.7" cy="25" r="20"/>
		<circle style="stroke: rgb(0, 0, 0); fill: white;" cx="58.047" cy="12.53" r="5.949"/>
		<circle style="fill: ${color[md3]}" cx="58.047" cy="12.53" r="3"/>
		<g transform-origin="35 21.8" transform="rotate(20)">
			<rect x="5" y="10" width="34" height="8.5" style="fill: ${color[md2]}; stroke: rgb(0, 0, 0);" rx="5" ry="5"/>
			<rect x="10" y="17.5" width="29" height="8.5" style="fill: ${color[md2]}; stroke: rgb(0, 0, 0);" rx="5" ry="5"/>
			<rect x="15" y="25" width="24" height="8.5" style="fill: ${color[md2]}; stroke: rgb(0, 0, 0);" rx="5" ry="5"/>    
		</g>
		<rect x="52.097" y="34.07" width="11.77" height="4.225" style="stroke: rgb(0, 0, 0); fill: red;" rx="10.566" ry="10.566"/>
	</g>
	</svg>
	`;
	return brd;
}

document.querySelector("#loadingBox").style.visibility = "hidden";

function ChangeBirdMenu(){
	document.querySelector("#loadingBox").style.visibility = "visible";
	
	var gallery = document.querySelector("#loadingBox");
	gallery.innerHTML = "";

	tokenOwners = ContractState.token_owners;
	tokenMds = ContractState.token_mds;

	galleryCode = "<div id='selectBirdDiv'><h2 style='width:100%' class='HVCenter'>Select Bird</h2>";

	for(i in ownedNFT){
		setBtn = "<button onclick='setActiveBird(" + ownedNFT[i] + ")'>Set</button>";

		md1 = parseInt("0x"+tokenMds[ownedNFT[i]][3]);
		md2 = parseInt("0x"+tokenMds[ownedNFT[i]][5]);
		md3 = parseInt("0x"+tokenMds[ownedNFT[i]][7]);
		galleryCode += `
		<div id="nft-${i}" class="nft-card">
			<div class="nft-card-id HVCenter">NFT ID: ${i}&nbsp;${setBtn}</div>
			<div class="nft-card-img-holder HVCenter">
				${buildBrd(md1,md2,md3,i)}
			</div>
			<div class="nft-card-owner">Owner:&nbsp;${tokenOwners[i]}</div>
		</div>
		`;
	}
	galleryCode += "</div>";
	gallery.innerHTML = galleryCode;

}

function setActiveBird(id){
	activeBird = id;
	mainState.restartGame();
	document.querySelector("#loadingBox").style.visibility = "hidden";
}
