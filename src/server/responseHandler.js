/**
 * Created by andrew on 4/6/2016.
 */
var scraper = require('./scraper');
var parser = require('./parser');

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var table = 'articles';
var url = 'mongodb://localhost:27017/s13';


var monthsNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function jsonResponse(res, content) {
	res.writeHead(200, {
		'Content-Type': 'application/json; charset=utf-8'
	});

	res.write(JSON.stringify(content));

	res.end('');
}

function saveAndReturnArticle(res, content) {
	jsonResponse(res, content);

	mongoConnectWithMethod(insertArticles, content);
}

function saveAndReturnParagraphs(res, content, articleId) {
	jsonResponse(res, content);

	mongoConnectWithMethod(insertParagraphs, content, articleId);
}

function mongoConnectWithMethod(dbMethod, content, id, callback) {
	MongoClient.connect(url, function (err, db) {
		dbMethod(db, content, function (content) {
			db.close();
			if (callback) {
				callback(content);
			}
		}, id);
	});
}

function insertArticles(db, articles, callback) {
	db.collection(table).insertMany(articles);
	callback();
}

function insertParagraphs(db, paragraphs, callback, articleId) {
	db.collection(table).updateOne({
		_id: articleId
	}, {
		$set: {
			paragraphs: paragraphs
		}
	});
	callback();
}

function returnArticles(response, year, month, day) {
	var date = day + ' ' + monthsNames[month - 1] + ' ' + year + ' года';

	var content;
	mongoConnectWithMethod(findArticles, content, date, function (content) {
		if (content) {
			console.log("fromBase");
			jsonResponse(response, content);
		} else {
			console.log("no in base");
			scraper.scrapWithParseMethod(response, saveAndReturnArticle, parser.parseForEntries, 'date', year, month, day);
		}
	});

}

function findParagraphs(db, paragraphs, callback, articleId) {
	db.collection('articles').find({
		_id: articleId
	}, {
		paragraphs: 1
	}).limit(1).next(function (err, doc) {
		paragraphs = doc.paragraphs;
		callback(paragraphs);
	});
}

function findArticles(db, articles, callback, date) {
	db.collection('articles').find({
		date: date
	}).forEach(function (doc) {
		console.log(doc);
		articles = doc;
	});
	

}

function returnParagraphs(response, id, content) {
	mongoConnectWithMethod(findParagraphs, content, id, function (content) {
		if (content) {
			console.log("fromBase");
			jsonResponse(response, content);
		} else {
			console.log("no in base");
			scraper.scrapWithParseMethod(response, saveAndReturnParagraphs, parser.parseForParagraphs, id);
		}
	});
}

exports.returnParagraphs = returnParagraphs;

exports.returnArticles = returnArticles;
