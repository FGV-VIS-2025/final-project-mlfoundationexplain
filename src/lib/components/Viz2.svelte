<script>
  export let currentStep;
</script>

<svg width="400" height="300">
  <!-- Animação com base na etapa (exemplo: mover um retângulo) -->
  <rect
    x={50 + currentStep * 30}
    y="100"
    width="100"
    height="100"
    fill="orange"
    rx="10"
    ry="10"
  />

  <text x="200" y="250" font-size="16" fill="#333" text-anchor="middle">
    Etapa {currentStep + 1}
  </text>
</svg>
