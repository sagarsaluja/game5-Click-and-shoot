//how to make sure the game runs on the same speed on all machines?
// requestAnimationFrame can pass the timestamp variable automatically to its given call back function

// timetoNextevent accumulates the time interval until it reaches a set threshold value

// at this time the event would be triggered.

//this makes sure that the animation loop is called on equal intervals on all machines , no
//matter how fast/slow they are.

//say threshold = 120
//on one computer , this would take 6 cycles , if it takes the computer to run the animation loop 20 seconds.

//on a slower computer , say animation loop takes 40 seconds. it would take 3 cycles here.

//COLLISION DETECTION BY COLOR:

//use the getImageData function : it takes the coordinates , and the area we want to scan
//using this we can detect the pixel color

//it gives a U Int 8 Clamped Array???

//its data property gives rgba value : r g b alpha

//we will setup a new collision canvas
//main logic:

//give each object a unique  random color. If the color you clicked on matches the color for "that" object , its a collision

//set opacity to 0 on canvas 2 so colors aren't visible.
