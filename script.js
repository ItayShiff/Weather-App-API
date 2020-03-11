/*
async function check() {
	let url = 'http://api.openweathermap.org/data/2.5/weather?q=Orlando&units=celcius&APPID=fb2fefe4ce6886c61bd1f92aef08735a';
	let response = await fetch(url);

	let result = await response.json(); // read response body and parse as JSON

	console.log(result);
}
check();
*/

let weather = document.getElementById('weather');
let city = document.getElementById('cityname');
let country = document.getElementById('countryname');
let name = document.getElementById('name');
let info = document.getElementById('infoGenerated');
let wrapper = document.querySelector('wrapper');
let errorElem = document.createElement('div');
let flag = document.getElementById('flagCode');

let background = document.getElementById('background');
let beforeBackground = document.getElementById('beforeBackground');
let logo = document.getElementById('logo');


search.onclick = MakeWeather;

function MakeWeather() {
	if (country.value=="" && city.value=="" && units.selectedIndex==0) {
		alert("You must enter city, country and select a unit.");
		country.style.border = city.style.border = '3px solid red';
		return;
	}
	if (country.value=="" && city.value=="" && units.selectedIndex!=0) {
		alert("You didn't enter city and country.");
		country.style.border = city.style.border = '3px solid red';
		return;
	}
	if (city.value=="" && country.value!="") {
		alert("You didn't enter any city.");
		city.style.border = '3px solid red';
		country.style.border = "";
		return;
	} 
	if (country.value=="" && city.value!="") {
		alert("You didn't enter any country.");
		country.style.border = '3px solid red';
		city.style.border = "";
		return;
	}
	if (country.value!="" && city.value!="") { // If everything is entered correctly
		city.style.border = "";
		country.style.border = "";
	}
	if (units.selectedIndex==0) {
		alert("You must select units.");
		return;
	}
	LoadingAnimations();
	// Generating a picture from Google API - Daily limit 100 requests ah
	let googlePic = fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBsA-UvYiDRPAOxD-jyLVihoGhUl09BQV4&cx=001298800645163162184:opuhkqkyi4y&q=${city.value}%20${country.value}&searchType=image`)
		.then(response => {
			if (response.ok) return response.json();
			throw new Error(response.statusText);
	  })
		.catch(err => {
			console.log("THERE IS AN ERROR USING GOOGLE API SO I'LL USE PEXELS INSTEAD");
			// API to get background according to the country picture from PEXELS 
			let pexels = fetch(`https://api.pexels.com/v1/search?query=${country.value}&per_page=15&page=1`, {
			  headers: {
			    Authorization: '563492ad6f9170000100000161bbd02306f344b2b172cd001d3d85da'
			  }})
				.then(response => {
			  		return response.json();
			  })
				  .then(result => { 
				  	if (result.total_results==0) {
				  		wrapper.hidden = true;
				  		errorElem.innerHTML = "Sorry, there's no such country.";
				  		clearInterval(rotatingCircle);
						circleLoad.remove();
						clearInterval(loadingAnimation);
						loading.remove();
						text.style.paddingBottom = '5px';
				  		info.append(errorElem);
				  		return;
				  	} else {
				  		borderAnimation();
				  		setTimeout(() => {
				  			movingBorderRight.style.borderRadius = '15px';
				  			movingBorderRight.style.left = text.getBoundingClientRect().left + 'px';

				  			let timesCalled = background.dataset.times;
							timesCalled++;
							background.dataset.times = timesCalled;
							let endClip = 80; // For the second and so on animations of clip path 
							if (timesCalled==1) background.src = result.photos[0].src.original; // If it's the just first time called, so just set it.
							if (timesCalled>1) { // if it's not the first time, so do clip path animation
								let clipSmaller = setInterval(() => {
									background.style.clipPath = `circle(${endClip}%)`;
									console.log(getComputedStyle(background).clipPath);
									endClip--;
									if (getComputedStyle(background).clipPath == 'circle(10% at 50% 50%)') {
										clearInterval(clipSmaller);
										background.src = result.photos[0].src.original;
										}
									}, 10);
								}
				  		}, 1500); // 1500 because it's the time it takes for the border animation to end, so after this, show background.
				  		
				 		}
			  });
		})
		  .then(result => {
		  	if (result == undefined) { return; }

	  		function SetBackground() {
				let timesCalled = background.dataset.times;
				timesCalled++;
				background.dataset.times = timesCalled;
					let endClip = 80; // For the second and so on animations of clip path 
					if (timesCalled==1) background.src = result.items[0].link; // If it's the just first time called, so just set it.
					if (timesCalled>1) { // if it's not the first time, so do clip path animation
						let clipSmaller = setInterval(() => {
							background.style.clipPath = `circle(${endClip}%)`;
							console.log(getComputedStyle(background).clipPath);
							endClip--;
							if (getComputedStyle(background).clipPath == 'circle(10% at 50% 50%)') {
								clearInterval(clipSmaller);
								background.src = result.items[0].link;
								}
							}, 10);
					}
			}

		  	if (result.spelling) { // If there's need for spelling correction
		  		alert(`Don't worry I corrected your typos 😊`);

				// To count the spaces made in the corrected version For example New York United States = 3
				let lengthSpaces = result.spelling.correctedQuery.match(/\s+/g).length;
				// Diving them by spaces by array, for Example arr[0] = Jerusalem, arr[1] = Israel
				let arr = result.spelling.correctedQuery.match(/\p{L}+/gu); 

		  		function isDoubleByte(str) { // To check the language of the entered country&name, false = English, true = not English
			    for (var i = 0, n = str.length; i < n; i++) {
			        if (str.charCodeAt( i ) > 255) { return true; }
			    }
			    return false;
				}

				if (isDoubleByte(city.value+country.value) && lengthSpaces==1) { // If there's need for correction in other language than English
			  		city.value = arr[0];
			  		country.value = arr[1];
				}
				if (!isDoubleByte(city.value+country.value) && lengthSpaces==1) { // There's need for correction in English, also capitalizing first letter
			  		city.value = arr[0].charAt(0).toUpperCase() + arr[0].slice(1);
			  		country.value = arr[1].charAt(0).toUpperCase() + arr[1].slice(1);  		
		  		}

		  		if (!isDoubleByte(city.value+country.value) && lengthSpaces==2) { // There's need for correction in English, also capitalizing first letter
		  			city.value = arr[0].charAt(0).toUpperCase() + arr[0].slice(1) + " " + arr[1].charAt(0).toUpperCase() + arr[1].slice(1);
		  			country.value = arr[2].charAt(0).toUpperCase() + arr[2].slice(1);
		  		}
		  		if (!isDoubleByte(city.value+country.value) && lengthSpaces==3) { // There's need for correction in English, also capitalizing first letter
		  			city.value = arr[0].charAt(0).toUpperCase() + arr[0].slice(1) + " " + arr[1].charAt(0).toUpperCase() + arr[1].slice(1);
		  			country.value = arr[2].charAt(0).toUpperCase() + arr[2].slice(1) + " " + arr[3].charAt(0).toUpperCase() + arr[3].slice(1);
		  		}

	  			//There's a need to generate a new picture because the generated picture previously gave wrong results, so searching now with correct results
		  		fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBsA-UvYiDRPAOxD-jyLVihoGhUl09BQV4&cx=001298800645163162184:opuhkqkyi4y&q=${city.value}%20${country.value}&searchType=image`)
				.then(response => {
				  		return response.json();
			  	})
					  .then(result => {
					  	RemoveGeoPic();	  	
					  	borderAnimation();
				  		setTimeout(() => {
				  			movingBorderRight.style.borderRadius = '15px';
				  			movingBorderRight.style.left = text.getBoundingClientRect().left + 'px';
				  			SetBackground();
				  		}, 1500); // 1500 because it's the time it takes for the border animation to end, so after this, show background.
					});

		  	} else { // There's no need for correction
		  		RemoveGeoPic();
		  		borderAnimation();
		  		setTimeout(() => {
		  			movingBorderRight.style.borderRadius = '15px';
		  			movingBorderRight.style.left = text.getBoundingClientRect().left + 'px';
		  			SetBackground();
		  		}, 1500); // 1500 because it's the time it takes for the border animation to end, so after this, show background.
		  	}
		  	
		  	
	  });

		background.onload = function() { // Success 
			

			background.style.clipPath = 'circle(10%)';
			let initialClip = 10; // For the first background clip path animation
	
			// Make clip path animation happen only in the first time
			let clipBigger = setInterval(() => {
				background.style.clipPath = `circle(${initialClip}%)`;
				console.log(getComputedStyle(background).clipPath);
				initialClip+= 1;
				if (getComputedStyle(background).clipPath == 'circle(80% at 50% 50%)') clearInterval(clipBigger);
			}, 15);
			

			// Remove loading animations
			clearInterval(rotatingCircle);		 			
			circleLoad.remove();
			clearInterval(loadingAnimation);
			loading.remove();
			text.style.paddingBottom = '5px';

			wrapper.hidden = false;
			console.log('loaded!');
			

			//API to get weather information according to the entered City & Country
			fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city.value},${country.value}&units=${units.options[units.selectedIndex].value}&APPID=fb2fefe4ce6886c61bd1f92aef08735a`) 
			  .then(response => {
			  	if (response.ok) return response.json();
			  	throw new Error(response.statusText);
			  })
			  .catch(function(err) {
			  		wrapper.hidden = true; 
			  		errorElem.innerHTML = `${err}`;
			  		info.append(errorElem);
			  		text.style.left = (innerWidth-text.clientWidth)/2 + 'px';
			  })
			  .then(result => {
			  		if (result === undefined) return;
			  		if (errorElem) { 
			  			errorElem.remove();
			  			wrapper.hidden = false;
			  		}

				  	let iconURL = ("https://openweathermap.org/img/w/" + result.weather[0].icon + ".png"); 
				  	icon.setAttribute("src", iconURL); // Set icon image
				  	icon.nextSibling.nextSibling.innerHTML = result.weather[0].description.charAt(0).toUpperCase() + result.weather[0].description.slice(1); // Getting description info
				  	
				  	name.children[0].innerHTML = `You searched for ${result.name}, ${result.sys.country}`;
				  	flag.src = `https://www.countryflags.io/${result.sys.country}/shiny/64.png`;
				  	flag.style.height = '40px';

				  	let rightSymbol = GetRightSymbol(units.options[units.selectedIndex].value);
				  	temp.innerHTML = `The weather now in ${result.name} is: <u>${result.main.temp}°${rightSymbol}</u> but it actually feels like <u>${result.main.feels_like}°${rightSymbol}</u>`;
				  	humidity.innerHTML = `The humidity now in ${result.name} is about <u>${result.main.humidity}%`;

				  	text.style.left = (innerWidth-text.clientWidth)/2 + 'px';
				  	logo.style.left = (innerWidth-logo.clientWidth)/2 + 'px';
				}
			  );
		};
	  
}

function GetRightSymbol(x) {
	if (x == "metric") return "C";
	if (x == "imperial") return "F";
	return "K";
}

city.onkeydown = country.onkeydown = (e) => (e.code=="Enter") ? MakeWeather() : true; // True because if false = disabling entering keys


// This is making animation of mousedown and mouseup, as if it's keyboard Key
search.onmousedown = geo.onmousedown =  function(e) {
	e.target.classList.add('onclick');

	if (e.target.classList.contains('onup')) {
		e.target.classList.remove('onup');
	}
};
search.onmouseup = geo.onmouseup = function(e) {
	e.target.classList.remove('onclick');
	e.target.classList.add('onup');
}
// This is used in case the person triggered mouseup after mousedown on button but then left mouse not on button, so that it still remained with wrong styles('onclick')
window.onmouseup = function(e) {
	if (document.elementFromPoint(e.clientX, e.clientY).tagName != 'BUTTON') {
		if (search.classList.contains('onclick')) {
			search.classList.remove('onclick');
			search.classList.add('onup');
		}
		if (geo.classList.contains('onclick')) {
			geo.classList.remove('onclick');	
			geo.classList.add('onup');	
		} 
	}
}


function LoadingAnimations() {
	if (!wrapper.hidden) wrapper.hidden = true;

	text.style.paddingBottom = '45px';
	let circleLoading = '<img src="circle.png" id="circleLoad">';
	let loadingOuterHTML = '<div id="loading">Loading</div>';

	// Responsive note
	if (innerWidth>1384) { // Make loading animation show under Geolocation search
		geo.insertAdjacentHTML('afterEnd', circleLoading);
		geo.insertAdjacentHTML('afterEnd', loadingOuterHTML);
	} else { // Make loading animation show under the SEARCH button
		geo.insertAdjacentHTML('afterEnd', circleLoading);
		search.insertAdjacentHTML('afterEnd', loadingOuterHTML);
	}
	
	console.log('now loading animations');
    circleLoad = document.getElementById('circleLoad');
	circleLoad.style.height = 35 + 'px';
	circleLoad.style.width = 35 + 'px';

	loading = document.getElementById('loading');
	loading.style.textAlign = 'center';
	loading.innerHTML = "Loading";

	circleLoad.style.position = loading.style.position = 'absolute';
	circleLoad.style.bottom = loading.style.bottom = '10px';

	loading.style.left = (text.offsetWidth-(loading.offsetWidth-circleLoad.offsetWidth))/2 + 'px';
	circleLoad.style.left = loading.getBoundingClientRect().left - text.offsetLeft - 50 + 'px';
	

	let UpOrDown = 0; // 0 = going up, 1 = going down
	let rotateDeg = 10;
	this.rotatingCircle = window.setInterval(() => {
		circleLoad.style.transform = `rotate(${rotateDeg}deg)`;
		rotateDeg+= 4;
	}, 20);
	this.loadingAnimation = window.setInterval(() => {
		if (UpOrDown==0) {
			loading.innerHTML += ".";
			if (loading.innerHTML=="Loading....") {
				UpOrDown = 1;
			}
		} else {
			loading.innerHTML = loading.innerHTML.slice(0, loading.innerHTML.length-1); // Removing last letter every 300ms until "Loading"
			if (loading.innerHTML=="Loading") {
				UpOrDown = 0;
			} 
		}
		
	}, 300);
}

let options = {
	  enableHighAccuracy: true
	};
geo.onclick = function() {
	// Used to get the user's own locations
	navigator.geolocation.getCurrentPosition(success, error, options);

	function success(pos) {
		
		if (units.selectedIndex==0) {
			alert("You must select units.");
			return;
		}
		LoadingAnimations();

	  geo.innerHTML = 'Use my own location!';
	  let lat = pos.coords.latitude;
	  let lon = pos.coords.longitude;
	  fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units.options[units.selectedIndex].value}&APPID=fb2fefe4ce6886c61bd1f92aef08735a`)
	  .then(response => {
	  	if (response.ok) return response.json();
	  	throw new Error(response.statusText);
	  })
	  .then(result => {

	  	let geoImage = document.createElement('img');

	  	//Now after we got the weather information, we will use the City & Country to find a background picture
	  	city.value = result.name;
	  	country.value = result.sys.country;
		  	fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBsA-UvYiDRPAOxD-jyLVihoGhUl09BQV4&cx=001298800645163162184:opuhkqkyi4y&q=${city.value}%20${country.value}&searchType=image`)
				.then(response => {
				  		if (response.ok) return response.json();
						throw new Error(response.statusText);
			  })
				.catch(err => {
					console.log("THERE IS AN ERROR USING GOOGLE API SO I'LL USE PEXELS INSTEAD");
					// API to get background according to the country picture from PEXELS 
					let pexels = fetch(`https://api.pexels.com/v1/search?query=${country.value}&per_page=15&page=1`, {
					  headers: {
					    Authorization: '563492ad6f9170000100000161bbd02306f344b2b172cd001d3d85da'
					  }})
						.then(response => {
					  		return response.json();
					  })
						  .then(result => { 
						  	if (result.total_results==0) {
						  		wrapper.hidden = true;
						  		errorElem.innerHTML = "Sorry, there's no such country.";
						  		// Remove loading animations
								clearInterval(rotatingCircle);
								console.log(circleLoad);
								circleLoad.remove();
								clearInterval(loadingAnimation);
								loading.remove();
								text.style.paddingBottom = '5px';
						  		info.append(errorElem);
						  		return;
						  	} else {
						  		borderAnimation();
						  		setTimeout(() => {
						  			movingBorderRight.style.borderRadius = '15px';
						  			movingBorderRight.style.left = text.getBoundingClientRect().left + 'px';

						  			let timesCalled = background.dataset.times;
									timesCalled++;
									background.dataset.times = timesCalled;
									let endClip = 80; // For the second and so on animations of clip path 
									if (timesCalled==1)  {
									background.src = result.photos[0].src.original; // If it's the just first time called, so just set it.
									background.style.clipPath = 'circle(10%)';
								}

									if (timesCalled>1) { // if it's not the first time, so do clip path animation
										let clipSmaller = setInterval(() => {
											background.style.clipPath = `circle(${endClip}%)`;
											console.log(getComputedStyle(background).clipPath);
											endClip--;
											if (getComputedStyle(background).clipPath == 'circle(10% at 50% 50%)') {
												clearInterval(clipSmaller);
												background.src = result.photos[0].src.original;
												}
											}, 10);
										}
						  		}, 1500); // 1500 because it's the time it takes for the border animation to end, so after this, show background.
						  		
						 		}
					  });
						  background.onload = () => {
						  	
					  		let initialClip = 10; // For the first background clip path animation
						
							// Make clip path animation happen only in the first time
							let clipBigger = setInterval(() => {
								background.style.clipPath = `circle(${initialClip}%)`;
								console.log(getComputedStyle(background).clipPath);
								initialClip+= 1;
								if (getComputedStyle(background).clipPath == 'circle(80% at 50% 50%)') clearInterval(clipBigger);
							}, 15);
						  	
						  		
						  	
						  	clearInterval(rotatingCircle);		 			
							circleLoad.remove();
							clearInterval(loadingAnimation);
							loading.remove();
							text.style.paddingBottom = '5px';
							wrapper.hidden = false;
							console.log('loaded geo in PEXELS!');
							
						  	let iconURL = ("https://openweathermap.org/img/w/" + result.weather[0].icon + ".png"); 
						  	icon.setAttribute("src", iconURL); // Set icon image
						  	icon.nextSibling.nextSibling.innerHTML = result.weather[0].description.charAt(0).toUpperCase() + result.weather[0].description.slice(1); // Getting description info
						  	
						  	name.children[0].innerHTML = `You are in ${result.name}, ${result.sys.country}`;
						  	flag.src = `https://www.countryflags.io/${result.sys.country}/shiny/64.png`;
						  	flag.style.height = '40px';

						  	let rightSymbol = GetRightSymbol(units.options[units.selectedIndex].value);
						  	temp.innerHTML = `The weather now in ${city.value} is: <u>${result.main.temp}°${rightSymbol}</u> but it actually feels like <u>${result.main.feels_like}°${rightSymbol}</u>`;
						  	humidity.innerHTML = `The humidity now in ${result.name} is about <u>${result.main.humidity}%`
						  	text.style.left = (innerWidth-text.clientWidth)/2 + 'px';
						  	logo.style.left = (innerWidth-logo.clientWidth)/2 + 'px';
						  }
				})

			 	.then(result => {
			 			if (result==null) return;
			 			// Remove loading animations	
			 			clearInterval(rotatingCircle);		 			
						circleLoad.remove();
						clearInterval(loadingAnimation);
						loading.remove();
						text.style.paddingBottom = '5px';

						borderAnimation();
				  		setTimeout(() => {
				  			movingBorderRight.style.borderRadius = '15px';
				  			movingBorderRight.style.left = text.getBoundingClientRect().left + 'px';

				  			let timesCalled = background.dataset.times;
							timesCalled++;
							background.dataset.times = timesCalled;
								let endClip = 80; // For the second and so on animations of clip path 
								if (timesCalled==1) geoImage.src = result.items[0].link; // If it's the just first time called, so just set it.
								if (timesCalled>1) { // if it's not the first time, so do clip path animation
									let clipSmaller = setInterval(() => {
										background.style.clipPath = `circle(${endClip}%)`;
										console.log(getComputedStyle(background).clipPath);
										endClip--;
										if (getComputedStyle(background).clipPath == 'circle(10% at 50% 50%)') {
											clearInterval(clipSmaller);
											geoImage.src = result.items[0].link;
											}
										}, 10);
								}
				  		}, 1500); // 1500 because it's the time it takes for the border animation to end, so after this, show background.
					  	geoImage.id = "geoimage";
					  	document.body.append(geoImage);
					  	background.hidden = true;

					});
			 	
		geoImage.onload = () => {
			wrapper.hidden = false;
			console.log('loaded geo!');
			
		  	let iconURL = ("https://openweathermap.org/img/w/" + result.weather[0].icon + ".png"); 
		  	icon.setAttribute("src", iconURL); // Set icon image
		  	icon.nextSibling.nextSibling.innerHTML = result.weather[0].description.charAt(0).toUpperCase() + result.weather[0].description.slice(1); // Getting description info
		  	
		  	name.children[0].innerHTML = `You are in ${result.name}, ${result.sys.country}`;
		  	flag.src = `https://www.countryflags.io/${result.sys.country}/shiny/64.png`;
		  	flag.style.height = '40px';

		  	let rightSymbol = GetRightSymbol(units.options[units.selectedIndex].value);
		  	temp.innerHTML = `The weather now in ${city.value} is: <u>${result.main.temp}°${rightSymbol}</u> but it actually feels like <u>${result.main.feels_like}°${rightSymbol}</u>`;
		  	humidity.innerHTML = `The humidity now in ${result.name} is about <u>${result.main.humidity}%`
		  	text.style.left = (innerWidth-text.clientWidth)/2 + 'px';
		  	logo.style.left = (innerWidth-logo.clientWidth)/2 + 'px';
		  }
	  });
	}

	function error(err) {
	  geo.innerHTML = `I'm sorry but Geolocation is unavaiable for you`;
	}

};

// Used in case need to remove geo picture and generate background picture made by search
function RemoveGeoPic() {
	if (document.body.children[document.body.children.length-1].tagName != 'IMG') return; // If the last element is not an IMG = Geo was not called, so return nothing.
	document.body.children[document.body.children.length-1].remove();
	background.hidden = false;
}

window.addEventListener('load', (event) => {
	document.body.hidden = false; // Initially the body is hidden, then this is used to avoid 'First Painting Bug' showing for X ms
	
	text.style.width = innerWidth/2.5 + 'px';

	text.style.left = (innerWidth-text.offsetWidth)/2 + 'px';
	text.style.top = (innerHeight-text.offsetHeight)/2 + 'px';

	logo.style.width = text.offsetWidth/1.5 + 'px';
	logo.style.height = text.getBoundingClientRect().top - 50 + 'px';
	logo.style.left = (innerWidth-logo.clientWidth)/2 + 5 + 'px';
	logo.style.top = text.getBoundingClientRect().top - logo.offsetHeight - 20 + 'px';
	background.style.position = beforeBackground.style.position = logo.style.position = 'absolute';

	//Responsive notes
	if (innerWidth<1700) {
		text.style.width = innerWidth/2 + 'px';
		text.style.left = (innerWidth-text.offsetWidth)/2 + 'px';
		text.style.top = (innerHeight-text.offsetHeight)/2 + 'px';
	}
    if (innerWidth<1150) {
    	credit.style.top = innerHeight - 60 + 'px';
		credit.children[0].style.left = (innerWidth-credit.children[0].clientWidth)/2 +'px';
		credit.children[1].style.left = (innerWidth-credit.children[1].clientWidth)/2 +'px';
		credit.children[1].style.top = credit.children[1].clientHeight + 5 + 'px';
	}
	if (innerWidth<1384) {
		text.insertBefore(search, info);
	}
	if (innerWidth<1300) {
		logo.style.width = text.offsetWidth/3*2.5 + 'px';
		logo.style.left = (innerWidth-logo.clientWidth)/2 + 'px';
	}
	if (innerWidth<740) {
		logo.style.height = text.getBoundingClientRect().top - 50 + 'px';
	}
	if (innerWidth<640) {
		text.style.width = text.offsetWidth/3*4 + 'px';
		text.style.left = (innerWidth-text.offsetWidth)/2 + 'px';
		logo.style.width = text.offsetWidth/3*2.5 + 'px';
		logo.style.left = (innerWidth-logo.clientWidth)/2 + 'px';
	}

	if (innerHeight+250>innerWidth) {
		text.style.width = '70%';
		text.style.left = (innerWidth-text.offsetWidth)/2 + 'px';
		logo.style.width = text.offsetWidth/3*2.5 + 'px';
		logo.style.left = (innerWidth-logo.clientWidth)/2 + 'px';
	}

	//Moving border right animation
	movingBorderRight.style.cssText = `
	position: absolute;
	height: 30px;
	width: ${text.clientWidth-10}px;
	left: ${text.getBoundingClientRect().left+4}px;
	top: ${text.getBoundingClientRect().top}px;
	z-index: 557;
	`
	movingBorderRight.style.borderTop = '5px solid #003cb3';
	movingBorderRight.style.width = '10px';
	movingBorderRight.style.left = text.getBoundingClientRect().left + 'px';
	movingBorderRight.hidden = true;
});



function borderAnimation() {
	movingBorderRight.style.borderRadius = "0";
	movingBorderRight.style.borderTopLeftRadius = "15px";
	movingBorderRight.hidden = false;
	function animate({timing, draw, duration}) {

	  let start = performance.now();

	  requestAnimationFrame(function animate(time) {
	    // timeFraction goes from 0 to 1
	    let timeFraction = (time - start) / duration;
	    if (timeFraction > 1) timeFraction = 1;

	    // calculate the current animation state
	    let progress = timing(timeFraction)

	    draw(progress); // draw it

	    if (timeFraction < 1) {
	      requestAnimationFrame(animate);
	    }

	  });
	}
	function quad(timeFraction) {
	  return Math.pow(timeFraction, 3)
	}

	animate({
	    duration: 1500,
	    timing: quad,
	    draw(progress) {
		  movingBorderRight.style.width = (text.offsetWidth) * progress + "px"; 
	    }
	  });
}

// 200ms After the page was resized, reload the page for correcting the positioning of all elements
// let CurrentWidth = innerWidth;
// let CurrentHeight = innerHeight;
// window.addEventListener('resize', () => setTimeout(() => (innerWidth!=CurrentWidth || innerWidth!=CurrentHeight) ? location.reload() : false, 150));

credit.style.top = innerHeight - 30 + 'px';