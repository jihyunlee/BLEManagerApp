var homeButtons = document.getElementsByClassName('homeButton');
for(var i=0; i<homeButtons.length; i++) { 
    homeButtons[i].style.position = 'absolute';
    var w = Math.floor(window.innerWidth*.15);
    homeButtons[i].style.width = w;
    homeButtons[i].style.height = w;
    homeButtons[i].style.right = Math.floor(w*.25)+'px';
    homeButtons[i].style.top = Math.floor(w*.25)+'px';
}