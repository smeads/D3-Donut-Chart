// margin and radius
let margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = 600 - margin.right - margin.left,
    height = 600 - margin.top - margin.bottom,
    radius = width / 2;

let legendRectSize = 25;
let legendSpacing = 6;

let color = d3.scaleOrdinal()
  .range(['#D6BF7C', '#B5060D', '#E4281D', '#0E89E6', '#5EC3ED', '#40E5AD', '#19BFA9', '#BEAA89']);

let formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

// arc generator
let arc = d3.arc()
  .outerRadius(radius - 10)
  .innerRadius(radius - 80);

let labelArc = d3.arc()
  .outerRadius(radius - 50)
  .innerRadius(radius - 50)

// pie generator
let pie = d3.pie()
  .startAngle(-90 * Math.PI/180)
  .endAngle(-90 * Math.PI/180 + 2*Math.PI)
  .padAngle(.01)
  .sort(null)
  .value(d => { return d.revenue; });

// define svg
let svg = d3.select('#donut').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${width/2}, ${height/2})`);

// import data
d3.json('data/starwars-donut.json', (error, data) => {
  if (error) throw error;
  // parse the data
  data.forEach(d => {
    d.revenue = +d.revenue; // '23' -> 23
    d.title = d.title;
    d.releaseDate = d.releaseDate;
  });
  // append g elements (arc)
  let g = svg.selectAll('.arc')
    .data(pie(data))
    .enter().append('g')
      .attr('class', 'arc')

  // append path of the arc
  g.append('path')
    .attr('id', (d, i) => { return `arc_${i}` })
    .attr('d', arc)
    .style('fill', d => {
      return color(d.data.title)
    })
    .transition()
    .ease(d3.easeLinear)
    .duration(2000)
    .attrTween('d', donutTween);

  g.selectAll('.arcText')
    .data(data)
    .enter()
      .append('text')
      .attr('class', 'arcText')
      .attr('x', 5)
      .attr('dy', 18)
    .append('textPath')
      .attr('xlink:href', (d, i) => { return `#arc_${i}`;})
      .text(d => {
        return formatter.format(d.revenue);
      })

  let legend = svg.selectAll('.legend')
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr('transform', (d, i) => {
      let height = legendRectSize + legendSpacing;
      let offset = height * color.domain().length / 2;
      let horz = -3 * legendRectSize;
      let vert = i * height - offset;
      return `translate(${horz}, ${vert})`
    })

  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color)
    .style('stroke', color)
    .transition()
    .ease(d3.easeLinear)
    .duration(2000)

  legend.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(d => { return d; })

})

function donutTween(b) {
  b.innerRadius = 0;
  let i = d3.interpolate({
    startAngle: -90 * Math.PI/180,
    endAnge: -90 * Math.PI/180 + 2*Math.PI
  }, b);
  return t => { return arc(i(t));}
}
