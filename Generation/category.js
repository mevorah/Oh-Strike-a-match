
var roots = ["People"];
var toVisitCategories = new Set();
var visitedCategories = new Set();

createCategories(roots);

function catefy(category){
    return "Category:" + category;
}

function queryUrl(category){
    var url = 'http://en.wikipedia.org/w/api.php?' +
	'callback=?' +
	'&format=json' +
	'&action=query' +
	'&list=categorymembers' +
	'&cmlimit=100' +
	'&cmtitle=' + category +
	'&cmtype=subcat|page';
    return url;
}

function createCategories(cats){
    var fullCats = [];
    for(category of cats){
        fullCats.push(catefy(category));
    }
    for(var root of fullCats){
        toVisitCategories.add(root);
    }
    for(var category of toVisitCategories){
        traverse(category);
    }
}

function isCategory(category){
    return category.includes("Category:");
}

function deCatefy(category){
    return category.replace("Category:", "");
}


var MAX_CHOICE_LENGTH = 40;
function filteredOut(category){
    var choiceWithinLength = category.length < MAX_CHOICE_LENGTH;
    if(!choiceWithinLength){
        return true;
    }
    return false;
}

var count = 0;
function printCategory(category){
    if(filteredOut(category)) return;
    var c = deCatefy(category);
    //var row = "<tr><td>" + c + "</tr></td>";
    count++;
    //var row = "<tr><td>" + count + "</td><td>" + c + "</td></tr>";
    var row = "<tr><td>" + c + "</td></tr>";

    $("#CSV").append(row);
}


function traverse(category){
    $.ajax({
        url: queryUrl(category),
        dataType: 'json',
        async: true,
        success: function(data){
            console.log(data);
            markVisited(category);
            for(categoryMember of data.query.categorymembers){
                var title = categoryMember.title;
                if(isCategory(title) && 
                   !visitedCategories.has(title)){
                    printCategory(title);
                    traverse(title);
                }
            }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
        }
    });
}

function markVisited(category){
    visitedCategories.add(category);
}