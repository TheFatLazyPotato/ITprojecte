function upload(){
    var imgcanvas = document.getElementById("display-input");
    var fileinput = document.getElementById("fileInput");
    var image = new SimpleImage(fileinput);
    image.drawTo(imgcanvas);
  }