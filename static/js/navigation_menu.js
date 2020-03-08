window.addEventListener("load",function(event) {
	document.querySelector("nav").onclick = (e) => {
		let classes = document.querySelector(".dropdown-menu").classList;
		if (classes.contains("show"))
			classes.remove("show");
		else
			classes.add("show");
	};
});
