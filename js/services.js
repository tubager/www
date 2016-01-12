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

.service('LoginService', ['$q','$http',  function ($q, $http) {
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
				var token = response.data.token;
				q.resolve(response.data);
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		logoff: function(){
			var q = $q.defer();
			var url = util.server + "auth/logoff";
			var token = util.profile.token;
			$http.get(url,{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token}}).then(function(success){
				q.resolve(success);
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		changePassword: function(oldPassword, newPassword){
			var q = $q.defer();
			var url = util.server + "auth/password";
			var token = util.profile.token;
			var data = {
				"userName": oldPassword,
				"password": newPassword,
				"code": ""
			};
			$http.post(url, data, {headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token}}).then(function(response){
				var token = response.data.token;
				q.resolve(response.data);
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		signUp: function(name, pw, mobile, email){
			var q = $q.defer();
			var server = util.server + "auth/signup";
			var data = {
				"userName": name,
				"password": pw,
				"mobile": mobile,
				"email": email,
				"code": ""
			};
			$http.post(server, data).then(function(response){
				var token = response.data.token;
				q.resolve(response.data);
			}, function(error){
				console.log(error);
				q.reject(error);
			});
			return q.promise;
		}
	}
}])
.service('FileService', ['$q','$cordovaFileTransfer', '$cordovaImagePicker', '$http', function($q, $cordovaFileTransfer,$cordovaImagePicker, $http){
	return {
		uploadImage: function(){
			var opt = {
					   maximumImagesCount: 1,
					   width: 0,
					   height: 0,
					   quality: 80
				};
				var q = $q.defer();
				$cordovaImagePicker.getPictures(opt).then(function(results) {
					var fileURL = results[0];
					var options = new FileUploadOptions();
					var token = util.profile.token;
					options.fileKey = "file";
					options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
					options.mimeType = "image/jpeg";
					options.httpMethod = "POST";
					options.params = {"name": options.fileName};
					options.headers={'X-Auth-Token': token};
					
					var url = util.server + "upload";
					var ft = new FileTransfer();
					ft.upload(fileURL, encodeURI(url), function(r){
						q.resolve(r);
					}, function(error){
						q.reject(error);
					}, options);
		        }, function(err) {
		            // An error occured. Show a message to the user
		        	q.reject(err);
		        });
				
				return q.promise;
		},
		uploadProfileImg: function(){
			var q = $q.defer();
			var fileURL = util.profile.img;
			var options = new FileUploadOptions();
					var token = util.profile.token;
					options.fileKey = "file";
					options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
					options.mimeType = "image/jpeg";
					options.httpMethod = "POST";
					options.headers={'X-Auth-Token': token};
			var url = util.server + "uploadprofileimg";
			var ft = new FileTransfer();
			ft.upload(fileURL, encodeURI(url), function(r){
				q.resolve(r);
			}, function(error){
				q.reject(error);
			}, options);
			return q.promise;
		},
		downloadProfile: function(){
			var q = $q.defer();
			var server = util.server + "user";
			var token = util.profile.token;
			$http.get(server, {headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token}}).then(function(user){
				q.resolve(user.data);
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		uploadProfile: function(){
			var q = $q.defer();
			var server = util.server + "user";
			var token = util.profile.token;
			var fileName = util.profile.img.substr(util.profile.img.lastIndexOf("/")+1);
			var data = {
				name: util.profile.userName || "",
				nickName: util.profile.nickName || "",
				email: util.profile.email || "",
				mobile: util.profile.mobile || "",
				gender: util.profile.gender || "M",
				address: util.profile.address || "",
				lastWord: util.profile.lastWord || "",
				img: fileName
			};
			$http.post(server, data, {headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token}}).then(function(response){
				q.resolve({});
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		testConnection: function(){
			var server = util.server + "auth/connection";
			$http.get(server).then(function(success){
				//alert("连接成功");
			}, function(error){
				alert(JSON.stringify(error));
			});
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
			$cordovaFile.writeFile(cordova.file.dataDirectory, "profile.json", JSON.stringify(profile), true)
			.then(function (success) {
				q.resolve(success);
			}, function (error) {
				q.reject(error);
			});
			return q.promise;
		},
		
		removeProfileImg: function(newName, path){
			var q = $q.defer();
			$cordovaFile.removeFile(cordova.file.dataDirectory + path, newName)
			.then(function (success) {
				// success
				q.resolve();
			}, function (error) {
				q.resolve();
			});
			return q.promise;
		},
		
		copyProfileImg: function(url){
			var q = $q.defer();
			var oldDir = url.substr(0,url.lastIndexOf("/")+1);
			var fileName = url.substr(url.lastIndexOf("/")+1, url.length-1);
			var newName = util.getUuid() + "." + fileName.split(".")[1];
			this.removeProfileImg(newName, "").then(function(){
				$cordovaFile.copyFile(oldDir, fileName, cordova.file.dataDirectory, newName)
				.then(function (success) {
					// success
					q.resolve(cordova.file.dataDirectory + newName);
				}, function (error) {
					q.reject(error);
				});
			}, function(){});
			
			return q.promise;
		},
		
		copyCoverImg: function(url, uuid){
			var q = $q.defer();
			var oldDir = url.substr(0,url.lastIndexOf("/")+1);
			var fileName = url.substr(url.lastIndexOf("/")+1, url.length-1);
			var newName = util.getUuid() + "." + fileName.split(".")[1];
			this.removeProfileImg(newName, uuid + "/").then(function(){
				$cordovaFile.copyFile(oldDir, fileName, cordova.file.dataDirectory + uuid + "/", newName)
				.then(function (success) {
					// success
					q.resolve(cordova.file.dataDirectory + uuid + "/" + newName);
				}, function (error) {
					q.reject(error);
				});
			}, function(){});
			return q.promise;
		},
		
		copyResource: function(data, uuid){
			var q = $q.defer();
			var url = data.url;
			var oldDir = url.substr(0,url.lastIndexOf("/")+1);
			var fileName = url.substr(url.lastIndexOf("/")+1, url.length-1);
			var newName = util.getUuid() + "." + fileName.split(".")[1];
			$cordovaFile.copyFile(oldDir, fileName, cordova.file.dataDirectory + uuid + "/", newName)
			.then(function (success) {
				// success
				data.url = cordova.file.dataDirectory + uuid + "/" + newName;
				q.resolve(data);
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
			$cordovaFile.writeFile(cordova.file.dataDirectory, "my_article.json", JSON.stringify(articleList),true)
			.then(function (success) {
				q.resolve(success);
			}, function (error) {
				q.reject(error);
			});
			return q.promise;
		},
		
		readArticle: function(uuid){
			var q = $q.defer();
			$cordovaFile.readAsText(cordova.file.dataDirectory + uuid + "/", uuid + ".json")
			.then(function (txt) {
				var article = JSON.parse(txt);
				q.resolve(article);
			}, function (err) {
				q.reject(err);
			});
			return q.promise;
		},
		
		updateCoverImgUrl: function(uuid, url, title, description){
			var q = $q.defer();
			var fileName = url.substr(url.lastIndexOf("/")+1, url.length-1);
			this.readArticle(uuid).then(function(article){
				article.coverImg = fileName;
				article.title = title;
				article.description = description;
				$cordovaFile.writeFile(cordova.file.dataDirectory + uuid + "/", uuid + ".json", JSON.stringify(article), true)
				.then(function (success) {
					alert("CoverImg updated for article " + uuid);
					q.resolve(success);
				}, function (error) {
					q.reject(error);
				});
			}, function(e){
				q.reject(e);
			});
			return q.promise;
		},
		
		removeArticle: function(uuid){
			var q = $q.defer();
			$cordovaFile.removeRecursively(cordova.file.dataDirectory, uuid).then(function(success){
				q.resolve(uuid);
			}, function(error){
				q.resolve(uuid);
			});
			return q.promise;
		},
		
		checkDir: function(dir){
			var q = $q.defer();
			$cordovaFile.checkDir(cordova.file.dataDirectory, dir)
			.then(function (success) {
				q.resolve(success);
			}, function (e) {
				$cordovaFile.createDir(cordova.file.dataDirectory, dir, true)
				.then(function (s) {
					q.resolve(s);
				}, function (error) {
					q.reject(error);
				});
			});
			return q.promise;
		},
		
		beforeSave: function(article, uuid){
			var q = $q.defer();
			var that = this;
			var count = 0;
			var flag = false;
			article.paragraphs.map(function(p){
				p.images.map(function(i){
					if(i.url.indexOf(uuid) < 0){
						count ++;
						that.copyResource(i, uuid).then(function(s){
							count--;
							if(flag && count == 0){
								q.resolve({});
							}
						},function(e){
							count--;
							if(flag && count == 0){
								q.resolve({});
							}
						});
					}
				});
				
				p.sounds.map(function(s){
					if(s.url.indexOf(uuid) < 0){
						count ++;
						that.copyResource(s, uuid).then(function(s){
							count--;
							if(flag && count == 0){
								q.resolve({});
							}
						},function(e){
							count--;
							if(flag && count == 0){
								q.resolve({});
							}
						});
					}
				});
			});
			flag = true;
			if(flag && count == 0){
				q.resolve({});
			}
			return q.promise;
		},
		
		saveArticle: function(article, uuid){
			var q = $q.defer();
			var that = this;
			this.checkDir(uuid).then(function(s){
				that.beforeSave(article, uuid).then(function(){
					$cordovaFile.writeFile(cordova.file.dataDirectory + uuid + "/", uuid + ".json", JSON.stringify(article), true)
					.then(function (success) {
						q.resolve(success);
					}, function (error) {
						q.reject(error);
					});
				}, function(){});
				
			}, function(e){
				q.reject(e);
			});
			return q.promise;
		}
	}
}])
.service('ArticleService',['$http','$q', function($http, $q){
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
			var q = $q.defer();
			var url = util.server + "books";
			var token = util.profile.token;
			return $http.get(url,{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token},data:{}}).then(function(items){
				alert(JSON.stringify(items));
				articles = items.data;
				q.resolve(articles);
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		
		uploadArticle: function(data){
			var article = {
				"uuid": data.uuid,
				"title": data.title,
				"description": data.description,
				"coverImg": data.coverImg,
				"userName": util.profile.userName,
				"paragraphs": []
			};
			if(data.paragraphs){
				data.paragraphs.map(function(p){
					var para = {
						"uuid": p.uuid,
						"title": p.title,
						"bookUuid": data.uuid,
						"text": p.text
					};
					var img = [];
					var imgText = [];
					if(p.images){
						p.images.map(function(i){
							var fileName = i.url || "";
							fileName = fileName.substr(fileName.lastIndexOf("/")+1);
							img.push(fileName);
							imgText.push(i.title || "");
						});
					}
					para.img = img.join(",");
					para.imgText = imgText.join(",");
					var audio = [];
					if(p.sounds){
						p.sounds.map(function(s){
							var fileName = s.url || "";
							fileName = fileName.substr(fileName.lastIndexOf("/")+1);
							audio.push(fileName);
						});
					}
					para.audio = audio.join(",");
					para.location = p.location;
					article.paragraphs.push(para);
				});
			}
			//alert(JSON.stringify(article));
			//return;
			var q = $q.defer();
			var url = util.server + "book";
			var token = util.profile.token;
			return $http.post(url,article,{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token}}).then(function(d){
				q.resolve(d);
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		}
	}
}])
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

