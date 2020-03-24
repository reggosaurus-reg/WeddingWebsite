window.onload = () => {
	/* DEBUG
	var password = prompt("Hur många ben har en fisk?");

	// TODO: This is not secure. Noones email is secure anywhere.
	while (password != "42 kanske") {
		if (password == null) { // When does this happen?
			return;
		}
		console.log("Fel lösen! " + password);
		password = prompt("Nej. Hur många ben har en fisk?");
	}
	*/
	//document.getElementById("people_list").textContent = "Tets";
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
};
