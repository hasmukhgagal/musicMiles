import React, { useEffect } from 'react';

function Login({ id, data = [] }) {

  useEffect(() => {
    init(id);
  }, [id]);

  const  init = (id) => {
    window.google.charts.load('current', { packages: ['bar'] });
    window.google.charts.setOnLoadCallback(drawChart);
    let x = [' ', 'Silver', 'Gold', 'Platinum'];
    let y = [' '];
    for(let i = 0; i < 3 ; i++) {
      if(data[i] && data[i].status) {
        if(data[i].status === 'Silver') { y[1] = data[i].count }
        if(data[i].status === 'Gold') { y[2] = data[i].count }
        if(data[i].status === 'Platinum') { y[3] = data[i].count }
      }
      if(!y[i+1]) {
        y[i+1] = 0
      }
    }
    
    function drawChart() {
      let data = window.google.visualization.arrayToDataTable([
        x,
        [' ', 0,0,0],
        y,
        [' ', 0,0,0]
      ]);
  
      let options = {
        // silver, gold, platinum
        colors: ['#C0C0C0','#FFD700', '#E5E4E2'],
        bars: 'vertical', // Required for Material Bar Charts.
        vAxis: {
          format: 'decimal',
          viewWindowMode:'explicit',
          viewWindow: {
            min: 0
          }
        }
      };
  
      let chart = new window.google.charts.Bar(document.getElementById(id));
  
      chart.draw(data, window.google.charts.Bar.convertOptions(options));
    }
  }

  return (
    <div>
      <div id={id}></div>
    </div>
  );
}

export default Login;
