// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    
  });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, $compileProvider) {
    $ionicConfigProvider.platform.android.tabs.position('bottom');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })
  .state('timeline',{
	  cache: false,
	  url: '/timeline/:id',
      templateUrl: 'templates/timeline.html',
      controller: 'TimelineCtrl'
  })
  .state('viewarticle',{
	  cache: false,
	  url: '/viewarticle/:id',
      templateUrl: 'templates/article.html',
      controller: 'ViewArticleCtrl'
  })
  .state('myarticles',{
	  cache: false,
	  url: '/myarticles',
      templateUrl: 'templates/my-articles.html',
      controller: 'MyArticlesCtrl'
  })
  .state('search',{
	  cache: false,
	  url: '/search/:id',
      templateUrl: 'templates/article-list.html',
      controller: 'ArticleListCtrl'
  })

  // Each tab has its own nav history stack:

  .state('tab.home', {
    url: '/home',
    views: {
      'tab-home': {
        templateUrl: 'templates/tab-home.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('editor', {
	  cache: false,
      url: '/editor/:id',
      templateUrl: 'templates/editor.html',
      controller: 'NewArticleCtrl'
    })

    .state('tab.settings', {
	  cache: false,
      url: '/account/settings',
      views: {
        'tab-account': {
          templateUrl: 'templates/account-settings.html',
          controller: 'AcntSettingsCtrl'
        }
      }
    })

    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })

    .state('signup', {
      url: '/sign-up',
      templateUrl: 'templates/sign-up.html',
      controller: 'SignUpCtrl'
    })

      .state('forgotpassword', {
        url: '/forgot-password',
        templateUrl: 'templates/forgot-password.html',
        controller: 'ForgetPwdCtrl'
      })

      .state('reclaimpassword', {
        url: '/reclaim-password',
        templateUrl: 'templates/reclaim-password.html',
        controller: 'ReclaimPwdCtrl'
      })
      .state('profile', {
		cache: false,
        url: '/account/profile',
		templateUrl: 'templates/account-profile.html',
        controller: 'AcntProfileCtrl'
      })
	/*
    .state('tab.chat-detail', {
      url: '/article/:id',
      views: {
        'tab-dash': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })
*/
  .state('tab.account', {
	cache: false,
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/home');
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|assets-library):/);

});
