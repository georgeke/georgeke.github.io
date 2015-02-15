function setWelcomeHeader() {
	var msgs = ["Hey!", "Welcome!", "Salutations!", "What's poppin'?"];
	var rand = Math.floor(Math.random() * msgs.length);

	//document.getElementById("welcome").innerText = msgs[rand];
}

function setContactHeader() {
	var msgs = ["Drop me a line!", "Talk to me!", "Let's talk!", "Get linked in!", "Contact me", "Any questions?"];
	var rand = Math.floor(Math.random() * msgs.length);

	document.getElementById("contact").innerText = msgs[rand];
}