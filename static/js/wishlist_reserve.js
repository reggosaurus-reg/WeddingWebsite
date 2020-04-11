window.onload = () => {
	function readyReload() {
		if (this.readyState == 4 && this.status == 200) {
			document.body.innerHTML = this.responseText;
		}
	}

	function readyUpdate() {
		if (this.readyState == 4) {
			let e = document.getElementById("reserve_error");
			e.textContent = this.responseText;
			e.style.display = 'block';
			if (this.status == 200) {
				sendGet(readyReload, "onskelista");
			}
		}
	}

	document.getElementById("reserve").onclick = (e) => {
		sendPost(readyUpdate, "onskelista", getItemsToReserve());
	}

}
// TODO: Move this to another file and import/require from send_anmalan.js too
function sendPost(readyFn, url, dataAsDict) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhttp.onreadystatechange = readyFn;
	xhttp.send(JSON.stringify(dataAsDict));
}

function sendGet(readyFn, url) {
	let xhttp = new XMLHttpRequest();
	xhttp.open("GET", url, true);
	xhttp.onreadystatechange = readyFn;
	xhttp.send();
}

function getItemsToReserve() {
	let items = document.querySelectorAll(".reserve_name");
	let numbers = document.querySelectorAll(".reserve_num");
	// Filter out entries to remove
	let i_list = [];
	let n_list = [];
	console.assert(items.length == numbers.length,
		"Items and numbers lengths differ. Something's wrong.");
	for (let i = 0; i < items.length; i++) {
		let item = items[i].innerHTML;
		let reserve_num = numbers[i].value;
		if (reserve_num != "") {
			i_list.push(item);
			n_list.push(reserve_num);
		}
	}
	let to_reserve = {items: i_list, numbers: n_list};
	return to_reserve;
}
