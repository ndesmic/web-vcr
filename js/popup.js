const captureBtn = document.getElementById("capture-btn");
const screenCaptureBtn = document.getElementById("screen-capture-btn");
const message = document.getElementById("message");
const mediaVideo = document.getElementById("media-video");
const mediaCanvas = document.getElementById("media-canvas");

let recording = false;

captureBtn.addEventListener("click", () => {
	message.textContent = "";

	const mediaTypes = [];
	if(mediaVideo.checked){
		mediaTypes.push("video");
	}
	if (mediaCanvas.checked) {
		mediaTypes.push("canvas");
	}

	if(mediaTypes.length === 0) {
		message.textContent = "Must pick at least one media type.";
		return;
	}

	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(tabs[0].id, { command: "toggle-record", payload: { mediaTypes } }, response => {
			switch(response.status){
				case "record-started": {
					captureBtn.textContent = "Stop Recording";
					break;
				}
				case "record-stopped": {
					captureBtn.textContent = "Start Recording";
					break;
				}
				case "no-element-found": {
					message.textContent = "No matching element found.  This could be because the element might be locked in a closed shadow DOM and you might need to use screen recording instead.";
				}
				case "record-failed": {
					message.textContent = "Could not record media, it may be using encrypted media extensions and you might need to use screen recording instead"
				}
			}
		});
	});
});

screenCaptureBtn.addEventListener("click", () => {
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(tabs[0].id, { command: "toggle-screen-record" }, response => {
			switch (response.status) {
				case "record-started": {
					captureBtn.textContent = "Stop Recording Screen";
					break;
				}
				case "record-stopped": {
					captureBtn.textContent = "Start Recording Screen";
					break;
				}
			}
		});
	});
});