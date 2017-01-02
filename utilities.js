var pointsArray = document.getElementsByClassName("point");

var revealPoint = function(point) {
    point.style.opacity = 1;
    point.style.transform = "scaleX(1) translateY(0)";
    point.style.msTransform = "scaleX(1) translateY(0)";  
};

var animatePoints = function() {
    //for Each(point,revealPoint);
    for (var i = 0; i < pointsArray.length; i++) {
        revealPoint(pointsArray[i]);  
    
    }
};

window.onload = function() {
    if (window.innerHeight > 950){
        animatePoints();
    }
    
    window.addEventListener("scroll", function(event){
        if (pointsArray[0].getBoundingClientRect().top <= 500) {
            
            animatePoints();
        }
    });
}