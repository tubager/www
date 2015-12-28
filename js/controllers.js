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
            alert(JSON.stringify(err));
        });
    }
})
.controller('NewArticleCtrl', function($scope, $ionicModal, $stateParams, LocalFileService, CameraService){
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
	$scope.data = {"text": "", "location": ""};
	
	function doSave(){
		var p = currentParagraph || {};
		if(!p.uuid){
			p.uuid = "P" + util.getUuid();
		}
		p.bookUuid = $scope.data.article.id;
		//p.title = "";
		p.text = $scope.data.text;
		p.images = $scope.images;
		p.sounds = $scope.sounds;
		p.location = $scope.data.location;
		
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
		if($stateParams.id == "new"){
			$scope.titleModel.show();
		}
		else{
			doSave();
		}
	};
	
	$scope.confirmNewArticle = function(){
		$scope.titleModel.hide();
		var title = $scope.data.articleTitle;
		var id = "A" + util.getUuid();
		$scope.articles.splice(1,0,{'id': id, 'title': title});
		$scope.data.article = $scope.articles[1];
		if(!$scope.$$phase) {
			$scope.$apply();
		}
		var articleList = [];
		for(var i=1; i<$scope.articles.length; i++){
			articleList.push($scope.articles[i]);
		}
		LocalFileService.saveArticle({'uuid': id, 'title': title, 'paragraphs': []}, id).then(function(success){
			LocalFileService.saveArticleList({'articles':articleList, 'currentArticle': id}).then(function(success){
				//alert("save sucessful");
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
	        $scope.images.push({'img':results[i], 'title': ''});
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
		        $scope.images.push({'img':path, 'title':''});
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

.controller('ChatDetailCtrl', function($scope, $stateParams, $ionicModal, ArticleService) {
  //$scope.chat = Chats.get($stateParams.chatId);
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
