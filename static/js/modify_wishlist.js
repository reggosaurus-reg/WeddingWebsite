window.onload = () => {
	let password = prompt("Vad heter Reginas katt?");
	sendPost(readyShow, "andraonskelista", { enter_password: password });
}

function removeFunction() {
	let to_remove = getItemsToRemove();
	if (to_remove.length == 0) {
		alert("Du har inte valt någon att ta bort.");
	}
	else if (confirm("Är du säker på att du vill ta bort " + to_remove.length +
		" sak(er) från databasen?")) {
		password = prompt("Really?");
		sendPost(readyUpdate, "andraonskelista",
			{ remove: to_remove, remove_password: password });
	}
}

function readyShow() {
	if (this.readyState == 4) {
		switch(this.status) {
			case 200: setupPageContent(); break;
			case 401: hidePageContent(); break;
		}
	}
}

function readyReload() {
	if (this.readyState == 4 && this.status == 200) {
		document.body.innerHTML = this.responseText;
		setupPageContent()
	}
}

function readyUpdate() {
	if (this.readyState == 4) {
		let e = document.getElementById("modify_error");
		e.textContent = this.responseText;
		e.style.display = 'block';
		if (this.status == 200) {
			sendGet(readyReload, "andraonskelista");
		}
	}
}

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

function setupPageContent() {
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

	// Setup buttons
	document.getElementById("remove").onclick = removeFunction;
	document.getElementById("add").onclick = () => {
		sendPost(readyUpdate, "andraonskelista", getItemsToAdd());
	}
}


// TODO: Move this too to other file
function hidePageContent() {
	document.getElementById("secretlist").style.display = "none";
	document.getElementById("unsecret").style.display = "block";
}


function getItemsToAdd() {
	// TODO: Only updates one at once... bloated code.
	let items_ = document.querySelectorAll(".add_name input");
	let numbers_ = document.querySelectorAll(".add_wished input");
	console.assert(items_.length == numbers_.length,
		"Item and number lengths differ. Something's wrong.");
	let i_list = [];
	let n_list = [];
	for (let i = 0; i < items_.length; i++) {
		i_list.push(items_[i].value);
		n_list.push(numbers_[i].value);
	}
	let to_add = {items: i_list, numbers: n_list};
	return {add: to_add};
}

function getItemsToRemove() {
	let names = document.querySelectorAll(".remove_name");
	let checkboxes = document.querySelectorAll(".remove_checkbox input");
	// Filter out entries to remove
	let to_remove = [];
	console.assert(names.length == checkboxes.length,
		"Name and box lengths differ. Something's wrong.");
	for (let i = 0; i < names.length; i++) {
		let name = names[i].innerHTML;
		let remove = checkboxes[i].checked;
		if (remove) {
			to_remove.push(name)
		}
	}
	return to_remove;
}
