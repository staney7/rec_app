angular.module('aboutMeModule', [])
.config(function($stateProvider){
	$stateProvider
		.state('tabs.aboutMe', {
			url: '/aboutMe',
			views: {
				'aboutMe-tab': {
					templateUrl: 'views/aboutMe/aboutMe.html',
					controller: 'aboutMeCtrl'
				}
			}
		});
})
	.constant('logoutAPI','http://rec.ustc.edu.cn/logout')
	.controller('aboutMeCtrl', function($scope, aboutMeService,logoutAPI,$http,$state,$ionicLoading,$q){
	// aboutMe controller

		$scope.setting=function () {
      window.plugins.socialsharing.share('Message only')
		}

		$scope.exit=function() {
			$ionicLoading.show({
					template: "正在登出，请稍候...",
					delay:0
				}
			);
			$http.get(logoutAPI).then(
				function (res) {
					$ionicLoading.hide();
					$ionicLoading.show({
							template: "登出成功",
							delay:0,
							duration:1000
						}
					);
					$state.go("login");
				},
				function (error) {

					$ionicLoading.hide();
					$ionicLoading.show({
							template: "登出失败，请检查网络",
							delay:0,
							duration:1000
						}
					);
					if (error.info=="请先登录") {
						$state.go("login");
					}
				}
			)
		}
});
