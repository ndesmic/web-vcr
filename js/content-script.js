const buttonMap = new WeakMap();
const recorderMap = new WeakMap();

async function record(video) {
	let mediaRecorder;
	let recordedChunks;
	let stream;
	try {
		try {
			stream = video.captureStream();
		} catch (ex) {
			if (ex.name === 'NotSupportedError') {
				stream = await navigator.mediaDevices.getDisplayMedia({
					video: {
						cursor: "never"
					},
					audio: true
				});
			}
		}
		mediaRecorder = new MediaRecorder(stream, {
			mimeType: 'video/webm;codecs=vp9',
			ignoreMutedMedia: true
		});
		recordedChunks = [];
		mediaRecorder.ondataavailable = e => {
			if (e.data.size > 0) {
				recordedChunks.push(e.data);
			}
		};
		mediaRecorder.start();
	} catch (ex) {
		console.log(ex);
	}

	return () => {
		mediaRecorder.stop();
		setTimeout(() => {
			const blob = new Blob(recordedChunks, {
				type: "video/webm"
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "recording.webm";
			a.click();
			URL.revokeObjectURL(url);
		}, 0);
	}
}

async function addRecorder(video) {
	if(buttonMap.get(video)) return;
	console.log(`Attaching Video`, video);
	const recordBtn = document.createElement("button");
	recordBtn.textContent = "🔴";
	recordBtn.classList.add("web-vcr-btn");
	buttonMap.set(video, recordBtn);

	let recording = false;

	recordBtn.addEventListener("click", async e => {
		e.preventDefault();
		e.stopPropagation();
		recording = !recording;
		if (recording) {
			recorderMap.set(video, await record(video));
			recordBtn.textContent = "⬜";
		} else {
			recorderMap.get(video)?.();
			recordBtn.textContent = "🔴"
		}
	});

	video.parentElement.appendChild(recordBtn);
}

const videos = Array.from(document.querySelectorAll("video"));

const videoObserver = new MutationObserver((mutationList, observer) => {
	for (mutation of mutationList) {
		if (mutation.type === "childList") {
			for(const child of mutation.addedNodes){
				if(child.nodeName === "VIDEO"){
					addRecorder(child);
				} else if(child.nodeType === Node.ELEMENT_NODE) {
					Array.from(child.querySelectorAll("video")).forEach(video => addRecorder(video));
				}
			}
		}
	}
});

videoObserver.observe(document.body, {
	subtree: true,
	childList: true
});

videos.forEach(video => addRecorder(video));

let mainVideoRecorder;
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	const videos = Array.from(document.querySelectorAll("video"));

	if(videos.length === 0) return;

	let maxVideo;
	for(const video of videos){
		if(!maxVideo || (video.width * video.height) > (maxVideo.width * maxVideo.height)){
			maxVideo = video;
		}
	}

	if (request.command === "record") {
		if(mainVideoRecorder){
			mainVideoRecorder();
			mainVideoRecorder = null;
		} else {
			mainVideoRecorder = await record(maxVideo);		}
	}
});