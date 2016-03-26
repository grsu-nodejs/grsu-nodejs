/**
 * Created by andrew on 3/26/2016.
 */
var fs = require('fs');

function loadResource(pathName, response) {
    var url = "./src/ui" + pathName;

    fs.readFile(url, function (err, file) {
        if (!err) {
            response.writeHeader(200, {
                "Content-Type": "text/" + pathName.substring(pathName.lastIndexOf('.') + 1)
            });
            response.write(file);
            response.end();
        } else {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write("404 Not found");
            response.end();
        }
    });
}

function index(res) {
    fs.readFile('./src/ui/index.html', function (err, html) {
        res.writeHeader(200, {
            "Content-Type": "text/html"
        });
        res.write(html);
        res.end();
    });
}

exports.loadResource = loadResource;
exports.index = index;