const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const { execSync } = require('child_process');

// High resolution SVG matching the official Tavoo calligraphy logo exactly:
// Olive green color: #4F5328
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 600" width="1000" height="600">
  <g fill="#4F5328">
    <!-- Capital 'T' Top Swoosh -->
    <path d="M 100 280 C 160 170, 270 130, 480 135 C 390 165, 260 190, 180 280 C 150 315, 115 295, 100 280 Z" />
    
    <!-- Capital 'T' Main Diagonal Stem -->
    <path d="M 320 160 C 260 285, 190 415, 130 520 C 115 545, 145 555, 165 520 C 215 425, 280 290, 335 200 Z" />

    <!-- Letter 'a' -->
    <path fill-rule="evenodd" d="
      M 310 370 
      C 320 270, 400 265, 440 330 
      C 460 370, 450 440, 395 455 
      C 340 465, 300 410, 310 370 Z 
      
      M 365 325 
      C 345 335, 345 410, 375 420 
      C 405 420, 420 360, 395 325 Z
    " />

    <!-- Letter 'v' -->
    <path d="
      M 420 420 
      C 440 400, 460 310, 470 240 
      C 480 220, 490 240, 500 280 
      C 510 330, 520 380, 540 430 
      C 550 450, 560 440, 570 410 
      C 590 330, 620 220, 660 180 
      C 670 170, 650 160, 620 190 
      C 580 230, 550 330, 520 410 
      C 500 350, 480 260, 460 210 
      C 450 190, 430 210, 420 250 Z
    " />

    <!-- First 'o' with Fork Cutout -->
    <path fill-rule="evenodd" d="
      M 570 350 
      C 560 250, 650 220, 730 260 
      C 750 340, 690 450, 600 440 
      C 555 435, 570 380, 570 350 Z 
      
      M 642 280 
      L 642 315 
      A 2 2 0 0 0 644 317 
      L 644 280 
      A 1 1 0 0 1 646 280 
      L 646 317 
      A 2 2 0 0 0 648 317 
      L 648 280 
      A 1 1 0 0 1 650 280 
      L 650 317 
      A 2 2 0 0 0 652 317 
      L 652 280 
      A 1 1 0 0 1 654 280 
      L 654 320 
      C 654 335, 646 343, 646 355 
      L 646 405 
      C 646 410, 640 410, 640 405 
      L 640 355 
      C 640 343, 632 335, 632 320 
      L 632 280 
      A 1 1 0 0 1 642 280 Z
    " />

    <!-- Second 'o' with Spoon Cutout -->
    <path fill-rule="evenodd" d="
      M 740 340 
      C 730 240, 820 220, 890 270 
      C 900 350, 840 440, 760 430 
      C 735 420, 740 370, 740 340 Z 
      
      M 805 275 
      C 792 275, 788 297, 792 320 
      C 796 333, 801 340, 801 400 
      C 801 408, 809 408, 809 400 
      L 809 340 
      C 809 333, 818 320, 818 297 
      C 818 275, 814 275, 805 275 Z
    " />

    <!-- Underline Calligraphic Swoosh -->
    <path d="M 250 520 C 420 465, 630 440, 810 465 C 630 475, 430 510, 250 520 Z" />
  </g>
</svg>
`;

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } });
const pngData = resvg.render().asPng();
fs.writeFileSync('public/tavoo-v3-raw.png', pngData);

// Trim excess transparent pixels tightly using ImageMagick
execSync('convert public/tavoo-v3-raw.png -trim +repage public/tavoo-logo-v3.png');
execSync('cp public/tavoo-logo-v3.png public/tavoo-logo.png');
fs.unlinkSync('public/tavoo-v3-raw.png');

console.log('Successfully created public/tavoo-logo-v3.png!');
