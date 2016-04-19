//Individual question and answer
function QandA(){
	this.category = "";
	this.url = "http://en.wikipedia.org/wiki/";
	this.question = "";
	this.correctAnswer = "";
	this.incorrect1 = "";
	this.incorrect2 = "";
	this.incorrect3 = "";
	this.answeredCorrectly = 0;
	this.answered = 0;
}

//Wiki Traverser
function WikiTraverser(){
}

WikiTraverser.prototype.numQuestionsGeneratedSoFar = 0;
WikiTraverser.prototype.qAndAs = [];

WikiTraverser.prototype.collectForCategory = function(category, trav){
	var toPopulate = [];
	this.traverseCategory(category, toPopulate, trav);
}

//Takes a starting category and traverses down a path
//of random categories. On every child category, all of the
//pageid's are collected and put into an array resembling:
//Array< Array<pageId> > where the inner array represents
//a category from which those pageIds were found. In generating
//question and answers, it makes sense that those towards the end
//of the array, ie further away from the base category, will be more
//difficult to answer than those general questions found at the beginning
//closer to the base category.
WikiTraverser.prototype.traverseCategory = function(nextCategory, toPopulate, trav){
	//Create url, ie the actual search
	var urlC = 'http://en.wikipedia.org/w/api.php?' +
	'callback=?' +
	'&format=json' +
	'&action=query' +
	'&list=categorymembers' +
	'&cmlimit=100' +
	'&cmtitle=' + nextCategory +
	'&cmtype=subcat|page';


	//Perform query
	$.ajax({
		url: urlC,
		dataType: 'json',
		async: false,
		success: function(data){
			var json_data = JSON.stringify(data);
			var wikiData = jQuery.parseJSON(json_data);
			var categoryMembers = wikiData.query.categorymembers;

			var pages = [];
			var categories = [];

			//Right here you have all of the subcategories and
			//pages within a category.

			categoryMembers.forEach(function(entry){
				//determine if entry is a category or page
				var split = entry.title.split(":");
				if(split[0] === "Category"){
					categories.push("Category:" + split[1]);
				}else{
					//Pushing pageids
					//May want to consider page names,
					//really just depends on the easiest
					//way to search and pull up an article.
					//title for page title
					pages.push(entry.title);
				}
			});
			//	console.log("Categories:" + categories);
			//	console.log("Pages:" + pages);
			toPopulate.push(pages);

			if(categories.length > 0){
				var catIndex = Math.floor(Math.random() * categories.length);
				var	nextCategory = categories[catIndex];
			//	console.log("Next Category to search:" + nextCategory);
				WikiTraverser.prototype.traverseCategory(nextCategory, toPopulate, trav);
			}else{
				WikiTraverser.prototype.populateQuestions(toPopulate, trav);
			}
		}
	});
}


//Because AJAX works asynchronously, a timeout must be set
//in order for the function to have enough time to populate
//the array.

//Consider changing to a polling function that checks if the array has returned
//data;
WikiTraverser.prototype.populateQuestions = function(toPopulate, trav){
	//console.log(toPopulate);
	var groupsOfFour = [];

	var numAnswers = 0;
	toPopulate.forEach(function(arr){
		var arrayLength = arr.length;
		numAnswers += arrayLength;
	});

	if(numAnswers >= 20){
		var total = 0;
		for(var i = toPopulate.length - 1; i >= 0; i--){
			var cat = toPopulate[i];
			while(cat.length >= 4){
				var group = [];
				for(var j = 0; j < 4; j++){
					var index =  Math.floor(Math.random() * cat.length);
					var page = cat[index];
					group.push(page);
					cat.splice(index, 1);
				}
				groupsOfFour.push(group);
			}
		}
	}

	//Generate
	for(var r = 0; r < 5; r++){
		this.generateQandA(groupsOfFour[r], trav);
	}
},

WikiTraverser.prototype.generateQandA = function(groupOfFour, trav){
//	console.log(groupOfFour);
	var url = 'http://en.wikipedia.org/w/api.php?' +
	'callback=?' +
	'&format=json' +
	'&action=query' +
	'&prop=extracts' +
	'&exsectionformat=plain' +
	'&exsentences=2' +
	'&titles=' + groupOfFour[0] + '|' +
	groupOfFour[1] + '|' +
	groupOfFour[2] + '|' +
	groupOfFour[3];
	$.getJSON(url, function(data){
		var json_data = JSON.stringify(data);
		var wikiData = jQuery.parseJSON(json_data);
		var question = [];
		$.each(wikiData.query.pages, function(key, value){
			//console.log(value);
			question.push(value);
		});

		//In parsing, use try catch block
		var item = new QandA();
		//Generate URL
		question.forEach(function(entry){
			item.category = trav.category;
			if(entry.extract != undefined){

				item.correctAnswer = entry.title;
				var rawQuestion = entry.extract;

				var html = rawQuestion;
				var div = document.createElement("div");
				div.innerHTML = html;
				var text = div.textContent || div.innerText || "";
				var question = text.replace(item.correctAnswer, "______", "gi");

				item.question  = question;

			}else if(item.incorrect1 == ""){
				item.incorrect1 = entry.title;
			}else if(item.incorrect2 == ""){
				item.incorrect2 = entry.title;
			}else if(item.incorrect3 == ""){
				item.incorrect3 = entry.title;
			}else{
				console.log("Error: Something Wrong in GenerateQandA");
			}
		});
		var title = item.correctAnswer;
		item.url += title.replace(/ /g, "_");


		//Put into appropriate category groups
		var catExists = 0;
		for(var i = 0; i < WikiTraverser.prototype.qAndAs.length; i++){
			if(item.category === WikiTraverser.prototype.qAndAs[i][0].category){
				catExists = 1;
				WikiTraverser.prototype.qAndAs[i].push(item);
			}
		}
		if(catExists === 0){
			WikiTraverser.prototype.qAndAs.push([item]);
		}

		WikiTraverser.prototype.numQuestionsGeneratedSoFar++;

	});
}
