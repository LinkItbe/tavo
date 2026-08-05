const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const { execSync } = require('child_process');

// Official Tavoo Logo SVG
// Color: Olive Green #4F5328
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" width="1000" height="620">
  <g fill="#4F5328">
    <!-- Capital 'T' Top Swoosh -->
    <path d="M 90 290 C 150 170, 270 120, 480 125 C 390 155, 260 185, 175 285 C 145 320, 105 305, 90 290 Z" />
    
    <!-- Capital 'T' Main Diagonal Stem -->
    <path d="M 320 150 C 260 280, 190 420, 125 530 C 110 555, 140 565, 160 530 C 215 430, 280 290, 335 190 Z" />

    <!-- Letter 'a' -->
    <path fill-rule="evenodd" d="
      M 310 380 
      C 320 270, 400 260, 445 330 
      C 465 370, 455 445, 395 460 
      C 340 470, 300 415, 310 380 Z 
      
      M 365 335 
      C 345 345, 345 420, 375 430 
      C 405 430, 420 370, 395 335 Z
    " />

    <!-- Letter 'v' -->
    <path d="
      M 420 430 
      C 440 410, 460 315, 470 240 
      C 480 215, 490 235, 500 280 
      C 510 335, 520 385, 540 435 
      C 550 455, 560 445, 570 415 
      C 590 335, 620 220, 660 175 
      C 670 165, 650 155, 620 185 
      C 580 225, 550 330, 520 415 
      C 500 355, 480 260, 460 205 
      C 450 185, 430 205, 420 250 Z
    " />

    <!-- First 'o' with Fork Cutout -->
    <path fill-rule="evenodd" d="
      M 570 355 
      C 560 250, 650 215, 735 260 
      C 755 340, 695 455, 600 445 
      C 555 440, 570 385, 570 355 Z 
      
      M 642 280 
      L 642 318 
      A 2 2 0 0 0 644 320 
      L 644 280 
      A 1 1 0 0 1 646 280 
      L 646 320 
      A 2 2 0 0 0 648 320 
      L 648 280 
      A 1 1 0 0 1 650 280 
      L 650 320 
      A 2 2 0 0 0 652 320 
      L 652 280 
      A 1 1 0 0 1 654 280 
      L 654 325 
      C 654 340, 646 348, 646 360 
      L 646 412 
      C 646 418, 640 418, 640 412 
      L 640 360 
      C 640 348, 632 340, 632 325 
      L 632 280 
      A 1 1 0 0 1 642 280 Z
    " />

    <!-- Second 'o' with Spoon Cutout -->
    <path fill-rule="evenodd" d="
      M 745 345 
      C 735 240, 825 215, 895 268 
      C 905 350, 845 445, 765 435 
      C 740 425, 745 375, 745 345 Z 
      
      M 808 275 
      C 795 275, 791 297, 795 320 
      C 799 333, 804 340, 804 405 
      C 804 413, 812 413, 812 405 
      L 812 340 
      C 812 333, 821 320, 821 297 
      C 821 275, 817 275, 808 275 Z
    " />

    <!-- Underline Calligraphic Swoosh -->
    <path d="M 240 535 C 420 475, 630 450, 815 478 C 630 488, 430 525, 240 535 Z" />
  </g>
</svg>
`;

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
const pngData = resvg.render().asPng();
fs.writeFileSync('public/raw.png', pngData);

// Trim excess transparent space
execSync('convert public/raw.png -trim +repage public/tavoo-logo.png');
execSync('cp public/tavoo-logo.png public/tavoo-logo-v2.png');
execSync('cp public/tavoo-logo.png public/tavoo-logo-v3.png');
execSync('cp public/tavoo-logo.png public/tavoo-logo-transparent-cropped.png');
fs.unlinkSync('public/raw.png');

console.log('Logo generated and trimmed in public/');
