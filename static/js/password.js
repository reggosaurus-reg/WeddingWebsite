window.onload = () => {
	var password = prompt("Hur många ben har en fisk?");

	while (password != "42 kanske") {
		if (password == null) {
			return;
		}
		console.log("Fel! " + password);
		password = prompt("Nej. Hur många ben har en fisk?");
	}
	console.log("Rätt!");
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
};
