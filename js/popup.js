const captureBtn = document.getElementById("capture-btn");
let recording = false;

captureBtn.addEventListener("click", () => {
	recording = !recording;
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(tabs[0].id, { command: "record" });
	});
	captureBtn.textContent = recording ? "Stop Recording" : "Record Screen";
});