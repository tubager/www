angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope,Sliders, $cordovaGeolocation, $ionicLoading, ArticleService) {
    $scope.sliders = Sliders.all();
    $scope.chats = Sliders.chats();
    ArticleService.getArticles().then(function(data){
    	$scope.chats = data;
    });
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
    	
//    	$ionicLoading.show({
//            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
//        });
    	var posOptions = {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0
            };
    	if(!$cordovaGeolocation){
    		alert("$cordovaGeolocation not found");
    	}
    	$cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;
            $ionicLoading.hide();
//            alert(lat);
//            alert(long);
             
        }, function(err) {
            $ionicLoading.hide();
        });
    }
})
	
	.controller('AcntSettingsCtrl', function ($scope) { })

	.controller('SignInCtrl', function ($scope, LoginService, $ionicPopup, $state) {
		$scope.user = {};
		$scope.submitted = false;

		$scope.signIn = function () {
			if ($scope.signin_form.$valid) {
				LoginService.signIn($scope.user.username, $scope.user.password).success(function (user) {
					$state.go('tab.home');
				}).error(function (user) {
					var alertPopup = $ionicPopup.alert({
						title: 'Login failed!',
						template: 'Please check your credentials!'
					});
				});
			} else {
				$scope.signin_form.submitted = true;
			}
		};
	})

	.controller('SignUpCtrl', function ($scope, $state) {
		$scope.submitted = false;

		$scope.signUp = function (user) {
			if ($scope.signup_form.$valid) {

				console.log('Sign-Up', user);
				$state.go('tab.home');
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


	.controller('AcntProfileCtrl', function ($scope, $ionicActionSheet, $timeout, $ionicModal) {
		$scope.user = {
			username: 'OliviaHu',
			nickname: 'Olivia',
			email:'oliviahu@gmail.com',
			password: 'secret',
			gender: 'Female',
			region: 'China',
			lastWord: 'Enjoy Your Journey!'
		};
		$scope.tempname = $scope.user.username;
		$ionicModal.fromTemplateUrl('templates/profile-nickname.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal = modal;
		});
		$scope.openModal = function () {
			$scope.modal.show();
		};
		$scope.closeModal = function() {
			$scope.modal.hide();
		};
		$scope.saveModal = function () {
			$scope.user.username = $scope.tempname;
			$scope.modal.hide();
		};
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
		});
		$scope.$on('modal.hide', function() {
		});
		$scope.$on('modal.removed', function() {
		});

		$scope.showActionsheet = function () {
			// Show the action sheet
			var hideSheet = $ionicActionSheet.show({
				buttons: [
					{ text: 'Take Photo' },
					{ text: 'Choose from Photos' }
				],
				cancelText: 'Cancel',
				cancel: function () {
					// add cancel code..
					console.log('CANCELLED');
				},
				buttonClicked: function (index) {
					console.log('BUTTON CLICKED', index);
					return true;
				}
			});

			// For example's sake, hide the sheet after two seconds
			$timeout(function () {
				hideSheet();
			}, 2000);
		};
	})

	.controller('ProfileGenderCtrl', function ($scope) {
		$scope.user = {
			gender: 'Female'
		};
		$scope.genderList = [
			{ text: "Female", value: "Female" },
			{ text: "Male", value: "Male" }
		];

		$scope.genderUpdate = function (item) {
			console.log("Selected Gender, text:", item.text, "value:", item.value);
			$state.go('tab.profile');
		};
	})

	.controller('ProfilePasswordCtrl', function ($scope) {
		$scope.user = {
			password: 'secret'
		};
		$scope.oldPassword = "";
		$scope.newPassword = "";

		$scope.submitted = false;

		$scope.updatePassword = function () {
			if ($scope.updatepassword_form.$valid) {
				// �����ύ
				console.log('Update-Password', user);
				$state.go('tab.profile');
			} else {
				$scope.updatepassword_form.submitted = true;
			}
		};

		$scope.genderUpdate = function () {
			console.log('Profile', user);
			$state.go('tab.profile');
		};
	})

	.controller('ProfileLastWordCtrl', function ($scope) {
		$scope.user = {
			lastWord: 'Enjoy Your Journey!'
		};

		$scope.templastword = $scope.user.lastWord;

		$scope.closeModal = function() {
			$scope.modal.hide();
		};
		$scope.saveModal = function () {
			$scope.user.lastWord = $scope.templastword;
			$scope.modal.hide();
		};

		$scope.updateLastword = function () {
			console.log('Profile-lastword', user);
			$state.go('tab.profile');
		};
	})
.controller('MyArticlesCtrl', function($scope, $ionicModal,LocalFileService){
	var articleList = [];
	//$scope.articles = [{title: "AAAAAAA", id: "1111"}, {title: "BBBBBB", id: "222222"}];
	//return;
	$scope.articles = [];
	
	LocalFileService.listArticles().then(function(data){
		articleList = data.articles;
		$scope.articles = articleList;
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	}, function(err){
		alert(JSON.stringify(err));
	});
})
.controller('NewArticleCtrl', function($scope, $ionicModal, $state, $stateParams, $cordovaGeolocation, LocalFileService, CameraService){
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
	$scope.data = {"text": "", "location": {"name": "", "latitude": "", "longitude": ""}};
	
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
			
			LocalFileService.saveArticle(currentArticle, currentArticle.uuid).then(function(success){
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
			$scope.titleModel.show();
		}
		else{
			doSave();
		}
	};
	
	$scope.confirmNewArticle = function(){
		$scope.titleModel.hide();
		var title = $scope.data.articleTitle;
		var description = $scope.data.articleDesc;
		var id = "A" + util.getUuid();
		$scope.articles.splice(1,0,{'id': id, 'title': title, 'description': description});
		$scope.data.article = $scope.articles[1];
		if(!$scope.$$phase) {
			$scope.$apply();
		}
		var articleList = [];
		for(var i=1; i<$scope.articles.length; i++){
			articleList.push($scope.articles[i]);
		}
		LocalFileService.saveArticle({'uuid': id, 'title': title, 'description': description, 'paragraphs': []}, id).then(function(success){
			LocalFileService.saveArticleList({'articles':articleList, 'currentArticle': id}).then(function(success){
				doSave();
			}, function(err){
				alert(JSON.stringify(err));
			});
		}, function(error){
			alert(JSON.stringify(error));
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
		$scope.modal.show();
	};
	
	$scope.closeSelect = function(){
		$scope.modal.hide();
	};
	
	$scope.closeNewArticle = function(){
		$scope.titleModel.hide();
	};
	
	$scope.selectPhoto = function(){
		$scope.modal.hide();
	    CameraService.selectPicture().then(function(results) {
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
	
	$scope.captureImage = function(){
		$scope.modal.hide();
	    CameraService.captureImage().then(function(mediaFiles) {
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
	  CameraService.captureImage().then(function(mediaFiles) {
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

.controller('TimelineCtrl', function($scope, $state, $stateParams, $ionicModal, ArticleService, LocalFileService) {
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
		$scope.chat.paragraphs.splice(idx, 1);
		LocalFileService.saveArticle($scope.chat, $scope.chat.uuid).then(function(success){
			if(!$scope.$$phase) {
				$scope.$apply();
			}
		}, function(error){
			
		});
	};
	$scope.editParagraph = function(articleUuid, paragraphUuid){
		$state.go('editor', {id: articleUuid + "," + paragraphUuid});
	};
	/*
	$scope.chat = {
			title: "【小青岛】2015第一场说走就走的旅行",
			description: "ihuhu酱总体上要靠谱恩",
			coverImg: "img/banners/4.jpg",
			uuid: "12345678900000",
			paragraphs:[
			            {
			            	uuid: "0549c83b33a1440c8785e295dccee2c0",
			            	index: 1,
			            	title: "一些碎碎念",
			            	text:"我一直认为，女生一定要多旅行、多拍照片，很庆幸爱上摄影，这几年也去了不少地方，拍了很多风景，也给自己留下许多照片，每个时期都有不同的样子，我们不能让时间静止，但抓不住的留下瞬间也是好的！所以我每次旅行自己都会拍很多照片，记录那个时候我的样子！相信多年之后再回过头看自己拍过的照片、写过的游记，一定会感谢当时的自己！",
			            	timestamp: "2015-06-19 8:00:00",
			            	images:[
			            	        {
			            	        	url: "http://file29.mafengwo.net/M00/30/40/wKgBpVVkJYaAZe2CABTkFKvtNtg03.groupinfo.w680.jpeg",
			            	        	title: ""
			            	        }
			            	        ],
			            	vedio: null,
			            	audio: null
			            },
			            {
			            	uuid: "0549c83b33a1440c8785e295dccee2c1",
			            	index: 2,
			            	title: "三大教堂、劈柴院、天幕城",
			            	text: "",
			            	timestamp: "2015-06-19 9:00:00",
			            	images:[
			            	        {
			            	        	url: "http://file29.mafengwo.net/M00/2D/6A/wKgBpVVkItSAWRWpAAjeYbm0x8E36.groupinfo.w680.jpeg",
			            	        	title: "青岛天主教堂 "
			            	        },
			            	        {
			            	        	url: "http://file29.mafengwo.net/M00/2D/72/wKgBpVVkItmAGhAnAAstvs2yW8M11.groupinfo.w680.jpeg",
			            	        	title: "江苏路基督教堂 "
			            	        },
			            	        {
			            	        	url: "http://file29.mafengwo.net/M00/4F/E6/wKgBpVVnTneALNc3AAneKqgTp1w63.groupinfo.w680.jpeg",
			            	        	title: "劈柴院 "
			            	        }
			            	        ],
			            	vedio: null,
			            	audio: null
			            }
			           ]
	};
	*/
	$ionicModal.fromTemplateUrl('templates/share-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });
	
	$scope.upload = function(article){
		console.log(article);
		ArticleService.uploadArticle(article).then(function(data){
			console.log(data);
		});
	};
	
	$scope.preview = function(article){
		self.location = "preview/leaves/leaves1.html";
	};
	
	$scope.openShare = function(){
		$scope.modal.show();
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

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
