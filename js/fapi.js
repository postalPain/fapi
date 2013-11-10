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
				headers 	= options.headers || '',
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
		            uploadFileCallback(credentialsData, false)
		        } else {
		            uploadFileCallback({}, status);
		        }
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