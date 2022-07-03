class Tooltip {
    constructor() {
      this._Anio = htl.svg`<text y="-22"></text>`;
      this._Personas_en_paro = htl.svg`<text y="-12"></text>`;
      this.node = htl.svg`<g pointer-events="none" display="none" font-family="sans-serif" font-size="7" text-anchor="middle">
    <rect x="-35" width="70" y="-30" height="20" fill="#6ab150" fill-opacity="0.5"></rect>
    ${this._Anio}
    ${this._Personas_en_paro}
    <circle r="2.5"></circle>
  </g>`;
    }
    show(d, x ,y) {
      this.node.removeAttribute("display");
      this.node.setAttribute("transform", `translate(${x(d.Anio)},${y(d.Personas_en_paro)})`);
      this._Anio.textContent = "Año: " + d.Anio;
      this._Personas_en_paro.textContent = "Personas: " + d.Personas_en_paro.toFixed(2);
    }
    hide() {
      this.node.setAttribute("display", "none");
    }
  }



const draw = async (el = "#graf") => {
// Selección de gráfica
const graf = d3.select("#graf")
width = 500
height = 240
margin = ({top: 20, right: 30, bottom: 30, left: 40})

let data = await d3.csv("evolucion_del_numero_de_parados_en_españa.csv", d3.autoType);
/*data = data.filter(function(d){
    
    if(d.Anio  )
})*/

let nuevoObjeto ={}
let newData = []

const sumarPersonasEnParo = (anio) => {
    let Personas_en_paro = 0;
    data.forEach( x => {
        if(x.Anio == anio){
            Personas_en_paro += x.Personas_en_paro
        }
    })
    return Personas_en_paro
}
const formatYear = d3.timeFormat('%Y');
//Recorremos el arreglo 
data.forEach( x => {
  if( !nuevoObjeto.hasOwnProperty(x.Anio)){
    nuevoObjeto[x.Anio] = x.Anio
    let Personas_en_paro = sumarPersonasEnParo(x.Anio)
    newData.push({
        Anio:  formatYear(new Date(+x.Anio, 0, 1)),
        Personas_en_paro: Personas_en_paro
    })
  }
})

data = newData

const line = d3.line().x(d => x(d.Anio)).y(d => y(d.Personas_en_paro))

const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.Anio), d3.max(data, d => d.Anio)])
    .range([margin.left, width - margin.right])

const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Personas_en_paro) + 5000])
    .range([height - margin.bottom, margin.top])

const xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80))

const yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(height / 40))
    .call(g => g.select(".domain").remove())


const tooltip = new Tooltip();

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("stroke-miterlimit", 1)
      .attr("d", line(data));

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  svg.append("g")
      .attr("fill", "none")
      .attr("pointer-events", "all")
    .selectAll("rect")
    .data(d3.pairs(data))
    .join("rect")
    .attr("x", ([a, b]) => x(a.Anio))
      .attr("height", height)
    .attr("width", ([a, b]) => x(b.Anio) - x(a.Anio))
      .on("mouseover", (event, [a]) => tooltip.show(a, x ,y))
      .on("mouseout", () => tooltip.hide());

  svg.append(() => tooltip.node);

  graf.append(() => svg.node());

}

draw()