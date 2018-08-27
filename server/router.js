const express = require('express');
const router = express.Router();

let _io = null;

const init = io => _io = io;

router.use((req, res, next) => {
    console.log(`someone is querying for ${req.path}.`);
    next();
});

router.route('/ws')
    .post((req, res) => {
        let obj = {
            status : 'success',
            data : '',
            message : ''
        };
        console.log(req.body.data);
        if (req.body.data) {
            console.log(req.body.data);
            obj['message'] = 'Upload data received.';
            res.json(obj);
        } else {
            obj['status'] = 'failed';
            obj['message'] = 'Upload data not detected';
            res.json(obj)
        }

        _io.emit('detailUpdate');
    })
    .get((req, res) => {
        res.json(null);
    });

exports.router = router;
exports.init = init;