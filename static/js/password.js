window.onload = () => {
	var password = prompt("Hur många ben har en fisk?");

	while (password != "42 kanske") {
		console.log("Fel! " + password);
		password = prompt("Nej. Hur många ben har en fisk?");
	}
	console.log("Rätt!");
};
