window.onload = () => {

	// Show page if correct password

	// TODO: Prettier, incorporated in html
	let password = prompt("Vad heter Reginas katt?");
	let xhttp = new XMLHttpRequest();
	xhttp.open("POST", "allaanmalda", true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
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

			// Show list
			document.getElementById("secretlist").style.display = "block";
			document.getElementById("unsecret").style.display = "none";
		}

		if (this.readyState == 4 && this.status == 401) {
			// Hide list
			document.getElementById("secretlist").style.display = "none";
			document.getElementById("unsecret").style.display = "block";
		}
	};

	let jsonobj = JSON.stringify({enter_password: password});
	xhttp.send(jsonobj);

	// "Remove" request

	document.getElementById("remove").onclick = (e) => {
		// Create and configure request
		let xhttp = new XMLHttpRequest();
		xhttp.open("POST", "allaanmalda", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				alert(this.responseText);
				if (this.status == 200) {
					// TODO: Reload without password. Split into two pages?
					location.reload(true);
				}
			}
		};

		// Pack data
		let names = document.querySelectorAll(".people_name");
		let checkboxes = document.querySelectorAll(".people_remove input");
		// Filter out entries to remove
		let to_remove = [];
		for (let i = 1; i < names.length; i++) {
			let name = names[i].innerHTML;
			// TODO BUG: checkboxes[i] is undefined
			let remove = check_boxes[i].checked;
			if (remove) {
				to_remove.push(name)
			}
		}

		// Send data
		if (confirm("Are you sure you wish to remove " + to_remove.length +
			" entries in the database?")) {
			password = prompt("Really?");
			let jsonobj = JSON.stringify({
				remove: to_remove,
				remove_password: password
			});
			xhttp.send(jsonobj);
		}
	};

	// Get csv

	document.getElementById("download").onclick = (e) => {
		// Create and configure request
		let xhttp = new XMLHttpRequest();
		xhttp.open("POST", "allaanmalda", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let preamble = "data:text/csv;charset=utf-8,";
				var encodedUri = encodeURI(preamble + this.responseText);
				var link = document.createElement("a");
				link.setAttribute("href", encodedUri);
				link.setAttribute("download", "wedding_guests.csv");
				document.body.appendChild(link);
				link.click();
			}
		};

		// Send data
		let jsonobj = JSON.stringify({ fetch_csv: true });
		xhttp.send(jsonobj);
	};
};
