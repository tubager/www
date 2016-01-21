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
		signUp: function(name, pw, mobile, email, techId){
			var q = $q.defer();
			var server = util.server + "auth/signup";
			var data = {
				"userName": name,
				"password": pw,
				"mobile": mobile,
				"email": email,
				"code": "",
				"techId": techId
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
				if(user.data.img){
					var url = util.server + "resource/filebyname?name=" + user.data.img;
					var filePath = cordova.file.dataDirectory + user.data.img;
					var options = {};
					user.data.img = cordova.file.dataDirectory + user.data.img;
					$cordovaFileTransfer.download(url, filePath, options, true)
					.then(function(){
						q.resolve(user.data);
					}, function(){
						q.resolve(user.data);
					});
				}
				else{
					q.resolve(user.data);
				}
				
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
		uploadGps: function(data){
			var q = $q.defer();
			var server = util.server + "resource/ullist";
			$http.post(server, data, {headers:{'Accept': 'application/json;charset=UTF-8'}}).then(function(response){
				q.resolve({});
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		testConnection: function(){
			var server = util.server + "auth/connection";
			$http.get(server).then(function(success){
				
			}, function(error){
				
			});
		}
	}
}])
.service('LocalFileService', ['$q','$cordovaFile', function($q, $cordovaFile){
	return {
		checkGPS: function(){
			var q = $q.defer();
			$cordovaFile.checkFile(cordova.file.dataDirectory, "trace.txt")
			.then(function(success){
				q.resolve({});
			}, function(error){
				$cordovaFile.createFile(cordova.file.dataDirectory, "trace.txt", true)
				.then(function (s) {
					q.resolve({});
				}, function (e) {
					q.reject(e);
				});
			});
			return q.promise;
		},
		clearGps: function(){
			var q = $q.defer();
			$cordovaFile.writeFile(cordova.file.dataDirectory, "trace.txt", "", true)
			.then(function (success) {
				q.resolve(success);
			}, function (error) {
				q.reject(error);
			});
			return q.promise;
		},
		saveGPS: function(latitude, longitude){
			var q = $q.defer();
			var date = new Date();
			var txt = latitude + "," + longitude + "," + date.getTime() + ";";
			this.checkGPS().then(function(){
				$cordovaFile.writeExistingFile(cordova.file.dataDirectory, "trace.txt", txt)
				.then(function(){
					q.resolve({});
				}, function(e){
					q.reject(e);
				});
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		readGPS: function(){
			var q = $q.defer();
			$cordovaFile.readAsText(cordova.file.dataDirectory, "trace.txt")
			.then(function(txt){
				q.resolve({text: txt});
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
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
			$cordovaFile.checkFile(oldDir, fileName).then(function(){
				//alert("found " + url);
			}, function(){
				//alert("not found " + url);
			});
			$cordovaFile.copyFile(oldDir, fileName, cordova.file.dataDirectory + uuid + "/", newName)
			.then(function (success) {
				// success
				//alert("file copied");
				data.url = cordova.file.dataDirectory + uuid + "/" + newName;
				q.resolve(data);
			}, function (error) {
				//alert(JSON.stringify(error));
				q.reject(error);
			});
			return q.promise;
		},
		
		getLocalArticles: function(){
			var q = $q.defer();
			$cordovaFile.checkFile(cordova.file.dataDirectory, "local_article.json")
			.then(function (success) {
				$cordovaFile.readAsText(cordova.file.dataDirectory, "local_article.json")
				.then(function (txt) {
					var articles;
					if(txt == ""){
						articles = [];
					}
					else{
						articles = JSON.parse(txt);
					}
					q.resolve(articles);
				}, function (err) {
					q.reject(err);
				});
			}, function (error) {
				$cordovaFile.createFile(cordova.file.dataDirectory, "local_article.json", true)
				.then(function (success) {
					q.resolve([]);
				}, function (error) {
					q.reject(error);
				});
			});
			return q.promise;
		},
		
		updateLocalArticles: function(article, op){
			var q = $q.defer();
			var articles;
			this.getLocalArticles()
			.then(function (result) {
				articles = result;
				var a;
				for(var i=0; i<articles.length; i++){
					if(articles[i].uuid == article.uuid){
						a = articles[i];
						break;
					}
				}
				if(op == "add"){
					if(a){
						a.uuid = article.uuid;
						a.title = article.title;
						a.description = article.description;
						a.coverImg = article.coverImg;
					}
					else{
						articles.splice(0,0,{
							uuid: article.uuid,
							title: article.title,
							description: article.description,
							coverImg: article.coverImg
						});
					}
				}
				else if(op == "remove"){
					if(a){
						var idx = articles.indexOf(a);
						if(idx >= 0){
							articles.splice(idx, 1);
						}
					}
				}
				if(articles){
					$cordovaFile.writeFile(cordova.file.dataDirectory, "local_article.json", JSON.stringify(articles),true)
					.then(function (success) {
						q.resolve(articles);
					}, function (error) {
						q.reject(error);
					});
				}
			}, function (err) {
				q.reject(err);
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
						
						var url = s.url;
						var oldDir = url.substr(0,url.lastIndexOf("/")+1);
						var fileName = url.substr(url.lastIndexOf("/")+1, url.length-1);
						var newName = util.getUuid() + "." + fileName.split(".")[1];
						window.resolveLocalFileSystemURL(url, function(fileEntry){
							fileEntry.file(function(file) {
								var reader = new FileReader();
								reader.onloadend = function(e) {
									var content = this.result;
									$cordovaFile.writeFile(cordova.file.dataDirectory + uuid + "/", newName, content, true).then(function(){
										s.url = cordova.file.dataDirectory + uuid + "/" + newName;
										count--;
										if(flag && count == 0){
											q.resolve({});
										}
									}, function(ee){
										count--;
										if(flag && count == 0){
											q.resolve({});
										}
									});
								};
								reader.readAsArrayBuffer(file);
							});
						}, function(error){
							
						});
						/*$cordovaFile.readAsArrayBuffer(oldDir, fileName).then(function(data){
							alert("readAsArrayBuffer");
							alert(cordova.file.externalRootDirectory);
							$cordovaFile.writeFile(cordova.file.dataDirectory + uuid + "/", newName, data, true).then(function(){
								alert("copy success");
								s.url = cordova.file.dataDirectory + uuid + "/" + newName;
								count--;
								if(flag && count == 0){
									q.resolve({});
								}
							}, function(ee){
								alert(JSON.stringify(ee));
								count--;
								if(flag && count == 0){
									q.resolve({});
								}
							});
						}, function(error){
							alert(JSON.stringify(error));
							alert(oldDir + fileName);
						});
						that.copyResource(s, uuid).then(function(ss){
							count--;
							if(flag && count == 0){
								q.resolve({});
							}
						},function(e){
							count--;
							if(flag && count == 0){
								q.resolve({});
							}
						});*/
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
						q.resolve(article);
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
.service('ArticleService',['$http','$q', '$cordovaFileTransfer', '$cordovaFile', function($http, $q, $cordovaFileTransfer, $cordovaFile){
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
			var url = util.server + "resource/books";
			var token = util.profile.token;
			
			$http.get(url,{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token},data:{}}).then(function(items){
				
				articles = items.data;
				q.resolve(articles);
			}, function(error){
				q.reject(error);
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
		
		downloadArticle: function(uuid){
			var q = $q.defer();
			this.checkDir(uuid).then(function(success){
				var url = util.server + "resource/book/" + uuid;
				var basePath = cordova.file.dataDirectory + uuid + "/";
				var filePath = basePath + uuid + ".json";
				var token = util.profile.token;
				var options = {};
				options.headers={'X-Auth-Token': token};
				
				$cordovaFileTransfer.download(url, filePath, options, true).then(function(result){
					$cordovaFile.readAsText(cordova.file.dataDirectory + uuid + "/", uuid + ".json")
					.then(function (txt) {
						var article = JSON.parse(txt);
						//downloading cover image
						url = util.server + "resource/filebyname?name=" + article.coverImg;
						filePath = basePath + article.coverImg;
						options = {};
						if(article.coverImg != "img/travel-default.png"){
							$cordovaFileTransfer.download(url, filePath, options, true);
							article.coverImg = filePath;
						}
						//downloading paragraph images
						var imgList = [];
						article.paragraphs.map(function(p){
							var imgs = p.img.split(",");
							var txts = p.imgText.split(",");
							p.images = [];
							for(var i=0; i<imgs.length; i++){
								if(imgs[i] == ""){
									continue;
								}
								p.images.push({url: basePath + imgs[i], title: txts[i] || ""});
								url = util.server + "resource/filebyname?name=" + imgs[i];
								filePath = basePath + imgs[i];
								options = {};
								$cordovaFileTransfer.download(url, filePath, options, true);
							}
							var audios = p.audio.split(",");
							p.sounds = [];
							for(var i=0; i<audios.length; i++){
								if(audios[i] == ""){
									continue;
								}
								p.sounds.push({url: basePath + audios[i], title:""});
								url = util.server + "resource/filebyname?name=" + audios[i];
								filePath = basePath + audios[i];
								options = {};
								$cordovaFileTransfer.download(url, filePath, options, true);
							}
						});
						$cordovaFile.writeFile(cordova.file.dataDirectory + uuid + "/", uuid + ".json", JSON.stringify(article), true)
						.then(function(){
							//alert("article saved");
						}, function(error){
							//alert("save article failed");
						});
						q.resolve(article);
					}, function (err) {
						q.reject(err);
					});
				}, function(error){
					q.reject(error);
				}, function(progress){
					
				});
			}, function(error){
				q.reject(error);
			});
			return q.promise;
		},
		
		uploadArticle: function(data){
			var coverImg = data.coverImg || "";
			coverImg = coverImg.substr(coverImg.lastIndexOf("/")+1);
			var article = {
				"uuid": data.uuid,
				"title": data.title,
				"description": data.description,
				"coverImg": coverImg,
				"userName": util.profile.userName,
				"paragraphs": []
			};
			var imgList = [];
			var audioList = [];
			if(data.coverImg){
				imgList.push({"fileName": coverImg, "paragraph": ""});
			}
			
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
							imgList.push({"fileName": fileName, "paragraph": p.uuid});
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
							audioList.push({"fileName": fileName, "paragraph": p.uuid});
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
			var idx = imgList.length + audioList.length;
			$http.post(url,article,{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': token}}).then(function(d){
				if(idx == 0){
					q.resolve(d);
				}
			}, function(error){
				q.reject(error);
			});
			url = util.server + "upload";
			
			imgList.map(function(data){
				var options = new FileUploadOptions();
				options.fileKey = "file";
				options.fileName = data.fileName;
				options.mimeType = "image/jpeg";
				options.httpMethod = "POST";
				options.params = {"paragraph": data.paragraph, "article": article.uuid, "resourceType": "image"};
				options.headers={'X-Auth-Token': token};
				var fileURL = cordova.file.dataDirectory + article.uuid + "/" + options.fileName;
				var ft = new FileTransfer();
				ft.upload(fileURL, encodeURI(url), function(r){
					idx--;
					if(idx <= 0){
						q.resolve({});
					}
				}, function(error){
					idx--;
					if(idx <= 0){
						q.resolve({});
					}
				}, options);
			});
			audioList.map(function(data){
				var options = new FileUploadOptions();
				options.fileKey = "file";
				options.fileName = data.fileName;
				options.mimeType = "audio/x-mpeg";
				options.httpMethod = "POST";
				options.params = {"paragraph": data.paragraph, "article": article.uuid, "resourceType": "audio"};
				options.headers={'X-Auth-Token': token};
				var fileURL = cordova.file.dataDirectory + article.uuid + "/" + options.fileName;
				var ft = new FileTransfer();
				ft.upload(fileURL, encodeURI(url), function(r){
					idx--;
					if(idx <= 0){
						q.resolve({});
					}
				}, function(error){
					idx--;
					if(idx <= 0){
						q.resolve({});
					}
				}, options);
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

