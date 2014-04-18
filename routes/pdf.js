var p2jcmd = require('../node_modules/pdf2json/lib/p2jcmd'),
    path = require('path'),
    _ = require('underscore'),
    fs = require('fs'),
    nodeUtil = require('util'),
    mongo = require('mongodb'),
    monk = require('monk'),
    PFParser = require('../node_modules/pdf2json/pdfparser');
var db = monk('localhost:27017/nodetest1');
var collection = db.get("questions");

var output;
var input = "";
var json = {
    formImage: {
        Pages: []
    }
};


var PDF2JSONUtil = (function () {

    var _continue = function (callback, err) {
        if (err)
            nodeUtil.p2jwarn(err);
        if (_.isFunction(callback))
            callback(err);
    };

    var _generateFieldsTypesFile = function (data, callback) {
        var pJSON = require("./pdffield").getAllFieldsTypes(data);
        var fieldsTypesPath = this.outputPath.replace(".json", ".fields.json");
        var fieldTypesFile = this.outputFile.replace(".json", ".fields.json");

        fs.writeFile(fieldsTypesPath, JSON.stringify(pJSON), function (err) {
            if (err) {
                nodeUtil.p2jwarn(this.inputFile + " => " + fieldTypesFile + " Exception: " + err);
            } else {
                nodeUtil.p2jinfo(this.inputFile + " => " + fieldTypesFile + " [" + this.outputDir + "] OK");
            }
            _continue.call(this, callback, err);
        }.bind(this));
    };

    var _writeOneJSON = function (data, callback) {

        json = {
            "formImage": data
        };
        this.curProcessor.successCount++;
        _continue.call(this, callback);
        /*fs.writeFile(this.outputPath, pJSON, function(err) {
            if(err) {
                nodeUtil.p2jwarn(this.inputFile + " => " + this.outputFile + " Exception: " + err);
                this.curProcessor.failedCount++;
                _continue.call(this, callback, err);
            } else {
                nodeUtil.p2jinfo(this.inputFile + " => " + this.outputFile + " [" + this.outputDir + "] OK");
                this.curProcessor.successCount++;

                if (_.has(argv, 't')) {//needs to generate fields.json file
                    _generateFieldsTypesFile.call(this, data, callback);
                }
                else {
                    _continue.call(this, callback);
                }
            }
        }.bind(this));
        */
    };

    var _parseOnePDF = function (callback) {
        this.pdfParser = new PFParser();

        this.pdfParser.on("pdfParser_dataReady", function (evtData) {

            if (( !! evtData) && ( !! evtData.data)) {
                _writeOneJSON.call(this, evtData.data, callback);
            } else {
                this.curProcessor.failedCount++;
                _continue.call(this, callback, "Exception: empty parsing result - " + this.inputPath);
            }
        }.bind(this));

        this.pdfParser.on("pdfParser_dataError", function (evtData) {
            this.curProcessor.failedCount++;
            var errMsg = "Exception: " + evtData.data;
            _continue.call(this, callback, errMsg);
        }.bind(this));

        nodeUtil.p2jinfo("Transcoding " + this.inputFile + " to - " + this.outputPath);
        this.pdfParser.loadPDF(this.inputPath, 5); //(_.has(argv, 's') ? 0 : 5));

    };

    // constructor
    var cls = function (inputDir, inputFile, curProcessor) {
        // public, this instance copies
        this.inputDir = path.normalize(inputDir);
        this.inputFile = inputFile;
        this.inputPath = this.inputDir + path.sep + this.inputFile;

        this.outputDir = path.normalize(inputDir);
        this.outputFile = null;
        this.outputPath = null;

        this.pdfParser = null;
        this.curProcessor = curProcessor;
    };

    /*cls.prototype.validateParams = function() {
        var retVal = null;

        if (!fs.existsSync(this.inputDir))
            retVal = "Input error: input directory doesn't exist - " + this.inputDir + ".";
        else if (!fs.existsSync(this.inputPath))
            retVal = "Input error: input file doesn't exist - " + this.inputPath + ".";
        else if (!fs.existsSync(this.outputDir))
            retVal = "Input error: output directory doesn't exist - " + this.outputDir + ".";

        if (retVal != null) {
            this.curProcessor.failedCount += 1;
            return retVal;
        }

        var inExtName = path.extname(this.inputFile).toLowerCase();
        if (inExtName !== '.pdf')
            retVal = "Input error: input file name doesn't have pdf extention  - " + this.inputFile + ".";
        else {
            this.outputFile = path.basename(this.inputPath, inExtName) + ".json";
            this.outputPath = this.outputDir + path.sep + this.outputFile;
            if (fs.existsSync(this.outputPath))
                nodeUtil.p2jinfo("Output file will be replaced - " + this.outputPath);
            else {
                var fod = fs.openSync(this.outputPath, "wx");
                if (!fod)
                    retVal = "Input error: can not write to " + this.outputPath;
                else {
                    fs.closeSync(fod);
                    fs.unlinkSync(this.outputPath);
                }
            }
        }

        return retVal;
    };*/

    cls.prototype.destroy = function () {
        this.inputDir = null;
        this.inputFile = null;
        this.inputPath = null;
        this.outputDir = null;
        this.outputPath = null;

        if (this.pdfParser) {
            this.pdfParser.destroy();
        }
        this.pdfParser = null;
        this.curProcessor = null;
    };

    cls.prototype.processFile = function (callback) {
        /*var validateMsg = this.validateParams();
        if (!!validateMsg) {
            _continue.call(this, callback, validateMsg);
        }
        else {
            _parseOnePDF.call(this, callback);
        }*/
        _parseOnePDF.call(this, callback);
    };
    console.log(json);
    //console.log(cls);
    return cls;
})();


var error = .5;
var equals = function (one, two) {
    if (Math.abs(two - one) < error) {
        return true;
    } else {
        return false;
    }
};
var parseJSON = function (res) {
    console.log("Successfully converted PDF -> JSON");
    //    console.log("here"  + json + " here" );
    var testn = "";
    fs.writeFile("State08.json", JSON.stringify(json), function (err) {
        if (err) {
            console.log(err);
        }
    });
    //console.log(JSON.stringify(json));
    //lets try to add lines together
    var questions = [];
    var finalrects = [];
    var newLines = [];
    var Verts = [];
    var Horiz = [];
    var add = 0;
    for (var i = 0; i < json.formImage.Pages.length; i++) {
        var next = false;
        for (var z = 0; z < json.formImage.Pages[0].Texts.length; z++) {
            var text = unescape(json.formImage.Pages[0].Texts[z].R[0].T);
            if (next) {
                testn = text.substring(text.indexOf("(") + 1, text.indexOf(")"));
                next = false;
            }
            if (text.indexOf("Computer Science Competition") !== -1) {
                next = true;
            }
        }
        var newFills = [];
        var dead = [];
        for (var j = 0; j < json.formImage.Pages[i].Fills.length; j++) {
            var one = json.formImage.Pages[i].Fills[j];
            var cur = one;
            if (dead.indexOf(j) > -1) {
                continue;
            }
            for (var k = j + 1; k < json.formImage.Pages[i].Fills.length; k++) {
                var two = json.formImage.Pages[i].Fills[k];
                //sketch assumptions that I made: 
                //I only need to check below/to the right because k>j
                //object one wont expand in both directions (so like, it cant expand H, then somehow match up with something vertically)
                if (equals(one.x, two.x) && equals(one.w, two.w) && equals((one.y + one.h), two.y)) {
                    cur.h = one.h + two.h + two.y - (one.y + one.h);
                    add++;
                    dead.push(k);
                } else if (equals(one.y, two.y) && equals(one.h, two.h) && equals((one.x + one.w), two.x)) {
                    cur.w = one.w + two.w + two.x - (one.x + one.w);
                    add++;
                    dead.push(k);
                }

            }
            newFills.push(cur);
        }
        //console.log('newFills: '+JSON.stringify(newFills));
        newLines.push(newFills);
        //json.formImage.Pages[i].Fills = newFills;
    }
    //console.log("Finished making newLines. " + add + " lines were added");

    //line refinement???
    for (var i = 0; i < newLines.length; i++) {
        var curh = [],
            curv = [];
        for (var j = 0; j < newLines[i].length; j++) {
            if (newLines[i][j].w > 0.6 && newLines[i][j].h > 0.6) {
                newLines[i].splice(j, 1);
                j--;
            } else if (newLines[i][j].w > newLines[i][j].h) {
                curh.push(newLines[i][j]);
            } else if (newLines[i][j].w < newLines[i][j].h) {
                curv.push(newLines[i][j]);
            }
        }
        Horiz.push(curh);
        Verts.push(curv);
    }
    //console.log(JSON.stringify(newLines));
    var xbnds = [];
    var ybnds = [];
    for (var pg = 0; pg < newLines.length; pg++) {
        var pgx = [];
        var pgy = [];
        for (var h = 0; h < Verts[pg].length - 1; h++) {
            if (Verts[pg][h + 1].x < Verts[pg][h].x) {
                h++;
            }
            var xdiff = Number.MAX_VALUE;
            for (var k = 0; k < Verts[pg].length; k++) { //not necessarily in order right and down
                var x;
                if (Verts[pg][k].x - Verts[pg][h].x < xdiff && Verts[pg][k].x - Verts[pg][h].x > 0) { // this pushes 3 columns, two of which are the same, I can't figure out why
                    x = {
                        xi: Verts[pg][h].x,
                        xf: Verts[pg][k].x
                    };
                    xdiff = Verts[pg][k].x - Verts[pg][h].x;
                }
            }
            pgx.push(x);
        }
        for (var h = 0; h < Horiz[pg].length - 1; h++) {
            var ydiff = Number.MAX_VALUE;
            for (var k = 0; k < Horiz[pg].length; k++) { //not necessarily in order right and down
                var y;
                if (Horiz[pg][k].y - Horiz[pg][h].y < ydiff && Horiz[pg][k].y - Horiz[pg][h].y > 0) {
                    var y = {
                        yi: Horiz[pg][h].y,
                        yf: Horiz[pg][k].y,
                        begin: Horiz[pg][h].x,
                        end: Horiz[pg][k].w + Horiz[pg][k].x
                    };
                    ydiff = Horiz[pg][k].y - Horiz[pg][h].y;
                }
            }
            pgy.push(y);
        }
        xbnds.push(pgx);
        ybnds.push(pgy);
    }
    /* console.log("xbnds" + JSON.stringify(xbnds));
    console.log("ybnds" + JSON.stringify(ybnds));*/
    //DRAWING INCORRECT BOXES

    for (var i = 0; i < ybnds.length; i++) {
        var pg = [];
        var right = null;
        for (var j = 0; j < ybnds[i].length; j++) {
            var bool = false;
            for (var k = 0; k < xbnds[i].length; k++) {
                if (equals(ybnds[i][j].end, xbnds[i][k].xi)) {
                    bool = true;
                    if (!right) { // if no right box created, 
                        right = {
                            x: xbnds[i][k].xi,
                            y: ybnds[i][j].yi,
                            w: xbnds[i][k].xf - xbnds[i][k].xi,
                            h: 0,
                            pg: i
                        };
                    }
                }
            }


            if (!bool && right) { //if long and right exists                
                var rect = {
                    x: ybnds[i][j].begin,
                    y: ybnds[i][j].yi,
                    w: right.x - ybnds[i][j].begin,
                    h: ybnds[i][j].yf - ybnds[i][j].yi,
                    pg: i
                };
                pg.push(rect);
                //console.log("PUSH");
                right['h'] = ybnds[i][j].yf - right['y'];
                //console.log(JSON.stringify(right));
                pg.push(right);
                right = null;
            } else {
                var rect = {
                    x: ybnds[i][j].begin,
                    y: ybnds[i][j].yi,
                    w: ybnds[i][j].end - ybnds[i][j].begin,
                    h: ybnds[i][j].yf - ybnds[i][j].yi,
                    pg: i,
                    text: ""
                };
                pg.push(rect);
            }
        }
        finalrects.push(pg);
    }

    var newfinal = [];
    //splitting boxes by Verts
    for (var i = 0; i < finalrects.length; i++) {

        var newlist = [];
        for (var j = 0; j < finalrects[i].length; j++) {
            var rect = finalrects[i][j];
            for (var k = 0; k < Verts[i].length; k++) {
                var vline = Verts[i][k];
                //console.log("vline-" + JSON.stringify(vline));
                if (vline.x > rect.x + 2 && vline.x < rect.x + rect.w - 2) {
                    if ((vline.y < rect.y || equals(vline.y, rect.y)) && (rect.y + rect.h < vline.y + vline.h || equals(rect.y + rect.h, vline.y + vline.h))) {
                        //console.log("SPLIT");
                        finalrects[i][j] = {
                            x: rect.x,
                            y: rect.y,
                            w: vline.x - rect.x,
                            h: rect.h,
                            pg: rect.pg,
                            text: ""
                        };
                        var newrect2 = {
                            x: vline.x,
                            y: rect.y,
                            w: rect.x + rect.w - vline.x,
                            h: rect.h,
                            pg: rect.pg,
                            text: ""
                        };
                        newlist.push(newrect2);
                        break;
                    }
                }
            }
        }
        //add newlist to rect
        /* console.log("start length " + finalrects[i].length);
        console.log('add length ' + newlist.length);*/
        finalrects[i] = finalrects[i].concat(newlist);
        //console.log("new length " + finalrects[i].length);

    }

    for (var i = 0; i < json.formImage.Pages.length; i++) {
        for (var q = 0; q < finalrects[i].length; q++) {
            var box = finalrects[i][q];
            for (var j = 0; j < json.formImage.Pages[i].Texts.length; j++) {
                var obj = json.formImage.Pages[i].Texts[j];
                if (obj.x > box.x && obj.x < box.x + box.w && obj.y + .5 > box.y && obj.y + .3 < box.y + box.h) {
                    if (obj.R[0].T || !(obj.R[0].T === "undefined")) {
                        //console.log(unescape(obj.R[0].T)); //does "undefined" === undefined
                        finalrects[i][q].text += obj.R[0].T;
                    }
                }
            }
        }
    }

    var last = json.formImage.Pages.length - 1;
    var answers = {};
    var regexch = /[A-E]/;
    var notspace = /\S/;
    var next = "";
    for (var z = 0; z < json.formImage.Pages[last].Texts.length; z++) {
        var text = unescape(json.formImage.Pages[last].Texts[z].R[0].T);
        if (text.search(regexch) === -1) {
            next = text;
            continue;
        }
        text = next + " " + text;
        next = "";
        var num = text.substring(text.search(notspace));
        num = num.substring(0, num.indexOf(" "));
        var letter = text.charAt(text.search(regexch));
        answers[num] = letter;
    }
    for (var z = 0; z < finalrects.length; z++) {
        var min = 1000;
        var secondColumn = 1000;
        var qpage = [];
        if (Verts[z][0]) {
            for (var q = 0; q < Verts[z].length; q++) {
                if (Verts[z][q].x < min) {
                    min = Verts[z][q].x;
                }

            }
            for (var q = 0; q < Verts[z].length; q++) {
                if (Verts[z][q].x < secondColumn && Verts[z][q].x > min) {
                    secondColumn = Verts[z][q].x;
                }

            }
            //console.log("here" + secondColumn + " " + min);
            var next = "";
            for (var j = 0; j < finalrects[z].length; j++) {
                if (finalrects[z][j].x >= secondColumn) {
                    //console.log(z + " " + j + " " + finalrects[z][j].x);
                    continue;
                }
                if (finalrects[z][j].text.indexOf("Assume") === 0) {
                    next = finalrects[z][j].text;
                    continue;
                }
                var question = {
                    test: testn,
                    ques: 1,
                    tags: [],
                    text: "",
                    code: "",
                    ans: [],
                    key: ""
                };
                for (var ot = 0; ot < finalrects[z].length; ot++) {
                    if (equals(finalrects[z][ot].y, finalrects[z][j].y) && ot !== j) {
                        question.code += unescape(finalrects[z][ot].text + " ");
                    } else if (finalrects[z][ot].y < finalrects[z][j].y && finalrects[z][ot].y + finalrects[z][ot].h > finalrects[z][j].y) {
                        question.code += unescape(finalrects[z][ot].text + " ");
                    }
                }
                var itext = unescape(finalrects[z][j].text);
                var qloc = itext.indexOf("QUESTION");
                var qno = itext.substring(qloc + 10, qloc + 13);
                question.ques = qno.substring(0, qno.indexOf(" "));
                question.text = unescape(next) + " " + itext.substring(qloc + 11 + question.ques.length, itext.lastIndexOf("A. "));
                question.ans.push(itext.substring(itext.lastIndexOf("A. ") + 3, itext.lastIndexOf("B. ")));
                question.ans.push(itext.substring(itext.lastIndexOf("B. ") + 3, itext.lastIndexOf("C. ")));
                question.ans.push(itext.substring(itext.lastIndexOf("C. ") + 3, itext.lastIndexOf("D. ")));
                if (itext.indexOf('E') === -1)
                    question.ans.push(itext.substring(itext.lastIndexOf("D. ") + 3));
                else {
                    question.ans.push(itext.substring(itext.lastIndexOf("D. ") + 3, itext.lastIndexOf("E. ")));
                    question.ans.push(itext.substring(itext.lastIndexOf("E. ") + 3));

                }
                question.key = answers[question.ques + '.'];
                //console.log(JSON.stringify(question));
                //console.log(qno);
                next = "";
                qpage.push(question);
            }
        }
        questions.push(qpage);
    }

    output = questions;
    console.log(output);
    console.log("bef");
    for(var r = 0; r<output.length; r++){
        collection.insert(output[r]);
    }
    console.log("what");
    res.send(output);

};





var pdfText = require('pdf-text'),
    _ = require('lodash'),
    fs = require('fs');

var mongo = require('mongodb');
var monk = require('monk');


var pathToPdf = __dirname + "/../A.pdf"

exports.index = function (req, res) {
    pdfText(pathToPdf, function (err) {
        input = pathToPdf;
        if (err) {
            // throw err;
        }
        var inputDir = path.dirname(input);
        var inputFile = path.basename(input);

        var p2j = new p2jcmd();
        p2j.inputCount = 1;
        console.log("bef");
        p2j.p2j = new PDF2JSONUtil(inputDir, inputFile, p2j);
        //p2j.p2j.processFile(_.bind(p2j.complete, p2j));
        console.log("aft");
        p2j.p2j.processFile(function () {
            parseJSON(res);
        });

    });
    console.log("here");
}