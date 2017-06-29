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
    .controller('gistsController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
        $scope.userId = $routeParams.userId;

        var gistId = sessionStorage.getItem('fhooghle_' + $scope.userId);

        $scope.gistDescription = '';
        $scope.gistContent = '';

        if(gistId !== null){
            $http.get('https://api.github.com/gists/' + gistId).then(
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
            //if(gistId !== null){
                //58533015cf37482aa2d73d81ee2e6b45
                //first delete existing gist and then create new gist
                //$http.delete('https://api.github.com/gists/' + gistId);
                
                // $http.patch('https://api.github.com/gists/' + gistId, {
                //     "description": $scope.gistDescription,
                //     "files": {
                //         "gist.txt": {
                //             "content": $scope.gistContent
                //         }
                //     }
                // }).then(
                //     function(response){
                //         //success
                //     },
                //     function(response){
                //         //failure
                //         console.log(response);
                //     }
                // )
            //}
            //else {
                $http.post('https://api.github.com/gists', {
                    "description": $scope.gistDescription,
                    "public": true,
                    "files": {
                        "gist.txt": {
                            "content": $scope.gistContent
                        }
                    }
                }).then(
                    function(response){
                        //success
                        sessionStorage.setItem('fhooghle_' + $scope.userId, response.data.id);
                    },
                    function(response){
                        //failure
                        console.log(response);
                    }
                )
            //}

            
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