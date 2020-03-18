window.addEventListener("load",function(event) {
	document.getElementById("signup").onclick = (e) => {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				// TODO: Restore error messages
				alert("Fick svar?", this.responseText);
			}
			else if (this.readyState == 4 && this.status == 418) {
				// TODO: Show error messages
				alert("Servern gav fel", this.responseText);
			}
		};
		xhttp.open("POST", "anmalan", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		var jsonobj = JSON.stringify({
			name: document.getElementById("name").value,
			email: document.getElementById("email").value,
			gluten: document.getElementById("gluten").checked,
			laktos: document.getElementById("laktos").checked,
			vegetarian: document.getElementById("vegetarian").checked,
			vegan: document.getElementById("vegan").checked,
			allergy_check: document.getElementById("allergy_check").checked,
			allergy: document.getElementById("allergy").value,
			other: document.getElementById("other").value,
			time: new Date()});
		alert(jsonobj);
		xhttp.send(jsonobj);
	};
});


// TODO: Value checks + mark fauly fields
// TODO: Have classes on required fields, change onclick or something
