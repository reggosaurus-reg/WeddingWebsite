window.addEventListener("load",function(event) {
	document.getElementById("signup").onclick = (e) => {
		setMessage("anmalan_status", "Försöker skicka din anmälan...");
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				removeErrors();
				clearFilledData();
				setMessage("anmalan_status", this.responseText);
			}
			else if (this.readyState == 4 && this.status == 418) {
				setErrors(JSON.parse(this.responseText));
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
