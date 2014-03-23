var homeButtons = document.getElementsByClassName('homeButton');
for(var i=0; i<homeButtons.length; i++) { 
    homeButtons[i].style.position = 'absolute';
    var w = Math.floor(window.innerWidth*.1);
    homeButtons[i].style.width = w+'px';
    homeButtons[i].style.height = w+'px';
    homeButtons[i].style.right = Math.floor(w*.5)+'px';
    homeButtons[i].style.top = Math.floor(w*.5)+'px';
}