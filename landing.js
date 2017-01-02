var animatePoints = function() {
 
    var revealPoint = function() {
         // #7
         $("this").css({
             opacity: 1,
             transform: "scaleX(1) translateY(0)"
         });
    };

    revealFirstPoint();
    revealSecondPoint();
    revealThirdPoint();
};

$(window).load(function() {
     if ($(window).height() > 950) {
         animatePoints();
     }
     var scrollDistance = $(".selling-points").offset().top - $("window").height() + 200;
   
    
   $(window).scroll(function(event) {
         if ($(window).scrollTop() >= d) {
            animatePoints();  
         }    
   });
});
