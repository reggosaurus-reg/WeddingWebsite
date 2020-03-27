window.addEventListener("load",function(event) {
	document.getElementById("signup").onclick = (e) => {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				removeErrors();
				// TODO: Notify that signup was successful!
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

function setErrors(faulty) {
	setErrorIfFaulty(faulty.name, "name_error");
	setErrorIfFaulty(faulty.email, "email_error");
	setErrorIfFaulty(faulty.info, "info_error");
	setErrorIfFaulty(faulty.allergy, "allergy_error");
}

function setErrorIfFaulty(fieldContent, elementId) {
	if (fieldContent != "undefined") {
		let e = document.getElementById(elementId);
		e.textContent = fieldContent;
		e.style.display = 'block';
	}
}
