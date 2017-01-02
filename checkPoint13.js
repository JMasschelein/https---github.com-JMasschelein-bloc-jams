var findParentByClassName = function(element, targetClass) {
    if (element.parentElement !== null ) {
        var currentParent = element.parentElement;
        return currentParent;
    } else { 
        alert("No parent found");};
    if (currentParent.className != targetClass && currentParent.className !== null) {
            currentParent = currentParent.parentElement;
        } else {alert("No parent found with that class name");}
};

