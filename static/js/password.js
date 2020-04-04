window.onload = () => {
	var question = "Vad kommer man tänka när man ser bruden?";
	/*var password = prompt(question);

	// TODO: This is not secure. Noones email is secure anywhere.
	while (password != "paMpigt") {
		if (password == null) { // When does this happen?
			return;
		}
		console.log("Fel lösen! " + password);
		password = prompt("Nej. " +  question);
	}
	*/
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
	document.getElementById("remove").onclick = (e) => {
		console.log("CLICK");
		// Create and configure request
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "allaanmalda", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				alert("De valda anmälningarna togs bort.");
			}
		};

		// Pack and send data
		var names = document.querySelectorAll(".people_name");
		var checkboxes = document.querySelectorAll(".people_remove input");
		// TODO: Treat no entries
		var to_remove = {};
		assert(names.length == checkboxes.length,
			"There's not as many name entries as checkbox entries!");

		// Filter out entries to remove
		for (var i = 1; i < names.length; i++) {
			var name = names[i].innerHTML;
			var remove = checkboxes[i].checked;
			if (remove) {
				console.log(name, ": ", remove);
				// TODO: Add to to_remove
			}
		}

		// TODO: Prompt if sure to remove #num entries?

		// TODO: Server treat this post - remove entries from db
		var jsonobj = JSON.stringify({
			remove: to_remove});
		xhttp.send(jsonobj);
	};

};
