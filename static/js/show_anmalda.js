window.onload = () => {

	// Show page if correct password

	var password = prompt("Vad heter Reginas katt?");
	var xhttp = new XMLHttpRequest();
	xhttp.open("POST", "allaanmalda", true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

	// TODO: Test password access, then make sure deletion works
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			document.getElementById("secretlist").style.display = "block";
			document.getElementById("unsecret").style.display = "none";
		}
		if (this.readyState == 4 && this.status == 401) {
			document.getElementById("secretlist").style.display = "none";
			document.getElementById("unsecret").style.display = "block";
		}
	};

	var jsonobj = JSON.stringify({enter_password: password});
	xhttp.send(jsonobj);

	// "Remove" request

	document.getElementById("remove").onclick = (e) => {
		// Create and configure request
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "allaanmalda", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

		xhttp.onreadystatechange = function() {
			if (this.readyState == 4) {
				alert(this.responseText);
			}
		};

		// Pack data
		var names = document.querySelectorAll(".people_name");
		var checkboxes = document.querySelectorAll(".people_remove input");
		// Filter out entries to remove
		var to_remove = [];
		for (var i = 1; i < names.length; i++) {
			var name = names[i].innerHTML;
			var remove = checkboxes[i].checked;
			if (remove) {
				to_remove.push(name)
			}
		}

		// Send data
		if (confirm("Are you sure you wish to remove " + to_remove.length +
			" entries in the database?")) {
			password = prompt("Really?");
			var jsonobj = JSON.stringify({
				remove: to_remove,
				remove_password: password
			});
			xhttp.send(jsonobj);
		}
	};
};
