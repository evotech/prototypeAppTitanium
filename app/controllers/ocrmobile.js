var args = arguments[0] || {};

var appId = "PrototypeEvotech";
var password = "0hjhOo3Bpvyqfr\/xUcjD9VJh";

//openCamera();

function openGallery() {
	Titanium.Media.openPhotoGallery({
		success : function(event) {
			// called when media returned from the camera
			Ti.API.debug('event : ' + JSON.stringify(event));
			Ti.API.debug('Our type was: ' + event.mediaType);
			if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				processImage(event.media);
				// var imageView = Ti.UI.createImageView({
				// width : win.width,
				// height : win.height,
				// image : event.media
				// });
				// imageView.getImage();
				// win.add(imageView);
			} else {
				alert("got the wrong type back =" + event.mediaType);
			}
		},
		cancel : function() {
			// called when user cancels taking a picture
		},
		error : function(error) {
			// called when there's an error
			var a = Titanium.UI.createAlertDialog({
				title : 'Camera'
			});
			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
			a.show();
		},
		saveToPhotoGallery : true,
		// allowEditing and mediaTypes are iOS-only settings
		allowEditing : true,
		mediaTypes : [Ti.Media.MEDIA_TYPE_VIDEO, Ti.Media.MEDIA_TYPE_PHOTO]
	});
}

function openCamera() {
	Titanium.Media.showCamera({
		success : function(event) {
			// called when media returned from the camera
			Ti.API.debug('event : ' + JSON.stringify(event));
			Ti.API.debug('Our type was: ' + event.mediaType);
			if (event.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
				processImage(event.media);
				// var imageView = Ti.UI.createImageView({
				// width : win.width,
				// height : win.height,
				// image : event.media
				// });
				// imageView.getImage();
				// win.add(imageView);
			} else {
				alert("got the wrong type back =" + event.mediaType);
			}
		},
		cancel : function() {
			// called when user cancels taking a picture
		},
		error : function(error) {
			// called when there's an error
			var a = Titanium.UI.createAlertDialog({
				title : 'Camera'
			});
			if (error.code == Titanium.Media.NO_CAMERA) {
				a.setMessage('Please run this test on device');
			} else {
				a.setMessage('Unexpected error: ' + error.code);
			}
			a.show();
		},
		saveToPhotoGallery : true,
		// allowEditing and mediaTypes are iOS-only settings
		allowEditing : true,
		mediaTypes : [Ti.Media.MEDIA_TYPE_VIDEO, Ti.Media.MEDIA_TYPE_PHOTO]
	});
}

var activityIndicator = Ti.UI.createActivityIndicator({
	color : 'green',
	font : {
		fontFamily : 'Helvetica Neue',
		fontSize : 26,
		fontWeight : 'bold'
	},
	message : 'Loading...',
	top : 10,
	left : 10,
	height : Ti.UI.SIZE,
	width : Ti.UI.SIZE
});

$.win.add(activityIndicator);

function getTheResult(result) {
	Ti.API.info('Download result : ' + result);
}

function processingComplete(error, task) {
	if (task.status !== 'Completed') {
		Ti.API.info('Error Processing the task');
		return;
	}
	Ti.API.info('Task Complete');

	//download result from result url
	var anXhr = Ti.Network.createHTTPClient();
	anXhr.setTimeout(200000);

	anXhr.onload = function() {
		Ti.API.info('response text download result: ' + this.responseText);
		var doc = this.responseXML.documentElement;
		var line = doc.getElementsByTagName('line');
		var imgResult = '';
		for (var i = 0; i < line.length; i++) {
			var charParam = line.item(i).getElementsByTagName('charParams');
			for (var j = 0; j < charParam.length; j++) {
				imgResult += charParam.item(j).text;
			}
			imgResult += '\n';
		}
		$.lblResult.text += imgResult;
		activityIndicator.hide();
	};

	anXhr.onerror = function() {
		alert('The HTTP request failed');
	};

	anXhr.open('GET', task.resultUrl);
	// anXhr.setRequestHeader('Authorization', 'Basic ' + Titanium.Utils.base64encode(appId + ':' + password));
	// anXhr.setRequestHeader("Content-Type", "text/html");
	anXhr.send();
	activityIndicator.message = 'Getting the result';
	activityIndicator.show();
}

function waitForCompletion(taskId, userCallback) {
	Ti.API.info('wait for completion, get task status');

	var anXhr = Ti.Network.createHTTPClient();
	anXhr.setTimeout(200000);

	anXhr.onload = function() {
		Ti.API.info('response text wait for completion: ' + this.responseText);
		var doc = this.responseXML.documentElement;

		var tmpTask = doc.getElementsByTagName('task');
		var _task = new Object();
		_task.id = tmpTask.item(0).getAttribute('id');
		_task.status = tmpTask.item(0).getAttribute('status');
		_task.resultUrl = tmpTask.item(0).getAttribute('resultUrl');
		Ti.API.info('status ' + _task.status);

		if (isTaskActive(_task)) {
			// setTimeout(waitForCompletion(taskId), 2000);
			waitForCompletion(taskId, processingComplete);
			Ti.API.info('wait');
		} else {
			Ti.API.info('got the result');
			activityIndicator.hide();
			Ti.API.info('got the result 2');
			userCallback(false, _task);
		}

	};

	anXhr.onerror = function() {
		alert('The HTTP request failed');
	};

	anXhr.open('GET', "http://cloud.ocrsdk.com" + '/getTaskStatus?taskId=' + taskId);
	anXhr.setRequestHeader('Authorization', 'Basic ' + Titanium.Utils.base64encode(appId + ':' + password));
	anXhr.setRequestHeader("Content-Type", "text/html");
	anXhr.send();
	activityIndicator.message = 'Wait for image processing';
	activityIndicator.show();

}

function isTaskActive(taskData) {
	if (taskData.status === 'Queued' || taskData.status === 'InProgress') {
		// Ti.API.info('wait');
		Ti.API.info('queued and in progress');
		return true;
	}
	Ti.API.info('completed');
	return false;
}

function processImage(image) {

	Ti.API.info('processing image');

	// Create an HTTPClient.
	var anXhr = Ti.Network.createHTTPClient();
	anXhr.setTimeout(200000);

	// Define the callback.
	anXhr.onload = function() {
		// Handle the XML data.
		// var doc = this.responseXML.documentElement;

		Ti.API.info('response text process image: ' + this.responseText);
		var doc = this.responseXML.documentElement;

		var tmpTask = doc.getElementsByTagName('task');
		var _task = new Object();
		_task.id = tmpTask.item(0).getAttribute('id');
		_task.status = tmpTask.item(0).getAttribute('status');
		Ti.API.info('Upload complete');
		Ti.API.info('Task id ' + _task.id + ", Task status : " + _task.status);
		if (!isTaskActive(_task)) {
			return;
		}
		activityIndicator.hide();
		waitForCompletion(_task.id, processingComplete);

	};
	anXhr.onerror = function() {
		alert('The HTTP request failed');
	};

	// Send the request data.
	anXhr.open('POST', "http://cloud.ocrsdk.com" + '/processImage' + "?language=English&exportFormat=xml");
	anXhr.setRequestHeader('Authorization', 'Basic ' + Titanium.Utils.base64encode(appId + ':' + password));
	anXhr.setRequestHeader("Content-Type", "text/html");
	anXhr.send(image);
	$.lblResult.text = "";
	activityIndicator.message = 'Uploading image';
	activityIndicator.show();
};
function uploadCompleted(error, taskData) {
	if (error) {
		console.log("Error: " + error.message);
		return;
	}

	console.log("Upload completed.");
	console.log("Task id = " + taskData.id + ", status is " + taskData.status);
	if (!ocrsdk.isTaskActive(taskData)) {
		console.log("Unexpected task status " + taskData.status);
		return;
	}

	ocrsdk.waitForCompletion(taskData.id, processingCompleted);
}
