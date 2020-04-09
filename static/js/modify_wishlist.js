window.onload = () => {
	// SHOW CORRECT PAGE VERSION
	//let password = prompt("Vad heter Reginas katt?");
	let password = "paMpigt";
	function readyShow() {
		if (this.readyState == 4) {
			switch(this.status) {
				case 200: showPageContent(); break;
				case 401: hidePageContent(); break;
			}
		}
	}

	function readyReload() {
		if (this.readyState == 4 && this.status == 200) {
			document.body.innerHTML = this.responseText;
			showPageContent()
		}
	}

	function readyUpdate() {
		if (this.readyState == 4) {
			alert(this.responseText);
			if (this.status == 200) {
				sendGet(readyReload, "andraonskelista");
			}
		}
	}

	sendPost(readyShow, "andraonskelista", { enter_password: password });

	// REMOVE ENTRIES // TODO
	document.getElementById("remove").onclick = (e) => {
		let to_remove = getNamesToRemove();
		if (to_remove.length == 0) {
			alert("Du har inte valt någon att ta bort.");
		}
		else if (confirm("Är du säker på att du vill ta bort " + to_remove.length +
			" person(er) från databasen?")) {
			password = prompt("Really?");
			sendPost(readyUpdate, "andraonskelista",
				{ remove: to_remove, remove_password: password });
		}
	};

	// TODO: Add new input row

	// ADD ALL INPUTED
	document.getElementById("add").onclick = (e) => {
		sendPost(readyUpdate, "andraonskelista", getItemsToAdd());
	}
};


// TODO: Move this to another file and import/require from send_anmalan.js too
function sendPost(readyFn, url, dataAsDict) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.onreadystatechange = readyFn;
	xhttp.send(JSON.stringify(dataAsDict));
}

function sendGet(readyFn, url) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("GET", url, true);
	xhttp.onreadystatechange = readyFn;
	xhttp.send();
}

function showPageContent() {
	// Pretty print booleans and calculate summary
	let totals = {"g": 0, "l": 0, "vt": 0, "vg": 0}
	let bools = document.querySelectorAll(".bool");
	for (let i = 0; i < bools.length; i++) {
		let b = parseInt(bools[i].innerHTML);
		let type = bools[i].classList[2];
		if (b) {
			bools[i].innerHTML = "x";
			totals[type] += 1;
		} else {
			bools[i].innerHTML = "-";
		}
	}

	// Show table
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
}


// TODO: Move this too to other file
function hidePageContent() {
	document.getElementById("secretlist").style.display = "none";
	document.getElementById("unsecret").style.display = "block";
}


function getItemsToAdd() {
	let items_ = document.querySelectorAll(".add_name input");
	let numbers_ = document.querySelectorAll(".add_wished input");
	console.assert(items_.length == numbers_.length,
		"Item and number lengths differ. Something's wrong.");
	i_list = [];
	n_list = [];
	for (let i = 0; i < items_.length; i++) {
		i_list.push(items_[i].value);
		n_list.push(numbers_[i].value);
	}
	to_add = {items: i_list, numbers: n_list};
	return {add: to_add};
}

