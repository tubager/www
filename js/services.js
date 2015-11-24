angular.module('starter.services', ['ionic', 'ngCordova'])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Andrew Jostlin',
    lastText: 'Did you get the ice cream?',
    face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
    id: 3,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 4,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];
  
  var sliders = [{
      id: 0,
      name: 'Ben Sparrow',
      img: 'img/banners/1.jpg'
  }, {
      id: 1,
      name: 'Max Lynx',
      img: 'img/banners/1.jpg'
  }, {
      id: 2,
      name: 'Andrew Jostlin',
      img: 'img/banners/1.jpg'
  }, {
      id: 3,
      name: 'Adam Bradleyson',
      img: 'img/banners/1.jpg'
  }, {
      id: 4,
      name: 'Perry Governor',
      img: 'img/banners/1.jpg'
  }];

  return {
      allSliders: function(){
          return sliders;
      },
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})
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
.service('Recommendation',function($http){
	var articles;
	return{
		getArticles: function(){
			var req = {
					method: 'GET',
					url: 'http://jsonplaceholder.typicode.com/users',
					//url: 'http://localhost:8080/book/99c8ca6c63f14b3f8bb85510bcdaae04',
					headers: {
						'Content-Type': 'application/json;charset=UTF-8',
					    'X-Auth-Token': "abcde"
					}
			};
			return $http.get('http://localhost:8080/books',{headers:{'Accept': 'application/json;charset=UTF-8','X-Auth-Token': "abcde"},data:{}}).then(function(items){
				articles = items.data;
				return articles;
			});
		}
	}
})
.factory('CameraService',['$q','$cordovaCamera', function($q,$cordovaCamera){
	return {
		getPicture: function(){
			var options = { 
		            quality : 75, 
		            destinationType : Camera.DestinationType.DATA_URL, 
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
		}
	}
}]);

