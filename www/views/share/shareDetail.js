/**
 * Created by jay on 2015/10/15.
 */

shareModule
    .config(function($stateProvider){
        $stateProvider
            .state('tabs.shareDetail', {
                url: '/shareDetail',
                views: {
                    'share-tab': {
                        templateUrl: 'views/share/shareDetail.html',
                        controller: 'shareDetailCtrl'
                    }
                }
            });
    })
    .controller('shareDetailCtrl', function($scope,$rootScope,$ionicLoading) {
            //alert(angular.toJson($rootScope.shareFile));
        $scope.shareModel=function(mode){
            if (mode==1){
                return "公开的"
            }
            return "私密的"
        }
        $scope.passwordShow=function(mode){
            if (mode==1) return false;
            return true;
        }

    $scope.shareClick=function(){
      window.plugins.socialsharing.share('来自睿客网的分享文件：'+$rootScope.shareFile.name, null, null, 'http://rec.ustc.edu.cn/s/'+$rootScope.shareFile.url);
    }
    $scope.weixinShareClick=function(){
      window.plugins.socialsharing.shareVia('com.tencent.mm/com.tencent.mm.ui.tools.ShareImgUI',
        '来自睿客网的分享文件：'+$rootScope.shareFile.name, null, null,
        'http://rec.ustc.edu.cn/s/'+$rootScope.shareFile.url,
        null,null);
    }

    $scope.copyClick=function(){
      var text = 'http://rec.ustc.edu.cn/s/'+$rootScope.shareFile.url;
      cordova.plugins.clipboard.copy(text);
      $ionicLoading.show({
          template: "已复制到剪贴板",
          duration:1000
        }
      )

    }

    });
