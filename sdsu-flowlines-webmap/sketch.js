imgX = 0;
imgY = 0;
imgW = 0;
imgH = 0;

imgScale = 1;
scaleFactor = 0.01;

panFromX = 0;
panFromY = 0;
panToX = 0;
panToY = 0;

columnContent = 180;
columnWidth = 200;



bldgCode = -1;
bldgName = "Click a building to identify";
instructionText = "Click and drag the map to move around. Use the scroll wheel to zoom in and out. Zoom out to reset the map. "
titleText = "Exploring Flowlines in the Built Environment" 
titleW = 500

outlineColor = '#575757'; // medium charcoal
textColor = '#152729'; // dark teal
backgroundColor = '#abb3ad'; // washed-out sage
legendColor = '#9fb5a3'; // sage
accentColor = '#4b686b'; //bright teal
font = 'Bahnschrift'; 

function preload() {
  img = loadImage('data/Campus100dpi.png');
  imgBldgs = loadImage('data/Buildings100dpi.png');
  tblBldgs = loadTable ('data/Building_Codes.csv', 'csv', 'header');
  lyr1 = loadImage('data/buildings_red.png');
  lyr2a = loadImage('data/streams_blue.png');
  lyr2b = loadImage('data/streams_light.png');
  lyr3 = loadImage('data/terrain.png');
  
  canvW = windowWidth
  maxCanvW = 800
  
  if (canvW <= maxCanvW) {
      canvW = windowWidth
    } else {
      canvW = maxCanvW
    }  
}


function setup() {
  canvH = 450;
  createCanvas(canvW, 450); 
  
  imgW = img.width;
  imgH = img.height;
  bldgW = imgBldgs.width;
  bldgH = imgBldgs.height;
  
  rectX = canvW - columnWidth
  rectY = 150
  
  rectW = canvW-rectX
  rectH = canvH-rectY
  
  imgW_max = imgW // set max image width 

  textFont(font);
  textSize(22);
  
  extImgW = (1/3) * imgW; // extent box is 1/3 of image size
  extImgH = (1/3) * imgH;
  extImgX = canvW-columnWidth;
  extImgY = 0;
  extW = extImgW
  extH = extImgH
  extX = 0;
  extY = 0;
  imgCenterX = 0;
  imgCenterY = 0;
  
  buttonSize = 20
  outButtonY = 10
  inButtonY = 35
  buttonX = 10 
  textAlign(CENTER);

  inButton = createButton('+');
  inButton.size(buttonSize, buttonSize);
  inButton.position(buttonX, outButtonY);
  inButton.mousePressed(zoomIn);
 
  outButton = createButton('-');
  outButton.mouseClicked(zoomOut);
  outButton.size(buttonSize, buttonSize);
  outButton.position(buttonX, inButtonY);
  
  checkX = canvW - columnContent;
  checkY = extH + 140;
  
  check1 = createCheckbox(' Buildings', true)
  check1.position(checkX, checkY);
  check1.changed(showLayer1)
  
  check2 = createCheckbox(' Flowlines', false)
  check2.position(checkX, (checkY+20));
  check2.changed(showLayer2)

  check3 = createCheckbox(' Terrain', false)
  check3.position(checkX, (checkY+40));
  check3.changed(showLayer3)
}

function draw() {
  background(backgroundColor);
   
  image(img, imgX, imgY, imgW, imgH); // draw main map
  
  showLayer3(); // show checkbox layers if they are selected
  showLayer2();
  showLayer1();

  if (canvW - columnWidth > titleW) { // show title if canvas is wide enough  
    push(); // format and draw + and - buttons and title rectangle
    fill(255,255,255,210);
    rectMode(LEFT)
    strokeWeight(0)
    rect(buttonX*5, outButtonY, titleW-60 , inButtonY+outButtonY )
    textSize(20)
    fill(accentColor)
    text(titleText, buttonX*6, outButtonY+15, titleW , inButtonY+outButtonY)
    pop();
  }
  
  image(img, extImgX, extImgY, extImgW, extImgH); //draw locator map
   
  push(); // format and  draw extent indicator
  translate(extImgX, 0);
  noFill();
  stroke(255);
  strokeWeight(2);
  rect(extX, extY, extW, extH); 
  pop();

  push(); // outline locator map
  stroke(outlineColor);
  strokeWeight(1);
  noFill();
  rect(canvW- columnWidth, extImgY, extImgW, extImgH); //outline locator map
  pop();
  
  fill(legendColor); // format and draw legend rectangle
  stroke(outlineColor); 
  strokeWeight(1); 
  rect(rectX, rectY, rectW, rectH); 
  stroke(accentColor); 
  fill(textColor); 

  
  textAlign(LEFT); // adds instructional text
  textSize(16)
  text(instructionText, canvW-columnContent, extImgH +10, 170, 200);
  
  textAlign(LEFT); // adds building text
  textSize(16)
  text(bldgName, canvW-columnContent, img.height-60, 170, 200);
}

function getFeatureName(grayVal, tbl) {
  name ="";
  for (var i=1; i<tbl.getRowCount(); i++) {
    var code = tbl.get(i,"Pixel_Val");
    if(grayVal == code) {
      name = tbl.get(i, "Name");
          console.log(name);
      return name;
    }
  }
}

function mousePressed() {
    panFromX = mouseX;
    panFromY = mouseY;

    pixelX = bldgW * (mouseX - imgX) / imgW
    pixelY = bldgH * (mouseY - imgY) / imgH

    bldgCode = red(imgBldgs.get(pixelX, pixelY));
    bldgName = getFeatureName(bldgCode, tblBldgs);
    console.log(bldgName);
} 

function mouseDragged(){
  panToX = mouseX;
  panToY = mouseY;
  xShift = panToX - panFromX;
  yShift = panToY - panFromY;
  imgX = imgX + xShift;
  imgY = imgY + yShift;
  extX = extX - (xShift/4);
  extY = extY - (yShift/4);  
  panFromX = panToX;
  panFromY = panToY;
}

function mouseWheel (event) {  
  scaleFactor = event.delta * -0.001;
  imgW_test = int(imgW * (1-scaleFactor));
  
  if (imgW_test  >= imgW_max) {
   
    imgW_old = imgW; 
    imgH_old = imgH;
    extW_old = extW;
    extH_old = extH;

    imgW = int(imgW * (1-scaleFactor));
    imgH = int(imgH * (1-scaleFactor));
    
    imgX = mouseX - ((mouseX - imgX) / imgW_old) * imgW;
    imgY = mouseY - ((mouseY - imgY) / imgH_old) * imgH;
    
    extW = int(extW * (1 + scaleFactor));
    extH = int(extH * (1 + scaleFactor));
    
    extX = mouseX/3 - ((mouseX/3 - extX) / extW_old) * extW; 
    extY = mouseY/3 - ((mouseY/3 - extY) / extH_old) * extH;
    
    } else {   
      imgX = 0; //initialize map
      imgY = 0;
      extX = 0;
      extY = 0;
      extW = extImgW
      extH = extImgH   
    }
}

function zoomIn() {
    imgCenterX = imgW/2;
    imgCenterY = imgH/2;
  
    clickScaleFactor  = 0.1;

    imgW_old = imgW; 
    imgH_old = imgH;
    extW_old = extW;
    extH_old = extH;
  
    imgW = int(imgW * (1+clickScaleFactor));
    imgH = int(imgH * (1+clickScaleFactor));
  
    imgX = imgCenterX - ((imgCenterX - imgX) / imgW_old) * imgW;
    imgY = imgCenterY - ((imgCenterY - imgY) / imgH_old) * imgH;
  
    extW = int(extW * (1 - clickScaleFactor)); // scale extent indicator size
    extH = int(extH * (1 - clickScaleFactor));
    
    extX = imgCenterX/3 - ((imgCenterX/3 - extX) / extW_old) * extW; 
    extY = imgCenterY/3 - ((imgCenterY/3 - extY) / extH_old) * extH;
}

function zoomOut() {
    imgCenterX = imgW/2;
    imgCenterY = imgH/2;
  
    clickScaleFactor  = -0.1;
  
    imgW_test = int(imgW * (1+clickScaleFactor));
  
    if (imgW_test  >= imgW_max) {
      
      imgW_old = imgW; 
      imgH_old = imgH;
      extW_old = extW;
      extH_old = extH;

      imgW = int(imgW * (1+clickScaleFactor));
      imgH = int(imgH * (1+clickScaleFactor));

      imgX = imgCenterX - ((imgCenterX - imgX) / imgW_old) * imgW;
      imgY = imgCenterY - ((imgCenterY - imgY) / imgH_old) * imgH;

      extW = int(extW * (1 - clickScaleFactor));
      extH = int(extH * (1 - clickScaleFactor));

      extX = imgCenterX/3 - ((imgCenterX/3 - extX) / extW_old) * extW; 
      extY = imgCenterY/3 - ((imgCenterY/3 - extY) / extH_old) * extH;

      } else {   
        imgX = 0; 
        imgY = 0;
        extX = 0;
        extY = 0;
        extW = extImgW
        extH = extImgH   
      }
}

function showLayer1() {
  if (check1.checked()) {  
    image(lyr1, imgX, imgY, imgW, imgH);
   }
}

function showLayer2() {
  if (check2.checked()) {  
    image(lyr2b, imgX, imgY, imgW, imgH);
    image(lyr2a, imgX, imgY, imgW, imgH);
   }
}

function showLayer3() {
  if (check3.checked()) {  
    image(lyr3, imgX, imgY, imgW, imgH);
   }
}
