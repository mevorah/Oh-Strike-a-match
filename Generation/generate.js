var VIEW_THRESHOLD = 200;
var MAX_CHOICE_LENGTH = 20;
var NUM_OPTIONS = 3;
var result = [];

var categories = [
'Acorna',
'Action characters',
'Action film characters',
'Action heroes',
'Action television characters',
'Action video game characters',
'Activists',
'Activities by jihadist groups',
'Adam and Eve',
'Adams family',
'Adoptees by nationality',
'Adoration of the Magi in art',
'Adrian Mole',
'Adventure characters',
'Adventure film characters',
'Advertising characters',
'Advertising people',
'Advisors',
'Advocates of pseudoscience',
'Afghan people',
'African American given names',
'African people by religion',
'African people stubs',
'African-American genealogy',
'African-American people',
'Afrikaans-speaking people',
'Afrikaner people',
'Afro-Brazilian people',
'Afroasiatic peoples',
'Afrocentrists',
'Agatha Christie characters',
'Agent Carter (TV series)',
'Agents of S.H.I.E.L.D.',
'Ainu people',
'Air pirates',
'Air traffic controllers',
'Airstrikes by perpetrator',
'Airstrikes conducted by France',
'Airstrikes conducted by Iran',
'Airstrikes conducted by Israel',
'Airstrikes conducted by Italy',
'Airstrikes conducted by Japan',
'Aku people',
'Al-Atassi family',
'Al-Azm family',
'Aladdin',
'Alaska Native people',
'Albanian biographers',
'Albanian people',
'Albanian people by war'
];

console.log("starting");
var i = 0;
var stagger = setInterval(function(){
    console.log("Creating Question ["+i+"] For:"+categories[i]);
    createQuestionAndAnswer(categories[i]);
    if(i == categories.length){
        clearInterval(stagger);
    }
    i++;
}, 10000)


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
                if(!page.title.includes("Category")){
                    processes[process]++;
                    averagePageViews(categoryText, page.title, process);
                }
            }
        }
    });
}

var rerun = [];
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
            rerun.push({category:category,title:title});
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
    }else{
        console.log("Not Pushing Page:"+title+"for Category:"+category+" due to [Average:"+average+", Length:"+choiceWithinLength+", doesNotcontainAnswer:"+doesNotContainAnswer+"]");
    }
    
    IFinished(process);
}

function printResult(res) {
    if(!(res.length < (NUM_OPTIONS + 1))){
        printHTML(res);
    }
}

function printHTML(res){
    var str = "<tr><td>" + res[0] + ",";
    for(var i = 1; i < res.length; i++){
        str += res[i].title+",";
    }
    str = str.substr(0, str.length - 1);
    str += "</td>";
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

