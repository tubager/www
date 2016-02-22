angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope,$state,Sliders, $cordovaGeolocation, $cordovaNetwork, $ionicLoading, ArticleService,LocalFileService, FileService) {
    $scope.sliders = Sliders.all();
    $scope.chats = Sliders.chats();
	$scope.data = {query: ""};
	$scope.search = function($event){
		if(!$scope.data.query || $scope.data.query == ""){
			return;
		}
		$state.go('search', {id: $scope.data.query});
	};
	
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
    	
//    	$ionicLoading.show({
//            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
//        });
		FileService.testConnection();
		
    	var posOptions = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };
    	$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var longitude = position.coords.longitude;
            LocalFileService.saveGPS(lat, longitude);
        }, function(err) {
            //$ionicLoading.hide();
        });
		
		LocalFileService.getProfile().then(function(profile){
			util.profile = profile;
			if(!util.profile.techId){
				util.profile.techId = util.getUuid();
				LocalFileService.saveProfile(util.profile);
			}
			getLocalArticles();
			uploadLocation();
			
			LocalFileService.listArticles().then(function(myArticleData){
				var myArticles = myArticleData.articles;
				ArticleService.getArticles().then(function(data){
					 data.map(function(d){
						 for(var i=0; i<myArticles.length; i++){
							 if(myArticles[i].uuid == d.uuid){
								 return;
							 }
						 }
						 for(var i=0; i<$scope.chats.length; i++){
							 if($scope.chats[i].uuid == d.uuid){
								 return;
							 }
						 }
						 //d.coverImg = util.server + "resource/filebyname?name=" + d.coverImg;
						 ArticleService.downloadArticle(d.uuid).then(function(article){
							LocalFileService.updateLocalArticles(article, "add").then(function(data){
								getLocalArticles();
							}, function(error){
								
							});
						 }, function(){});
					 });
				}, function(error){
				});
			});
			
			 
		}, function(error){
		});
    }
	
	function getLocalArticles(){
		LocalFileService.getLocalArticles().then(function(data){
			if(data.length > 0){
				$scope.chats = data;
			}
			
		}, function(error){
			
		});
	}
	
	function uploadLocation(){
		var type = $cordovaNetwork.getNetwork();
		if(type != Connection.WIFI){
			return;
		}
		
		if(!util.isLoggedIn){
			return;
		}
		LocalFileService.readGPS().then(function(gpsData){
			var txt = gpsData.text;
			if(txt == null || txt == ""){
				return;
			}
			var data = {"techId": util.profile.userName, "text": txt};
			FileService.uploadGps(data).then(function(success){
				LocalFileService.clearGps();
			}, function(){});
		}, function(){});
	}
})
	
	.controller('AcntSettingsCtrl', function ($scope) {
	})

	.controller('SignInCtrl', function ($scope, LoginService, $ionicPopup, $state,LocalFileService, FileService, $ionicLoading) {
		$scope.user = {};
		$scope.submitted = false;
		
		$scope.register = function(){
			$state.go('signup');
		};
		$scope.claimPassword = function(){
			$state.go('forgotpassword');
		};

		$scope.signIn = function () {
			$ionicLoading.show({
				template: '<ion-spinner icon="bubbles"></ion-spinner><br/>正在登录'
			});
			LoginService.signIn($scope.user.username, $scope.user.password).then(function(response){
				var token = response.token;
				util.profile.token = token;
				util.profile.userName = $scope.user.username;
				FileService.downloadProfile().then(function(user){
					util.profile.mobile = user.mobile;
					util.profile.email = user.email;
					util.profile.gender = user.gender || "M";
					util.profile.lastWord = user.lastWord;
					util.profile.techId = user.techId;
					util.profile.img = user.img;
					LocalFileService.saveProfile(util.profile).then(function(success){
						$ionicLoading.hide();
						$state.go('tab.account');
					}, function(e){
						$ionicLoading.hide();
						alert(JSON.stringify(e));
					});
				},function(){
					$ionicLoading.hide();
				});
			},function(error){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: '登录失败!',
					template: CS[error.data.message] || ""
				});
			});
		};
	})

	.controller('SignUpCtrl', function ($scope, $state, $ionicPopup, LoginService,LocalFileService) {
		$scope.submitted = false;
		$scope.signUp = function (user) {
			if ($scope.signup_form.$valid) {
				if(user.password1 != user.password2){
					var alertPopup = $ionicPopup.alert({
						title: '注册失败!',
						template: '两次输入的密码不一致!'
					});
				}
				else{
					LoginService.signUp(user.username, user.password1, user.mobile, user.email, util.profile.techId).then(function(response){
						console.log(response);
						var token = response.token;
						util.profile = util.defaultProfile;
						util.profile.token = token;
						util.profile.userName = $scope.user.username;
						LocalFileService.saveProfile(util.profile).then(function(success){
							$state.go('tab.account');
						}, function(e){
							alert(JSON.stringify(e));
						});
					},function(error){
						$ionicPopup.alert({
							title: '注册失败!',
							template: error.data.message
						});
					});
				}
			} else {
				$scope.signup_form.submitted = true;
			}
		};
	})
	.controller('ForgetPwdCtrl', function ($scope, $state) {
		$scope.submitted = false;

		$scope.forgetPwd = function (user) {
			if ($scope.forget_pwd_form.$valid) {
				console.log('Forget-Password', user);
				$state.go('reclaimpassword');
			} else {
				$scope.forget_pwd_form.submitted = true;
			}
		};
	})

	.controller('ReclaimPwdCtrl', function ($scope) {
	})


	.controller('AcntProfileCtrl', function ($scope, $ionicActionSheet, $ionicModal, CameraService, LocalFileService, LoginService, $state,FileService) {
		$scope.user = {
			userName: util.profile.userName || "",
			nickName: util.profile.nickName || "",
			email: util.profile.email || "",
			mobile: util.profile.mobile || "",
			gender: util.profile.gender || "M",
			address: util.profile.address || "",
			lastWord: util.profile.lastWord || "",
			img: util.profile.img || "img/img_5236.jpg"
		};
		$scope.temp = {};
		
		function saveProfile(){
			util.profile.nickName = $scope.user.nickName;
			util.profile.img = $scope.user.img;
			util.profile.gender = $scope.user.gender;
			util.profile.lastWord = $scope.user.lastWord;
			util.profile.mobile = $scope.user.mobile;
			util.profile.email = $scope.user.email;
			LocalFileService.saveProfile(util.profile);
		}
		
		$scope.save = function(){
			FileService.uploadProfile().then(function(success){
				$state.go("tab.account");
			}, function(error){
				alert(JSON.stringify(error));
			});
			
			FileService.uploadProfileImg().then(function(success){
				
			}, function(error){
				alert(JSON.stringify(error));
			});
		};
		
		$scope.logoff = function(){
			LoginService.logoff().then(function(){
				
			}, function(){});
			//util.profile = util.defaultProfile;
			util.profile.token = null;
			saveProfile();
			$state.go('tab.account');
		};
		
		$ionicModal.fromTemplateUrl('templates/account/profile-nickname.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.nickModal = modal;
		});
		$scope.openNickModal = function () {
			$scope.temp.nickName = $scope.user.nickName;
			$scope.nickModal.show();
		};
		$scope.closeNickModal = function() {
			$scope.nickModal.hide();
		};
		$scope.saveNickModal = function () {
			$scope.user.nickName = $scope.temp.nickName;
			$scope.nickModal.hide();
			saveProfile();
		};
		
		$ionicModal.fromTemplateUrl('templates/account/profile-mobile.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.mobileModal = modal;
		});
		$scope.openMobileModal = function () {
			$scope.temp.mobile = $scope.user.mobile;
			$scope.mobileModal.show();
		};
		$scope.closeMobileModal = function() {
			$scope.mobileModal.hide();
		};
		$scope.saveMobileModal = function () {
			$scope.user.mobile = $scope.temp.mobile;
			$scope.mobileModal.hide();
			saveProfile();
		};
		
		$ionicModal.fromTemplateUrl('templates/account/profile-email.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.emailModal = modal;
		});
		$scope.openEmailModal = function () {
			$scope.temp.email = $scope.user.email;
			$scope.emailModal.show();
		};
		$scope.closeEmailModal = function() {
			$scope.emailModal.hide();
		};
		$scope.saveEmailModal = function () {
			$scope.user.email = $scope.temp.email;
			$scope.emailModal.hide();
			saveProfile();
		};
		
		$ionicModal.fromTemplateUrl('templates/account/profile-gender.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.genderModal = modal;
		});
		$scope.openGenderModal = function () {
			$scope.temp.gender = $scope.user.gender;
			$scope.genderModal.show();
		};
		$scope.closeGenderModal = function() {
			$scope.genderModal.hide();
		};
		$scope.saveGenderModal = function () {
			$scope.user.gender = $scope.temp.gender;
			$scope.genderModal.hide();
			saveProfile();
		};
		
		$ionicModal.fromTemplateUrl('templates/account/profile-password.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.passwordModal = modal;
		});
		$scope.openPasswordModal = function(){
			$scope.temp.oldPassword = "";
			$scope.temp.newPassword1 = "";
			$scope.temp.newPassword2 = "";
			$scope.passwordModal.show();
		};
		$scope.closePasswordModal = function(){
			$scope.passwordModal.hide();
		};
		$scope.savePasswordModal = function(){
			if($scope.temp.newPassword1 != $scope.temp.newPassword2){
				var alertPopup = $ionicPopup.alert({
					title: '更改密码失败!',
					template: '两次输入的密码不一致!'
				});
			}
			else{
				LoginService.changePassword($scope.temp.oldPassword, $scope.temp.newPassword1).then(function(response){
					console.log(response);
					var token = response.token;
					util.profile.token = token;
					LocalFileService.saveProfile(util.profile).then(function(success){
						$state.go('tab.account');
					}, function(e){
						alert(JSON.stringify(e));
					});
				},function(error){
					$ionicPopup.alert({
						title: '更改密码失败!',
						template: error.data.message
					});
				});
				$scope.passwordModal.hide();
			}
			
		};
		
		$ionicModal.fromTemplateUrl('templates/account/profile-lastword.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.signatureModal = modal;
		});
		$scope.openSignatureModal = function(){
			$scope.temp.lastWord = $scope.user.lastWord;
			$scope.signatureModal.show();
		};
		$scope.closeSignatureModal = function(){
			$scope.signatureModal.hide();
		};
		$scope.saveSignatureModal = function(){
			$scope.user.lastWord = $scope.temp.lastWord;
			$scope.signatureModal.hide();
			saveProfile();
		};

		$scope.showActionsheet = function () {
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: '<i class="icon ion-camera"></i>拍照片' },
					{ text: '<i class="icon ion-images"></i>从相册选取' }
				],
				cancelText: '取消',
				cancel: function () {
					// add cancel code..
				},
				buttonClicked: function (index) {
					if(index == 0){
						//taking photo
						CameraService.getPicture().then(function(mediaFiles) {
							LocalFileService.copyProfileImg(mediaFiles).then(function(url){
								$scope.user.img = url;
								saveProfile();
							}, function(error){});
							
						}, function(err) {
							alert(err);
						});
					}
					else if(index == 1){
						//select from album
						CameraService.selectPicture(300,300,90,1).then(function(results) {
						    LocalFileService.copyProfileImg(results[0]).then(function(url){
								$scope.user.img = url;
								saveProfile();
							}, function(error){});
						}, function(err) {
							alert(err);
						});
					}
					return true;
				}
			});

		};
	})
.controller('ArticleListCtrl', function($scope,$stateParams, $ionicModal,ArticleService,$ionicPopup){
	var query = $stateParams.id;
	$scope.articles = [];
	ArticleService.searchArticles(query).then(function(data){
		$scope.articles = data;
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}, function(err){
		alert(JSON.stringify(err));
	});
})
.controller('MyArticlesCtrl', function($scope, $ionicModal,LocalFileService,$ionicPopup,$ionicActionSheet,CameraService){
	var articleList = [];
	//$scope.articles = [{title: "AAAAAAA", id: "1111", coverImg:"img/travel-default.png"}, {title: "BBBBBB", id: "222222", coverImg: "img/travel-default.png"}];
	//return;
	$scope.articles = [];
	
	LocalFileService.listArticles().then(function(data){
		articleList = data.articles;
		$scope.articles = articleList;
		$scope.currentArticle = data.currentArticle;
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}, function(err){
		alert(JSON.stringify(err));
	});
	
	$ionicModal.fromTemplateUrl('templates/newarticle-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.titleModel = modal;
    });
	
	$scope.editArticle = function(a){
		$scope.data = {articleTitle: a.title, articleDesc: a.description, id: a.id, coverImg: a.coverImg || "img/travel-default.png"};
		$scope.titleModel.show();
	};
	
	$scope.changeCoverImg = function(){
		$ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-camera"></i>拍照片' },
				{ text: '<i class="icon ion-images"></i>从相册选取' }
			],
			cancelText: '取消',
			cancel: function () {
				// add cancel code..
			},
			buttonClicked: function (index) {
				if(index == 0){
					//taking photo
					CameraService.captureImage(util.img.width,util.img.height,util.img.quality).then(function(mediaFiles) {
						$scope.data.coverImg = mediaFiles;//[0].fullPath;
					}, function(err) {
						alert(err);
					});
				}
				else if(index == 1){
					//select from album
					CameraService.selectPicture(util.img.width,util.img.height,util.img.quality,1).then(function(results) {
						$scope.data.coverImg = results[0];
					}, function(err) {
						alert(err);
					});
				}
				return true;
			}
		});
	};
	
	$scope.closeNewArticle = function(){
		$scope.titleModel.hide();
	};
	
	$scope.confirmNewArticle = function(){
		LocalFileService.copyCoverImg($scope.data.coverImg, $scope.data.id).then(function(url){
			for(var i=0; i<$scope.articles.length; i++){
				var a = $scope.articles[i];
				if(a.id == $scope.data.id){
					a.title = $scope.data.articleTitle;
					a.description = $scope.data.articleDesc;
					a.coverImg = url;
					break;
				}
			}
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			LocalFileService.saveArticleList({articles: $scope.articles, currentArticle: $scope.currentArticle});
			LocalFileService.updateCoverImgUrl($scope.data.id, url, $scope.data.articleTitle, $scope.data.articleDesc);
		}, function(error){
			alert(JSON.stringify(error));
		});
		
		$scope.titleModel.hide();
	};
	
	$scope.removeArticle = function(uuid){
		$ionicPopup.confirm({
			title: '删除确认',
			template: '确定删除美好回忆？'
		}).then(function(res) {
			if(res) {
				LocalFileService.removeArticle(uuid).then(function(s){
					for(var i=0; i<$scope.articles.length; i++){
						var a = $scope.articles[i];
						if(a.id == uuid){
							$scope.articles.splice(i,1);
							break;
						}
					}
					if(!$scope.$$phase) {
						$scope.$apply();
					}
					LocalFileService.saveArticleList({articles: $scope.articles, currentArticle: $scope.currentArticle});
				}, function(e){
					
				});
			} else {
			   
			}
		});
		
	};
})
.controller('NewArticleCtrl', function($scope, $ionicModal, $state, $stateParams, $cordovaGeolocation, LocalFileService, CameraService,$ionicActionSheet){
	var articleList = [];
	var currentArticle = null;
	var currentParagraph = null;
	LocalFileService.listArticles().then(function(data){
		articleList = data.articles;
		articleList.splice(0,0,{'id': 'new', 'title': '新建游记'});
		$scope.articles = articleList;
		if(!data.currentArticle){
			$scope.data.article = $scope.articles[0];
		}
		else{
			for(var i=0; i<articleList.length; i++){
				if(articleList[i].id == data.currentArticle){
					$scope.data.article = $scope.articles[i];
					break;
				}
			}
		}
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}, function(err){
		alert(JSON.stringify(err));
	});
	$scope.images = [];
	$scope.sounds = [];
	$scope.data = {"text": "", "title": "", "location": {"name": "", "latitude": "", "longitude": ""}};
	
	if($stateParams.id != "new"){
		var articleUuid = $stateParams.id.split(",")[0];
		var paragraphUuid = $stateParams.id.split(",")[1];
		LocalFileService.readArticle(articleUuid).then(function(success){
			var currentArticle = success;
			var p = null;
			currentArticle.paragraphs.map(function(para){
				if(para.uuid == paragraphUuid){
					p = para;
					currentParagraph = para;
				}
			});
			if(p != null){
				$scope.data.title = p.title || "";
				$scope.images = p.images;
				$scope.sounds = p.sounds;
				$scope.data.text = p.text;
				$scope.data.location = p.location;
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
		}, function(error){
			alert(JSON.stringify(error));
		});
	}
	
	var posOptions = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };
	$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
		var lat  = position.coords.latitude;
		var long = position.coords.longitude;
		$scope.data.location.latitude = lat;
		$scope.data.location.longitude = long;
//            alert(lat);
//            alert(long);
		 
	}, function(err) {
		$scope.data.location.latitude = 0;
		$scope.data.location.longitude = 0;
	});
	
	function doSave(){
		var textNode = document.getElementById("templateText");
		var p = currentParagraph || {};
		if(!p.uuid){
			p.uuid = "P" + util.getUuid();
		}
		p.bookUuid = $scope.data.article.id;
		//p.title = "";
		p.text = textNode.innerText;//$scope.data.text;
		p.images = $scope.images;
		p.sounds = $scope.sounds;
		p.location = $scope.data.location;
		p.title = $scope.data.title;
		p.timestamp = new Date();
		
		LocalFileService.readArticle($scope.data.article.id).then(function(success){
			var currentArticle = success;
			var found = false;
			for(var i=0; i<currentArticle.paragraphs.length; i++){
				if(currentArticle.paragraphs[i].uuid == p.uuid){
					found = true;
					currentArticle.paragraphs[i] = p;
					break;
				}
			}
			if(!found){
				currentArticle.paragraphs.push(p);
			}
			
			LocalFileService.saveArticle(currentArticle, currentArticle.uuid).then(function(article){
				$state.go('timeline', {id: currentArticle.uuid});
			}, function(error){
				
			});
		}, function(error){
			alert(JSON.stringify(error));
		});
		
	}
	
	$scope.removeImg = function(index){
		$scope.images.splice(index,1);
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	};
	
	$scope.removeSound = function(index){
		$scope.sounds.splice(index,1);
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	};
	
	$scope.save = function(){
		if($scope.data.article.id == "new"){
			$scope.data.coverImg = "img/travel-default.png";
			$scope.titleModel.show();
		}
		else{
			doSave();
		}
	};
	
	function saveNewArticle(url, id, title, description){
		$scope.articles.splice(1,0,{'id': id, 'title': title, 'description': description, 'coverImg': url});
		$scope.data.article = $scope.articles[1];
		if(!$scope.$$phase) {
			$scope.$apply();
		}
		var articleList = [];
		for(var i=1; i<$scope.articles.length; i++){
			articleList.push($scope.articles[i]);
		}
		LocalFileService.saveArticle({'uuid': id, 'title': title, 'description': description, 'coverImg':url, 'paragraphs': []}, id).then(function(success){
			LocalFileService.saveArticleList({'articles':articleList, 'currentArticle': id}).then(function(success){
				doSave();
			}, function(err){
				alert(JSON.stringify(err));
			});
		}, function(error){
			alert(JSON.stringify(error));
		});
	}
	
	$scope.confirmNewArticle = function(){
		$scope.titleModel.hide();
		var title = $scope.data.articleTitle;
		var description = $scope.data.articleDesc;
		var coverImg = $scope.data.coverImg;
		var id = "A" + util.getUuid();
		if(coverImg == "img/travel-default.png"){
			saveNewArticle(coverImg, id, title, description);
		}
		else{
			LocalFileService.copyCoverImg(coverImg, id).then(function(url){
				saveNewArticle(url, id, title, description);
			}, function(e){
				alert(JSON.stringify(e));
			});
		}
	};
	
	$scope.changeCoverImg = function(){
		$ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-camera"></i>拍照片' },
				{ text: '<i class="icon ion-images"></i>从相册选取' }
			],
			cancelText: '取消',
			cancel: function () {
				// add cancel code..
			},
			buttonClicked: function (index) {
				if(index == 0){
					//taking photo
					CameraService.captureImage(util.img.width,util.img.height,util.img.quality).then(function(mediaFiles) {
						$scope.data.coverImg = mediaFiles;//[0].fullPath;
					}, function(err) {
						alert(err);
					});
				}
				else if(index == 1){
					//select from album
					CameraService.selectPicture(util.img.width,util.img.height,util.img.quality,1).then(function(results) {
						$scope.data.coverImg = results[0];
					}, function(err) {
						alert(err);
					});
				}
				return true;
			}
		});
	};
	
	$ionicModal.fromTemplateUrl('templates/photo-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
	
	$ionicModal.fromTemplateUrl('templates/newarticle-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.titleModel = modal;
    });
	
	$scope.openSelect = function(){
		//$scope.modal.show();
		$ionicActionSheet.show({
			buttons: [
				{ text: '<i class="icon ion-camera"></i>拍照片' },
				{ text: '<i class="icon ion-images"></i>从相册选取' }
			],
			cancelText: '取消',
			cancel: function () {
				// add cancel code..
			},
			buttonClicked: function (index) {
				if(index == 0){
					//taking photo
					captureImage();
				}
				else if(index == 1){
					//select from album
					selectPhoto();
				}
				return true;
			}
		});
	};
	
	$scope.closeSelect = function(){
		$scope.modal.hide();
	};
	
	$scope.closeNewArticle = function(){
		$scope.titleModel.hide();
	};
	
	function selectPhoto(){
		$scope.modal.hide();
	    CameraService.selectPicture(util.img.width,util.img.height,util.img.quality,5).then(function(results) {
		  for (var i = 0; i < results.length; i++) {
	        //alert('Image URI: ' + results[i]);
	        $scope.images.push({'url':results[i], 'title': ''});
	      }
		  if(!$scope.$$phase) {
			$scope.$apply();
		  }
	    }, function(err) {
	    	alert(err);
	    });
    };
	
	function captureImage(){
		$scope.modal.hide();
	    CameraService.captureImage(util.img.width,util.img.height,util.img.quality).then(function(mediaFiles) {
			$scope.images.push({'url':mediaFiles, 'title':''});
			if(!$scope.$$phase) {
				$scope.$apply();
			}
			/*
		    var i, path, len;
		    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        //alert(path);
		        $scope.images.push({'url':path, 'title':''});
			    if(!$scope.$$phase) {
					$scope.$apply();
				  }
		    }
			*/
	    }, function(err) {
	    	alert(err);
	    });
    };
	
	$scope.captureAudio  = function(){
	  CameraService.captureAudio ().then(function(mediaFiles) {
		    var i, path, len;
		    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        //alert(path);
		        $scope.sounds.push({'url':path, 'title':''});
			    if(!$scope.$$phase) {
					$scope.$apply();
				  }
		    }
	    }, function(err) {
	    	alert(err);
	    });
  };
})
.controller('ChatsCtrl', function($scope, CameraService, $cordovaMedia, $ionicLoading, FileService) {
//  $scope.chats = Chats.all();
//  $scope.remove = function(chat) {
//    Chats.remove(chat);
//  }
//  $scope.slideHasChanged = function (idx) {
//
//  }
	$scope.images = [];
	$scope.sounds = [];
	$scope.videos = [];
	
	$scope.play = function(src) {
		alert(src);
        var media = new Media(src, null, null, mediaStatusCallback);
        $cordovaMedia.play(media);
    }
 
    var mediaStatusCallback = function(status) {
        if(status == 1) {
            $ionicLoading.show({template: '正在加载...'});
        } else {
            $ionicLoading.hide();
        }
    }
    
    $scope.uploadPhoto = function(){
    	FileService.uploadImage().then(function(r){
    		alert(r.response);
    	}, function(err){
    		alert(JSON.stringify(err));
    	});
    };
	
  $scope.getPhoto = function() {
	  CameraService.getPicture().then(function(imageURI) {
		  //alert(imageURI);
		  $scope.images.push(imageURI);
		  if(!$scope.$$phase) {
				$scope.$apply();
			  }
    }, function(err) {
    	alert(err);
    });
  };
  
  $scope.selectPhoto = function(){
	  CameraService.selectPicture().then(function(results) {
		  for (var i = 0; i < results.length; i++) {
	        //alert('Image URI: ' + results[i]);
	        $scope.images.push(results[i]);
	      }
		  if(!$scope.$$phase) {
			$scope.$apply();
		  }
	    }, function(err) {
	    	alert(err);
	    });
  };
  
  $scope.captureImage = function(){
	  CameraService.captureImage(util.img.width,util.img.height,util.img.quality).then(function(mediaFiles) {
		    var i, path, len;
		    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        //alert(path);
		        $scope.images.push(path);
			    if(!$scope.$$phase) {
					$scope.$apply();
				  }
		    }
	    }, function(err) {
	    	alert(err);
	    });
  };
  
  $scope.captureVideo  = function(){
	  CameraService.captureVideo ().then(function(mediaFiles) {
		    var i, path, len;
		    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        //alert(path);
		        $scope.videos.push(path);
			    if(!$scope.$$phase) {
					$scope.$apply();
				  }
		    }
	    }, function(err) {
	    	alert(err);
	    });
  };
  
  $scope.captureAudio  = function(){
	  CameraService.captureAudio ().then(function(mediaFiles) {
		    var i, path, len;
		    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		        path = mediaFiles[i].fullPath;
		        // do something interesting with the file
		        //alert(path);
		        $scope.sounds.push(path);
			    if(!$scope.$$phase) {
					$scope.$apply();
				  }
		    }
	    }, function(err) {
	    	alert(err);
	    });
  };
  
  $scope.scanQrcode = function(){
	  CameraService.scanQrcode().then(function(result){
		  alert(JSON.stringify(result));
	  },function(err){
			alert(JSON.stringify(err));
	  });
  };
  
})

.controller('ViewArticleCtrl', function($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, ArticleService, FileService, LocalFileService,$ionicLoading) {
    $scope.chat = {};
	var articleId = $stateParams.id;
	LocalFileService.readArticle(articleId).then(function(data){
		$scope.chat = data;
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}, function(error){
		alert(JSON.stringify(error));
	});
	
	$scope.download = function(article){
		if(article && article.uuid){
			$ionicLoading.show({
				template: '<ion-spinner icon="bubbles"></ion-spinner><br/>正在下载!'
			});
			ArticleService.downloadArticle(article.uuid).then(function(){
				$ionicLoading.hide();
			},function(){
				$ionicLoading.hide();
			});
		}
	};
})

.controller('TimelineCtrl', function($scope, $state, $stateParams, $ionicModal, $ionicActionSheet, ArticleService, FileService, LocalFileService,$ionicPopup, $ionicLoading) {
    $scope.chat = {};
	var articleId = $stateParams.id;
	if(articleId == "current"){
		LocalFileService.listArticles().then(function(data){
			if(data.currentArticle){
				LocalFileService.readArticle(data.currentArticle).then(function(data){
					$scope.chat = data;
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}, function(error){
					alert(JSON.stringify(error));
				});
			}
		}, function(err){
			alert(JSON.stringify(err));
		});
	}
	else{
		LocalFileService.readArticle(articleId).then(function(data){
			$scope.chat = data;
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		}, function(error){
			alert(JSON.stringify(error));
		});
	}
	
	$scope.gotoArticles = function(){
		$state.go("myarticles");
	};
	
	$scope.removeParagraph = function(uuid){
		var idx = -1;
		for(var i=0; i<$scope.chat.paragraphs.length; i++){
			if($scope.chat.paragraphs[i].uuid == uuid){
				idx = i;
				break;
			}
		}
		if(idx < 0){
			return;
		}
		$ionicPopup.confirm({
			title: '删除确认',
			template: '确定删除？'
		}).then(function(res) {
			if(res) {
				$scope.chat.paragraphs.splice(idx, 1);
				LocalFileService.saveArticle($scope.chat, $scope.chat.uuid).then(function(success){
					if(!$scope.$$phase) {
						$scope.$apply();
					}
				}, function(error){
					
				});
			} else {
			   
			}
		});
		
	};
	$scope.editParagraph = function(articleUuid, paragraphUuid){
		$state.go('editor', {id: articleUuid + "," + paragraphUuid});
	};
	
	$ionicModal.fromTemplateUrl('templates/share-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
	
	$scope.download = function(article){
		if(article && article.uuid){
			$ionicLoading.show({
				template: '<ion-spinner icon="bubbles"></ion-spinner><br/>正在下载!'
			});
			ArticleService.downloadArticle(article.uuid).then(function(){
				$ionicLoading.hide();
			},function(){
				$ionicLoading.hide();
			});
		}
	};
	
	$scope.upload = function(article){
		var loggedIn = util.isLoggedIn();
		if(!loggedIn){
			$state.go("signin");
		}
		else{
			$ionicLoading.show({
				template: '<ion-spinner icon="bubbles"></ion-spinner><br/>正在发布游记!'
			});
			ArticleService.uploadArticle($scope.chat).then(function(data){
				$ionicLoading.hide();
				$ionicPopup.alert({
					title: '发布成功',
					template: "您已成功的发布了游记！"
				});
			}, function(){
				$ionicLoading.hide();
			});
		}
		if(!util.profile.techId){
			return;
		}
		LocalFileService.readGPS().then(function(gpsData){
			var txt = gpsData.text;
			if(txt == null || txt == ""){
				return;
			}
			var data = {"techId": util.profile.techId, "text": txt};
			FileService.uploadGps(data).then(function(success){
				LocalFileService.clearGps();
			}, function(){});
		}, function(){});
	};
	
	$scope.preview = function(article){
		self.location = "preview/leaves/leaves1.html";
	};
	
	function shareArticle(index){
		var loggedIn = util.isLoggedIn();
		if(!loggedIn){
			$state.go("signin");
			return;
		}
		$ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>正在发布游记!'
        });
		ArticleService.uploadArticle($scope.chat).then(function(data){
			$ionicLoading.hide();
			if(index == 0){
				//share to timeline
				Wechat.share({
					message: {
						title: $scope.chat.title || "",
						description: $scope.chat.description || "来自途八哥的游记",
						thumb: "www/img/thumbnail.png",
						mediaTagName: "TEST-TAG-001",
						messageExt: "这是第三方带的测试字段",
						messageAction: "<action></action>",
						media: {
							type: Wechat.Type.LINK,
							webpageUrl: "http://host.tubager.com/pages/index.html?uuid=" + $scope.chat.uuid
						}
					},
					scene: Wechat.Scene.TIMELINE   // share to Timeline
				}, function () {
					//alert("Success");
				}, function (reason) {
					//alert("Failed: " + reason);
				});
			}
			else if(index == 1){
				//share to friends
				Wechat.share({
					message: {
						title: $scope.chat.title || "",
						description: $scope.chat.description || "来自途八哥的游记",
						thumb: "www/img/thumbnail.png",
						mediaTagName: "",
						messageExt: "这是第三方带的测试字段",
						messageAction: "<action></action>",
						media: {
							type: Wechat.Type.LINK,
							webpageUrl: "http://host.tubager.com/pages/index.html?uuid=" + $scope.chat.uuid
						}
					},
					scene: Wechat.Scene.SESSION   // share to Timeline
				}, function () {
					alert("Success");
				}, function (reason) {
					alert("Failed: " + reason);
				});
			}
		}, function(){
			$ionicLoading.hide();
		});
	}
	
	$scope.openShare = function(){
		//$scope.modal.show();
		$ionicActionSheet.show({
			buttons: [
				{ text: '微信朋友圈' },
				{ text: '微信好友' }
			],
			titleText: '分享游记到',
			cancelText: '取消',
			cancel: function () {
				// add cancel code..
			},
			buttonClicked: function (index) {
				shareArticle(index);
				return true;
			}
		});
	};
	
	$scope.closeShare = function(){
		$scope.modal.hide();
	};
	
	$scope.shareToTimeline = function(){
		$scope.modal.hide();
	};
	
	$scope.shareToFriends = function(){
		$scope.modal.hide();
	};
})

.controller('AccountCtrl', function($scope, LocalFileService, $state, $ionicModal,$ionicPopup, ArticleService, $ionicLoading) {
    $scope.profile = util.profile;
	$scope.img = util.profile.img || "img/users/t1.jpg";
	if(util.profile.token && util.profile.token != ""){
		$scope.loggedIn = true;
	}
	else{
		$scope.loggedIn = false;
	}
	
	$scope.temp = {currentArticle: ""};
	$scope.articles = [];
	
	LocalFileService.listArticles().then(function(data){
		$scope.articles = data.articles;
		$scope.temp.currentArticle = data.currentArticle;
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}, function(err){
		alert(JSON.stringify(err));
	});
	
	$ionicModal.fromTemplateUrl('templates/defaultarticle-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.defaultModal = modal;
    });
	
	$scope.closeDefaultModal = function(){
		$scope.defaultModal.hide();
	};
	
	$scope.saveDefaultModal = function(){
		LocalFileService.saveArticleList({'articles':$scope.articles, 'currentArticle': $scope.temp.currentArticle}).then(function(){
			
		}, function(){});
		$scope.defaultModal.hide();
	};
	
	$scope.bookManagement = function(){
		$state.go("myarticles");
	};
	$scope.defaultManagement = function(){
		$scope.defaultModal.show();
	};
	$scope.downloadMyArticle = function(){
		$ionicLoading.show({
			template: '<ion-spinner icon="bubbles"></ion-spinner><br/>正在下载我的游记'
		});
		var myArticles = [];
		LocalFileService.listArticles().then(function(data){
			myArticles = data.articles;
			var idx = 0;
			ArticleService.getMyArticles().then(function(list){
				//$ionicLoading.hide();
				list.map(function(d){
					for(var i=0; i<myArticles.length; i++){
						if(myArticles[i].id == d.uuid || myArticles[i].uuid == d.uuid){
							return;
						}
					}
					idx++;
					ArticleService.downloadArticle(d.uuid).then(function(article){
						myArticles.push({'id': article.uuid, 'title': article.title, 'description': article.description, 'coverImg': article.coverImg});
						data.articles = myArticles;
						LocalFileService.saveArticleList(data);
						idx--;
						if(idx <= 0){
							$ionicLoading.hide();
						}
					}, function(){
						idx--;
						if(idx <= 0){
							$ionicLoading.hide();
						}
					});
				});
			}, function(){
				$ionicLoading.hide();
			});
		}, function(err){
			$ionicLoading.hide();
		});
	};
	$scope.downloadManagement = function(){
		
	};
	$scope.cacheClearing = function(){
		$ionicPopup.alert({
			title: '',
			template: '缓存清理完毕!'
		});
	};
	$scope.about = function(){
		
	};
  
});
