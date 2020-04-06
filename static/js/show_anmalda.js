window.onload = () => {
	// SHOW CORRECT PAGE VERSION
	let password = prompt("Vad heter Reginas katt?");
	function ready() {
		if (this.readyState == 4) {
			switch(this.status) {
				case 200: showPageContent(); break;
				case 401: hidePageContent(); break;
			}
		}
	}
	sendPost(ready, { enter_password: password });

	// REMOVE ENTRIES
	document.getElementById("remove").onclick = (e) => {
		function ready() {
			if (this.readyState == 4) {
				alert(this.responseText);
				if (this.status == 200) {
					// TODO: Reload without password. Split into two pages?
					location.reload(true);
				}
			}
		}

		let to_remove = getNamesToRemove();
		if (confirm("Are you sure you wish to remove " + to_remove.length +
			" entries in the database?")) {
			password = prompt("Really?");
			sendPost(ready, { remove: to_remove, remove_password: password });
		}
	};

	// GET CSV
	document.getElementById("download").onclick = (e) => {
		function ready() {
			if (this.readyState == 4 && this.status == 200) {
				downloadCsvFile(this.responseText);
			}
		};
		sendPost(ready, { fetch_csv: true });
	};
};


// TODO: Move this to another file and import/require from send_anmalan.js too
function sendPost(readyFn, dataAsDict) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("POST", "allaanmalda", true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.onreadystatechange = readyFn;
	xhttp.send(JSON.stringify(dataAsDict));
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

	// Print summary
	for (let type in totals) {
		document.querySelector("#total_" + type).innerHTML = totals[type];
	}

	// Show table
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
}


function hidePageContent() {
	document.getElementById("secretlist").style.display = "none";
	document.getElementById("unsecret").style.display = "block";
}


function getNamesToRemove() {
	let names = document.querySelectorAll(".people_name");
	let checkboxes = document.querySelectorAll(".people_remove input");
	// Filter out entries to remove
	let to_remove = [];
	for (let i = 1; i < names.length; i++) {
		let name = names[i].innerHTML;
		// TODO BUG: checkboxes[i] is undefined
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
