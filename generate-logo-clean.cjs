const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const { execSync } = require('child_process');

// Clean, smooth SVG logo for Tavoo
// Main Olive Color: #4F5328
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500">
  <g fill="#4F5328">
    <!-- T -->
    <!-- Top curved stroke -->
    <path d="M 120 220 C 180 140, 290 120, 520 125 C 430 150, 290 170, 200 250 C 170 280, 130 260, 120 220 Z" />
    <!-- Vertical stem -->
    <path d="M 350 140 C 290 260, 220 380, 160 480 C 145 505, 175 515, 195 480 C 245 390, 310 260, 365 180 Z" />

    <!-- a -->
    <path fill-rule="evenodd" d="
      M 330 330 
      C 340 240, 420 235, 460 300 
      C 480 340, 470 410, 415 425 
      C 360 435, 320 380, 330 330 Z 
      M 385 285 
      C 365 295, 365 370, 395 380 
      C 425 380, 440 320, 415 285 Z
    " />

    <!-- v -->
    <path d="
      M 440 380 
      C 460 360, 480 270, 490 210 
      C 500 190, 510 210, 520 250 
      C 530 300, 540 350, 560 400 
      C 570 420, 580 410, 590 380 
      C 610 300, 640 200, 680 160 
      C 690 150, 670 140, 640 170 
      C 600 210, 570 300, 540 380 
      C 520 320, 500 230, 480 180 
      C 470 160, 450 180, 440 220 Z
    " />

    <!-- First 'o' with Fork Cutout -->
    <path fill-rule="evenodd" d="
      M 590 320 
      C 580 220, 670 190, 750 230 
      C 770 310, 710 420, 620 410 
      C 575 405, 590 350, 590 320 Z 
      
      M 662 250 
      L 662 285 
      A 2 2 0 0 0 664 287 
      L 664 250 
      A 1 1 0 0 1 666 250 
      L 666 287 
      A 2 2 0 0 0 668 287 
      L 668 250 
      A 1 1 0 0 1 670 250 
      L 670 287 
      A 2 2 0 0 0 672 287 
      L 672 250 
      A 1 1 0 0 1 674 250 
      L 674 290 
      C 674 305, 666 313, 666 325 
      L 666 375 
      C 666 380, 660 380, 660 375 
      L 660 325 
      C 660 313, 652 305, 652 290 
      L 652 250 
      A 1 1 0 0 1 662 250 Z
    " />

    <!-- Second 'o' with Spoon Cutout -->
    <path fill-rule="evenodd" d="
      M 760 310 
      C 750 210, 840 190, 910 240 
      C 920 320, 860 410, 780 400 
      C 755 390, 760 340, 760 310 Z 
      
      M 825 245 
      C 812 245, 808 267, 812 290 
      C 816 303, 821 310, 821 370 
      C 821 378, 829 378, 829 370 
      L 829 310 
      C 829 303, 838 290, 838 267 
      C 838 245, 834 245, 825 245 Z
    " />

    <!-- Underline Swoosh -->
    <path d="M 270 490 C 440 435, 650 410, 830 435 C 650 445, 450 480, 270 490 Z" />
  </g>
</svg>
`;

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
const pngData = resvg.render().asPng();
fs.writeFileSync('public/tavoo-raw.png', pngData);

// Trim empty transparent edges with ImageMagick
execSync('convert public/tavoo-raw.png -trim +repage public/tavoo-logo-transparent-cropped.png');
execSync('cp public/tavoo-logo-transparent-cropped.png public/tavoo-logo.png');
fs.unlinkSync('public/tavoo-raw.png');

console.log('Successfully generated tightly cropped Tavoo logo files!');
