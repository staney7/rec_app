/**
 * Created by jay on 2015/8/28.
 */
angular.module("listModule", [])
    .config(function($stateProvider){
        $stateProvider
            .state('tabs.list', {
                url: '/list',
                views: {
                    'netdisk-tab': {
                        templateUrl: 'views/list/list.html',
                        controller: 'listCtrl'
                    }
                }
            });
    })
    .controller('listCtrl', function($scope,$ionicPopup,$rootScope,storageService,netdiskService,$state,$ionicLoading){
        $scope.file=null;
        $scope.popu=null;
        $scope.card=[false,false,false,false];
        $scope.click=function(id){

            $scope.card[id]=!$scope.card[id];
        };
        $scope.icon=function(id){
            if ($scope.card[id]==false){
                return "fa-angle-right"
            }
            return "fa-angle-down";
        };
        $scope.progressbarColor=function(file){
            if (file.status) return "progress-bar-info";
            else return "progress-bar-danger"
        };

    $scope.clearCompleteDownload=function(){
      var myPopup = $ionicPopup.show({
        template: '',
        title: '你确定要清除所有的已下载文件么？',
        scope: $scope,
        buttons: [
          {text: '取消'},
          {
            text: "删除",
            type: 'button-assertive',
            onTap: function (e){
              $rootScope.completeDownloadFileIndex=[];
              $rootScope.completeUploadFileIndex=[];
              storageService.set("completeDownloadFileIndex",$rootScope.completeDownloadFileIndex);
              storageService.set("completeUploadFileIndex",$rootScope.completeUploadFileIndex);
            }
          }
        ]
      });
    };
        $scope.completeDownloadListItemClick=function(file){
            var myPopup = $ionicPopup.show({
                template: '',
                title: '你确定要从列表中删除么',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                   {
                        text: "删除",
                        type: 'button-assertive',
                        onTap: function (e) {
                            var t,i;
                            for (i=0;i<$rootScope.completeDownloadFileIndex.length;i++){
                                if ($rootScope.completeDownloadFileIndex[i]==file) t=i;
                            }
                            //alert(t);
                            $rootScope.completeDownloadFileIndex.splice(t, 1);
                            storageService.set("completeDownloadFileIndex", $rootScope.completeDownloadFileIndex);
                        }
                    }
                ]
            });
        };
        $scope.restartDownload=function(file){
          $scope.popup.close();
          var id = file.file.id;
          var filename = file.file.name;
          var t = -1, i, j;
          for (j = 0; j < $rootScope.n; j++) {
            var temp = $rootScope.downloadOrder[j];
            //alert(temp);
            if ($rootScope.downloadFileIndex[temp] == file) t = j;
          }
          var a = {
            file: file.file,
            status: true,
            progress: 0,
            uploadTransfer:null
          };
          storageService.set("downloadFileIndex", $rootScope.downloadFileIndex);
          netdiskService.getDownloadUrl(id).then(
            function (url) {
              file.status = true;
              file.progress = 0;
              //alert(angular.toJson(url));
              netdiskService.downloadFile(url, filename, t).then(function () {
                  var i;
                  $rootScope.downloadFileIndex.splice($rootScope.downloadOrder[t], 1);
                  $rootScope.completeDownloadFileIndex.push(a);
                  $rootScope.downloadOrder[t] = -1;
                  for (i = t + 1; i < $rootScope.downloadOrder.length; i++) {
                    $rootScope.downloadOrder[i]--;
                  }
                  //alert(angular.toJson($rootScope.downloadFileIndex));
                  storageService.set("downloadFileIndex", $rootScope.downloadFileIndex);
                  storageService.set("completeDownloadFileIndex", $rootScope.completeDownloadFileIndex);
                }, function (errorinfo) {
                  $rootScope.downloadFileIndex[$rootScope.downloadOrder[t]].status = false;
                      if (errorinfo.info=="请先登录") {
                          $state.go("login");
                      }
                }
              );
            },
            function (error) {
              $ionicLoading.show({
                  template:error.info,
                  delay:0,
                  duration:1000
                }
              );
                if (error.info=="请先登录") {
                    $state.go("login");
                }
              //alert(angular.toJson(error));
            })
        };
    $scope.deleteDownloadFile=function(file){
                    $scope.popup.close();
                          var t = -1, i, j;
                          for (j = 0; j < $rootScope.n; j++) {
                              var temp = $rootScope.downloadOrder[j];
                              //alert(temp);
                              if ($rootScope.downloadFileIndex[temp] == file) t = j;
                          }
                          if (t != -1) {
                              $rootScope.downloadFileIndex.splice($rootScope.downloadOrder[t], 1);
                              $rootScope.downloadOrder[t] = 0;
                              for (i = t + 1; i < $rootScope.downloadOrder.length; i++) {
                                  $rootScope.downloadOrder[i]--;
                              }
                              storageService.set("downloadFileIndex", $rootScope.downloadFileIndex);
                          }
    }


        $scope.downloadListItemClick=function(file){
          $scope.file=file;
            if (!file.status) {
              $scope.popup=$ionicPopup.show({
                template: '<ion-list> <ion-item ng-click="deleteDownloadFile(file)">删除文件 </ion-item>'
                + '<ion-item ng-click="restartDownload(file)">重新下载 </ion-item>' +
                ' <ion-item ng-click="popup.close()">取消 </ion-item></ion-list>',
                title: "请选择操作",
                scope: $scope,
              });
            } else {
              //alert(angular.toJson($rootScope.downloadTransfer[0].abort));
              var myPopup = $ionicPopup.show({
                template: '',
                title: '你确定要停止下载么',
                scope: $scope,
                buttons: [
                  {text: '取消'},
                  {
                    text: "停止下载",
                    type: 'button-assertive',
                    onTap: function (e) {
                      file.transfer.abort();
                    }
                  }
                ]
              });
            }

        };

    $scope.fileUpload=function(fileOrder,res,files,t){
      //alert(angular.toJson(res));
      var i=fileOrder;

      var a={
        file:files[i],
        status:true,
        progress:0,
        uploadTransfer:null
      }

      var data={};
      data["id"]=files[i].name + i;
      data["url"]=res[data.id].url;
      data["token"]=res[data.id].token;
      data["params"] = {
        name: files[i].name,
        max_file_size: res[data.id].max_file_size,
        max_file_count: res[data.id].max_file_count,
        expires: res[data.id].expires,
        signature: res[data.id].signature,
        redirect: ""
      };
      data["filePath"]=files[i].nativeURL;
      //alert(angular.toJson(data));
      netdiskService.fileUpload(data.filePath, data.url, data.params,t).then(function () {
        //alert(token);
        netdiskService.fileUploadCompleteAPI(data.token).then(
          function () {
            var i;
            $rootScope.uploadFileIndex.splice($rootScope.uploadOrder[t],1);
            $rootScope.completeUploadFileIndex.push(a);
            $rootScope.uploadOrder[t]=0;
            for (i=t+1;i<$rootScope.uploadOrder.length;i++){
              $rootScope.uploadOrder[i]--;
            }
            storageService.set("uploadFileIndex",$rootScope.uploadFileIndex);
            storageService.set("completeUploadFileIndex",$rootScope.completeUploadFileIndex);
            //alert("success");
            $rootScope.Refresh();
          }
        );
      }, function (error) {
        $rootScope.uploadFileIndex[$rootScope.uploadOrder[t]].status=false;

          if (error.info=="请先登录") {
              $state.go("login");
          }
      });
    }

    $scope.restartUpload=function(file){
      $scope.popup.close();
      var id = file.file.id;
      var filename = file.file.name;
      var t = -1, i, j;
      for (j = 0; j < $rootScope.m; j++) {
        var temp = $rootScope.uploadOrder[j];
        //alert(temp);
        if ($rootScope.uploadFileIndex[temp] == file) t = j;
      }
      var a = {
        file: file.file,
        status: true,
        progress: 0,
        uploadTransfer:null
      }
      storageService.set("uploadFileIndex", $rootScope.uploadFileIndex);
      var files=[];
      files.push(file.file);
      //alert(angular.toJson(files));
      netdiskService.getFileUploadUrl(files).then(
        function(res){
          file.status = true;
          file.progress = 0;
          file.uploadTransfer=null;
          var i;
          for (i=0;i<files.length;i++) {
            $scope.fileUpload(i,res,files,t);
          }
        },function(error){
          $ionicLoading.show({
              template:error.info,
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



    $scope.deleteUploadFile=function(file) {
      $scope.popup.close();
      var t = -1, i, j;
      for (j = 0; j < $rootScope.m; j++) {
        var temp = $rootScope.uploadOrder[j];
        //alert(temp);
        if ($rootScope.uploadFileIndex[temp] == file) t = j;
      }
      if (t != -1) {
        $rootScope.uploadFileIndex.splice($rootScope.uploadOrder[t], 1);
        $rootScope.uploadOrder[t] = 0;
        for (i = t + 1; i < $rootScope.uploadOrder.length; i++) {
          $rootScope.uploadOrder[i]--;
        }
        storageService.set("uploadFileIndex", $rootScope.uploadFileIndex);
      }
    }


    $scope.uploadListItemClick=function(file){
      //alert(angular.toJson(file));
      $scope.file=file;
      if (!file.status) {
        $scope.popup=$ionicPopup.show({
          template: '<ion-list> <ion-item ng-click="deleteUploadFile(file)">取消上传 </ion-item>'
          + '<ion-item ng-click="restartUpload(file)">重新上传 </ion-item>' +
          ' <ion-item ng-click="popup.close()">取消 </ion-item></ion-list>',
          title: "请选择操作",
          scope: $scope,
        });
      } else{
        var myPopup = $ionicPopup.show({
          template: '',
          title: '你确定要停止下载么',
          scope: $scope,
          buttons: [
            {text: '取消'},
            {
              text: "停止下载",
              type: 'button-assertive',
              onTap: function (e) {
                file.transfer.abort();
              }
            }
          ]
        });

      }

    };


    $scope.completeUploadListItemClick=function(file){
      var myPopup = $ionicPopup.show({
        template: '',
        title: '你确定要从列表中删除么',
        scope: $scope,
        buttons: [
          {text: '取消'},
          {
            text: "删除",
            type: 'button-assertive',
            onTap: function (e) {
              var t,i;
              for (i=0;i<$rootScope.completeUploadFileIndex.length;i++){
                if ($rootScope.completeUploadFileIndex[i]==file) t=i;
              }
              $rootScope.completeUploadFileIndex.splice(t, 1);
              storageService.set("completeUploadListItemClick", $rootScope.completeUploadFileIndex);
            }
          }
        ]
      });
    };

        $scope.progressLength=function(file,t){
            if (t==1) {
                //alert(angular.toJson(file));
                return "width:" + file.progress + "%;height:10px;";
            }  else if (t==2){
                //alert(angular.toJson(file));
                return   "width:" + file.progress + "%;height:10px";
            }
        };
        $scope.getFileType= function(fileName){
            var temp=fileName.split(".");
            // alert(angular.toJson(temp));
            if (temp.length==1) return "OTHERS"

            var lastName=temp[temp.length-1];
            return lastName;
        };
       $scope.remainBytes=function(file){

           var a=Math.ceil(file.progress/100*file.file.bytes);
           var temp=$rootScope.bytesToOthers(a)+"/"+$rootScope.bytesToOthers(file.file.bytes);

           if (file.status)
           return temp;
           else return "下载失败";
       };
        $scope.percent=function(file){
          if (file.status) return file.progress.toFixed(2)+"%";
          else return "上传失败"
        }

    });
