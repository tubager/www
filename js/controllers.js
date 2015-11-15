angular.module('starter.controllers', [])

.controller('DashCtrl', function ($scope,Sliders) {
    $scope.sliders = Sliders.all();
    $scope.chats = Sliders.chats();
})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
  $scope.slideHasChanged = function (idx) {

  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
