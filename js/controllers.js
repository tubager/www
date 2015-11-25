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

.controller('ChatsCtrl', function($scope, Chats, CameraService) {
//  $scope.chats = Chats.all();
//  $scope.remove = function(chat) {
//    Chats.remove(chat);
//  }
//  $scope.slideHasChanged = function (idx) {
//
//  }
  $scope.getPhoto = function() {
	  CameraService.getPicture().then(function(imageURI) {
		  alert(imageURI);
    }, function(err) {
    	alert(err);
    });
  };
  
  $scope.selectPhoto = function(){
	  CameraService.selectPicture().then(function(results) {
		  for (var i = 0; i < results.length; i++) {
		        alert('Image URI: ' + results[i]);
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
		        alert(path);
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
		        alert(path);
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
		        alert(path);
		    }
	    }, function(err) {
	    	alert(err);
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
