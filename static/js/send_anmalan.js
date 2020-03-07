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
		var jsonobj = JSON.stringify({
			name: document.getElementById("name").value,
			time: new Date()});
		alert(jsonobj);
		xhttp.send(jsonobj);
	};
};

// Problems:
// SOLVED!? Double posts? Sometimes unpermitted post, sometimes received data is none
// Nav. script is overwritten by this one?
