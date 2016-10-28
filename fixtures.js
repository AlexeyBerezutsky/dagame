(function(){
    'use strict';

    var inputToolsApp = angular.module('inputToolsApp',['inputTools']);

    inputToolsApp.controller('main',[
        '$scope',

        function($scope){
            $scope.somethingFromBE = 123.12321;

        }
    ]);

})();