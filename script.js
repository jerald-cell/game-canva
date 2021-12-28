var canvas, ctx;
var wrapper;
var Jerald = {};

Jerald.drag = {
  xdown: 0,
  ydown: 0,
  obj: null,
  isDragging: false,
  didDrag: false,
};

Jerald.hit = {
  hitKeys: [],
  hitGrid: [],
  width: 0,
  height: 0,
  resetHit: function () {
    this.hitKeys.length = 0;
    this.hitKeys.push("Default");
    this.hitGrid = new Uint16Array(this.width * this.height);

    //this.hitGrid = Array(this.height * this.width).fill(0);
  },
  AddHit: function (obj, x, y, w, h) {
    x = parseInt(x);
    y = parseInt(y);
    let i = this.hitKeys.length;
    this.hitKeys.push(obj);
    for (j = y; j < y + h; j++) {
      this.hitGrid.fill(i, this.width * j + x, this.width * j + x + w);
    }
  },
  getHit: function (x, y) {
    let i = this.hitGrid[y * this.width + x];
    return this.hitKeys[i];
  },
};

Jerald.drawScrollBar = function (scrollbar) {
  //draw whole rect
  ctx.fillStyle = scrollbar.bgColor;
  ctx.fillRect(scrollbar.x, 0, scrollbar.width, scrollbar.height);
  Jerald.hit.AddHit(
    { scroll: scrollbar, part: "Body" },
    scrollbar.x,
    scrollbar.y,
    scrollbar.width,
    scrollbar.height
  );

  //draw top btn
  ctx.fillStyle = scrollbar.btnColor;
  ctx.beginPath();
  ctx.moveTo(scrollbar.x, scrollbar.topbtn_height);
  ctx.lineTo(scrollbar.x + scrollbar.width / 2, 0);
  ctx.lineTo(scrollbar.x + scrollbar.width, scrollbar.topbtn_height);
  ctx.closePath();
  ctx.fill();

  Jerald.hit.AddHit(
    { scroll: scrollbar, part: "Top" },
    scrollbar.x,
    scrollbar.y,
    scrollbar.width,
    scrollbar.topbtn_height
  );

  //draw bottom btn
  ctx.fillStyle = scrollbar.btnColor;
  ctx.beginPath();
  ctx.moveTo(scrollbar.x, scrollbar.height - scrollbar.topbtn_height);
  ctx.lineTo(scrollbar.x + scrollbar.width / 2, scrollbar.height);
  ctx.lineTo(
    scrollbar.x + scrollbar.width,
    scrollbar.height - scrollbar.topbtn_height
  );
  ctx.closePath();
  ctx.fill();

  Jerald.hit.AddHit(
    { scroll: scrollbar, part: "Bottom" },
    scrollbar.x,
    scrollbar.y + scrollbar.height - scrollbar.topbtn_height,
    scrollbar.width,
    scrollbar.topbtn_height
  );

  //draw middle btn
  ctx.fillStyle = scrollbar.btnColor;
  ctx.fillRect(
    scrollbar.x,
    scrollbar.middlebtn_y,
    scrollbar.btn_width,
    scrollbar.middlebtn_height
  );

  Jerald.hit.AddHit(
    { scroll: scrollbar, part: "Drag" },
    scrollbar.x,
    scrollbar.y + scrollbar.topbtn_height,
    scrollbar.width,
    scrollbar.middlebtn_height
  );
};

Jerald.makeScrollBar = function (
  x,
  y,
  width,
  height,
  btnColor,
  bgColor,
  btn_width,
  topbtn_height,
  middlebtn_height,
  range
) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.btnColor = btnColor;
  this.bgColor = bgColor;
  this.btn_width = btn_width;
  this.topbtn_height = topbtn_height;
  this.middlebtn_height = middlebtn_height;
  this.middlebtn_y = topbtn_height;
  this.range = range;
};

Jerald.initialize = function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  Jerald.scrollbarA = new Jerald.makeScrollBar(
    (ctx.canvas.width * 1) / 3 - 15,
    0,
    15,
    ctx.canvas.height,
    "black",
    "#D3D3D3",
    15,
    10,
    ctx.canvas.height / 2
  );

  Jerald.scrollbarB = new Jerald.makeScrollBar(
    (ctx.canvas.width * 2) / 3 - 15,
    0,
    15,
    ctx.canvas.height,
    "black",
    "#D3D3D3",
    15,
    10,
    ctx.canvas.height / 2
  );

  Jerald.scrollbarC = new Jerald.makeScrollBar(
    ctx.canvas.width - 15,
    0,
    15,
    ctx.canvas.height,
    "black",
    "#D3D3D3",
    15,
    10,
    30
  );

  Jerald.hit.width = ctx.canvas.width;
  Jerald.hit.height = ctx.canvas.height;
  Jerald.hit.resetHit();

  ///////////////////////
  var wrapper = document.getElementById("wrapper");

  //   window.addEventListener("click", function (event) {
  //     var type = hit.getHit(event.clientX, event.clientY);
  //     console.log(typeof type);

  //     console.log(
  //       event.clientX + ", " + event.clientY,
  //       hit.getHit(event.clientX, event.clientY)
  //     );
  //   });

  //////////////////
  /// DIV MOUSE UP
  /// get the x, y
  wrapper.addEventListener("mousedown", (e) => {
    var drag = Jerald.drag;
    var obj = Jerald.hit.getHit(e.clientX, e.clientY);
    if (obj && obj.scroll) {
      drag.obj = obj;
      drag.ydown = obj.scroll.middlebtn_y - e.clientY;
      drag.isDragging = true;
    }
    isDragging = true;
  });

  wrapper.addEventListener("mouseup", (e) => {
    var drag = Jerald.drag;
    drag.obj = null;
    drag.isDragging = false;
  });

  wrapper.addEventListener("mousemove", (e) => {
    var drag = Jerald.drag;
    if (!drag.isDragging) {
      return;
    }
    var s = drag.obj.scroll;
    s.middlebtn_y = e.clientY + drag.ydown;
    if (s.middlebtn_y < s.y + s.topbtn_height) {
      s.middlebtn_y = s.y + s.topbtn_height;
    }
    if (s.middlebtn_y + s.middlebtn_height > s.height - s.topbtn_height) {
      s.middlebtn_y = s.height - s.topbtn_height - s.middlebtn_height;
    }
    Jerald.drawAll();
  });

  window.addEventListener("resize", function () {
    Jerald.initialize();
    Jerald.drawAll();
  });
};

Jerald.drawAll = function () {
  // drawing background containers
  Jerald.colorRect(0, 0, (ctx.canvas.width * 1) / 3, ctx.canvas.height, "red");
  Jerald.colorRect(
    (ctx.canvas.width * 1) / 3,
    0,
    (ctx.canvas.width * 1) / 3,
    ctx.canvas.height,
    "blue"
  );
  Jerald.colorRect(
    (ctx.canvas.width * 2) / 3,
    0,
    (ctx.canvas.width * 1) / 3,
    ctx.canvas.height,
    "yellow"
  );

  // drawing circles
  Jerald.colorCircle(
    (ctx.canvas.width * 1) / 3 / 2,
    ctx.canvas.height / 2,
    100,
    "blue"
  );
  Jerald.colorCircle(
    (ctx.canvas.width * 1) / 2,
    ctx.canvas.height / 2,
    100,
    "red"
  );
  Jerald.colorCircle(
    ctx.canvas.width - (ctx.canvas.width * 1) / 3 / 2,
    ctx.canvas.height - 100 - Jerald.scrollbarC.middlebtn_y,
    100,
    "green"
  );

  Jerald.drawScrollBar(Jerald.scrollbarA);
  Jerald.drawScrollBar(Jerald.scrollbarB);
  Jerald.drawScrollBar(Jerald.scrollbarC);
};

Jerald.colorRect = function (
  topLeftX,
  topLeftY,
  boxWidth,
  boxHeight,
  fillColor
) {
  ctx.fillStyle = fillColor;
  ctx.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
};

Jerald.colorCircle = function (centerX, centerY, radius, fillColor) {
  ctx.fillStyle = fillColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 100, 0, Math.PI * 2, true);
  ctx.fill();
};

window.onload = function () {
  wrapper = document.getElementById("wrapper");
  canvas = document.getElementById("myCanvas");
  ctx = canvas.getContext("2d");

  Jerald.initialize();
  Jerald.drawAll();
};

////////////////////////
//debugging

//window onload
// onresize
// keydown keyup

// //div
// mousedown
// mousemove
// mouseUp
// touchStart
// touchEnd
// touchDrag
// OnWheel
