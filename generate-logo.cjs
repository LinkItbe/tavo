const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <g fill="#4D5328">
    <!-- T top crossbar -->
    <path d="M 110 365 C 150 280, 240 230, 445 235 C 380 262, 260 285, 185 385 C 158 420, 122 400, 110 365 Z" />
    
    <!-- T main vertical/diagonal stem -->
    <path d="M 310 260 C 255 380, 195 535, 150 660 C 140 688, 162 698, 182 668 C 222 588, 282 432, 322 310 Z" />
    
    <!-- Letter 'a' outer loop & inner counter -->
    <path fill-rule="evenodd" d="M 300 520 C 310 415, 385 410, 425 480 C 445 520, 435 580, 385 600 C 335 610, 290 560, 300 520 Z M 350 470 C 330 480, 330 550, 360 560 C 390 560, 405 500, 380 470 Z" />
    
    <!-- Letter 'v' -->
    <path d="M 405 560 C 425 540, 442 450, 452 380 C 462 360, 472 380, 482 420 C 492 470, 502 520, 522 580 C 532 600, 542 590, 552 560 C 572 480, 602 370, 642 330 C 652 320, 632 310, 602 340 C 562 380, 532 480, 502 560 C 482 500, 462 410, 442 360 C 432 340, 412 360, 405 400 Z" />
    
    <!-- First 'o' with Fork Cutout -->
    <!-- Outer oval shape of first 'o' -->
    <!-- Inside cutout: 3 tines, neck, handle -->
    <path fill-rule="evenodd" d="
      M 550 485 
      C 540 375, 630 345, 710 385 
      C 730 475, 660 585, 570 575 
      C 530 570, 550 515, 550 485 Z
      
      M 622 415 
      L 622 450 
      A 2 2 0 0 0 624 452 
      L 624 415 
      A 1 1 0 0 1 626 415 
      L 626 452 
      A 2 2 0 0 0 628 452 
      L 628 415 
      A 1 1 0 0 1 630 415 
      L 630 452 
      A 2 2 0 0 0 632 452 
      L 632 415 
      A 1 1 0 0 1 634 415 
      L 634 455 
      C 634 470, 626 478, 626 490 
      L 626 545 
      C 626 550, 620 550, 620 545 
      L 620 490 
      C 620 478, 612 470, 612 455 
      L 612 415 
      A 1 1 0 0 1 622 415 Z
    " />

    <!-- Second 'o' with Spoon Cutout -->
    <!-- Outer oval shape of second 'o' -->
    <!-- Inside cutout: spoon head bowl, neck, handle -->
    <path fill-rule="evenodd" d="
      M 720 475 
      C 710 375, 800 355, 870 415 
      C 880 495, 820 585, 740 575 
      C 715 565, 720 515, 720 475 Z
      
      M 785 410 
      C 772 410, 768 432, 772 455 
      C 776 468, 781 475, 781 540 
      C 781 548, 789 548, 789 540 
      L 789 475 
      C 789 468, 798 455, 798 432 
      C 798 410, 794 410, 785 410 Z
    " />

    <!-- Underline Swoosh stroke -->
    <path d="M 250 685 C 400 625, 600 595, 770 625 C 600 635, 420 675, 250 685 Z" />
  </g>
</svg>
`;

const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } });
const pngData = resvg.render().asPng();
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/tavoo-logo.png', pngData);
console.log('Successfully generated public/tavoo-logo.png, file size:', pngData.length);
