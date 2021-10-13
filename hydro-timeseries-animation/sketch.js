// Set constants and create variables
const W = 680, H = 200; // dimensions of canvas
const time = 229; // half of data length number for x tick values
const step = W/time; // calculate time step

let framerate = 30; // set a slower framerate

let pos, fy, c, Q, colors, l, f;
let table;

let disch = []; // to store volume of discharge (Q)
let turb = []; // to store turbidity value
let cond = []; // to store conductivity value
let datetime = []; // to store datetime value
let count = 0; // steps counter

let dischcolor = '#46568c'; // color for discharge data
let turbcolor = '#a6663d'; // color for turbidity data
let condcolor = '#d9a738'; // color for conductivity data

let coeffCond = 0.04;
let coeffTurb = 0.7;

function preload() { // preload data and audio files
  table = loadTable('Mar21.csv', 'csv', 'header');
  rain = loadSound('rainstick.wav');
  bg =   loadImage('MT_Image.png');

}



function setup() {
  createCanvas(W, H);
  fill(255, 30, 70, 90);

      
  // array containing the x positions of the line graph, scaled to fit the canvas
  posx = Float32Array.from((table.getColumn('Mins')), (_, i) => map(i, 0, time, 0, W));
  
  // function to scale the discharge to a canvas height
  fy = _ => map(_, 0, 3, H, 10);
  rain.play();
}


function drawText() {
  textSize(14);

  strokeWeight(0); // no outline  
  stroke(91, 125, 125)
  // text backgrounds
  fill(255,255,255,210); // semitransparent white fill
  rect(13, H-23, 110, 17, 10); 
  rect(13, H-193, 185, 17, 10); 
  rect(W-115, H-193, 103, 17, 10); 
  
  fill(255, 191, 148, 240); // semitransparent orange fill
  rect(W-255, H-44, 250, 34, 10); 
  
  
  // axis label text
  fill(dischcolor);
  textAlign(LEFT);
  text('Stream Depth (ft)', 15, H-10);
  fill(condcolor);
  text('Specific Conductivity (Us/cm)', 15, H-180);
  textAlign(RIGHT);
  fill(turbcolor);
  text('Turbidity (FNU)', W-15, H-180);
  
  fill(82, 82, 82);
  text('Clues from the Hydrograph:', W-50, H-30);
  
  textSize(9);
  text('What happens to water quality when it rains in San Diego?', W-15, H-16);
  
}

function drawAxes() {
  
  stroke(dischcolor); // discharge axis
  line(10, H+10, 10, H-80); 
  line(10, H-80, 7, H-75); 
  line(10, H-80, 13, H-75); 
  
  stroke(condcolor); // conductivity axis
  line(10, H-120, 10, -H); 
  line(10, H-120, 7, H-125); 
  line(10, H-120, 13, H-125); 

  stroke(turbcolor); // turbidity axis
  line(W-10, H-120, W-10, -H); 
  line(W-10, H-120, W-7, H-125); 
  line(W-10, H-120, W-13, H-125); 
  
}


function draw() {
  background(bg);
  background(255, 255, 255, 160);

 
  frameRate(framerate);  
  
  // length of disch list -1 (to access last item of data list)
  l = disch.length -1 ;

  // frameCount
  f = frameCount;
  
  // amount of discharge
  Qcol = (table.getColumn('Depth_m'));
  Q = Qcol[f]
   
  // amount of turbidity
  Tcol = (table.getColumn('Turbidity_FNU'));
  T = Tcol[f]
  
  // amount of conductivity
  Ccol = (table.getColumn('SpCond'));
  C = Ccol[f]
  
  // date and time
  DTcol = (table.getColumn('Time'));
  DT = DTcol[f]
  
  // store that number at each step (the x-axis tick values)
  if (f&step) {
    disch.push(Q);
    turb.push(T);
    cond.push(C);
    datetime.push(DT);
    count += 1;
  }
  
  
    
  // iterate over data list to rebuild curve at each frame
  for (let i = 0; i < l; i++) {
   
    
    date = datetime[i+1]; // display date and time in the corner
  

    x1 = posx[i]; // time
    x2 = posx[i+1];
    
    y1 = fy(disch[i]); // discharge
    y2 = fy(disch[i+1]);

    z1 = coeffTurb*(turb[i]); // turbidity
    z2 = coeffTurb*(turb[i+1]);

    a1 = coeffCond*(cond[i]); // conductivity
    a2 = coeffCond*(cond[i+1]);
    
    strokeWeight(0);
    fill(193, 215, 224,210); // timer fill
    rect(23, H-60, 120, 23, 10); // timer shape
    textAlign(LEFT);
    fill(40, 84, 102) // text color
    textSize(14);
    text(date, 35, H-43);
    
    // vertical lines (x-values)
    stroke(dischcolor);
    strokeWeight(0.5);
    line(x1, H, x1, y1 + 2); // Q

    strokeWeight(0.25); // for vertical lines
    stroke(turbcolor);
    line(x1, -H, x1, z1 - 2); // turbidity (upsidedown)
    stroke(condcolor);
    line(x1, -H, x1, a1 - 2); // conductivity (upsidedown)
    
    
    // polyline
    strokeWeight(2);
    stroke(dischcolor);
    line(x1, y1, x2, y2); // Q
    
    stroke(turbcolor);
    line(x1, z1, x2, z2); // turbidity
    
    stroke(condcolor);
    line(x1, a1, x2, a2); // conductivity


  }
  
  // draw ellispe at last data point
  if (count > 1) {
    fill(255, 255, 255);
    stroke(dischcolor);
    ellipse(posx[l], fy(disch[l]), 4, 4);
    stroke(turbcolor);
    ellipse(posx[l], coeffTurb*(turb[l]), 4, 4);
    stroke(condcolor);
    ellipse(posx[l], coeffCond*(cond[l]), 4, 4);

  }
  
  drawAxes();
  drawText();


} 




  
  



// moving graph source: https://discourse.processing.org/t/how-to-make-a-moving-graph-in-javascript-p5/19630/2