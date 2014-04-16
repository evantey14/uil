/*var p2jcmd = require('../node_modules/pdf2json/lib/p2jcmd'),
    path = require('path'),
    _ = require('underscore'),
    fs = require('fs'),
    nodeUtil = require('util'),
    PFParser = require('../node_modules/pdf2json/pdfparser');

var input = '../State2008.pdf';

var json = {
    formImage: {
        Pages: []
    }
};*/

// var PDF2JSONUtil = (function () {

//     var _continue = function(callback, err) {
//         if (err)
//             nodeUtil.p2jwarn(err);
//         if (_.isFunction(callback))
//             callback(err);
//     };

//     var _generateFieldsTypesFile = function(data, callback) {
//         var pJSON = require("./pdffield").getAllFieldsTypes(data);
//         var fieldsTypesPath = this.outputPath.replace(".json", ".fields.json");
//         var fieldTypesFile = this.outputFile.replace(".json", ".fields.json");

//         fs.writeFile(fieldsTypesPath, JSON.stringify(pJSON), function(err) {
//             if (err) {
//                 nodeUtil.p2jwarn(this.inputFile + " => " + fieldTypesFile + " Exception: " + err);
//             } else {
//                 nodeUtil.p2jinfo(this.inputFile + " => " + fieldTypesFile + " [" + this.outputDir + "] OK");
//             }
//             _continue.call(this, callback, err);
//         }.bind(this));
//     };

//     var _writeOneJSON = function(data, callback) {
        
//         json = {"formImage":data};
//         this.curProcessor.successCount++;
//         _continue.call(this,callback);
//         /*fs.writeFile(this.outputPath, pJSON, function(err) {
//             if(err) {
//                 nodeUtil.p2jwarn(this.inputFile + " => " + this.outputFile + " Exception: " + err);
//                 this.curProcessor.failedCount++;
//                 _continue.call(this, callback, err);
//             } else {
//                 nodeUtil.p2jinfo(this.inputFile + " => " + this.outputFile + " [" + this.outputDir + "] OK");
//                 this.curProcessor.successCount++;

//                 if (_.has(argv, 't')) {//needs to generate fields.json file
//                     _generateFieldsTypesFile.call(this, data, callback);
//                 }
//                 else {
//                     _continue.call(this, callback);
//                 }
//             }
//         }.bind(this));
//         */
//     };

//     var _parseOnePDF = function(callback) {
//         this.pdfParser = new PFParser();

//         this.pdfParser.on("pdfParser_dataReady", function (evtData) {
            
//             if ((!!evtData) && (!!evtData.data)) {
//                 _writeOneJSON.call(this, evtData.data, callback);
//             }
//             else {
//                 this.curProcessor.failedCount++;
//                 _continue.call(this, callback, "Exception: empty parsing result - " + this.inputPath);
//             }
//         }.bind(this));

//         this.pdfParser.on("pdfParser_dataError", function (evtData) {
//             this.curProcessor.failedCount++;
//             var errMsg = "Exception: " + evtData.data;
//             _continue.call(this, callback, errMsg);
//         }.bind(this));

//         nodeUtil.p2jinfo("Transcoding " + this.inputFile + " to - " + this.outputPath);
//         this.pdfParser.loadPDF(this.inputPath, 5);//(_.has(argv, 's') ? 0 : 5));
        
//     };

//     // constructor
//     var cls = function (inputDir, inputFile, curProcessor) {
//         // public, this instance copies
//         this.inputDir = path.normalize(inputDir);
//         this.inputFile = inputFile;
//         this.inputPath = this.inputDir + path.sep + this.inputFile;

//         this.outputDir = path.normalize(inputDir);
//         this.outputFile = null;
//         this.outputPath = null;
        
//         this.pdfParser = null;
//         this.curProcessor = curProcessor;
//     };

//     /*cls.prototype.validateParams = function() {
//         var retVal = null;

//         if (!fs.existsSync(this.inputDir))
//             retVal = "Input error: input directory doesn't exist - " + this.inputDir + ".";
//         else if (!fs.existsSync(this.inputPath))
//             retVal = "Input error: input file doesn't exist - " + this.inputPath + ".";
//         else if (!fs.existsSync(this.outputDir))
//             retVal = "Input error: output directory doesn't exist - " + this.outputDir + ".";

//         if (retVal != null) {
//             this.curProcessor.failedCount += 1;
//             return retVal;
//         }

//         var inExtName = path.extname(this.inputFile).toLowerCase();
//         if (inExtName !== '.pdf')
//             retVal = "Input error: input file name doesn't have pdf extention  - " + this.inputFile + ".";
//         else {
//             this.outputFile = path.basename(this.inputPath, inExtName) + ".json";
//             this.outputPath = this.outputDir + path.sep + this.outputFile;
//             if (fs.existsSync(this.outputPath))
//                 nodeUtil.p2jinfo("Output file will be replaced - " + this.outputPath);
//             else {
//                 var fod = fs.openSync(this.outputPath, "wx");
//                 if (!fod)
//                     retVal = "Input error: can not write to " + this.outputPath;
//                 else {
//                     fs.closeSync(fod);
//                     fs.unlinkSync(this.outputPath);
//                 }
//             }
//         }

//         return retVal;
//     };*/

//     cls.prototype.destroy = function() {
//         this.inputDir = null;
//         this.inputFile = null;
//         this.inputPath = null;
//         this.outputDir = null;
//         this.outputPath = null;

//         if (this.pdfParser) {
//             this.pdfParser.destroy();
//         }
//         this.pdfParser = null;
//         this.curProcessor = null;
//     };

//     cls.prototype.processFile = function(callback) {
//         /*var validateMsg = this.validateParams();
//         if (!!validateMsg) {
//             _continue.call(this, callback, validateMsg);
//         }
//         else {
//             _parseOnePDF.call(this, callback);
//         }*/
//         _parseOnePDF.call(this,callback);
//     };

//     return cls;
// })();

/*var error = .5;
var equals = function (one, two) {
    if (Math.abs(two - one) < error) {
        return true;
    } else {
        return false;
    }
};

var parseJSON = function(){
    console.log("Successfully converted PDF -> JSON");
    fs.writeFile("State08.json", JSON.stringify(json), function(err) {
        if(err){
            console.log(err);
        }
    });
    var finalrects = []; // will store final boxes
    var newLines = []; // these are combined fill objects
    var Verts = []; 
    var Horiz = [];
    var add = 0;
    //adding lines together
    for (var i = 0; i < json.formImage.Pages.length; i++) {
        var newFills = [];//to store new lines for a page
        var dead = [];//to store "dead" lines that were already added to another line
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
        newLines.push(newFills);
    }
    console.log("Finished making newLines. " + add + " lines were added");
    //line refinement
    var del = 0;
    for (var i = 0; i < newLines.length; i++) {
        var curh = [],
            curv = [];
        for (var j = 0; j < newLines[i].length; j++) {
            if (newLines[i][j].w > 0.6 && newLines[i][j].h > 0.6) {
                del++;
                newLines[i].splice(j, 1);
                j--;
            } else if (newLines[i][j].w > newLines[i][j].h) {
                curh.push(newLines[i][j]);
            } else if (newLines[i][j].w < newLines[i][j].h) {
                curv.push(newLines[i][j]);
            }
        }
        console.log("Page " + i + ". " + del + " boxes deleted. " + curh.length + " horiz lines. "+ curv.length + " vert lines.");
        Horiz.push(curh);
        Verts.push(curv);
    }
    //console.log(JSON.stringify(newLines));
    
    var xbnds = [];
    var ybnds = [];
    //making bounds
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
        console.log('Page '+pg+'. '+pgx.length+' x bounds. '+pgy.length+' y bounds.');
        xbnds.push(pgx);
        ybnds.push(pgy);
    }

    //console.log("xbnds" + JSON.stringify(xbnds));
    //console.log("ybnds" + JSON.stringify(ybnds));
    
    //making boxes
    var push = 0;
    for (var i = 0; i < ybnds.length; i++) {
        var pg = [];
        var right = null;
        for (var j = 0; j < ybnds[i].length; j++) {
            var bool = false;
            for(var k = 0; k < xbnds[i].length; k++){
                if(equals(ybnds[i][j].end,xbnds[i][k].xi)){
                    bool = true;
                    if(!right){ // if no right box created, 
                        right = {
                            x: xbnds[i][k].xi,
                            y: ybnds[i][j].yi,
                            w: xbnds[i][k].xf-xbnds[i][k].xi,
                            h: 0,
                            pg: i
                        };
                    }
                }
            }
            if(!bool && right){//if long and right exists                
                var rect = {
                    x: ybnds[i][j].begin,
                    y: ybnds[i][j].yi,
                    w: right.x - ybnds[i][j].begin,
                    h: ybnds[i][j].yf - ybnds[i][j].yi,
                    pg: i
                };
                pg.push(rect);
                push++;
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
                    pg: i
                };
                pg.push(rect);    
            }
        }
        finalrects.push(pg);
    }
    console.log('pushed '+push+' right boxes.');

    //splitting boxes
    var split = 0;
    for(var i = 0; i<finalrects.length; i++){
        for(var j = 0; j<finalrects[i].length; j++){
            var rect = finalrects[i][j];
            for(var k = 0; k<Verts[i].length; k++){
                var vline = Verts[i][k];
                //console.log("vline-"+JSON.stringify(vline));
                if(vline.x > rect.x && vline.x < rect.x+rect.w){
                    if((vline.y<rect.y || equals(vline.y,rect.y)) && (rect.y+rect.h<vline.y+vline.h || equals(rect.y+rect.h,vline.y+vline.h))){
                        split++;
                        finalrects[i][j] = {
                            x: rect.x,
                            y: rect.y,
                            w: vline.x-rect.x,
                            h: rect.h,
                        };
                        var newrect = {
                            x: vline.x,
                            y: rect.y,
                            w: rect.x+rect.w-vline.x,
                            h: rect.h
                        };
                        finalrects[i].push(newrect);
                    }
                }
            }
        }
    }
    console.log('split '+split+' boxes');
    console.log('finished making boxes');
    //console.log(JSON.stringify(finalrects));
    var str = "";
    for(var i = 0; i<json.formImage.Pages.length; i++){
        var pgtxt = json.formImage.Pages[i].Texts;
        for(var k = 0; k<pgtxt.length; k++){
                //console.log(pgtxt[k].R[0].T);
                str+=pgtxt[k].R[0].T+'\n';
            }
    }

    var regex = new RegExp('%20','g');
    str = str.replace(regex," ");
    regex = new RegExp('%3A','g');
    str = str.replace(regex,':');

    fs.writeFile("text.txt", str, function(err) {
        if(err){
            console.log(err);
        }
    });

};


var inputDir = path.dirname(input);
var inputFile = path.basename(input);

var p2j = new p2jcmd();
p2j.inputCount = 1;
p2j.p2j = new PDF2JSONUtil(inputDir, inputFile, p2j);
//p2j.p2j.processFile(_.bind(p2j.complete, p2j));
p2j.p2j.processFile(parseJSON);
*/




    var pdfText = require('pdf-text')
      , _ = require('lodash')
      , fs = require('fs');

    var mongo = require('mongodb');
    var monk = require('monk');
    var db = monk('localhost:27017/nodetest1');
    var collection = db.get("questions");

    var pathToPdf = __dirname + "/../A.pdf"

    exports.index = function(req, res) {
        pdfText(pathToPdf, function(err, chunks) {
            if(err){
               // throw err;
            }
            for(var i=0;i<chunks.length;i++) {
                if(chunks[i] === "Q" && ("" + chunks[i+1]).indexOf("UESTION") === 0) {
                    chunks[i+1] = "Q" + chunks[i+1];
                    chunks.splice(i, 1);
                }
            }
            chunks = _.map(chunks, function(x) { return x.trim(); });
            
            var out = []
              , mode = null
              , cur = {test: "", ques: "", tags: [], text: "", ans: [], key: ""}
              , key = []
              , test = "" // stores test id
              , data = ""; // to be printed to chunks.txt

            for(var i=0;i<chunks.length;i++) {
                data = data + chunks[i] + '\n';
                if(chunks[i] === "Computer Science Competition"){
                    test = chunks[i+1];
                } else if(chunks[i] === "QUESTION") {
                    if(cur["test"] !== "") {
                        out.push(cur);
                    }
                    cur = {test: test, ques: "", tags: [], text: "", ans: [], key: ""};
                    cur["ques"] = chunks[i+1];
                    i = i+2;
                    mode = 'txt';
                } else if (chunks[i].match(/^[A-E]\.$/i) !== null) {
                    mode = null;
                    cur['ans'].push(chunks[i+1]); // does not allow for multiple line answers
                } else if (chunks[i] === "Computer   Science   Answer   Key"){
                    mode = 'ans';
                    test = chunks[i+1];
                    i = i + 1;
                }
                switch(mode) {
                    case 'txt':
                        cur['text'] += chunks[i] + '\n';
                        break;
                    case 'ans':
                        console.log("+"+chunks[i]+"++"+i);
                        if(chunks[i]==="Notes:"){
                            i = chunks.length;
                        } else {
                            if(chunks[i].length>3){
                                var index = chunks[i].indexOf('.');
                                //key[chunks[i].substring(0,index)] = chunks[i][chunks[i].length-1];
                                key[chunks[i].substring(0,index)] = chunks[i][chunks[i].length-1];
                                console.log("added to key");
                            } else {
                                //key[chunks[i].substring(0,chunks[i].length-1)] = chunks[i+1];
                                key[chunks[i].substring(0,chunks[i].length-1)] = chunks[i+1];
                                i = i + 1;
                                console.log("added to key");
                            }
                        }
                        break;
                }
            }

            out.push(cur);

            fs.writeFile(__dirname + '/../chunks.txt', data, function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log('printed chunks');
                }
            });

            out = _.map(out, function(obj){
                console.log("NEW OBJ");
                console.log(obj);
                obj["key"]=key[parseInt(obj["ques"])];
                console.log(obj);
                return obj;
            });
            
            res.send([out,key]);
            collection.insert(out);
        });
    }

