angular.module('fhooghle', ['ngRoute'])
    .controller('searchController', ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http){
        $scope.searchTrm = '';
        $scope.onSearchTrmChanged = function(){
            if($scope.searchTrm.length > 0){
                $http.get('https://api.github.com/search/users?q=' + $scope.searchTrm)
                .then(function(response){
                    //success
                    $rootScope.$broadcast('user_search_results_ready', response.data.items);
                }, 
                function(response){
                    //failure
                    console.log('failure');
                });
            }
            else{
                $rootScope.$broadcast('user_search_results_clear');
            }
        }
    }])
    .controller('resultsController', ['$scope', function($scope){
        $scope.users = [];
        $scope.$on('user_search_results_ready', function(e, d){
            $scope.users = d;
        })
        $scope.$on('user_search_results_clear', function(e, d){
            $scope.users = [];
        })
        
    }])
    .controller('gistsController', ['$scope', '$http', function($scope, $http){
        $scope.postGist = function(){
            console.log('creating gist...');
        }
        
    }])
    .config(function($routeProvider){
        $routeProvider
            .when('/gists', {
                templateUrl: 'gist.html',
                controller: 'gistsController'
            })
            .when('/default', {
                templateUrl: 'gist-info.html'
            })
            .otherwise('/default')
    })