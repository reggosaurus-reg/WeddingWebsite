window.onload = () => {
	var question = "Vad kommer man tänka när man ser bruden?";
	var password = prompt(question);

	// TODO: This is not secure. Noones email is secure anywhere.
	while (password != "paMpigt") {
		if (password == null) { // When does this happen?
			return;
		}
		console.log("Fel lösen! " + password);
		password = prompt("Nej. " +  question);
	}
	document.getElementById("secretlist").style.display = "block";
	document.getElementById("unsecret").style.display = "none";
};
