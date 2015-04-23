// instantiate angular-js web app named bacster

var app = angular.module('bacster', ['ui.router', 'kendo.directives',
				      'ngCookies', 'ngGrid', 'ngResource', 'ngRoute']);

// defining directive 'dynamic' to be used for dynamic generation of html:
app.directive('dynamic', function ($compile) {
    return {
      restrict: 'A',
      replace: true,
      link: function (scope, ele, attrs) {
          scope.$watch(attrs.dynamic, function(html) {
	      ele.html(html);
	      $compile(ele.contents())(scope);
	  });
      }
    };
});

app.directive('a', function() {
    return {
      restrict: 'E',
      link: function(scope, elem, attrs) {
	  if(attrs.ngClick || attrs.href === '' || /^#dynamic-/.test(attrs.href)){
	      elem.on('click', function(e){
		  e.preventDefault();
	      });
	  }
      }
    };
});

app.config( function($httpProvider, $stateProvider, $urlRouterProvider) {
  /* Create url routes, and a root ui state named 'nav'. All other ui
   * states are declared to be children of nav. Nav state partials
   * will get loaded into the template nav.html.
   */
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
  $stateProvider
   .state('nav', {
      url: '/',
      templateUrl: '{{ STATIC_URL }}partials/nav.html',
      controller : 'navController'
    }) 
    .state('nav.home', {
      url: 'home',
      templateUrl: '{{ STATIC_URL }}partials/nav.home.html',
      controller: 'homeController'
    })
    .state('nav.search', {
      url: 'search',
      templateUrl: '{{ STATIC_URL }}partials/nav.search.html',
      controller: 'searchController'
    })
    .state('nav.search-result', {
      url: 'search/result',
      templateUrl: '{{ STATIC_URL }}partials/nav.search-result.html',
      controller: 'searchResultController'
    })
    .state('nav.collection', {
      url: 'collection', 
      templateUrl: '{{ STATIC_URL }}partials/nav.collection.html',
      controller: 'collectionController'
    })
    .state('nav.form-generate', {
      url: 'form-generate',
      templateUrl: '{{ STATIC_URL }}partials/nav.form-generate.html'
    })
    .state('nav.help', {
      url: 'help',
      templateUrl: '{{ STATIC_URL }}partials/nav.help.html'
    })
    .state('nav.about', {
      url: 'about',
      templateUrl: '{{ STATIC_URL }}partials/nav.about.html'
    })
    .state('nav.new-session', {
      url: 'new-session',
      templateUrl: '{{ STATIC_URL }}partials/nav.new-session.html',
      controller: 'sessionController'
    })  
    .state('nav.logs', {
      url: 'logs/:requestId',
      templateUrl: '{{ STATIC_URL }}partials/nav.logs.html',
      controller : 'workLogController'
    });
    
  // for any unmatched url, redirect to /home
  $urlRouterProvider.otherwise('/home');
  
});


// do some work when the app is started
app.run( function ($rootScope, $state, $stateParams) {
  
  /* 
   * It''s very handy to add references to $state and $stateParams to the
   * $rootScope so that you can access them from any scope within your
   * applications.For example, <li ng-class="{ active:
   * $state.includes('contacts.list') }"> will set the <li> to active
   * whenever'contacts.list' or one of its decendents is active.
   */
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
});

app.run(
    function($http, $cookies) {
        $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
        // Add the following two lines
        $http.defaults.xsrfCookieName = 'csrftoken';
        $http.defaults.xsrfHeaderName = 'X-CSRFToken';
    });
