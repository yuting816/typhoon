//mapbox 地图服务URL
var mapboxUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
//设置版权信息
var mapAttr = 'Map data & copy; <a href="https://www.openstreetmap.org/">《慕课网：WebGIS入门进阶》</a> contributors, ' + 
   '<a href="http://giscafer.com/">giscafer</a>, ' +
   'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';
//定义两个图层，卫星影像图层和街道图层
var satellite = L.tileLayer(mapboxUrl,
     {id: "mapbox.satellite", 
     attribution: mapAttr
    });
var streets = L.tileLayer(mapboxUrl, {
    id: 'mapbox.streets', 
    attribution: mapAttr
    });

//创建地图实例
var map = L.map('map', {
    //设置地图中心点在台风起始位置，方便查看
    center: [18.7, 119.3],
    zoom: 5,
    //展示 影像图 和 街道图 两个图层
    layers: [satellite, streets]
})
//通过layer control 来实现图层切换UI
//https://leafletjs.com/examples/layers-control/
var baseLayers = {
    '影像图': satellite,
    '街道图': streets
};
L.control.layers(baseLayers).addTo(map);

//先分析台风的数据格式，与leafLet提供给的polyline方法不一样
//需要做一个数据转换
var allpoints = dataHandler();
//绘制蓝色台风路径
polyline = L.polyline(allpoints, {color: "blue"}).addTo(map);
//校正地图中心位置
map.fitBounds(polyline.getBounds());
//移除静态路径折线
map.removeLayer(polyline);
//调用使折线动态绘制的函数
animateDrawLine();
//定义数据转换的函数
function dataHandler() {
    //获取台风坐标点数据对象
    var forecast = typhoonTestData[0]['points'];
    //定义折线点数据的新数组
    var polylinePoints = [];
    //找到经纬度数据，存放在新数组中
    for (var i = 0; i < forecast.length; i++) {
        var p = forecast[i];
        polylinePoints.push([Number(p['lat']), Number(p['lng'])])  
    }
    return polylinePoints;
};
//数据转换后得到经纬度数据

//折线图层
var lineLayer;
//台风标志图层
var marker
var typhoonIcon = L.icon({
    iconUrl: 'typhoon.png',
    iconSize: [28, 28],
    iconAnchor: [10, 10]
});
//获取台风具体的描述信息
var land = typhoonTestData[0]['land'][0];
//动态绘制折线
function animateDrawLine() {
   var length = allpoints.length;
   //定义用来存放递增元素的经纬度数据
   var drawPoints = [];
   var count = 0;
   //定时器100ms，动态的塞入坐标数据
   var timer = setInterval(
       function() {
           //循环台风路径中的每个点，设置定时器依次描绘
           if (count < length) {
               drawPoints.push(allpoints[count]);
               count++;
               //清除之前绘制的折线图层
               if (lineLayer && count !== length) {
                   map.removeLayer(lineLayer);
                   lineLayer = null;
               }
               //清除之前的marker图层
               if (marker && count !== length) {
                   map.removeLayer(marker);
                   marker = null;
               }
               //最新数据点drawPoints绘制折线
               lineLayer = L.polyline(drawPoints, {color: 'blue'}).addTo(map);
               //根据最新的数据组最后一个绘制marker
               if (count === length) {
                   map.removeLayer(marker);
                   //如果是路径最后一个点，自动弹出信息框
                   marker = L.marker(drawPoints[length - 1], {icon: typhoonIcon})
                   .addTo(map)
                   .bindPopup(
                       "<b>" +
                       typhoonTestData[0]['name'] + 
                       "</b><br>" + 
                       land['info'] + 
                       "<br>" + 
                       land['landtime'] + 
                       "<br>经度：" + 
                       land['lng'] + 
                       "<br>经度：" + 
                       land['lat'] + 
                       "<br>强度：" + 
                       land['strong'] + 
                       "<br><br><b>Author: wuyuting<b>"
                       ).openPopup();
               } else {
                   //取已绘制点数组中最后一个点，放置台风标志
                   marker = L.marker(drawPoints[count - 1], {icon: typhoonIcon})
                             .addTo(map);
               }
           } else {
               //取完数据后清除定时器
               clearInterval(timer);
           }
       }, 100);
}

animateDrawLine();









