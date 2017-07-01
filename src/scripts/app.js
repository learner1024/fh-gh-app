angular.module('fhooghle', ['ngRoute'])
    .factory('FhooghleDataService', ['$http', '$q', function($http, $q){
        return {
            searchUsers : function(searchTerm){
                return $http.get('https://api.github.com/search/users?q=' + searchTerm);
            },
            getGistById: function(gistId){
                return $http.get('https://api.github.com/gists/' + gistId);
            },
            createNewGist: function(gistDescription, gistContent){
                return $http.post('https://api.github.com/gists', {
                    "description": gistDescription,
                    "public": false,
                    "files": {
                        "gist.txt": {
                            "content": gistContent
                        }
                    }
                })
            }
        }}])
    .factory('FhooghleStorageService', function(){
        return {
            getItem: function(userId){
                return sessionStorage.getItem('fhooghle_' + userId);
            },
            setItem: function(userId, gistId){
                sessionStorage.setItem('fhooghle_' + userId, gistId);
            }
        }
    })
    .controller('searchController', ['$rootScope', '$scope', 'FhooghleDataService', function($rootScope, $scope, FhooghleDataService){
        $scope.searchTrm = '';
        $scope.onSearchTrmChanged = function(){
            if($scope.searchTrm.length > 0){
                FhooghleDataService.searchUsers($scope.searchTrm).then(
                    function(response){
                        //success
                        $rootScope.$broadcast('user_search_results_ready', response.data.items);
                    }, 
                    function(response){
                        //failure
                        console.log('failure');
                    }
                )
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
    .controller('gistsController', ['$scope', 'FhooghleDataService', '$routeParams', 'FhooghleStorageService', 
    function($scope, FhooghleDataService, $routeParams, FhooghleStorageService){
        $scope.userId = $routeParams.userId;

        var gistId = FhooghleStorageService.getItem($scope.userId);

        $scope.gistDescription = '';
        $scope.gistContent = '';

        if(gistId !== null){
            FhooghleDataService.getGistById(gistId).then(
                function(response){
                    $scope.gistDescription = response.data.description;
                    $scope.gistContent = response.data.files['gist.txt'].content;
                },
                function(response){
                    console.log(response);
                }
            )
        }

        $scope.postGist = function(){
            gistId = FhooghleStorageService.getItem($scope.userId);
            if(gistId === null){
                FhooghleDataService.createNewGist($scope.gistDescription, $scope.gistContent).then(
                    function(response){
                        //success
                        FhooghleStorageService.setItem($scope.userId, response.data.id);
                    },
                    function(response){
                        //failure
                        console.log(response);
                    }
                )
            }
        }
        
    }])
    .config(function($routeProvider){
        $routeProvider
            .when('/gists/:userId', {
                templateUrl: 'gist.html',
                controller: 'gistsController'
            })
            .when('/default', {
                templateUrl: 'gist-info.html'
            })
            .otherwise('/default')
    })