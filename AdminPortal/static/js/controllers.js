angular.module("app")

    .constant("fireRef", 'https://salesmanapp101.firebaseio.com/')

// #### Index.html Controller ####
    .controller("indexController", function ($rootScope, $scope) {
        $rootScope.headerName = "Salesman App";
        $rootScope.headerElements = true;
    })


// #### login.html Controller ####
    .controller("loginController", function ($rootScope, $scope, $http, $state, toastService) {
        $scope.progress1 = false;
        $scope.user = {};
        $scope.login = function () {
            $scope.progress1 = true;
            $http.post("api/login", { data: $scope.user })
                .success(function (response) {
                    if (response.token) {
                        localStorage.setItem('token', response.token);
                        $scope.progress1 = false;
                        $state.go("userProfile");
                        toastService.showSimpleToast('You are Logged in')
                    }
                    else{
                    $scope.progress1 = false;
                    toastService.showSimpleToast('Invalid User Name or Password')
                    $state.go("/login");
                    }
                })
                .error(function (err) {
                    console.log("error in sign in");
                    console.log(err);
                    $scope.progress1 = false;
                    $state.go("/login");
                })
        }

    })


// #### signup.html Controller ####
    .controller("signupController", function ($scope, $http, $state, toastService) {
        $scope.progress2 = false;
        $scope.user = {};
        $scope.saveData = function () {
            $scope.progress2 = true;
            $http.post("api/signup", { data: $scope.user })
                .success(function (data) {
                    toastService.showSimpleToast('successfully created your Account')
                    console.log(data);
                    console.log("successfully added (index.js)")
                    $scope.progress2 = false;
                    $state.go("login");
                })
                .error(function (err) {
                    $scope.progress2 = false;
                    console.log(err);
                })
        }

    })


// #### userprofile.html Controller ####
    .controller("userProfileController", function ($scope, $rootScope, getCompanyService, getSalesmenInfo, $mdDialog, $mdMedia, $http, fireRef, $firebaseArray, getUserName) {
        getUserName.getCurrentUser();        
        $rootScope.currentUser = localStorage.getItem('currentUser');      
           
        var fireRef = new Firebase(fireRef);

        $scope.token = localStorage.getItem("token");
        $scope.orders = $firebaseArray(fireRef.child($scope.token));
      


        $rootScope.headerElements = false;
        getCompanyService.getCompanyData()
            .then(function (response) {
                $scope.company = response.data;
                $scope.ifCompany = true;
            }, function (error) {
                console.log(error);
            })
        
        getSalesmenInfo.getSalesmanData()
            .then(function (response) {
                console.log(response.data)
                $scope.allSalesmen = response.data;
               console.log($scope.allSalesmen)
            }, function (error) {
                console.log(error);
            })
        
        
        //add salesman FAB Button code
        $scope.showAdvanced = function (ev) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            $mdDialog.show({
                controller: addSalesmenController,
                templateUrl: '../templates/addSalesmen.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            })
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };

        function addSalesmenController($rootScope, $http, $scope, $mdDialog, $state, toastService) {

            $scope.createSalesman = function () {
                $scope.salesman.uniqueId = localStorage.getItem("token");
                $http.post("api/newSalesman", $scope.salesman)
                    .success(function () {
                        toastService.showSimpleToast('New salesman created successfully')
                        $mdDialog.hide();
                        $state.go($state.current, {}, { reload: true })
                    })
            }

            
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
        
        
        //add Product Button code
        $scope.addProduct = function (ev) {
            var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
            $mdDialog.show({
                controller: addProductController,
                templateUrl: '../templates/addProduct.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            })
            $scope.$watch(function () {
                return $mdMedia('xs') || $mdMedia('sm');
            }, function (wantsFullScreen) {
                $scope.customFullscreen = (wantsFullScreen === true);
            });
        };


        function addProductController($scope, $mdDialog, $http) {
            $scope.product = {
                firebaseToken: localStorage.getItem("token")
            }

            $scope.addProduct = function () {
                $http.post("api/addProduct", $scope.product)
                    .success(function (response) {
                        console.log(response);
                        console.log($scope.product)
                    })
                    .error(function (err) {
                        console.log(err);
                    })
            }
            
            $scope.hide = function () {
                $mdDialog.hide();
            };
            $scope.cancel = function () {
                $mdDialog.cancel();
            };
        }
        
        $scope.exInfo = true;
        
        $scope.clickIcon = 'expand_more';
        
        $scope.clickToMorph = function (index) {
                    if($scope.allSalesmen[index].more){
                   $scope.allSalesmen[index].more = null;                  
              }else{
                   $scope.allSalesmen[index].more = 'expand_less';
              }        
        }
     
    })
    
    
// #### company.html Controller ####
    .controller("newCompanyController", function ($scope, $rootScope, $http, $state, toastService) {

        $scope.token = localStorage.getItem("token");
        $scope.companyInfo = {};
        $scope.companyInfo.adminId = $scope.token;
        console.log($scope.companyInfo);
        console.log($scope.companyInfo.adminId);

        $scope.createCompany = function () {
            $http.post("api/newCompany", $scope.companyInfo)
                .then(function (data) {
                    toastService.showSimpleToast('Successfully created your Company')
                    console.log(data + "from newCompanyController");
                    $state.go("userProfile")

                }, function (err) {
                    console.log(err);
                })

        }
    })


// #### viewProducts.html Controller ####
    .controller("productsController", function ($scope, $rootScope, $http, getUserName) {
        getUserName.getCurrentUser();        
        $rootScope.currentUser = localStorage.getItem('currentUser');      
        
        $rootScope.currentUser = $rootScope.currentUser
        $rootScope.headerElements = false;
        $http.get("api/getProducts")
            .success(function (data) {
                console.log(data);
                $scope.products = data;
                console.log($scope.products);
            })
            .error(function (err) {
                console.log(err);
            })
    })


// #### orders.html Controller ####
    .controller("ordersController", function ($scope, $rootScope, $http, fireRef, $firebaseArray, $state, getUserName, toastService) {
        getUserName.getCurrentUser();        
        $rootScope.currentUser = localStorage.getItem('currentUser');      
        
    $rootScope.currentUser = $rootScope.currentUser
        $rootScope.headerElements = false;
        var fireRef = new Firebase(fireRef);

        $scope.token = localStorage.getItem("token");
        $scope.orders = $firebaseArray(fireRef.child($scope.token));

        // Save to order to MongoDB and remove it from Firebase    
        $scope.sendDelivery = function (index) {
            $http.post("api/orders", $scope.orders[index])
                .success(function (data) {
                    console.log(data)
                    toastService.showSimpleToast('Operation Successfull');
                    $scope.orders.$remove(index);
                })
                .error(function (err) {
                    console.log(err)
                })
        }
    })


// #### location.html Controller ####
    .controller('locationController', function ($scope, $rootScope, $state, $stateParams, getUserName) {
        getUserName.getCurrentUser();        
        $rootScope.currentUser = localStorage.getItem('currentUser');      

        $scope.lat = $stateParams.lat * 1;
        $scope.lng = $stateParams.lng * 1;

        angular.extend($scope, {
            center: {
                lat: $scope.lat,
                lng: $scope.lng,
                zoom: 20
            },
            markers: {
                marker: {
                    lat: $scope.lat,
                    lng: $scope.lng,
                    message: "Order Location",
                    focus: true,
                    draggable: false
                }},
                layers: {
                    baselayers: {
                        googleTerrain: {
                            name: 'Google Terrain',
                            layerType: 'TERRAIN',
                            type: 'google'
                        },
                        googleHybrid: {
                            name: 'Google Hybrid',
                            layerType: 'HYBRID',
                            type: 'google'
                        },
                        googleRoadmap: {
                            name: 'Google Streets',
                            layerType: 'ROADMAP',
                            type: 'google'
                        }
                    }
                },
                defaults: {
                    scrollWheelZoom: false
                }
            })
    })