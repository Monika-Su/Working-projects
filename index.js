const express = require("express"),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    body_parser = require('body-parser'),
    config = require('./server/config'),
    fs = require('fs');

app.use(body_parser.urlencoded({extended: false}));

app.use(body_parser.json());

let current = {
    user: null,
};
let workload = config.workload;
let detail;
let userList = {};

try {
    detail = JSON.parse(fs.readFileSync('./server/data.json', 'utf-8'));
}
catch (e) {
    console.log('Get data failed!');
    detail = {
        'CN': [],
        'HK': [],
        'HKEN': [],
        'TW': [],
        'MO': []
    };
}

const getOverview = () => {
    if (detail) {
        let arr = [], res = {};
        for (let i in detail) {
            if (detail.hasOwnProperty(i)) {
                arr = arr.concat(detail[i]);
            }
        }

        arr.forEach(item => {
            // console.log(item);
            let assignee = item['Assignee'] || 'anonymous';
            let cd = item['CD_Delegate'] || 'anonymous';
            let writerDue = item['Writer_ISV_Due_day'] || '-';
            let cdDue = item['CD_ISV_Due_day'] || '-';
            let words = item['Total_Words'] || 0;
            res[assignee] = res[assignee] || {};
            res[assignee][writerDue] = (res[assignee][writerDue] || 0) + Math.round(words / workload.WS.Assignee);
            res[cd] = res[cd] || {};
            res[cd][cdDue] = (res[assignee][cdDue] || 0) + Math.round(words / workload.ISV.CD);

            // console.log(res);
        });

        return res;
    } else {
        return null;
    }
};

// console.log(getOverview());

let testUserData = config.user, overview = getOverview();

const pushData = () => {
    fs.writeFileSync('./server/data.json', JSON.stringify(detail));
};

const getUserList = () => {
    let res = [];
    for (let p in userList) {
        if (userList.hasOwnProperty(p) && userList[p] && userList[p].userInfo) {
            res.push(userList[p].userInfo.name);
        }
    }
    return res;
    // return userList.reduce((prev, current) => {
    //     return current.userInfo ? prev.push(current.userInfo.name) : prev;
    // }, []);
};

io.on("connection", function (socket) {
    console.log("[0≌0]:" + socket.id + " 来访问了");
    userList[socket.id] = {
        socket,
        userInfo: null
    };

    socket.on('login', (data) => {
        let obj = {
            status: 'failed',
            data: {},
            message: ''
        };
        if (data && data['username'] && data['password']) {
            console.log(`${data['username']} is logging in.`);
            if (testUserData[data['username']]) {
                let currentUser = testUserData[data['username']];
                if (currentUser['password'] === data['password']) {
                    userList[socket.id].userInfo = testUserData[data['username']];
                    let group = userList[socket.id].userInfo['group'] || 'all';
                    obj['data'] = config.group[group] || config.group['all'];
                    obj['status'] = 'success';
                    obj['message'] = '登录成功';
                } else {
                    obj['message'] = '用户名与密码不匹配';
                }
            } else {
                obj['message'] = '用户名不存在';
            }
        } else {
            obj['message'] = '未提供用户名及密码';
        }
        socket.emit('loginReply', obj);
        console.log(`announcing ${getUserList()} to Users`);
        io.emit('userListUpdate', getUserList());
    });

    socket.on('getOverview', () => {
        socket.emit('overviewReply', overview);
    });

    socket.on('getGroupStatus', group => {
        group = group || 'all';
        let status = config.group[group] || config.group['all'];
        socket.emit('groupStatusReply', status);
    });

    socket.on('getDetail', (geo) => {
        geo = geo || 'CN';
        let geoDetail = detail[geo.toUpperCase()];

        // console.log(geoDetail);
        socket.emit('detailReply', geoDetail);
        socket.emit('configReply', config.typeData)
    });

    socket.on('getUserList', () => {
        socket.emit('userListReply', getUserList());
    });

    socket.on('getCurrentUser', () => {
        socket.emit('currentUserReply', current.user ? current.user.userInfo.name : null);
    });

    socket.on('editApply', () => {
        let obj = {
            status: 'failed',
            data: {},
            message: ''
        };
        if (userList[socket.id] && userList[socket.id]['userInfo']) {
            if (current.user === null) {
                current.user = userList[socket.id];

                obj.status = 'success';
            } else {
                obj.message = '已有用戶在編輯中';
            }
        } else {
            obj.message = '用戶未登陸或不存在';
        }

        socket.emit('editReply', obj);
        if (obj.status === 'success') {
            io.emit('currentUserUpdate', current.user.userInfo.name);
        }
    });

    socket.on('updateDetail', (obj) => {
        let geo = obj['geo'];
        if (geo) {
            detail[geo] = obj['data'];
            pushData();
        }
        io.emit('detailUpdate', detail[geo]);
        overview = getOverview();
        io.emit('overviewUpdate', overview);
    });

    socket.on('editFinish', () => {
        current['user'] = null;
        current['userName'] = null;
        io.emit('currentUserUpdate', null);
    });

    //todo
    socket.on('download', geo => {
    });

    socket.on('disconnect', function () {
        //remove all the position he took.
        if (current.user && current.user.socket && current.user.socket.id === socket.id) {
            current.user = null;
        }
        userList[socket.id] = null;
        delete userList[socket.id];

        socket.emit('userListUpdate', getUserList());
        console.log("[0×0]:" + socket.id + " has left.");
    });
});

// const exporter = () => {
//     const exportPath = `report-${new Date().getTime()}.xlsx`;
//     let data = {
//         sheets: [
//             {
//                 header: {
//                     url: 'URL',
//                     desc: 'Description',
//                     ogDesc: 'OG Description',
//                     title: 'Title',
//                     ogTitle: 'OG Title',
//                 },
//                 items: [],
//                 sheetName: 'Report',
//             }
//         ],
//         filepath: `static/data/${exportPath}`
//     };
//
//     data.sheets[0].items = req;
//
//     excel.j2e(data, function (err) {
//         console.log(err);
//         console.log('finish');
//         cb(err, exportPath);
//     });
// };

// app.use(session({
//     secret: 'imyourfather',
//     cookie: {
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     },
//     resave: false,
//     saveUninitialized: true,
//     // url : 'https://att.usspk02.orchard.apple.com'
// }));

const Router = require('./server/router');

const router = Router.router;
Router.init(io);

app.use('/', express.static('./static'));
app.use('/node_modules', express.static('./node_modules'));

app.use('/api', router);

app.set('port', (process.env.PORT || 2334));
http.listen(app.get('port'), () => {
    console.log(`[ √ ] : Inventory List Starts on ${app.get('port')}!`)
});