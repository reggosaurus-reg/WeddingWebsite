window.addEventListener("load",function(event) {
	document.getElementById("signup").onclick = (e) => {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				alert("Fick svar?");
			}
		};
		xhttp.open("POST", "anmalan", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		var jsonobj = JSON.stringify({
			name: document.getElementById("name").value,
			email: document.getElementById("email").value,
			time: new Date()});
		xhttp.send(jsonobj);
	};
});


// TODO: Value checks + mark fauly fields
// TODO: Have classes on required fields, change onclick or something
