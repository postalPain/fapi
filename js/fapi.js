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
	}



	


	return this;
})();