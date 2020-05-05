let SIGNUP_NOT_RECEIVED = "Anmälan kunde inte tas emot. Försök igen!";
window.onload = () => {
	switch (PAGE_TYPE) {
		case "signup":
			showIfNotPastDeadline();
			document.getElementById("signup").onclick = (e) => {
				// Timeout
				let timeout_message = "Försöker skicka din anmälan...";
				setMessage("anmalan_status", timeout_message);
				setTimeout(function() {
					if (document.getElementById("anmalan_status") === timeout_message) {
						setMessage("anmalan_status",
						"Anmälan kunde inte tas emot. Försök igen!");
					}
				}, 5000);

				// Pack and send field data
				var data = {
					name: 		document.getElementById("name").value,
					email: 		document.getElementById("email").value,
					gluten: 	document.getElementById("gluten").checked,
					laktos: 	document.getElementById("laktos").checked,
					vegetarian: document.getElementById("vegetarian").checked,
					vegan: 		document.getElementById("vegan").checked,
					allergy: 	document.getElementById("allergy").value,
					other: 		document.getElementById("other").value};
				sendPost(readyShowS, "anmalan", data);
			};
			break;
		case "wishlist":
			document.getElementById("reserve").onclick = (e) => {
				let to_reserve = getItemsToReserve();
				if (to_reserve.items.length > 0) {
					sendPost(readyUpdateW, "onskelista", to_reserve);
				} else {
					setMessage("reserve_error", "Välj något som du vill köpa först!");
				}
			}
			break;
		case "admin_signup":
			let passwordS = prompt("Vad heter Reginas katt?");
			sendPost(readyShowSA, "anmalanadmin", { enter_password: passwordS });
			// REMOVE ENTRIES
			document.getElementById("remove").onclick = (e) => {
				function readyRemove() {
					if (this.readyState == 4) {
						alert(this.responseText);
						if (this.status == 200) {
							sendGet(readyReloadSA, "anmalanadmin");
						}
					}
				}

				let to_remove = getNamesToRemove();
				if (to_remove.length == 0) {
					alert("Du har inte valt någon att ta bort.");
				}
				else if (confirm("Är du säker på att du vill ta bort " + to_remove.length +
					" person(er) från databasen?")) {
					let sure = prompt("Helt säker?");
					sendPost(readyRemove, "anmalanadmin", { remove: to_remove, remove_password: sure });
				}
			};

			// GET CSV
			document.getElementById("download").onclick = (e) => {
				function readyCsv() {
					if (this.readyState == 4 && this.status == 200) {
						downloadCsvFile(this.responseText);
					}
				};
				sendPost(readyCsv, "anmalanadmin", { fetch_csv: true });
			};
			break;
		case "admin_wishlist":
			let passwordW = prompt("Vad heter Reginas katt?");
			sendPost(readyShowWA, "onskelistaadmin", { enter_password: passwordW });
			break;
		// TODO: Put homepage here
		default:
			// TODO: Put menu here
			console.log(PAGE_TYPE + " is an invalid page type.");
	}
}

// ---- GENERAL

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

// ---- CALLS


function readyUpdateW() {
	if (this.readyState == 4) {
		let e = document.getElementById("reserve_error");
		e.textContent = this.responseText;
		e.style.display = 'block';
		if (this.status == 200) {
			sendGet(readyReloadW, "onskelista?success=true");
		}
	}
}

// TODO: Thsís is never called...
function readyReloadS() {
	if (this.readyState == 4 && this.status == 200) {
		document.body.innerHTML = this.responseText;
		showPageContent()
	}
}

function readyReloadW() {
	if (this.readyState == 4 && this.status == 200) {
		document.body.innerHTML = this.responseText;
		document.getElementById("reserve").onclick = (e) => {
			let to_reserve = getItemsToReserve();
			if (to_reserve.items.length > 0) {
				sendPost(readyUpdateW, "onskelista", to_reserve);
			} else {
				setMessage("reserve_error", "Välj något som du vill köpa först!");
			}
		}
	}
}

function readyShowS() {
	if (this.readyState == 4 && this.status == 200) {
		removeErrors();
		clearFilledData();
		if (document.getElementById("anmalan_status") == SIGNUP_NOT_RECEIVED) {
			setMessage("anmalan_status", "Nu kunde anmälan tas emot! " + this.responseText);
		} else {
			setMessage("anmalan_status", this.responseText);
		}
	}
	else if (this.readyState == 4 && this.status == 418) {
		setErrors(JSON.parse(this.responseText));
	}
};

function readyShowSA() {
	if (this.readyState == 4) {
		switch(this.status) {
			case 200: showPageContent(); break;
			case 401: hidePageContent(); break;
		}
	}
}

function readyReloadWA() {
	if (this.readyState == 4 && this.status == 200) {
		document.body.innerHTML = this.responseText;
		setupPageContent();
	}
}

function readyUpdateWA(obj, id) {
	if (obj.readyState == 4) {
		document.getElementById("remove_error").style.display = 'none';
		document.getElementById("add_error").style.display = 'none';
		document.getElementById("cat_error").style.display = 'none';

		setMessage(id, obj.responseText);
		if (obj.status == 200) {
			sendGet(readyReloadWA, "onskelistaadmin");
		}
	}
}
function readyShowWA() {
	if (this.readyState == 4) {
		switch(this.status) {
			case 200: setupPageContent(); break;
			case 401: hidePageContent(); break;
		}
	}
}
// ---- WISHLIST

function getItemsToReserve() {
	let items = document.querySelectorAll(".reserve_name");
	let numbers = document.querySelectorAll(".reserve_num");
	// Filter out entries to remove
	let i_list = [];
	let n_list = [];
	console.assert(items.length == numbers.length,
		"Items and numbers lengths differ. Something's wrong.");
	for (let i = 0; i < items.length; i++) {
		let item = items[i].innerHTML;
		// Treat if item name has url
		if (items[i].children.length == 1) {
			item = items[i].children[0].innerHTML;
		}
		let reserve_num = numbers[i].value;
		if (reserve_num != "") {
			i_list.push(item);
			n_list.push(reserve_num);
		}
	}
	let to_reserve = {items: i_list, numbers: n_list};
	return to_reserve;
}

// ---- WISHLIST ADMIN


function removeFunction() {
	let to_remove = getItemsToRemove();
	if (to_remove.length == 0) {
		setMessage("remove_error", "Du har inte valt något att ta bort.");
	}
	else if (confirm("Är du säker på att du vill ta bort " + to_remove.length +
		" sak(er) från databasen?")) {
		password = prompt("Really?");
		sendPost(function() { readyUpdateWA(this, "remove_error"); },
			"onskelistaadmin", { remove: to_remove, remove_password: password });
	}
}
function setupPageContent() {
	// Show table
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";

	hideNumbersFunction();

	// Setup buttons
	document.getElementById("remove").onclick = removeFunction;
	document.getElementById("add_item").onclick = () => {
		sendPost(function() {readyUpdateWA(this, "add_error"); },
			"onskelistaadmin", getItemsToAdd());
	}
	document.getElementById("add_cat").onclick = () => {
		sendPost(function() { readyUpdateWA(this, "cat_error"); },
			"onskelistaadmin", getCathegoryToAdd());
	}
}


function hidePageContent() {
	document.getElementById("secretlist").style.display = "none";
	document.getElementById("unsecret").style.display = "block";
}

function hideNumbersFunction() {
	let numbers = document.querySelectorAll(".left_to_buy");
	for (let i = 0; i < numbers.length; i++) {
		numbers[i].style.visibility = "hidden";
	}
	document.getElementById("show_hide").onclick = showNumbersFunction;
}

function showNumbersFunction() {
	let numbers = document.querySelectorAll(".left_to_buy");
	for (let i = 0; i < numbers.length; i++) {
		numbers[i].style.visibility = "visible";
	}
	document.getElementById("show_hide").onclick = hideNumbersFunction;
}

function getCathegoryToAdd() {
	let cat = document.querySelector("#new_cat");
	return {add_cathegory: cat.value};
}

function getItemsToAdd() {
	// TODO: Only updates one at once... bloated code.
	let items_ = document.querySelectorAll(".add_name input");
	let desc = document.querySelectorAll(".add_description input");
	let cat = document.querySelectorAll(".add_cathegory select");
	let url = document.querySelectorAll(".add_url input");
	let numbers_ = document.querySelectorAll(".add_wished input");
	console.assert(items_.length == numbers_.length,
		"Item and number lengths differ. Something's wrong.");
	let i_list = [];
	let d_list = [];
	let c_list = [];
	let u_list = [];
	let n_list = [];
	for (let i = 0; i < items_.length; i++) {
		i_list.push(items_[i].value);
		d_list.push(desc[i].value);
		c_list.push(cat[i].value);
		u_list.push(url[i].value);
		n_list.push(numbers_[i].value);
	}
	let to_add = {items: i_list, descriptions: d_list, cathegories: c_list,
		urls: u_list, numbers: n_list};
	return {add_item: to_add};
}

function getItemsToRemove() {
	let names = document.querySelectorAll(".remove_name");
	// TODO: What if name is link?
	let checkboxes = document.querySelectorAll(".remove_checkbox input");
	// Filter out entries to remove
	let to_remove = [];
	console.assert(names.length == checkboxes.length,
		"Name and box lengths differ. Something's wrong.");
	for (let i = 0; i < names.length; i++) {
		let name = names[i].innerHTML;
		// Treat if item name has url
		if (names[i].children.length == 1) {
			name = names[i].children[0].innerHTML;
		}
		let remove = checkboxes[i].checked;
		if (remove) {
			to_remove.push(name)
		}
	}
	return to_remove;
}

// ---- SIGNUP ADMIN

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

	// Print summary
	for (let type in totals) {
		document.querySelector("#total_" + type).innerHTML = totals[type];
	}

	// Show table
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
}


function getNamesToRemove() {
	let names = document.querySelectorAll(".people_name");
	let checkboxes = document.querySelectorAll(".people_remove input");
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


function downloadCsvFile(content) {
	let preamble = "data:text/csv;charset=utf-8,";
	var encodedUri = encodeURI(preamble + content);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", "wedding_guests.csv");
	document.body.appendChild(link);
	link.click();
}

// ---- SIGNUP
function showIfNotPastDeadline() {
	let deadline = new Date("Jul 2, 2020 00:00:00").getTime();
	let now = new Date().getTime();
	if (deadline - now < 0) {
		document.getElementById("too_late").style.display = "block";
		document.getElementById("time_left").style.display = "none";
	} else {
		document.getElementById("too_late").style.display = "none";
		document.getElementById("time_left").style.display = "block";
	}
}

function removeErrors() {
	document.getElementById("name_error").style.display = 'none';
	document.getElementById("email_error").style.display = 'none';
	document.getElementById("info_error").style.display = 'none';
	document.getElementById("allergy_error").style.display = 'none';
}

function clearFilledData() {
	document.getElementById("name").value = "";
	document.getElementById("email").value = "";
	document.getElementById("gluten").checked = false;
	document.getElementById("laktos").checked = false;
	document.getElementById("vegetarian").checked = false;
	document.getElementById("vegan").checked = false;
	document.getElementById("allergy").value = "";
	document.getElementById("other").value = "";
}

function setErrors(faulty) {
	setMessage("name_error", faulty.name);
	setMessage("email_error", faulty.email);
	setMessage("info_error", faulty.info);
	setMessage("allergy_error", faulty.allergy);
	setMessage("anmalan_status", "Ett eller flera fält är felaktigt ifyllt.");
}

function setMessage(elementId, fieldContent) {
	// If there is a message to set
	if (fieldContent != "undefined") {
		let e = document.getElementById(elementId);
		e.textContent = fieldContent;
		e.style.display = 'block';
	}
}
