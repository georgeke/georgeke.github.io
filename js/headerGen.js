function setContactHeader() {
	var msgs = ["Drop me a line!", "Talk to me!", "Let's talk!", "Get linked in!", "Contact me", "Any questions?"];
	var rand = Math.floor(Math.random() * msgs.length);

	document.getElementById("contact").innerText = msgs[rand];
}