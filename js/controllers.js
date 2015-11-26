angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope,Sliders, $cordovaGeolocation, $ionicLoading, Recommendation) {
    $scope.sliders = Sliders.all();
    $scope.chats = Sliders.chats();
    Recommendation.getArticles().then(function(data){
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

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
