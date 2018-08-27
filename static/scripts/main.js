let inventory = angular.module("inventory", ['api', "ui.router", "ngTable"], function ($compileProvider) {
    $compileProvider.directive('compile', "detailTrackedTable", "scrollpin", function ($compile, $timeout) {
        return {
            link: function (scope, element, attrs) {
                scope.$watch(
                    function (scope) {
                        return scope.$eval(attrs.compile);
                    },
                    function (value) {
                        element.html(value);
                        $compile(element.contents())(scope);
                    }
                );
            }
        };
    })
});
inventory.run(['$rootScope', '$state', '$stateParams',
    function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }
]);
//The basic config. Router state using ui-router.
inventory.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state("login", {
                url: "/login/",
                templateUrl: "views/login.html",
                controller: "loginCtrl"
            })
            .state("overview", {
                url: "/main/",
                templateUrl: "views/main.html",
                controller: "mainCtrl"
            })
            .state("detail", {
                url: "/detail/:geo",
                templateUrl: "views/detail.html",
                controller: "detailCtrl"
            });
        //Redirect all other state to the main page.
        //If pages go wrong, just remove this.
        $urlRouterProvider.otherwise('/login/');
    }
]);

//Basic bind & run function. Don't remove this plz.
//Login
inventory.controller("loginCtrl", util.getParam(function ($scope, socket, $http, $state, $rootScope) {
    let username = document.getElementById("username");
    let password = document.getElementById("password");
    socket.emit("getUserList");
    socket.on("userListReply", function (userdata) {
        $scope.login = () => {
            let income = {
                username: $scope.username,
                password: $scope.password,
            };
            if (userdata.indexOf($scope.username) != -1) {
                alert("请勿重复登录");
            }
            else {
                sessionStorage.setItem("username", $scope.username);
                sessionStorage.setItem("password", $scope.password);
                socket.emit('login', income);
                socket.on('loginReply', function (data) {
                    if (data.status == "success") {
                        alert(data.message);
                        $state.go('overview');
                        $rootScope.linelist = data.data;
                    }
                    else {
                        alert(data.message);
                    }
                })
            }
        };
    });
}));
//main
inventory.controller("mainCtrl", util.getParam(function ($scope, socket, $http, $state) {
    $scope.name_value = sessionStorage.getItem("username");
    $scope.goDetail = (gc) => {
        $state.go('detail', {geo: gc});
        let filter_groups = document.getElementsByClassName("ng-table-filters");
        for (let i = 0; i < filter_groups.length; i++) {
            filter_groups[i].style.display = 'none';
        }
    };
    socket.emit("getDetail", geo = "HKEN")
    socket.on('detailReply', function (data) {
        $scope.HMdata = data;
    })
    socket.emit("getDetail", geo = "TW")
    socket.on('detailReply', function (data) {
        $scope.TWdata = data
    })
    socket.emit("getDetail", geo = "CN")
    socket.on('detailReply', function (data) {
        $scope.CNdata = data
    })
    socket.emit("getOverview");
    socket.on("overviewReply", function (data) {
        $scope.userDate = data;
        let arr = [];
        let newArr = [];
        for (let m in data) {
            for (let p in data[m]) {
                arr.push(p);
            }
        }
        let len = arr.length;
        let tmp = {};
        for (let i = 0; i < len; i++) {
            if (!tmp[arr[i]]) {
                tmp[arr[i]] = 1;
                newArr.push(arr[i]);
                newArr.sort();
            }
        }
        $scope.newDate = newArr;
    })
}));
//detail.html
inventory.controller("detailCtrl", (function ($scope, socket, $window,$http, NgTableParams, $state, $stateParams, $rootScope, $location, $filter) {
    let url = $location.url();
    let sumChanges=(id)=>{
        let map = {};
        //sum
        for (let p in id) {
            map[id[p].Category] = map[id[p].Category] || {
                    Category: id[p].Category,
                    Total_Words: 0,
                    Words_to_Edit: 0,
                    Words_to_Translate: 0
                    // setdata: []
                };
            // map[Data[p].Category].setdata.push(Data[p]);
            map[id[p].Category].Total_Words += Number(id[p].Total_Words);
            map[id[p].Category].Words_to_Edit += Number(id[p].Words_to_Edit);
            map[id[p].Category].Words_to_Translate += Number(id[p].Words_to_Translate);
        }
        $scope.groups = id;
        $scope.sum = (data, filed) => {
            let sum;
            for (let i in map) {
                for (let k in data) {
                    if (i == data[k].Category) {
                        sum = map[i][filed];
                        return sum;
                    }
                }

            }
        };
    }
    $scope.getOverview = () => {
        $state.go('overview');
    };
    $scope.goDetail = (newGeo) => {
        socket.emit("editFinish");
        $state.go('detail', {geo: newGeo});
    };
    let loginName = sessionStorage.getItem("username");
    let inputGeo = $stateParams.geo;
    let detailDate;
    if(url.indexOf("&")!=-1){
        sessionStorage.removeItem('username');
        sessionStorage.removeItem("password");
        let searchPa = $location.search();
        $scope.linelist = $rootScope.linelist;
        socket.emit('getDetail', (geo = searchPa.geo));
        socket.on('detailReply', function (Data) {
            //Set ID
            for (let a in Data) {
                Data[a]['ID'] = a;
            }
            let map = {};
            //sum
            for (let p in Data) {
                map[Data[p].Category] = map[Data[p].Category] || {
                        Category: Data[p].Category,
                        Total_Words: 0,
                        Words_to_Edit: 0,
                        Words_to_Translate: 0
                        // setdata: []
                    };
                // map[Data[p].Category].setdata.push(Data[p]);
                map[Data[p].Category].Total_Words += Number(Data[p].Total_Words);
                map[Data[p].Category].Words_to_Edit += Number(Data[p].Words_to_Edit);
                map[Data[p].Category].Words_to_Translate += Number(Data[p].Words_to_Translate);
            }
            ;
            $scope.sum = (data, filed) => {
                let sum;
                for (let i in map) {
                    for (let k in data) {
                        if (i == data[k].Category) {
                            sum = map[i][filed];
                            return sum;
                        }
                    }

                }
            };
            $scope.groups = Data;
            detailDate = Data;
            $scope.tableParams = new NgTableParams(
                {group: {Category: "desc"}},
                {dataset: Data, groupOptions: {isExpanded: false}});

            let filterSearch = (id) => {
                for (let k in detailDate) {
                    let newData = $filter("filter")(detailDate, id);
                    $scope.groups = newData;
                    $scope.tableParams = new NgTableParams(
                        {group: {Category: "desc"}},
                        {dataset: newData, groupOptions: {isExpanded: false}});
                }
            }
            $scope.search = () => {
                let text = $scope.search.text;
                filterSearch(text);
            }
            /* else if (model == 'Radar') {
             let Radar = $scope.search.filterRadar;
             filterSearch(Radar);
             }
             else if (model == "PageName") {
             let PageName = $scope.search.filterPage_name;
             filterSearch(PageName);
             }
             else if (model == 'ReferURL') {
             let ReferURL = $scope.search.filterReference_URL;
             filterSearch(ReferURL);
             }
             else if (model == 'GeoLocal') {
             let GeoLocal = $scope.search.filterGeo_Local_URL;
             filterSearch(GeoLocal);
             }
             else if (model == 'Notes') {
             let Notes = $scope.search.filterNotes;
             filterSearch(Notes);
             }
             else if (model == 'WsId') {
             let WsId = $scope.search.filterWS_ID;
             filterSearch(WsId);
             }
             else if (model == 'WordsTrans') {
             let WordsTrans = $scope.search.filterWords_to_Translate;
             filterSearch(WordsTrans);
             }
             else if (model == 'WordsEdit') {
             let WordsEdit = $scope.search.filterWords_to_Edit;
             filterSearch(WordsEdit);
             }
             else if (model == 'TotalWords') {
             let TotalWords = $scope.search.filterTotal_Words;
             filterSearch(TotalWords);
             }
             else if (model == 'Assignee') {
             let Assignee = $scope.search.filterAssignee;
             filterSearch(Assignee);
             }
             else if (model == 'CdDg') {
             let CdDg= $scope.search.filterCD_Delegate;
             filterSearch(CdDg);
             }
             else if (model == 'Type') {
             let Type = $scope.search.filterType;
             filterSearch(Type);
             }
             else if (model == 'WIsvDay') {
             let WIsvDay = $scope.search.filterWriter_ISV_Due_Day;
             filterSearch(WIsvDay);
             }
             else if (model == 'CDIsvDay') {
             let CDIsvDay = $scope.search.filterCD_ISV_Due_day;
             filterSearch(CDIsvDay);
             }
             else if (model == 'ACDIsvDay') {
             let ACDIsvDay = $scope.search.filterArt_CD_ISV_Due_day;
             filterSearch(ACDIsvDay);
             }
             else if (model == 'XFIsvDay') {
             let XFIsvDay = $scope.search.filterXF_ISV_Due_day;
             filterSearch(XFIsvDay);
             }
             else if (model == "GPDay") {
             let GPDay = $scope.search.filterGraphic_Due_day;
             filterSearch(GPDay);
             }*/
        });
        socket.emit('getGroupStatus', searchPa.group);
        socket.on("groupStatusReply", function (data) {
            $scope.linelist = data;
            $scope.$watch("linelist", function (newValue) {
                for (let m in data) {
                    if (data[m].title == "Category") {
                        if (data[m].show == true) {
                            $scope.isCategory = true;
                            $scope.removeColumn_Category = true;
                        }
                        else {
                            $scope.isCategory = false;
                            $scope.removeColumn_Category = false;
                        }
                    }
                    if (data[m].title == "Radar") {
                        if (data[m].show == true) {
                            $scope.isRadar = true;
                            $scope.removeColumn_Radar = true;
                        }
                        else {
                            $scope.isRadar = false;
                            $scope.removeColumn_Radar = false;
                        }
                    }
                    if (data[m].title == "Page_Name") {
                        if (data[m].show == true) {
                            $scope.isPage_Name = true;
                            $scope.removeColumn_Page_Name = true;
                        }
                        else {
                            $scope.isPage_Name = false;
                            $scope.removeColumn_Page_Name = false;
                        }
                    }
                    if (data[m].title == "Reference_URL") {
                        if (data[m].show == true) {
                            $scope.isReference_URL = true;
                            $scope.removeColumn_Reference_URL = true;
                        }
                        else {
                            $scope.isReference_URL = false;
                            $scope.removeColumn_Reference_URL = false;
                        }
                    }
                    if (data[m].title == "Geo_Locale_URL") {
                        if (data[m].show == true) {
                            $scope.isGeo_Locale_URL = true;
                            $scope.removeColumn_Geo_Locale_URL = true;
                        }
                        else {
                            $scope.isGeo_Locale_URL = false;
                            $scope.removeColumn_Geo_Locale_URL = false;
                        }
                    }
                    if (data[m].title == "Notes") {
                        if (data[m].show == true) {
                            $scope.isNotes = true;
                            $scope.removeColumn_Notes = true;
                        }
                        else {
                            $scope.isNotes = false;
                            $scope.removeColumn_Notes = false;
                        }
                    }
                    if (data[m].title == "WS_ID") {
                        if (data[m].show == true) {
                            $scope.isWS_ID = true;
                            $scope.removeColumn_WS_ID = true;
                        }
                        else {
                            $scope.isWS_ID = false;
                            $scope.removeColumn_WS_ID = false;
                        }
                    }
                    if (data[m].title == "WS_Task") {
                        if (data[m].show == true) {
                            $scope.isWS_Task = true;
                            $scope.removeColumn_WS_Task = true;
                        }
                        else {
                            $scope.isWS_Task = false;
                            $scope.removeColumn_WS_Task = false;
                        }
                    }
                    if (data[m].title == "Words_to_Translate") {
                        if (data[m].show == true) {
                            $scope.isWords_to_Translate = true;
                            $scope.removeColumn_Words_to_Translate = true;
                        }
                        else {
                            $scope.isWords_to_Translate = false;
                            $scope.removeColumn_Words_to_Translate = false;
                        }
                    }
                    if (data[m].title == "Words_to_Edit") {
                        if (data[m].show == true) {
                            $scope.isWords_to_Edit = true;
                            $scope.removeColumn_Words_to_Edit = true;
                        }
                        else {
                            $scope.isWords_to_Edit = false;
                            $scope.removeColumn_Words_to_Edit = false;
                        }
                    }
                    if (data[m].title == "Total_Words") {
                        if (data[m].show == true) {
                            $scope.isTotal_Words = true;
                            $scope.removeColumn_Total_Words = true;
                        }
                        else {
                            $scope.isTotal_WordsL = false;
                            $scope.removeColumn_Total_Words = false;
                        }
                    }
                    if (data[m].title == "Assignee") {
                        if (data[m].show == true) {
                            $scope.isAssignee = true;
                            $scope.removeColumn_Assignee = true;
                        }
                        else {
                            $scope.isAssignee = false;
                            $scope.removeColumn_Assignee = false;
                        }
                    }
                    if (data[m].title == "CD_Delegate") {
                        if (data[m].show == true) {
                            $scope.isCD_Delegate = true;
                            $scope.removeColumn_CD_Delegate = true;
                        }
                        else {
                            $scope.isCD_Delegate = false;
                            $scope.removeColumn_CD_Delegate = false;
                        }
                    }
                    if (data[m].title == "CD_Review") {
                        if (data[m].show == true) {
                            $scope.isCD_Review = true;
                            $scope.removeColumn_CD_Review = true;
                        }
                        else {
                            $scope.isCD_Review = false;
                            $scope.removeColumn_CD_Review = false;
                        }
                    }
                    if (data[m].title == "Type") {
                        if (data[m].show == true) {
                            $scope.isType = true;
                            $scope.removeColumn_Type = true;
                        }
                        else {
                            $scope.isType = false;
                            $scope.removeColumn_Type = false;
                        }
                    }
                    if (data[m].title == "Writer_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isWriter_ISV_Ready = true;
                            $scope.removeColumn_Writer_ISV_Ready = true;
                        }
                        else {
                            $scope.isWriter_ISV_Ready = false;
                            $scope.removeColumn_Writer_ISV_Ready = false;
                        }
                    }
                    if (data[m].title == "Writer_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isWriter_ISV_Due_Day = true;
                            $scope.removeColumn_Writer_ISV_Due_day = true;
                        }
                        else {
                            $scope.isWriter_ISV_Due_Day = false;
                            $scope.removeColumn_Writer_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "CD_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isCD_ISV_ready = true;
                            $scope.removeColumn_CD_ISV_ready = true;
                        }
                        else {
                            $scope.isCD_ISV_ready = false;
                            $scope.removeColumn_CD_ISV_ready = false;
                        }
                    }
                    if (data[m].title == "CD_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isCD_ISV_Due_day = true;
                            $scope.removeColumn_CD_ISV_Due_day = true;
                        }
                        else {
                            $scope.isCD_ISV_Due_day = false;
                            $scope.removeColumn_CD_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "CD_ISV_Approved") {
                        if (data[m].show == true) {
                            $scope.isCD_ISV_Approved = true;
                            $scope.removeColumn_CD_ISV_Approved = true;
                        }
                        else {
                            $scope.isCD_ISV_Approved = false;
                            $scope.removeColumn_CD_ISV_Approved = false;
                        }
                    }
                    if (data[m].title == "Art_CD_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isArt_CD_ISV_Ready = true;
                            $scope.removeColumn_Art_CD_ISV_Ready = true;
                        }
                        else {
                            $scope.isArt_CD_ISV_Ready = false;
                            $scope.removeColumn_Art_CD_ISV_Ready = false;
                        }
                    }
                    if (data[m].title == "Art_CD_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isArt_CD_ISV_Due_day = true;
                            $scope.removeColumn_Art_CD_ISV_Due_day = true;
                        }
                        else {
                            $scope.isArt_CD_ISV_Due_day = false;
                            $scope.removeColumn_Art_CD_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "XF_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isXF_ISV_Ready = true;
                            $scope.removeColumn_XF_ISV_Ready = true;
                        }
                        else {
                            $scope.isXF_ISV_Ready = false;
                            $scope.removeColumn_XF_ISV_Ready = false;
                        }
                    }
                    if (data[m].title == "XF_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isXF_ISV_Due_day = true;
                            $scope.removeColumn_XF_ISV_Due_day = true;
                        }
                        else {
                            $scope.isXF_ISV_Due_day = false;
                            $scope.removeColumn_XF_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "Graphic_Ready") {
                        if (data[m].show == true) {
                            $scope.isGraphic_Ready = true;
                            $scope.removeColumn_Graphic_Ready = true;
                        }
                        else {
                            $scope.isGraphic_Ready = false;
                            $scope.removeColumn_Graphic_Ready = false;
                        }
                    }
                    if (data[m].title == "Graphic_Due_day") {
                        if (data[m].show == true) {
                            $scope.isGraphic_Due_day = true;
                            $scope.removeColumn_Graphic_Due_day = true;
                        }
                        else {
                            $scope.isGraphic_Due_day = false;
                            $scope.removeColumn_Graphic_Due_day = false;
                        }
                    }
                }
            }, true);
            let show_column = () => {
                for (let m in data) {
                    if (data[m].title == "Category") {
                        if (data[m].show == true) {
                            $scope.isCategory = true;
                            $scope.removeColumn_Category = true;
                        }
                        else {
                            $scope.isCategory = false;
                            $scope.removeColumn_Category = false;
                        }
                    }
                    if (data[m].title == "Radar") {
                        if (data[m].show == true) {
                            $scope.isRadar = true;
                            $scope.removeColumn_Radar = true;
                        }
                        else {
                            $scope.isRadar = false;
                            $scope.removeColumn_Radar = false;
                        }
                    }
                    if (data[m].title == "Page_Name") {
                        if (data[m].show == true) {
                            $scope.isPage_Name = true;
                            $scope.removeColumn_Page_Name = true;
                        }
                        else {
                            $scope.isPage_Name = false;
                            $scope.removeColumn_Page_Name = false;
                        }
                    }
                    if (data[m].title == "Reference_URL") {
                        if (data[m].show == true) {
                            $scope.isReference_URL = true;
                            $scope.removeColumn_Reference_URL = true;
                        }
                        else {
                            $scope.isReference_URL = false;
                            $scope.removeColumn_Reference_URL = false;
                        }
                    }
                    if (data[m].title == "Geo_Locale_URL") {
                        if (data[m].show == true) {
                            $scope.isGeo_Locale_URL = true;
                            $scope.removeColumn_Geo_Locale_URL = true;
                        }
                        else {
                            $scope.isGeo_Locale_URL = false;
                            $scope.removeColumn_Geo_Locale_URL = false;
                        }
                    }
                    if (data[m].title == "Notes") {
                        if (data[m].show == true) {
                            $scope.isNotes = true;
                            $scope.removeColumn_Notes = true;
                        }
                        else {
                            $scope.isNotes = false;
                            $scope.removeColumn_Notes = false;
                        }
                    }
                    if (data[m].title == "WS_ID") {
                        if (data[m].show == true) {
                            $scope.isWS_ID = true;
                            $scope.removeColumn_WS_ID = true;
                        }
                        else {
                            $scope.isWS_ID = false;
                            $scope.removeColumn_WS_ID = false;
                        }
                    }
                    if (data[m].title == "WS_Task") {
                        if (data[m].show == true) {
                            $scope.isWS_Task = true;
                            $scope.removeColumn_WS_Task = true;
                        }
                        else {
                            $scope.isWS_Task = false;
                            $scope.removeColumn_WS_Task = false;
                        }
                    }
                    if (data[m].title == "Words_to_Translate") {
                        if (data[m].show == true) {
                            $scope.isWords_to_Translate = true;
                            $scope.removeColumn_Words_to_Translate = true;
                        }
                        else {
                            $scope.isWords_to_Translate = false;
                            $scope.removeColumn_Words_to_Translate = false;
                        }
                    }
                    if (data[m].title == "Words_to_Edit") {
                        if (data[m].show == true) {
                            $scope.isWords_to_Edit = true;
                            $scope.removeColumn_Words_to_Edit = true;
                        }
                        else {
                            $scope.isWords_to_Edit = false;
                            $scope.removeColumn_Words_to_Edit = false;
                        }
                    }
                    if (data[m].title == "Total_Words") {
                        if (data[m].show == true) {
                            $scope.isTotal_Words = true;
                            $scope.removeColumn_Total_Words = true;
                        }
                        else {
                            $scope.isTotal_WordsL = false;
                            $scope.removeColumn_Total_Words = false;
                        }
                    }
                    if (data[m].title == "Assignee") {
                        if (data[m].show == true) {
                            $scope.isAssignee = true;
                            $scope.removeColumn_Assignee = true;
                        }
                        else {
                            $scope.isAssignee = false;
                            $scope.removeColumn_Assignee = false;
                        }
                    }
                    if (data[m].title == "CD_Delegate") {
                        if (data[m].show == true) {
                            $scope.isCD_Delegate = true;
                            $scope.removeColumn_CD_Delegate = true;
                        }
                        else {
                            $scope.isCD_Delegate = false;
                            $scope.removeColumn_CD_Delegate = false;
                        }
                    }
                    if (data[m].title == "CD_Review") {
                        if (data[m].show == true) {
                            $scope.isCD_Review = true;
                            $scope.removeColumn_CD_Review = true;
                        }
                        else {
                            $scope.isCD_Review = false;
                            $scope.removeColumn_CD_Review = false;
                        }
                    }
                    if (data[m].title == "Type") {
                        if (data[m].show == true) {
                            $scope.isType = true;
                            $scope.removeColumn_Type = true;
                        }
                        else {
                            $scope.isType = false;
                            $scope.removeColumn_Type = false;
                        }
                    }
                    if (data[m].title == "Writer_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isWriter_ISV_Ready = true;
                            $scope.removeColumn_Writer_ISV_Ready = true;
                        }
                        else {
                            $scope.isWriter_ISV_Ready = false;
                            $scope.removeColumn_Writer_ISV_Ready = false;
                        }
                    }
                    if (data[m].title == "Writer_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isWriter_ISV_Due_Day = true;
                            $scope.removeColumn_Writer_ISV_Due_day = true;
                        }
                        else {
                            $scope.isWriter_ISV_Due_Day = false;
                            $scope.removeColumn_Writer_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "CD_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isCD_ISV_ready = true;
                            $scope.removeColumn_CD_ISV_ready = true;
                        }
                        else {
                            $scope.isCD_ISV_ready = false;
                            $scope.removeColumn_CD_ISV_ready = false;
                        }
                    }
                    if (data[m].title == "CD_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isCD_ISV_Due_day = true;
                            $scope.removeColumn_CD_ISV_Due_day = true;
                        }
                        else {
                            $scope.isCD_ISV_Due_day = false;
                            $scope.removeColumn_CD_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "CD_ISV_Approved") {
                        if (data[m].show == true) {
                            $scope.isCD_ISV_Approved = true;
                            $scope.removeColumn_CD_ISV_Approved = true;
                        }
                        else {
                            $scope.isCD_ISV_Approved = false;
                            $scope.removeColumn_CD_ISV_Approved = false;
                        }
                    }
                    if (data[m].title == "Art_CD_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isArt_CD_ISV_Ready = true;
                            $scope.removeColumn_Art_CD_ISV_Ready = true;
                        }
                        else {
                            $scope.isArt_CD_ISV_Ready = false;
                            $scope.removeColumn_Art_CD_ISV_Ready = false;
                        }
                    }
                    if (data[m].title == "Art_CD_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isArt_CD_ISV_Due_day = true;
                            $scope.removeColumn_Art_CD_ISV_Due_day = true;
                        }
                        else {
                            $scope.isArt_CD_ISV_Due_day = false;
                            $scope.removeColumn_Art_CD_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "XF_ISV_Ready") {
                        if (data[m].show == true) {
                            $scope.isXF_ISV_Ready = true;
                            $scope.removeColumn_XF_ISV_Ready = true;
                        }
                        else {
                            $scope.isXF_ISV_Ready = false;
                            $scope.removeColumn_XF_ISV_Ready = false;
                        }
                    }
                    if (data[m].title == "XF_ISV_Due_day") {
                        if (data[m].show == true) {
                            $scope.isXF_ISV_Due_day = true;
                            $scope.removeColumn_XF_ISV_Due_day = true;
                        }
                        else {
                            $scope.isXF_ISV_Due_day = false;
                            $scope.removeColumn_XF_ISV_Due_day = false;
                        }
                    }
                    if (data[m].title == "Graphic_Ready") {
                        if (data[m].show == true) {
                            $scope.isGraphic_Ready = true;
                            $scope.removeColumn_Graphic_Ready = true;
                        }
                        else {
                            $scope.isGraphic_Ready = false;
                            $scope.removeColumn_Graphic_Ready = false;
                        }
                    }
                    if (data[m].title == "Graphic_Due_day") {
                        if (data[m].show == true) {
                            $scope.isGraphic_Due_day = true;
                            $scope.removeColumn_Graphic_Due_day = true;
                        }
                        else {
                            $scope.isGraphic_Due_day = false;
                            $scope.removeColumn_Graphic_Due_day = false;
                        }
                    }
                }
            };
            show_column();
        });
        $scope.goDetail=(idGeo)=>{
            $location.search('geo',idGeo);
            socket.emit('getDetail', (geo = idGeo));
            socket.on('detailReply', function (Data) {
                //Set ID
                for (let a in Data) {
                    Data[a]['ID'] = a;
                }
                let map = {};
                //sum
                for (let p in Data) {
                    map[Data[p].Category] = map[Data[p].Category] || {
                            Category: Data[p].Category,
                            Total_Words: 0,
                            Words_to_Edit: 0,
                            Words_to_Translate: 0
                            // setdata: []
                        };
                    // map[Data[p].Category].setdata.push(Data[p]);
                    map[Data[p].Category].Total_Words += Number(Data[p].Total_Words);
                    map[Data[p].Category].Words_to_Edit += Number(Data[p].Words_to_Edit);
                    map[Data[p].Category].Words_to_Translate += Number(Data[p].Words_to_Translate);
                }
                ;
                $scope.sum = (data, filed) => {
                    let sum;
                    for (let i in map) {
                        for (let k in data) {
                            if (i == data[k].Category) {
                                sum = map[i][filed];
                                return sum;
                            }
                        }

                    }
                };
                $scope.groups = Data;
                detailDate = Data;
                $scope.tableParams = new NgTableParams(
                    {group: {Category: "desc"}},
                    {dataset: Data, groupOptions: {isExpanded: false}});

                let filterSearch = (id) => {
                    for (let k in detailDate) {
                        let newData = $filter("filter")(detailDate, id);
                        $scope.groups = newData;
                        $scope.tableParams = new NgTableParams(
                            {group: {Category: "desc"}},
                            {dataset: newData, groupOptions: {isExpanded: false}});
                    }
                }
                $scope.search = () => {
                    let text = $scope.search.text;
                    filterSearch(text);
                }
                /* else if (model == 'Radar') {
                 let Radar = $scope.search.filterRadar;
                 filterSearch(Radar);
                 }
                 else if (model == "PageName") {
                 let PageName = $scope.search.filterPage_name;
                 filterSearch(PageName);
                 }
                 else if (model == 'ReferURL') {
                 let ReferURL = $scope.search.filterReference_URL;
                 filterSearch(ReferURL);
                 }
                 else if (model == 'GeoLocal') {
                 let GeoLocal = $scope.search.filterGeo_Local_URL;
                 filterSearch(GeoLocal);
                 }
                 else if (model == 'Notes') {
                 let Notes = $scope.search.filterNotes;
                 filterSearch(Notes);
                 }
                 else if (model == 'WsId') {
                 let WsId = $scope.search.filterWS_ID;
                 filterSearch(WsId);
                 }
                 else if (model == 'WordsTrans') {
                 let WordsTrans = $scope.search.filterWords_to_Translate;
                 filterSearch(WordsTrans);
                 }
                 else if (model == 'WordsEdit') {
                 let WordsEdit = $scope.search.filterWords_to_Edit;
                 filterSearch(WordsEdit);
                 }
                 else if (model == 'TotalWords') {
                 let TotalWords = $scope.search.filterTotal_Words;
                 filterSearch(TotalWords);
                 }
                 else if (model == 'Assignee') {
                 let Assignee = $scope.search.filterAssignee;
                 filterSearch(Assignee);
                 }
                 else if (model == 'CdDg') {
                 let CdDg= $scope.search.filterCD_Delegate;
                 filterSearch(CdDg);
                 }
                 else if (model == 'Type') {
                 let Type = $scope.search.filterType;
                 filterSearch(Type);
                 }
                 else if (model == 'WIsvDay') {
                 let WIsvDay = $scope.search.filterWriter_ISV_Due_Day;
                 filterSearch(WIsvDay);
                 }
                 else if (model == 'CDIsvDay') {
                 let CDIsvDay = $scope.search.filterCD_ISV_Due_day;
                 filterSearch(CDIsvDay);
                 }
                 else if (model == 'ACDIsvDay') {
                 let ACDIsvDay = $scope.search.filterArt_CD_ISV_Due_day;
                 filterSearch(ACDIsvDay);
                 }
                 else if (model == 'XFIsvDay') {
                 let XFIsvDay = $scope.search.filterXF_ISV_Due_day;
                 filterSearch(XFIsvDay);
                 }
                 else if (model == "GPDay") {
                 let GPDay = $scope.search.filterGraphic_Due_day;
                 filterSearch(GPDay);
                 }*/
            });
        }
    }
    else{
        if(loginName===null){
            $state.go("login")
        }
        else{
            socket.emit('getDetail', (geo = inputGeo));
            socket.on('detailReply', function (Data) {
                //Set ID
                for (let a in Data) {
                    Data[a]['ID'] = a;
                }
                sumChanges(Data);
                $scope.tableParams = new NgTableParams(
                    {group: {Category: "desc"}},
                    {dataset: Data, groupOptions: {isExpanded: false}});

                let filterSearch = (id) => {
                    for (let k in detailDate) {
                        let newData = $filter("filter")(detailDate, id);
                        $scope.groups = newData;
                        $scope.tableParams = new NgTableParams(
                            {group: {Category: "desc"}},
                            {dataset: newData, groupOptions: {isExpanded: false}});
                    }
                }
                $scope.search = () => {
                    let text = $scope.search.text;
                    filterSearch(text);
                }
            });
            socket.emit('getGroupStatus');
            socket.on("groupStatusReply", function (data) {
                $scope.linelist = data;
                $scope.$watch("linelist", function (newValue) {
                    for (let m in data) {
                        if (data[m].title == "Category") {
                            if (data[m].show == true) {
                                $scope.isCategory = true;
                                $scope.removeColumn_Category = true;
                            }
                            else {
                                $scope.isCategory = false;
                                $scope.removeColumn_Category = false;
                            }
                        }
                        if (data[m].title == "Radar") {
                            if (data[m].show == true) {
                                $scope.isRadar = true;
                                $scope.removeColumn_Radar = true;
                            }
                            else {
                                $scope.isRadar = false;
                                $scope.removeColumn_Radar = false;
                            }
                        }
                        if (data[m].title == "Page_Name") {
                            if (data[m].show == true) {
                                $scope.isPage_Name = true;
                                $scope.removeColumn_Page_Name = true;
                            }
                            else {
                                $scope.isPage_Name = false;
                                $scope.removeColumn_Page_Name = false;
                            }
                        }
                        if (data[m].title == "Reference_URL") {
                            if (data[m].show == true) {
                                $scope.isReference_URL = true;
                                $scope.removeColumn_Reference_URL = true;
                            }
                            else {
                                $scope.isReference_URL = false;
                                $scope.removeColumn_Reference_URL = false;
                            }
                        }
                        if (data[m].title == "Geo_Locale_URL") {
                            if (data[m].show == true) {
                                $scope.isGeo_Locale_URL = true;
                                $scope.removeColumn_Geo_Locale_URL = true;
                            }
                            else {
                                $scope.isGeo_Locale_URL = false;
                                $scope.removeColumn_Geo_Locale_URL = false;
                            }
                        }
                        if (data[m].title == "Notes") {
                            if (data[m].show == true) {
                                $scope.isNotes = true;
                                $scope.removeColumn_Notes = true;
                            }
                            else {
                                $scope.isNotes = false;
                                $scope.removeColumn_Notes = false;
                            }
                        }
                        if (data[m].title == "WS_ID") {
                            if (data[m].show == true) {
                                $scope.isWS_ID = true;
                                $scope.removeColumn_WS_ID = true;
                            }
                            else {
                                $scope.isWS_ID = false;
                                $scope.removeColumn_WS_ID = false;
                            }
                        }
                        if (data[m].title == "WS_Task") {
                            if (data[m].show == true) {
                                $scope.isWS_Task = true;
                                $scope.removeColumn_WS_Task = true;
                            }
                            else {
                                $scope.isWS_Task = false;
                                $scope.removeColumn_WS_Task = false;
                            }
                        }
                        if (data[m].title == "Words_to_Translate") {
                            if (data[m].show == true) {
                                $scope.isWords_to_Translate = true;
                                $scope.removeColumn_Words_to_Translate = true;
                            }
                            else {
                                $scope.isWords_to_Translate = false;
                                $scope.removeColumn_Words_to_Translate = false;
                            }
                        }
                        if (data[m].title == "Words_to_Edit") {
                            if (data[m].show == true) {
                                $scope.isWords_to_Edit = true;
                                $scope.removeColumn_Words_to_Edit = true;
                            }
                            else {
                                $scope.isWords_to_Edit = false;
                                $scope.removeColumn_Words_to_Edit = false;
                            }
                        }
                        if (data[m].title == "Total_Words") {
                            if (data[m].show == true) {
                                $scope.isTotal_Words = true;
                                $scope.removeColumn_Total_Words = true;
                            }
                            else {
                                $scope.isTotal_WordsL = false;
                                $scope.removeColumn_Total_Words = false;
                            }
                        }
                        if (data[m].title == "Assignee") {
                            if (data[m].show == true) {
                                $scope.isAssignee = true;
                                $scope.removeColumn_Assignee = true;
                            }
                            else {
                                $scope.isAssignee = false;
                                $scope.removeColumn_Assignee = false;
                            }
                        }
                        if (data[m].title == "CD_Delegate") {
                            if (data[m].show == true) {
                                $scope.isCD_Delegate = true;
                                $scope.removeColumn_CD_Delegate = true;
                            }
                            else {
                                $scope.isCD_Delegate = false;
                                $scope.removeColumn_CD_Delegate = false;
                            }
                        }
                        if (data[m].title == "CD_Review") {
                            if (data[m].show == true) {
                                $scope.isCD_Review = true;
                                $scope.removeColumn_CD_Review = true;
                            }
                            else {
                                $scope.isCD_Review = false;
                                $scope.removeColumn_CD_Review = false;
                            }
                        }
                        if (data[m].title == "Type") {
                            if (data[m].show == true) {
                                $scope.isType = true;
                                $scope.removeColumn_Type = true;
                            }
                            else {
                                $scope.isType = false;
                                $scope.removeColumn_Type = false;
                            }
                        }
                        if (data[m].title == "Writer_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isWriter_ISV_Ready = true;
                                $scope.removeColumn_Writer_ISV_Ready = true;
                            }
                            else {
                                $scope.isWriter_ISV_Ready = false;
                                $scope.removeColumn_Writer_ISV_Ready = false;
                            }
                        }
                        if (data[m].title == "Writer_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isWriter_ISV_Due_Day = true;
                                $scope.removeColumn_Writer_ISV_Due_day = true;
                            }
                            else {
                                $scope.isWriter_ISV_Due_Day = false;
                                $scope.removeColumn_Writer_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "CD_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isCD_ISV_ready = true;
                                $scope.removeColumn_CD_ISV_ready = true;
                            }
                            else {
                                $scope.isCD_ISV_ready = false;
                                $scope.removeColumn_CD_ISV_ready = false;
                            }
                        }
                        if (data[m].title == "CD_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isCD_ISV_Due_day = true;
                                $scope.removeColumn_CD_ISV_Due_day = true;
                            }
                            else {
                                $scope.isCD_ISV_Due_day = false;
                                $scope.removeColumn_CD_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "CD_ISV_Approved") {
                            if (data[m].show == true) {
                                $scope.isCD_ISV_Approved = true;
                                $scope.removeColumn_CD_ISV_Approved = true;
                            }
                            else {
                                $scope.isCD_ISV_Approved = false;
                                $scope.removeColumn_CD_ISV_Approved = false;
                            }
                        }
                        if (data[m].title == "Art_CD_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isArt_CD_ISV_Ready = true;
                                $scope.removeColumn_Art_CD_ISV_Ready = true;
                            }
                            else {
                                $scope.isArt_CD_ISV_Ready = false;
                                $scope.removeColumn_Art_CD_ISV_Ready = false;
                            }
                        }
                        if (data[m].title == "Art_CD_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isArt_CD_ISV_Due_day = true;
                                $scope.removeColumn_Art_CD_ISV_Due_day = true;
                            }
                            else {
                                $scope.isArt_CD_ISV_Due_day = false;
                                $scope.removeColumn_Art_CD_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "XF_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isXF_ISV_Ready = true;
                                $scope.removeColumn_XF_ISV_Ready = true;
                            }
                            else {
                                $scope.isXF_ISV_Ready = false;
                                $scope.removeColumn_XF_ISV_Ready = false;
                            }
                        }
                        if (data[m].title == "XF_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isXF_ISV_Due_day = true;
                                $scope.removeColumn_XF_ISV_Due_day = true;
                            }
                            else {
                                $scope.isXF_ISV_Due_day = false;
                                $scope.removeColumn_XF_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "Graphic_Ready") {
                            if (data[m].show == true) {
                                $scope.isGraphic_Ready = true;
                                $scope.removeColumn_Graphic_Ready = true;
                            }
                            else {
                                $scope.isGraphic_Ready = false;
                                $scope.removeColumn_Graphic_Ready = false;
                            }
                        }
                        if (data[m].title == "Graphic_Due_day") {
                            if (data[m].show == true) {
                                $scope.isGraphic_Due_day = true;
                                $scope.removeColumn_Graphic_Due_day = true;
                            }
                            else {
                                $scope.isGraphic_Due_day = false;
                                $scope.removeColumn_Graphic_Due_day = false;
                            }
                        }
                    }
                }, true);
                let show_column = () => {
                    for (let m in data) {
                        if (data[m].title == "Category") {
                            if (data[m].show == true) {
                                $scope.isCategory = true;
                                $scope.removeColumn_Category = true;
                            }
                            else {
                                $scope.isCategory = false;
                                $scope.removeColumn_Category = false;
                            }
                        }
                        if (data[m].title == "Radar") {
                            if (data[m].show == true) {
                                $scope.isRadar = true;
                                $scope.removeColumn_Radar = true;
                            }
                            else {
                                $scope.isRadar = false;
                                $scope.removeColumn_Radar = false;
                            }
                        }
                        if (data[m].title == "Page_Name") {
                            if (data[m].show == true) {
                                $scope.isPage_Name = true;
                                $scope.removeColumn_Page_Name = true;
                            }
                            else {
                                $scope.isPage_Name = false;
                                $scope.removeColumn_Page_Name = false;
                            }
                        }
                        if (data[m].title == "Reference_URL") {
                            if (data[m].show == true) {
                                $scope.isReference_URL = true;
                                $scope.removeColumn_Reference_URL = true;
                            }
                            else {
                                $scope.isReference_URL = false;
                                $scope.removeColumn_Reference_URL = false;
                            }
                        }
                        if (data[m].title == "Geo_Locale_URL") {
                            if (data[m].show == true) {
                                $scope.isGeo_Locale_URL = true;
                                $scope.removeColumn_Geo_Locale_URL = true;
                            }
                            else {
                                $scope.isGeo_Locale_URL = false;
                                $scope.removeColumn_Geo_Locale_URL = false;
                            }
                        }
                        if (data[m].title == "Notes") {
                            if (data[m].show == true) {
                                $scope.isNotes = true;
                                $scope.removeColumn_Notes = true;
                            }
                            else {
                                $scope.isNotes = false;
                                $scope.removeColumn_Notes = false;
                            }
                        }
                        if (data[m].title == "WS_ID") {
                            if (data[m].show == true) {
                                $scope.isWS_ID = true;
                                $scope.removeColumn_WS_ID = true;
                            }
                            else {
                                $scope.isWS_ID = false;
                                $scope.removeColumn_WS_ID = false;
                            }
                        }
                        if (data[m].title == "WS_Task") {
                            if (data[m].show == true) {
                                $scope.isWS_Task = true;
                                $scope.removeColumn_WS_Task = true;
                            }
                            else {
                                $scope.isWS_Task = false;
                                $scope.removeColumn_WS_Task = false;
                            }
                        }
                        if (data[m].title == "Words_to_Translate") {
                            if (data[m].show == true) {
                                $scope.isWords_to_Translate = true;
                                $scope.removeColumn_Words_to_Translate = true;
                            }
                            else {
                                $scope.isWords_to_Translate = false;
                                $scope.removeColumn_Words_to_Translate = false;
                            }
                        }
                        if (data[m].title == "Words_to_Edit") {
                            if (data[m].show == true) {
                                $scope.isWords_to_Edit = true;
                                $scope.removeColumn_Words_to_Edit = true;
                            }
                            else {
                                $scope.isWords_to_Edit = false;
                                $scope.removeColumn_Words_to_Edit = false;
                            }
                        }
                        if (data[m].title == "Total_Words") {
                            if (data[m].show == true) {
                                $scope.isTotal_Words = true;
                                $scope.removeColumn_Total_Words = true;
                            }
                            else {
                                $scope.isTotal_WordsL = false;
                                $scope.removeColumn_Total_Words = false;
                            }
                        }
                        if (data[m].title == "Assignee") {
                            if (data[m].show == true) {
                                $scope.isAssignee = true;
                                $scope.removeColumn_Assignee = true;
                            }
                            else {
                                $scope.isAssignee = false;
                                $scope.removeColumn_Assignee = false;
                            }
                        }
                        if (data[m].title == "CD_Delegate") {
                            if (data[m].show == true) {
                                $scope.isCD_Delegate = true;
                                $scope.removeColumn_CD_Delegate = true;
                            }
                            else {
                                $scope.isCD_Delegate = false;
                                $scope.removeColumn_CD_Delegate = false;
                            }
                        }
                        if (data[m].title == "CD_Review") {
                            if (data[m].show == true) {
                                $scope.isCD_Review = true;
                                $scope.removeColumn_CD_Review = true;
                            }
                            else {
                                $scope.isCD_Review = false;
                                $scope.removeColumn_CD_Review = false;
                            }
                        }
                        if (data[m].title == "Type") {
                            if (data[m].show == true) {
                                $scope.isType = true;
                                $scope.removeColumn_Type = true;
                            }
                            else {
                                $scope.isType = false;
                                $scope.removeColumn_Type = false;
                            }
                        }
                        if (data[m].title == "Writer_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isWriter_ISV_Ready = true;
                                $scope.removeColumn_Writer_ISV_Ready = true;
                            }
                            else {
                                $scope.isWriter_ISV_Ready = false;
                                $scope.removeColumn_Writer_ISV_Ready = false;
                            }
                        }
                        if (data[m].title == "Writer_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isWriter_ISV_Due_Day = true;
                                $scope.removeColumn_Writer_ISV_Due_day = true;
                            }
                            else {
                                $scope.isWriter_ISV_Due_Day = false;
                                $scope.removeColumn_Writer_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "CD_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isCD_ISV_ready = true;
                                $scope.removeColumn_CD_ISV_ready = true;
                            }
                            else {
                                $scope.isCD_ISV_ready = false;
                                $scope.removeColumn_CD_ISV_ready = false;
                            }
                        }
                        if (data[m].title == "CD_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isCD_ISV_Due_day = true;
                                $scope.removeColumn_CD_ISV_Due_day = true;
                            }
                            else {
                                $scope.isCD_ISV_Due_day = false;
                                $scope.removeColumn_CD_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "CD_ISV_Approved") {
                            if (data[m].show == true) {
                                $scope.isCD_ISV_Approved = true;
                                $scope.removeColumn_CD_ISV_Approved = true;
                            }
                            else {
                                $scope.isCD_ISV_Approved = false;
                                $scope.removeColumn_CD_ISV_Approved = false;
                            }
                        }
                        if (data[m].title == "Art_CD_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isArt_CD_ISV_Ready = true;
                                $scope.removeColumn_Art_CD_ISV_Ready = true;
                            }
                            else {
                                $scope.isArt_CD_ISV_Ready = false;
                                $scope.removeColumn_Art_CD_ISV_Ready = false;
                            }
                        }
                        if (data[m].title == "Art_CD_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isArt_CD_ISV_Due_day = true;
                                $scope.removeColumn_Art_CD_ISV_Due_day = true;
                            }
                            else {
                                $scope.isArt_CD_ISV_Due_day = false;
                                $scope.removeColumn_Art_CD_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "XF_ISV_Ready") {
                            if (data[m].show == true) {
                                $scope.isXF_ISV_Ready = true;
                                $scope.removeColumn_XF_ISV_Ready = true;
                            }
                            else {
                                $scope.isXF_ISV_Ready = false;
                                $scope.removeColumn_XF_ISV_Ready = false;
                            }
                        }
                        if (data[m].title == "XF_ISV_Due_day") {
                            if (data[m].show == true) {
                                $scope.isXF_ISV_Due_day = true;
                                $scope.removeColumn_XF_ISV_Due_day = true;
                            }
                            else {
                                $scope.isXF_ISV_Due_day = false;
                                $scope.removeColumn_XF_ISV_Due_day = false;
                            }
                        }
                        if (data[m].title == "Graphic_Ready") {
                            if (data[m].show == true) {
                                $scope.isGraphic_Ready = true;
                                $scope.removeColumn_Graphic_Ready = true;
                            }
                            else {
                                $scope.isGraphic_Ready = false;
                                $scope.removeColumn_Graphic_Ready = false;
                            }
                        }
                        if (data[m].title == "Graphic_Due_day") {
                            if (data[m].show == true) {
                                $scope.isGraphic_Due_day = true;
                                $scope.removeColumn_Graphic_Due_day = true;
                            }
                            else {
                                $scope.isGraphic_Due_day = false;
                                $scope.removeColumn_Graphic_Due_day = false;
                            }
                        }
                    }
                };
                show_column();
            });
        }
    }
    socket.emit('editApply');
    socket.on('editReply', function (applyDate) {
        socket.emit('getDetail', (geo = inputGeo));
        socket.on('detailReply', function (data) {
            if (applyDate.status == "success") {
                $scope.editRow = (id, rowForm) => {
                    rowForm.isEditing = true;
                    for (let m in data) {
                        if (data[m].ID == id) {
                            editedItemBackup = angular.copy(data[m]);
                            $scope.save.category1 = editedItemBackup.Category;
                            $scope.save.radar = editedItemBackup.Radar;
                            $scope.save.page_name = editedItemBackup.Page_Name;
                            $scope.save.reference_url = editedItemBackup.Reference_URL;
                            $scope.save.geo_locale_url = editedItemBackup.Geo_Locale_URL;
                            $scope.save.notes = editedItemBackup.Notes;
                            $scope.save.ws_id = editedItemBackup.WS_ID;
                            $scope.save.ws_task = editedItemBackup.WS_Task;
                            $scope.save.words_to_translate = editedItemBackup.Words_to_Translate;
                            $scope.save.words_to_edit = editedItemBackup.Words_to_Edit;
                            $scope.save.total_words = editedItemBackup.Total_Words;
                            $scope.save.assignee = editedItemBackup.Assignee;
                            $scope.save.cd_delegate = editedItemBackup.CD_Delegate;
                            $scope.save.cd_review = editedItemBackup.CD_Review;
                            $scope.save.type = editedItemBackup.Type;
                            $scope.save.writer_isv_ready = editedItemBackup.Writer_ISV_Ready;
                            $scope.save.writer_isv_due_day = editedItemBackup.Writer_ISV_Due_day;
                            $scope.save.cd_isv_ready = editedItemBackup.CD_ISV_Ready;
                            $scope.save.cd_isv_approved = editedItemBackup.CD_ISV_Approved;
                            $scope.save.cd_isv_due_day = editedItemBackup.CD_ISV_Due_day;
                            $scope.save.art_cd_isv_ready = editedItemBackup.Art_CD_ISV_Ready;
                            $scope.save.art_cd_isv_due_day = editedItemBackup.Art_CD_ISV_Due_day;
                            $scope.save.xf_isv_ready = editedItemBackup.XF_ISV_Ready;
                            $scope.save.xf_isv_due_day = editedItemBackup.XF_ISV_Due_day;
                            $scope.save.graphic = editedItemBackup.Graphic_Ready;
                            $scope.save.graphic_due_day = editedItemBackup.Graphic_Due_day;
                        }
                    }
                }
                $scope.del = (id) => {
                    for (let i in data) {
                        if (id == data[i].ID) {
                            data.splice(id, 1);
                            // console.log(detailDate);
                            let Dataobj = {};
                            Dataobj.geo = inputGeo;
                            Dataobj.data = data;
                            socket.emit('updateDetail', Dataobj);
                            socket.on('detailUpdate', function (newDelData) {
                                console.log(newDelData);
                                sumChanges(data);
                                $scope.tableParams = new NgTableParams(
                                    {group: {Category: "desc"}},
                                    {dataset: newDelData, groupOptions: {isExpanded: false}});

                                // $scope.tableParams.reload().then(function(data) {
                                //     if (data.length === 0 && self.tableParams.total() > 0) {
                                //         self.tableParams.page(self.tableParams.page() - 1);
                                //         self.tableParams.reload();
                                //     }
                                // });
                            });
                        }
                        socket.on("currentUserUpdate")
                        socket.emit("editFinish");
                    }
                }
                $scope.add = () => {
                    $scope.isShowInput = true;
                    $scope.saveAddrow.category1 = '';
                    $scope.saveAddrow.radar = '';
                    $scope.saveAddrow.page_name = '';
                    $scope.saveAddrow.reference_url = '';
                    $scope.saveAddrow.geo_locale_url = '';
                    $scope.saveAddrow.notes = " ";
                    $scope.saveAddrow.ws_id = " ";
                    $scope.saveAddrow.ws_task = " ";
                    $scope.saveAddrow.words_to_translate = null;
                    $scope.saveAddrow.words_to_edit = null;
                    $scope.saveAddrow.total_words = null;
                    $scope.saveAddrow.assignee = " ";
                    $scope.saveAddrow.cd_delegate = " ";
                    $scope.saveAddrow.cd_review = " ";
                    $scope.saveAddrow.type = null;
                    $scope.saveAddrow.writer_isv_ready = false;
                    $scope.saveAddrow.writer_isv_due_day = ' ';
                    $scope.saveAddrow.cd_isv_ready = false;
                    $scope.saveAddrow.cd_isv_due_day = '';
                    $scope.saveAddrow.art_cd_isv_due_day = '';
                    $scope.saveAddrow.xf_isv_ready = false;
                    $scope.saveAddrow.xf_isv_due_day = '';
                    $scope.saveAddrow.graphic_ready = '';
                    $scope.saveAddrow.graphic_due_day = '';
                }
            }
        })
        // else if((loginName==null)&&(applyDate.status == "failed")) {
        //     $scope.editRow = () => {
        //         alert(applyDate.message);
        //         $state.go("login")
        //     }
        //     $scope.del = (id) => {
        //         alert(applyDate.message);
        //         $state.go("login")
        //     }
        //     $scope.add = () => {
        //         alert(applyDate.message);
        //         $state.go("login")
        //     }
        // }
        // else{
        //     $scope.editRow = () => {
        //         alert(applyDate.message);
        //     }
        //     $scope.del = (id) => {
        //         alert(applyDate.message);
        //     }
        //     $scope.add = () => {
        //         alert(applyDate.message);
        //     }
        // }

    });
    $scope.isLastPage = () => {
        return $scope.tableParams.page() === totalPages();
    };
    $scope.totalPages = () => {
        return Math.ceil($scope.tableParams.total() / $scope.tableParams.count());
    };
    $scope.isShowFilter = false;
    $scope.showFilter = () => {
        if ($scope.isShowFilter == false) {
            $scope.isShowFilter = true;
        }
        else {
            $scope.isShowFilter = false;
        }
    };
    $scope.menuState = false;
    $scope.toggle = () => {
        $scope.menuState = !$scope.menuState;
        let sideButton = document.getElementById("sideButton");
        let side_line = document.getElementById("side_line");
        let table_list = document.getElementById("table_list");
        if ($scope.menuState) {
            side_line.style.left = "-30px";
            side_line.style.boxShadow = "0 3px 6px 1px rgba(0,0,0,.08), 0 7px 14px 1px rgba(50,50,93,.1)";
            side_line.style.width = '10px';
            side_line.style.height = '900px';
            side_line.style.background = "#fff";
            sideButton.style.left = "5px";
            table_list.style.marginLeft = "-230px"

        }
        else {
            side_line.style.left = "205px";
            side_line.style.borderLeft = '0';
            side_line.style.width = '0';
            side_line.style.boxShadow = '0';
            side_line.style.background = "transparent";
            sideButton.style.left = "0";
            side_line.style.height = '0';
            table_list.style.marginLeft = "0";
        }

    };
    $scope.name_value = sessionStorage.getItem("username");
    $scope.password_value = sessionStorage.getItem("password");
    // let userData = {username: $scope.name_value, password: $scope.password_value};
    $scope.cancel = (id, rowForm) => {
        socket.emit("editFinish");
        rowForm.isEditing = false;
    };
    //Update page
    let dataObj = {};
    dataObj['geo'] = inputGeo;
    socket.emit('updateDetail', inputGeo);
    socket.on('detailUpdate', function (Updetail) {
        socket.emit('getDetail', (geo = inputGeo));
        socket.on('detailReply', function (data) {
            //saveRow
            $scope.saveAddrow = () => {
                let addRow = {
                    Category: $scope.saveAddrow.category1,
                    Radar: $scope.saveAddrow.radar,
                    Page_Name: $scope.saveAddrow.page_name,
                    Reference_URL: $scope.saveAddrow.reference_url,
                    Geo_Locale_URL: $scope.saveAddrow.geo_locale_url,
                    Notes: $scope.saveAddrow.notes,
                    WS_ID: $scope.saveAddrow.ws_id,
                    WS_Task: $scope.saveAddrow.ws_task,
                    Words_to_Translate: $scope.saveAddrow.words_to_translate,
                    Words_to_Edit: $scope.saveAddrow.words_to_edit,
                    Total_Words: $scope.saveAddrow.total_words,
                    Assignee: $scope.saveAddrow.assignee,
                    CD_Delegate: $scope.saveAddrow.cd_delegate,
                    CD_Review: $scope.saveAddrow.cd_review,
                    Type: $scope.saveAddrow.type,
                    Writer_ISV_Ready: $scope.saveAddrow.writer_isv_ready,
                    Writer_ISV_Due_day: $scope.saveAddrow.writer_isv_due_day,
                    CD_ISV_Ready: $scope.saveAddrow.cd_isv_ready,
                    CD_ISV_Due_day: $scope.saveAddrow.cd_isv_due_day,
                    CD_ISV_Approved: $scope.saveAddrow.cd_isv_approved,
                    Art_CD_ISV_Ready: $scope.saveAddrow.art_cd_isv_ready,
                    Art_CD_ISV_Due_day: $scope.saveAddrow.art_cd_isv_due_day,
                    XF_ISV_Ready: $scope.saveAddrow.xf_isv_ready,
                    XF_ISV_Due_day: $scope.saveAddrow.xf_isv_due_day,
                    Graphic_Ready: $scope.saveAddrow.graphic,
                    Graphic_Due_day: $scope.saveAddrow.graphic_due_day
                };
                data.unshift(addRow);
                let newData = data;
                $scope.isShowInput = false;
                sumChanges(newData);
                $scope.groups=newData;
                $scope.tableParams = new NgTableParams(
                    {group: {Category: "desc"}},
                    {dataset: newData, groupOptions: {isExpanded: false}});
                socket.emit("editFinish");
                socket.on("currentUserUpdate")

            };
            //save
            $scope.save = (id) => {
                let saveData = {
                    Category: $scope.save.category1,
                    Radar: $scope.save.radar,
                    Page_Name: $scope.save.page_name,
                    Reference_URL: $scope.save.reference_url,
                    Geo_Locale_URL: $scope.save.geo_locale_url,
                    Notes: $scope.save.notes,
                    WS_ID: $scope.save.ws_id,
                    WS_Task: $scope.save.ws_task,
                    Words_to_Translate: $scope.save.words_to_translate,
                    Words_to_Edit: $scope.save.words_to_edit,
                    Total_Words: $scope.save.total_words,
                    Assignee: $scope.save.assignee,
                    CD_Delegate: $scope.save.cd_delegate,
                    CD_Review: $scope.save.cd_review,
                    Type: $scope.save.type,
                    Writer_ISV_Ready: $scope.save.writer_isv_ready,
                    Writer_ISV_Due_day: $scope.save.writer_isv_due_day,
                    CD_ISV_Ready: $scope.save.cd_isv_ready,
                    CD_ISV_Approved: $scope.save.cd_isv_approved,
                    CD_ISV_Due_day: $scope.save.cd_isv_due_day,
                    Art_CD_ISV_Ready: $scope.save.art_cd_isv_ready,
                    Art_CD_ISV_Due_day: $scope.save.art_cd_isv_due_day,
                    XF_ISV_Ready: $scope.save.xf_isv_ready,
                    XF_ISV_Due_day: $scope.save.xf_isv_due_day,
                    Graphic_Ready: $scope.save.graphic,
                    Graphic_Due_day: $scope.save.graphic_due_day
                };
                for (let i in data) {
                    if (id == data[i].ID) {
                        data.splice(i, 1, saveData);
                        let delDate = data;
                        sumChanges(delDate);
                        $scope.groups=delDate;
                        $scope.tableParams = new NgTableParams(
                            {group: {Category: "desc"}},
                            {dataset: delDate, groupOptions: {isExpanded: false}});
                    }
                }
                socket.emit("editFinish");
                socket.on("currentUserUpdate")
            };
        })
    });
    //cancel
    $scope.cancelAddrow = () => {
        $scope.isShowInput = false;
        socket.emit("editFinish");
    };
    socket.emit("getUserList");
    socket.on("userListReply", function (userdata) {
        if (((userdata.indexOf(loginName)) == -1) && (loginName != null)) {
            $scope.editRow=()=>{
                alert("Hi,"+loginName+"您登录已经超时，需要重新登录");
                $state.go("login")
            }
            $scope.del=()=>{
                alert("Hi,"+loginName+"您登录已经超时，需要重新登录");
                $state.go("login")
            }
            $scope.add=()=>{
                alert("Hi,"+loginName+"您登录已经超时，需要重新登录");
                $state.go("login")
            }
        }
        else if(loginName===null){
            $scope.editRow=()=>{
                alert("用户未登录");
                $state.go("login")
            }
            $scope.del=()=>{
                alert("用户未登录");
                $state.go("login")
            }
            $scope.add=()=>{
                alert("用户未登录");
                $state.go("login")
            }
        }
    });
}));
(function () {
    "use strict";
    angular.module("inventory").run(configureDefaults);
    configureDefaults.$inject = ["ngTableDefaults"];
    function configureDefaults(ngTableDefaults) {
        ngTableDefaults.params.count = 5;
        ngTableDefaults.settings.counts = [];
    }
})();
