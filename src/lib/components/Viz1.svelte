<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  export let currentStep;

  let svg;

  onMount(() => {
    const svgEl = d3.select(svg)
      .attr('width', 500)
      .attr('height', 500);
    
    svgEl.append('circle')
      .attr('id', 'circle')
      .attr('r', 50)
      .attr('cx', 250)
      .attr('cy', 250)
      .attr('fill', 'steelblue');
  });

  $: if (svg) {
    d3.select('#circle')
      .transition()
      .duration(500)
      .attr('fill', currentStep === 0 ? 'steelblue' :
                    currentStep === 1 ? 'orange' :
                    currentStep === 2 ? 'green' : 'purple');
  }
</script>

<svg bind:this={svg}></svg>
