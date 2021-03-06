angular.module("starter")

    .constant("ref", "http://localhost:8000")

    .controller("loginController", function ($rootScope, $scope, $http, ref, $state) {

        $scope.login = function (salesman) {
            console.log(salesman);
            $http.post(ref + "/api/salesmanLogin", salesman)
                .success(function (data) {
                    if (data.uniqueId) {
                        console.log(data);
                        $rootScope.salesmanDetails = data;
                        localStorage.setItem("token", data.uniqueId);
                        $state.go("dashboard");
                    }
                })
                .error(function (err) {
                    console.log(err);
                })
        }

    })

    .controller("dashboardController", function ($scope) {


    })

    .controller("orderController", function (ref, $http, $scope, $rootScope, $firebaseArray, $cordovaGeolocation) {

        var fireRef = new Firebase("https://salesmanapp101.firebaseio.com/")

        $scope.token = localStorage.getItem("token");
        $scope.orders = $firebaseArray(fireRef.child($scope.token));


        $http.get(ref + "/api/getProducts")
            .success(function (data) {
                console.log(data);
                $scope.products = data;
            }, function (err) {
                console.log(err);
            }
                )

        var posOptions = { timeout: 10000, enableHighAccuracy: false };

        // Save order and Salesman Location to firebase
        $scope.takeOrder = function (arg) {

            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {
                    $scope.lat = position.coords.latitude
                    $scope.lng = position.coords.longitude;

                    $scope.orders.$add({
                        name: arg.name,
                        quantity: arg.quantity,
                        sentBy: $rootScope.salesmanDetails.name,
                        firebaseToken: localStorage.getItem("token"),
                        recievedOn: Firebase.ServerValue.TIMESTAMP,
                        lat: $scope.lat,
                        lng: $scope.lng
                    })

                }, function (err) {
                    console.log(err);
                });



        }

    })