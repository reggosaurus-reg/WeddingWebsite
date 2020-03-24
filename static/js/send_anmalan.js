window.addEventListener("load",function(event) {
	document.getElementById("signup").onclick = (e) => {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				document.getElementById("name_error").style.display = 'none';
				document.getElementById("email_error").style.display = 'none';
				// TODO: Notify that signup was successful!
			}
			else if (this.readyState == 4 && this.status == 418) {
				// Show error messages from json if a field was faulty
				var faulty = JSON.parse(this.responseText);
				if (faulty.name != "undefined") {
					let n = document.getElementById("name_error");
					n.textContent = faulty.name;
					n.style.display = 'block';
				}
				if (faulty.email != "undefined") {
					let e = document.getElementById("email_error");
					e.textContent = faulty.email;
					e.style.display = 'block';
				}
			}
		};
		xhttp.open("POST", "anmalan", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		// Pack and send field data
		var jsonobj = JSON.stringify({
			name: 		document.getElementById("name").value,
			email: 		document.getElementById("email").value,
			gluten: 	document.getElementById("gluten").checked,
			laktos: 	document.getElementById("laktos").checked,
			vegetarian: document.getElementById("vegetarian").checked,
			vegan: 		document.getElementById("vegan").checked,
			allergy: 	document.getElementById("allergy").value,
			other: 		document.getElementById("other").value});
		xhttp.send(jsonobj);
	};
});


// TODO: Have classes on required fields, change onclick or something
