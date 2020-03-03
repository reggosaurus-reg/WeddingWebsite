window.onload = () => {
	document.getElementById("post_anmalan").onclick = (e) => {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				alert("Fick svar?");
			}
		};
		xhttp.open("POST", "anmalan", true);
		xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhttp.send(JSON.stringify({
			name: document.getElementById("name").value,
			time: new Date()}));
	};
};
