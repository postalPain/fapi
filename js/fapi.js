var fapi = (function(params) {
	var params = params || {},
		platform = params['platform'] || 'browser'; // as a platform could be 'phonegap' or 'browser'

	/*
		File Object
		realized according to W3C file api interface

		properties:
			- lastModifiedDate
			- name
			- size
   			- type
   			- fullPath just in phonegap versions

   		methods:
   			- slice
	*/

	if (platform == 'browser') {

		this.getFileFromLibrary = function(getFileFromLibraryCallback) {
			$('<input type="file" name="file" />').change(function(e) {
				var file = e.currentTarget.files[0];

				getFileFromLibraryCallback(file, false);
			}).click();
		};


		this.uploadFile = function(params, uploadFileCallback) {
			var url 		= params.url,
				file 		= params.file,
				fileKey 	= params.fileKey || "file",
				fileName 	= params.fileName || file.name,
				postData	= params.postData || '',
				headers 	= params.headers || '',
				formData 	= new FormData();

			for (var key in postData) {
				formData.append(key, postData[key]);
			}

			formData.append(fileKey, file, file.name);


			$.ajax({
		        url: url,
		        type: 'POST',
		        context: this,
		        data: formData,
		        cache: false,
		        contentType: false,
		        processData: false
		    }).complete(function(respond, status) {
		        if (status == 'success' || status == 'nocontent') {
		            uploadFileCallback(respond.responseText, false)
		        } else {
		            uploadFileCallback({}, status);
		        }
		    });
		};


		this.getFileByURL = function(url, getFileByURLCallback) {

			var oReq = new XMLHttpRequest();
			
			oReq.open("GET", url, true);
			oReq.responseType = "arraybuffer";

			oReq.onload = function (oEvent) {

				var arrayBuffer = oReq.response,
					byteArray,
					blob,
					type = oReq.getResponseHeader('Content-Type'),
					name = url.substr(url.lastIndexOf('/')+1);

				if (arrayBuffer) {
					byteArray = new Uint8Array(arrayBuffer);
					blob = new Blob([new Uint8Array(byteArray)], {type: type});
					blob.name = name;
					getFileByURLCallback(blob, false);
				} else {
					getFileByURLCallback({}, arrayBuffer);
				}
			};

			
			oReq.send(null);
		};
		

		this.getPhoto = function(getPhotoCallback) {
			var video = $('<video width="640" height="480" autoplay></video>')[0],
				canvas = $('<canvas width="640" height="480"></canvas>')[0],
				canvasContext = canvas.getContext("2d"),
				videoObj = {
					video: true
				};
			
			navigator.getMedia = ( navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia ||
                   navigator.msGetUserMedia),
		 	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;


			navigator.getMedia(videoObj, function(stream) {
				if (video.mozSrcObject !== undefined) {
			        video.mozSrcObject = window.URL.createObjectURL(stream);
			    } else {
			        video.src = window.URL.createObjectURL(stream);
			    };

				video.play();

				window.setTimeout(function() {
					canvasContext.drawImage(video, 0, 0, 640, 480);
					var imageDataURL = canvas.toDataURL("image/jpeg");
					getPhotoCallback(imageDataURL, false);
				}, 50);
			}, function(err) {
				getPhotoCallback({}, err);
			});
		};
	} else if (platform == 'phonegap') {
		this.getFileFromLibrary = function(getFileFromLibraryCallback) {

			navigator.camera.getPicture(gotFileURISuccess, gotFileURIFail, {
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				destinationType: Camera.DestinationType.NATIVE_URI
			});
        
        
			function gotFileURISuccess(fileURI) {
				window.resolveLocalFileSystemURI(fileURI, gotFileEntrySuccess, gotFileEntryFail);        
			}
        	function gotFileURIFail(message) {
				getFileFromLibraryCallback({}, message);
			}
        
        
			function gotFileEntrySuccess(fileEntry) {
				var file = fileEntry.file();
                
                getFileFromLibraryCallback(file, false);
            }
         	function gotFileEntryFail(error) {
			    getFileFromLibraryCallback({}, error);
			}
		};


		this.uploadFile = function(params, uploadFileCallback) {
			var url 		= params.url,
				file 		= params.file,
				path 		= file.fullPath,
				fileKey 	= params.fileKey || "file",
				fileName 	= params.fileName || file.name,
				postData	= params.postData || '',
				headers 	= options.headers || '',
				ft 			= new FileTransfer(),
				ftOptions 	= new FileUploadOptions();

			ftOptions.fileKey	= fileKey;
            ftOptions.fileName  = fileName;
            ftOptions.mimeType  = file.type;
            ftOptions.headers   = headers;
            ftOptions.params	= postData;


            ft.upload(path, encodeURI(url), uploadSuccess, uploadFail, ftOptions);


            function uploadSuccess(respond) {
	            uploadFileCallback(respond, false);
            }
            function uploadFail(error) {
                uploadFileCallback({}, error);
            }
		};


		this.getFileByURL = function(url, getFileByURLCallback) {
			var ft = new FileTransfer(),
	    		uriEncoded = encodeURI(url),
	    		parsedURI = parseURI(url);
	    		
	    	
	    	// get access to file system
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, onFileSystemFail);
			
			
			// get root path and return it
			function onFileSystemSuccess(fileSystem) {
				downloadFile(fileSystem.root.fullPath + '/temp/temp.png');
			}
			function onFileSystemFail(error) {
				getFileByURLCallback({}, error);
			}


			function downloadFile(filePath) {
				// download file and return path to file in callback function
		    	ft.download(uriEncoded, filePath, function(fileEntry) {
		    		getFileByURLCallback(fileEntry.file(), false);
			    },
			    function(error) {
				    getFileByURLCallback({}, error);
			    });
			}
	    };
	}

	// common methods
	this.fileToDataURL = function(file, fileToDataURLCallback) {
		var fReader = new FileReader();
	    
	    fReader.onloadend = function(e){
	        fileToDataURLCallback(e.target.result);
	    };
	    

	    fReader.readAsDataURL(file);
	};

	this.dataURLToBlob = function(params, dataURLToBlobCallback) {

		var dataURL 	= params.dataURL,
	        type 		= params.contentType || 'image/jpeg',
	        filename 	= params.fileName,
	        strDecoded	= atob(dataURL.split(',')[1]),
	        byteArray	= [],
	        blob;
	            
	    for(var i = 0; i < strDecoded.length; i++) {
	        byteArray.push(strDecoded.charCodeAt(i));
	    }
	    
	    blob = new Blob([new Uint8Array(byteArray)], {type: type});
	    blob.name = filename;
	    

	    dataURLToBlobCallback(blob);
	};


	return this;
})();