var pdfText = require('pdf-text')
  , _ = require('lodash')
  , fs = require('fs');

var pathToPdf = __dirname + "/../A.pdf"

exports.index = function(req, res) {
    pdfText(pathToPdf, function(err, chunks) {
        if(err) throw err;
        for(var i=0;i<chunks.length;i++) {
            if(chunks[i] === "Q" && ("" + chunks[i+1]).indexOf("UESTION") === 0) {
                chunks[i+1] = "Q" + chunks[i+1];
                chunks.splice(i, 1);
            }
        }
        chunks = _.map(chunks, function(x) { return x.trim(); });
        
        var out = []
          , mode = null
          , cur = {question: "", tags: [], text: "", ans: []}
          , key = {}
          , test = ""
          , data = ""; // to be printed to chunks.txt

        for(var i=0;i<chunks.length;i++) {
            data = data + chunks[i] + '\n';
            if(chunks[i] === "QUESTION") {
                if(cur !== {}) {
                    out.push(cur);
                    cur = {question: "", tags: [], text: "", ans: []};
                }
                cur["question"] = chunks[i+1];
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
                    if(chunks[i]==="Notes:"){
                        i = chunks.length;
                    } else {
                        console.log("+"+chunks[i]+"+");
                        if(chunks[i].length>3){
                            var index = chunks[i].indexOf('.');
                            key[chunks[i].substring(0,index)] = chunks[i][chunks[i].length-1];
                            console.log("added to key");
                        } else {
                            key[chunks[i].substring(0,chunks[i].length-1)] = chunks[i+1];
                            i = i + 1;
                            console.log("added to key");
                        }
                    }
                    break;
            }
        }

        fs.writeFile(__dirname + '/../chunks.txt', data, function(err){
            if(err){
                console.log(err);
            } else {
                console.log('printed chunks');
            }
        });

        out.push(cur);
        res.send([out,key]);
        
    });
}
