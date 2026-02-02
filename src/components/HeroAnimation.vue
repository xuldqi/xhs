<template>
  <svg viewBox="0 0 400 400" class="hero-svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #FF2442; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #FF5C77; stop-opacity: 1" />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color: #E0E0E0; stop-opacity: 1" />
        <stop offset="100%" style="stop-color: #BDBDBD; stop-opacity: 1" />
      </linearGradient>
    </defs>
    
    <!-- Animated background shapes -->
    <g class="bg-shapes">
      <path d="M 50 50 Q 150 0, 250 50 T 450 50" fill="none" stroke="url(#grad2)" stroke-width="2" class="path1" />
      <path d="M 0 150 Q 100 100, 200 150 T 400 150" fill="none" stroke="#E0E0E0" stroke-width="1" class="path2" />
      <path d="M 50 250 Q 150 300, 250 250 T 450 250" fill="none" stroke="#BDBDBD" stroke-width="1.5" class="path3" />
    </g>
    
    <!-- Central UI element -->
    <g class="ui-element">
      <rect x="100" y="100" width="200" height="200" rx="15" fill="rgba(255,255,255,0.7)" stroke="#E0E0E0" stroke-width="2"/>
      <line x1="120" y1="130" x2="280" y2="130" stroke="url(#grad1)" stroke-width="4" rx="2" class="line-1"/>
      <rect x="120" y="150" width="160" height="20" rx="5" fill="#F5F5F5" class="bar-1" />
      <rect x="120" y="180" width="120" height="20" rx="5" fill="#EEEEEE" class="bar-2" />
      
      <!-- Chart elements -->
      <g class="chart">
        <path d="M 120 250 L 150 220 L 180 240 L 210 210 L 240 230 L 270 200" fill="none" stroke="url(#grad1)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chart-line"/>
        <circle cx="120" cy="250" r="4" fill="#FF2442" class="dot dot1" />
        <circle cx="150" cy="220" r="4" fill="#FF2442" class="dot dot2" />
        <circle cx="180" cy="240" r="4" fill="#FF2442" class="dot dot3" />
        <circle cx="210" cy="210" r="4" fill="#FF2442" class="dot dot4" />
        <circle cx="240" cy="230" r="4" fill="#FF2442" class="dot dot5" />
        <circle cx="270" cy="200" r="4" fill="#FF2442" class="dot dot6" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.hero-svg {
  width: 100%;
  height: 100%;
}

.path1, .path2, .path3 {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 5s ease-in-out forwards;
}
.path2 { animation-delay: 0.5s; }
.path3 { animation-delay: 1s; }

.ui-element {
  opacity: 0;
  transform: scale(0.8);
  animation: fadeIn 1s ease-out 1.5s forwards;
}

.line-1, .bar-1, .bar-2 {
  transform-origin: left center;
  transform: scaleX(0);
  animation: scaleIn 0.8s cubic-bezier(0.5, 0, 0.1, 1) forwards;
}
.line-1 { animation-delay: 2s; }
.bar-1 { animation-delay: 2.2s; }
.bar-2 { animation-delay: 2.4s; }

.chart-line {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  animation: draw 2s ease-in-out 2.8s forwards;
}

.dot {
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
}
.dot1 { animation-delay: 3s; }
.dot2 { animation-delay: 3.2s; }
.dot3 { animation-delay: 3.4s; }
.dot4 { animation-delay: 3.6s; }
.dot5 { animation-delay: 3.8s; }
.dot6 { animation-delay: 4s; }

@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scaleIn {
  to {
    transform: scaleX(1);
  }
}
</style>
