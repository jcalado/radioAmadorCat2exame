class FavQuiz {
	static messagesArray = {};
	static pageBlocks = [];
	static currentPage = 0;
	static test = false;
	constructor(json) {
		this.jsonFile = json;
		Quiz.pageBlocks = [];
		this.createQuiz();
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.has('TEST')) {
			Quiz.test = true;
		}
	}

	checkQuestion() {
		const index = parseInt(this.value);
		const question = Quiz.messagesArray.questions[index];
		const answer = question.correctIndex;
		const elements = document.getElementsByName('n' + index);
		var uniqueId = question.uniqueID;

		for (let i = 0; i < elements.length; i++) {
			if (elements[i].checked) {
				if (answer - 1 === i) {
					this.style.background = "#00FF00";
					this.innerHTML = "CERTO";
					if (Quiz.test == true) this.quiz.stroreAnswer(true, uniqueId);
					return;
				}
			}
		}

		const noteElement = document.getElementById('note' + index);
		noteElement.innerHTML = question.notes;
		this.style.background = "#FF0000";
		this.innerHTML = "ERRADO";

		if (Quiz.test == true) this.quiz.stroreAnswer(false, uniqueId);



	}
	stroreAnswer(isCorrect, answerId) {
		const parts = this.jsonFile.split('.');
		// Check if there is an existing record in local storage
		const existingRecords = JSON.parse(localStorage.getItem(parts[0])) || {};

		// Check if a record already exists for the answerId
		if (existingRecords.hasOwnProperty(answerId)) {
			// If a record exists, append the new correctness value to the array
			existingRecords[answerId].isCorrect.push(isCorrect);
		} else {
			// If no record exists, create a new one with an array containing the initial value
			existingRecords[answerId] = {
				isCorrect: [isCorrect],
			};
		}

		// Save the updated records back to local storage
		localStorage.setItem(parts[0], JSON.stringify(existingRecords));

		this.plotAnswers(existingRecords[answerId].isCorrect);

	}
	plotAnswers(answers) {

		const canvasDiv = document.getElementById('answerDisplay');
		canvasDiv.style.display = 'block'; // Show the canvas div
		canvasDiv.onclick = function() {
			canvasDiv.style.display = 'none';
		}

		const canvas = document.getElementById('canvas');
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const trueColor = 'green';
		const falseColor = 'red';

		const answerWidth = 30; // Width of each answer box
		const spacing = 10; // Spacing between answer boxes

		let x = 10;
		let y = 10;

		for (const answer of answers) {
			const color = answer ? trueColor : falseColor;

			ctx.fillStyle = color;
			ctx.fillRect(x, y, answerWidth, answerWidth);

			x += answerWidth + spacing;

			// Move to the next row if the canvas width is reached
			if (x + answerWidth > canvas.width) {
				x = 10;
				y += answerWidth + spacing;
			}
		}
	}

	showPage() {
		var index = parseInt(this.value);
		window.scrollTo(0, 0);

		if (index == 0) {

			index = 0;
		} else {
			index = index / 10;
		}
		for (const page of Quiz.pageBlocks) {
			page.style.display = "none";
		}
		Quiz.pageBlocks[index].style.display = "block";
		Quiz.currentPage = index;
	}
	createQuiz() {

		var numberOfUnanswered = 0;
		var questionCounter = 0;
		var ajaxRequest = new XMLHttpRequest();
		ajaxRequest.quiz = this;
		ajaxRequest.onreadystatechange = function() {

			if (ajaxRequest.readyState == 4) {
				//the request is completed, now check its status
				if (ajaxRequest.status == 200) {
					//turn JSON into array


					Quiz.messagesArray = JSON.parse(ajaxRequest.responseText);
					this.quiz.questions = Quiz.messagesArray.questions;
					var welcomeDiv = document.getElementById("welcome");
					welcomeDiv.innerHTML = "";
					var indexBlock = document.createElement("div");
					indexBlock.id = "qIndex";

					welcomeDiv.appendChild(indexBlock);
					var index = 0;
					const parts = this.quiz.jsonFile.split('.');
					const favoritesString = localStorage.getItem(parts[0] + "Fav") || '[]';
					const favorites = JSON.parse(favoritesString);
					for (var qindex in Quiz.messagesArray.questions) {
						if (favorites.includes(this.quiz.questions[qindex].uniqueID) == false) continue;
						var pageBlock;
						Quiz.messagesArray.questions[qindex].index = index;
						index++;
						if (questionCounter == 0) {
							pageBlock = document.createElement("div");
							pageBlock.id = "Page" + questionCounter;
							pageBlock.style.display = "block";
							pageBlock.className = 'page';
							let btn = document.createElement("button");
							btn.innerHTML = questionCounter / 10 + 1;
							btn.value = questionCounter;
							btn.onclick = this.quiz.showPage;
							indexBlock.appendChild(btn);
							Quiz.pageBlocks.push(pageBlock);

						} else if (questionCounter % 10 == 0) {
							pageBlock = document.createElement("div");
							pageBlock.id = "Page" + questionCounter;
							pageBlock.style.display = "none";
							pageBlock.className = 'page';
							let btn = document.createElement("button");
							btn.innerHTML = questionCounter / 10 + 1;
							btn.value = questionCounter;
							btn.onclick = this.quiz.showPage;
							indexBlock.appendChild(btn);
							Quiz.pageBlocks.push(pageBlock);
						}
						questionCounter++;

						var questionBlock = document.createElement("div");
						questionBlock.className = "questionBlock";
						questionBlock.id = "questionBlock"+qindex;

						var questionCard = document.createElement("div");
						questionCard.className = "questionCard";
						questionCard.id = "questionCardId"+qindex;
						questionBlock.appendChild(questionCard);

						var questiontxt = document.createElement("span");
						questiontxt.className = "question";
						questiontxt.innerHTML = this.quiz.questions[qindex].index + 1 + ") " + this.quiz.questions[qindex].question
						questionCard.appendChild(questiontxt);

						var answers = document.createElement("div");
						answers.className = "answers";

						var noteBlock = document.createElement("div");
						noteBlock.id = "note" + qindex;
						noteBlock.className = "questionImage";

						let i = 1;
						for (var key of Quiz.messagesArray.questions[qindex].answers) {

							let label = document.createElement("label");

							let input = document.createElement("input");
							input.type = "radio";
							input.value = i;
							input.name = "n" + this.quiz.questions[qindex].index;

							label.appendChild(input);
							label.innerHTML += key;

							answers.appendChild(label);
							i++;
						}

						questionCard.appendChild(answers);
						pageBlock.appendChild(questionBlock);

						if (this.quiz.questions[qindex].img) {
							var image = document.createElement("img");
							image.className = "questionImage";
							image.src = this.quiz.questions[qindex].img;
							questionBlock.appendChild(image);
						} else {

						}


						welcomeDiv.appendChild(pageBlock);

						questionCard.appendChild(noteBlock);
						if (Quiz.messagesArray.questions[qindex].correctIndex == null) {
							console.log("ERROR Q" + Quiz.messagesArray.questions[qindex].numb);
						}
						if (Quiz.messagesArray.questions[qindex].notes == null) {
							console.log("ERROR Q" + Quiz.messagesArray.questions[qindex].numb);
						}

						if (Quiz.messagesArray.questions[qindex].correctIndex == 0) {
							let notAvailble = document.createElement("div");
							notAvailble.innerHTML = "resposta Indisponivel";
							questionBlock.appendChild(notAvailble);
							console.log(Quiz.messagesArray.questions[qindex].numb);
							numberOfUnanswered++;
						} else {

							let btn = document.createElement("button");
							btn.innerHTML = "Verificar";
							btn.value = qindex;
							btn.quiz = this.quiz;
							btn.onclick = this.quiz.checkQuestion;
							questionCard.appendChild(btn);

							let starIcon = document.createElement("img");
							starIcon.unitqueId = Quiz.messagesArray.questions[qindex].uniqueID;

							starIcon.existingRecords = parts[0];
							if (localStorage && localStorage.getItem(starIcon.existingRecords + "Fav") !== null) {
								const favorites = JSON.parse(localStorage.getItem(starIcon.existingRecords + "Fav")) || [];
								if (favorites.includes(starIcon.unitqueId)) {
									starIcon.src = "images/starfav.png"; // Set the path to your star icon image
								} else {
									starIcon.src = "images/starnotfav.png"; // Set the path to your star icon image
								}
							} else {
								// Handle the case where localStorage is not available or favorites array is null
								starIcon.src = "images/starnotfav.png"; // Set the path to your default star icon image
								localStorage.setItem(starIcon.existingRecords + "Fav", JSON.stringify([]));
							}
							starIcon.value = qindex;
							starIcon.jsonFile=this.quiz.jsonFile;



							// Add a click event listener to the star icon
							starIcon.onclick = this.quiz.saveFav;

							

							questionCard.appendChild(starIcon);
						}
					}
					console.log("Unanswered" + numberOfUnanswered);

				} else {
					console.log("Status error: " + ajaxRequest.status);
				}
			} else {
				console.log("Ignored readyState: " + ajaxRequest.readyState);
			}
		};
		ajaxRequest.open('GET', this.jsonFile);
		ajaxRequest.send();
	}
	static showFavElement(cat, id) {
	  
	    const favorites = JSON.parse(localStorage.getItem(cat + "Fav")) ; // Parse and handle null/empty array
	    const element = document.getElementById(id);
	
		if (favorites === null || favorites.length === 0) {
	        element.style.display = "none"; // Hide the element if favorites is null or empty
	      } else {
	        element.style.display = "block"; // Show the element if it's in favorites
	      }
	    
	  }

	  static hideFavElement (cat, id) {
	    const element = document.getElementById(id);
	    element.style.display = "none"; // Hide the element if it's not in favorites
	      
	    
	  }
	saveFav() {
		var favorites = JSON.parse(localStorage.getItem(this.existingRecords + "Fav"));
		// Get the unique ID of the question associated with the clicked star
		const index = favorites.indexOf(this.unitqueId);
		if (index === -1) {
			// If not in favorites, add it
			favorites.push(this.unitqueId);

			
			this.src = "images/starfav.png"; // Set the path to your favorite star icon image
		} else {
			// If already in favorites, remove it
			const elements = document.getElementById("questionBlock" + this.value);
			elements.style.display = "none";
			
			
			favorites.splice(index, 1);
			this.src = "images/starnotfav.png"; // Set the path to your regular star icon image
			if (favorites.length==0)
			{
				new Quiz(this.jsonFile);
			}
		}

		// Save the updated favorites array back to local storage
		localStorage.setItem(this.existingRecords + "Fav", JSON.stringify(favorites));
		
		MatomoOptOutManager.update();
	}

}