angular.module('starter.services', ['ionic', 'ngCordova'])

.factory('Sliders', function () {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var sliders = [{
        id: 0,
        name: 'Ben Sparrow',
        img: 'img/banners/1.jpg'
    }, {
        id: 1,
        name: 'Max Lynx',
        img: 'img/banners/2.jpg'
    }, {
        id: 2,
        img: 'img/banners/3.jpg'
    }, {
        id: 3,
        img: 'img/banners/4.jpg'
    }];

    var chats = [{
        id: 0,
        title: '【东京北海道】初夏花未央',
        description: '晓稀 ',
        coverImg: 'img/banners/1.jpg'
    }, {
        id: 1,
        title: '【天空之城】阳春三月 携死党．奔赴女儿国（完结）',
        description: '天空之城',
        coverImg: 'img/banners/2.jpg'
    }, {
        id: 2,
        title: '#消夏计划#I TAIWAN臺灣向南走向北走',
        description: 'ar_vinny ',
        coverImg: 'img/banners/3.jpg'
    }, {
        id: 3,
        title: '沙丁鱼大迁徙－狂野南非 海盗王.基德作品',
        description: '海盗王基德',
        coverImg: 'img/banners/4.jpg'
    }];

    return {
        all: function () {
            return sliders;
        },
        chats: function () {
            return chats;
        }
    };
})

.service('LoginService', function ($q, $http) {
	return {
		signIn: function (name, pw) {
			var q = $q.defer();
			var server = util.server + "auth/signin";
			var data = {
				"userName": name,
				"password": pw,
				"code": ""
			};
			$http.post(server, data, {headers:{'Accept': 'application/json;charset=UTF-8'}}).then(function(response){
				console.log(response);
				q.resolve(response);
			}, function(error){
				console.log(error);
				q.reject(error);
			});
			return q.promise;
		},
		signUp: function(name, pw){
			var q = $q.defer();
			var server = util.server + "auth/signup";
			var data = {
				"userName": name,
				"password": pw,
				"code": ""
			};
			$http.post(server, data, {headers:{'Accept': 'application/json;charset=UTF-8'}}).then(function(response){
				console.log(response);
				q.resolve(response);
			}, function(error){
				console.log(error);
				q.reject(error);
			});
			return q.promise;
		}
	}
})
.service('FileService', ['$q','$cordovaFileTransfer', '$cordovaImagePicker', function($q, $cordovaFileTransfer,$cordovaImagePicker){
	return {
		uploadImage: function(){
			var options = {
					   maximumImagesCount: 1,
					   width: 0,
					   height: 0,
					   quality: 80
				};
				var q = $q.defer();
				$cordovaImagePicker.getPictures(options).then(function(results) {
					var fileURL = results[0];
					var options = new FileUploadOptions();
					options.fileKey = "file";
					options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
					options.mimeType = "image/jpeg";
					options.httpMethod = "POST";
					options.params = {"name": options.fileName};
					options.headers={'X-Auth-Token':'abcde'};
					
					var ft = new FileTransfer();
					ft.upload(fileURL, encodeURI("http://120.25.68.228:8080/upload"), function(r){
						q.resolve(r);
					}, function(error){
						q.reject(error);
					}, options);
		        }, function(err) {
		            // An error occured. Show a message to the user
		        	q.reject(err);
		        });
				
				return q.promise;
		}
	}
}])
.service('LocalFileService', ['$q','$cordovaFile', function($q, $cordovaFile){
	return {
		getProfile: function(){
			var q = $q.defer();
			$cordovaFile.checkFile(cordova.file.dataDirectory, "profile.json")
			.then(function (success) {
				$cordovaFile.readAsText(cordova.file.dataDirectory, "profile.json")
				.then(function (txt) {
					var profile;
					if(txt == ""){
						profile = {};
					}
					else{
						profile = JSON.parse(txt);
					}
					q.resolve(profile);
				}, function (err) {
					q.reject(err);
				});
			}, function (error) {
				$cordovaFile.createFile(cordova.file.dataDirectory, "profile.json", true)
				.then(function (success) {
					q.resolve({});
				}, function (error) {
					q.reject(error);
				});
			});
			return q.promise;
		},
		
		saveProfile: function(profile){
			var q = $q.defer();
			if(!profile){
				profile = {};
			}
			$cordovaFile.writeExistingFile(cordova.file.dataDirectory, "profile.json", JSON.stringify(profile))
			.then(function (success) {
				q.resolve(success);
			}, function (error) {
				q.reject(error);
			});
			return q.promise;
		},
		
		listArticles: function(){
			var q = $q.defer();
			$cordovaFile.checkFile(cordova.file.dataDirectory, "my_article.json")
			.then(function (success) {
				$cordovaFile.readAsText(cordova.file.dataDirectory, "my_article.json")
				.then(function (txt) {
					var articles;
					if(txt == ""){
						articles = {'articles':[], 'currentArticle': null};
					}
					else{
						articles = JSON.parse(txt);
					}
					q.resolve(articles);
				}, function (err) {
					q.reject(err);
				});
			}, function (error) {
				$cordovaFile.createFile(cordova.file.dataDirectory, "my_article.json", true)
				.then(function (success) {
					q.resolve({'articles':[], 'currentArticle': null});
				}, function (error) {
					q.reject(error);
				});
			});
			return q.promise;
		},
		
		saveArticleList: function(articleList){
			var q = $q.defer();
			$cordovaFile.writeExistingFile(cordova.file.dataDirectory, "my_article.json", JSON.stringify(articleList))
			.then(function (success) {
				q.resolve(success);
			}, function (error) {
				q.reject(error);
			});
			return q.promise;
		},
		
		readArticle: function(uuid){
			var q = $q.defer();
			$cordovaFile.readAsText(cordova.file.dataDirectory, uuid + "/" + uuid + ".json")
			.then(function (txt) {
				var article = JSON.parse(txt);
				q.resolve(article);
			}, function (err) {
				q.reject(err);
			});
			return q.promise;
		},
		
		saveArticle: function(article, uuid){
			var q = $q.defer();
			$cordovaFile.writeFile(cordova.file.dataDirectory, uuid + "/" + uuid + ".json", JSON.stringify(article), true)
			.then(function (success) {
				q.resolve(success);
			}, function (error) {
				q.reject(error);
			});
			return q.promise;
		}
	}
}])
.service('ArticleService',function($http){
	var articles;
	return{
		getArticles: function(){
//			var req = {
//					method: 'GET',
//					url: 'http://jsonplaceholder.typicode.com/users',
//					//url: 'http://localhost:8080/book/99c8ca6c63f14b3f8bb85510bcdaae04',
//					headers: {
//						'Content-Type': 'application/json;charset=UTF-8',
//					    'X-Auth-Token': "abcde"
//					}
//			};
			return $http.get('http://120.25.68.228:8080/books',{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': "abcde"},data:{}}).then(function(items){
				articles = items.data;
				return articles;
			});
		},
		
		uploadArticle: function(article){
			return $http.post('http://localhost:8080/book',article,{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': "abcde"}}).then(function(d){
				return d;
			});
		}
	}
})
.factory('CameraService',['$q','$cordovaCamera','$cordovaImagePicker','$cordovaCapture','$cordovaBarcodeScanner', function($q,$cordovaCamera,$cordovaImagePicker,$cordovaCapture,$cordovaBarcodeScanner){
	return {
		getPicture: function(){
			var options = { 
		            quality : 75, 
		            destinationType : Camera.DestinationType.FILE_URL, 
		            sourceType : Camera.PictureSourceType.CAMERA, 
		            allowEdit : true,
		            encodingType: Camera.EncodingType.JPEG,
		            targetWidth: 300,
		            targetHeight: 300,
		            popoverOptions: CameraPopoverOptions,
		            saveToPhotoAlbum: false
		        };
			var q = $q.defer();
			$cordovaCamera.getPicture(options).then(function(imageData) {
				q.resolve(imageData);
	        }, function(err) {
	            // An error occured. Show a message to the user
	        	q.reject(err);
	        });
			
			return q.promise;
		},
		
		selectPicture: function(){
			var options = {
				   maximumImagesCount: 10,
				   width: 0,
				   height: 0,
				   quality: 80
			};
			var q = $q.defer();
			$cordovaImagePicker.getPictures(options).then(function(results) {
				q.resolve(results);
	        }, function(err) {
	            // An error occured. Show a message to the user
	        	q.reject(err);
	        });
			
			return q.promise;
		},
		
		captureImage : function(){
			var options = { limit: 1 };
			var q = $q.defer();
			$cordovaCapture.captureImage(options).then(function(imageData) {
		      // Success! Image data is here
				q.resolve(imageData);
		    }, function(err) {
		      // An error occurred. Show a message to the user
	        	q.reject(err);
		    });
			
			return q.promise;
		},
		
		captureAudio : function(){
			var options = { limit: 1, duration: 10 };
			var q = $q.defer();
			$cordovaCapture.captureAudio(options).then(function(audioData) {
		      // Success! Image data is here
				q.resolve(audioData);
		    }, function(err) {
		      // An error occurred. Show a message to the user
	        	q.reject(err);
		    });
			
			return q.promise;
		},
		
		captureVideo : function(){
			var options = { limit: 1, duration: 15 };
			var q = $q.defer();
			$cordovaCapture.captureVideo(options).then(function(videoData) {
		      // Success! Image data is here
				q.resolve(videoData);
		    }, function(err) {
		      // An error occurred. Show a message to the user
	        	q.reject(err);
		    });
			
			return q.promise;
		},
		
		scanQrcode: function(){
			var q = $q.defer();
			$cordovaBarcodeScanner.scan().then(function(scanData) {
		      // Success! Image data is here
				q.resolve(scanData);
		    }, function(err) {
		      // An error occurred. Show a message to the user
	        	q.reject(err);
		    });
			
			return q.promise;
		}
	}
}]);

