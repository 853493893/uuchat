"use strict";

var _ = require('lodash');
var moment = require('moment');
var Message = require('../database/message');
var utils = require('../utils');

var messageController = module.exports;

messageController.get = function (req, res, next) {
    Message.findById(req.params.uuid, function (err, message) {
        if (err) return next(err);

        return res.json({code: 200, msg: message});
    });
};

messageController.create = function (req, res, next) {
    var message = {
        cid: req.params.cid,
        csid: req.params.csid,
        msg: req.body.msg,
        type: req.body.type || 0,
        device: req.body.device || 0
    };

    Message.insert(message, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: data});
    });
};

messageController.list = function (req, res, next) {
    var cid = req.params.cid;
    var csid = req.params.csid;

    var condition = {cid: cid};
    if (csid) condition.csid = csid;

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = utils.parsePositiveInteger(req.query.pageSize) || 20;

    return Message.list(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        return res.json({code: 200, msg: _.reverse(messages)});
    });
};

messageController.delete = function (req, res, next) {

    var condition = {uuid: req.params.uuid};

    Message.delete(condition, function (err, data) {
        if (err) return next(err);

        return res.json({code: 200, msg: 'success delete'});
    });
};

messageController.search = function (req, res, next) {
    if (!req.query.msg) return res.json({code: 200, msg: []});

    var condition = {
        csid: req.params.csid,
        msg: {
            '$like': '%' + req.query.msg + '%',
            '$notLike': 'content/upload/%'
        }
    };

    var order = [['createdAt', 'DESC']];

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 5;

    return Message.search(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        return res.json({code: 200, msg: messages});
    });
};

messageController.searchLatestMonth = function (req, res, next) {
    if (!req.query.msg) return res.json({code: 200, msg: []});

    var condition = {
        csid: req.params.csid,
        msg: {
            '$like': '%' + req.query.msg + '%',
            '$notLike': 'content/upload/%'
        },
        createdAt:{
            '$gte':moment().subtract(1, 'month')
        }
    };

    var pageNum = utils.parsePositiveInteger(req.query.pageNum);
    var pageSize = 100;

    var order = [['createdAt', 'DESC']];

    return Message.search(condition, order, pageSize, pageNum, function (err, messages) {
        if (err) return next(err);

        return res.json({code: 200, msg: messages});
    });
};