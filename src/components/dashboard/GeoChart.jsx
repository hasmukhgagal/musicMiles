import React, { useEffect, useState } from 'react';
import { DashboardService } from '../../services';

function GeoChart({artistId}) {
  const [ loading, setLoading ] = useState(false)
  useEffect(() => {
    setLoading(true)
    init();
  }, []);

  const init = async () => {
    window.google.charts.load('current', {
      packages: ['geochart'],
      // Note: you will need to get a mapsApiKey for your project.
      // See: https://developers.google.com/chart/interactive/docs/basic_load_libs#load-settings
      mapsApiKey: 'AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY',
    });
    const chartData = await DashboardService.getHeatMapDate(artistId);
    setLoading(false)
    window.google.charts.setOnLoadCallback(drawRegionsMap);
    function drawRegionsMap() {
      let array = [];
      array.push(['Country', 'Popularity']);
      for (let index = 0; index < chartData.length; index++) {
        const element = chartData[index];
        if (element._id) {
          array.push([element._id, element.fans]);
        }
      }
  
      var data = window.google.visualization.arrayToDataTable(array);
  
      var options = {};
  
      var chart = new window.google.visualization.GeoChart(
        document.getElementById('regions_div')
      );
  
      chart.draw(data, options);
    }
  }

  return (
    <div>
      {
        loading && <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '250px'
        }}><div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div></div>
      }
      <div id="regions_div"></div>
    </div>
  );
}

export default GeoChart;
