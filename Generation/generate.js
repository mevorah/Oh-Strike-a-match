var VIEW_THRESHOLD = 500;
var MAX_CHOICE_LENGTH = 20;
var NUM_OPTIONS = 3;
var result = [];

var categories = ["Seinfeld", "Saturday Night Live sketches", "Nicktoons"];

for(category of categories){
    createQuestionAndAnswer(category);
}

function createQuestionAndAnswer(category){
    var categoryText = "Category:"+category;
    var queryURL = 'http://en.wikipedia.org/w/api.php?' +
	'callback=?' +
	'&format=json' +
	'&action=query' +
	'&list=categorymembers' +
	'&cmlimit=100' +
	'&cmtitle=' + categoryText +
	'&cmtype=subcat|page';
    $.ajax({
	   url: queryURL,
	   dataType: 'json',
        async: false,
        success: function(data){
            var process = newProcess(category);
            console.log(data);
            for(var page of data.query.categorymembers){
                processes[process]++;
                averagePageViews(categoryText, page.title, process);
            }
        }
    });
}

var averagePageViews = function(category, title, process) {
    $.ajax({
        url: 'http://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/' + title + '/daily/2015100100/2015103100',
        dataType: 'json',
        async: true,
        success: function(data){
            var sum = 0;
            var index = 0;
            for(item of data.items){
                index += 1;
                sum += item.views; 
            }
            var average = sum / index;
            filter(category, title, average, process);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
            IFinished(process);
        }
    })
}

var filter = function(category, title, average, process){
    var isAboveThreshold = average > VIEW_THRESHOLD;
    var answer = category.replace("Category:", "");
    var doesNotContainAnswer = !title.includes(answer);
    var choiceWithinLength = title.length < MAX_CHOICE_LENGTH;
    
    if(isAboveThreshold && doesNotContainAnswer && choiceWithinLength){
        result[process].push({title:title, average:average});
    }
    IFinished(process);
}

function printResult(res) {
    if(!(res.length < (NUM_OPTIONS + 1))){
        printHTML(res);
    }
}

function printHTML(res){
    var str = "<tr><td>" + res[0];
    for(var i = 1; i < res.length; i++){
        str += "<td>"+res[i].title+"</td>";
    }
    var row = str.concat("</tr>");
    $("#CSV").append(row);
}

/*-----------------------------------------------------------------------*/
var processes = [];

function IFinished(process){
    processes[process]--;
    if(processes[process] == 0){
        console.log(result[process]);
        printResult(result[process]);
    }
}

var newProcess = function(category) {
    result.push([category]);
    var index = processes.length;
    processes.push(0);
    return index;
}

