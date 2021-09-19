{
	const { record, recordScreen, getMainMediaElement } = window.webVcr;

	chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
		switch(request.command){
			case "toggle-record": {
				return await toggleRecordMainMedia(request, sendResponse);
			}
			case "toggle-screen-record": {
				return await toggleRecordScreen(request, sendResponse);
			}
		}
	});

	let mainVideoRecorder;
	let mainMediaElement;
	async function toggleRecordMainMedia(request, sendResponse){
		if (mainVideoRecorder) {
			mainVideoRecorder();
			mainVideoRecorder = null;
			mainMediaElement.style.border = "none";
			sendResponse({ status: "record-stopped" });
		} else {
			mainMediaElement = getMainMediaElement(request.payload.mediaTypes);
			if(!mainMediaElement){
				sendResponse({ status: "no-element-found" });
			} else {
				try {
					mainVideoRecorder = await record(mainMediaElement);
					mainMediaElement.style.border = "3px dashed magenta";
					sendResponse({ status: "record-started" });
				} catch(ex){
					sendResponse({ status: "record-fail", payload: { ex } });
				}
			}

		}
		return true;
	}


	let screenRecorder;
	async function toggleRecordScreen(){
		if (screenRecorder) {
			screenRecorder();
			screenRecorder = null;
			sendResponse({ status: "record-stopped" });
		} else {
			screenRecorder = await recordScreen(mainMediaElement);
			sendResponse({ status: "record-started" });
		}
		return true;
	}
}