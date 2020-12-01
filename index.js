import './index.scss';

let Node = airglass.extend(airglass.Renderable, {
  _constructor: function (params) {
    this.path = new Path2D;
    this.x = params && params.x || 0;
    this.y = params && params.y || 0;
    this.width = 0;
    this.height = 0;
    this.imports = params && params.imports || [];
    this.exports = params && params.exports || [];
    this.name = params && params.name || '';
    this.nameFill = params && params.nameFill || '#fff';
    this.nameFontSize = params && params.nameFontSize || 12;
    this.r = (params && params.r || 2) * devicePixelRatio;
    this.nameBarHeight = params && params.nameBarHeight || 40;
  },
  draw: function (ctx) {
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.line;
    ctx.stroke(this.path);

    let path = new Path2D;
    path.rect(this.x, this.y, this.width, this.nameBarHeight);
    ctx.fillStyle = this.fill;
    ctx.fill(path);

    path = new Path2D;
    path.moveTo(this.x, this.y + this.nameBarHeight);
    path.lineTo(this.x + this.width, this.y + this.nameBarHeight);
    ctx.stroke(path);

    ctx.font = `${this.nameFontSize}px sans-serif`;
    ctx.fillStyle = this.nameFill;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x + this.width / 2, this.y + this.nameBarHeight / 2);
  },
  updatePath: function () {
    let path = new Path2D;
    path.moveTo(this.x + this.r, this.y);
    path.lineTo(this.x + this.width - this.r, this.y);
    path.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.r, this.r);
    path.lineTo(this.x + this.width, this.y + this.height - this.r);
    path.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - this.r, this.y + this.height, this.r);
    path.lineTo(this.x + this.r, this.y + this.height);
    path.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - this.r, this.r);
    path.lineTo(this.x, this.y + this.r);
    path.arcTo(this.x, this.y, this.x + this.r, this.y, this.r);
    this.path = path;
    return this;
  },
  getTextWidth: function (ctx) {
    ctx.font = `${this.nameFontSize}px sans-serif`;
    return Math.ceil(ctx.measureText(this.name).width);
  }
});
Node.createNodeLine = function (params) {
  let NodeLine = airglass.extend(airglass.Effect, {
    _constructor: function (params) {
      this.startPoint = params && params.startPoint || { x: 0, y: 0 };
      this.endPoint = params && params.endPoint || { x: 0, y: 0 };
    },
    init: function () {
      this.bounds.x = this.startPoint.x;
      this.bounds.y = this.startPoint.y > this.endPoint.y ? this.endPoint.y : this.startPoint.y;
      let frameWidth = this.bounds.width = Math.ceil(this.line + Math.abs(this.endPoint.x - this.startPoint.x));
      let frameHeight = this.bounds.height = Math.ceil(this.line + Math.abs(this.endPoint.y - this.startPoint.y));
      this.bounds.centerX = this.bounds.x + frameWidth / 2;
      this.bounds.centerY = this.bounds.y + frameHeight / 2;
      let lineLength = Math.sqrt(frameWidth * frameWidth, frameHeight * frameHeight);
      this.frameCounts = Math.ceil(lineLength / 10);
      let step = 1 / this.frameCounts;
      this.keyframes.updateFrames(frameWidth, frameHeight, this.frameCounts, (i, ctx) => {
        let t = i * step;
        let margin = this.line / 2;
        let startPoint = {
          x: this.startPoint.x - this.bounds.x + margin,
          y: this.startPoint.y - this.bounds.y + margin
        };
        let c1 = {
          x: this.bounds.centerX - this.bounds.x + margin,
          y: this.startPoint.y - this.bounds.y + margin
        };
        let c2 = {
          x: this.bounds.centerX - this.bounds.x + margin,
          y: this.endPoint.y - this.bounds.y + margin
        };
        let endPoint = {
          x: this.endPoint.x - this.bounds.x + margin,
          y: this.endPoint.y - this.bounds.y + margin
        };
        let path = new Path2D();
        path.moveTo(startPoint.x, startPoint.y);
        path.bezierCurveTo(
          c1.x, c1.y,
          c2.x, c2.y,
          endPoint.x, endPoint.y
        );
        ctx.lineWidth = this.line;
        ctx.strokeStyle = this.stroke;
        ctx.stroke(path);

        let offsetX = endPoint.x - startPoint.x;
        let offsetY = endPoint.y - startPoint.y;
        let topPoint = {
          x: startPoint.x + t * offsetX,
          y: startPoint.y + t * offsetY
        };
        let lg = ctx.createLinearGradient(topPoint.x, topPoint.y, topPoint.x + step * 2 * offsetX, topPoint.y + step * offsetY);
        lg.addColorStop(0, 'hsla(0, 0%, 100%, 0)');
        lg.addColorStop(.7, 'hsla(0, 0%, 100%, .7)');
        lg.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
        ctx.strokeStyle = lg;
        ctx.stroke(path);
      });
      this.keyframes.initialized = true;
      return this;
    }
  });
  return new NodeLine(params);
};
Node.createPort = function (params) {
  let Port = airglass.extend(airglass.Renderable, {
    _constructor(params) {
      this.path = new Path2D;
      this.x = params && params.x || 0;
      this.y = params && params.y || 0;
      this.name = params && params.name || '';
      this.dir = params && params.dir || 'LTR';
      this.nameFontSize = params && params.nameFontSize || 12;
      this.size = params && params.size || 10;
      this.margin = params && params.margin || this.size / 2;
    },
    updatePath() {
      let path = new Path2D;
      path.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2, true);
      this.path = path;
    },
    draw(ctx) {
      ctx.fillStyle = this.fill;
      ctx.fill(this.path);

      ctx.textBaseline = 'middle';
      ctx.font = `${this.nameFontSize}px sans-serif`;
      if (this.dir == 'LTR') {
        ctx.textAlign = 'left';
        ctx.fillText(this.name, this.x + this.size / 2 + this.margin, this.y);
      } else {
        ctx.textAlign = 'right';
        ctx.fillText(this.name, this.x - this.size - this.margin, this.y);
      }
    },
  });
  return new Port(params);
};

let funcs = {
  prototype: {
    reference: function (type, targetPort) {
      if (type == 'connect')
        {createLineBySourcePort(this, targetPort);}
      if (type == 'disconnect')
        {deleteLineByTargetPorts(targetPort);}
    }
  },
  class: {
    reference: function (type, targetPort) {
      if (type == 'connect')
        {createLineBySourcePort(this, targetPort);}
      if (type == 'disconnect')
        {deleteLineByTargetPorts(targetPort);}
    }
  },
  reference: {
    reference: function (type, targetPort) {
      if (type == 'connect')
        {createLineBySourcePort(this, targetPort);}
      if (type == 'disconnect')
        {deleteLineByTargetPorts(targetPort);}
    }
  },
  Null: {
    "null": function (type, targetPort) {
      if (type == 'connect')
        {createLineBySourcePort(this, targetPort);}
      if (type == 'disconnect')
        {deleteLineByTargetPorts(targetPort);}
    }
  }
};

let lastEventPosition;
let touchstartPosition;
let activeNode;
let activeSourcePort;
let activeTempLink;
let activeTargetPort;
let renderers = {
  link: null,
  tempLink: null,
  linkLight: null,
  node: null,
  tempNode: null,
  port: null,
  tempPort: null,
};

let animateLinkTimer;
let ag;
let portSize = 6;

ajax('data.json', {
  responseType: 'json'
}, (response) => {
  let width = response.width || 800;
  let height = response.height || 400;
  ag = new airglass.Airglass({
    element: document.querySelector('#app'),
    width,
    height,
    DPR: 1,
  });
  renderers.link = ag.addRenderer('link');
  renderers.tempLink = ag.addRenderer('tempLink');
  renderers.linkLight = ag.addRenderer('linkLight');
  renderers.node = ag.addRenderer('node');
  renderers.tempNode = ag.addRenderer('tempNpde');
  renderers.port = ag.addRenderer('port');
  renderers.tempPort = ag.addRenderer('tempPort');

  let targetPorts = [];
  let sourcePorts = [];

  let hosts = response.hosts;

  // 标题栏内边距
  let namePadding = 6;

  let portMargin = portSize * .5;
  let hostTBPadding = portMargin;
  let hostLRPadding = namePadding;

  // 标题高度
  let nameFontSize = 12;
  let nameBarHeight = nameFontSize + namePadding;
  let portOffsetY = portSize / 2 + portMargin;

  hosts.forEach((host, i) => {
    if (!host.id || !host.x || !host.y) {return;}
    let properties = host.properties || {};
    let nodeHue = properties.nodeHue;
    let nodeSaturation = properties.nodeSaturation;
    let nodeLight = properties.nodeLight;

    let portHue = properties.portHue;
    let portSaturation = properties.portSaturation;
    let portLight = properties.portLight;

    let _module = new Node({
      x: host.x,
      y: host.y,
      r: 3,
      lineWidth: 1,
      fill: `hsla(${nodeHue || 0}, ${nodeSaturation || 70}%, ${nodeLight || 50}%, 0.17)`,
      stroke: `hsl(${nodeHue || 0}, ${nodeSaturation || 70}%, ${nodeLight || 50}%)`,
      nameFill: `hsl(${nodeHue || 0}, ${nodeSaturation || 100}%, ${nodeLight || 50}%)`,
      nameFontSize: nameFontSize,
      nameBarHeight: nameBarHeight,
      name: host.name,
    });
    _module.userData = {
      id: host.id,
      name: host.name,
      width: host.width,
      height: host.height,
      type: host.type,
      properties: properties,
    };

    let moduleInitialHeight = nameBarHeight + hostTBPadding;

    if (host.width) {
      _module.width = host.width;
    } else {
      _module.width = _module.getTextWidth(renderers.port.element.getContext('2d')) + hostLRPadding * 2;
    }

    let singlePortPlaceholderHeight = portSize + portMargin * 2;
    let importPortsTotalHeight = host.imports.length * singlePortPlaceholderHeight;
    let exportPortsToTalHeight = host.exports.length * singlePortPlaceholderHeight;

    _module.imports = host.imports &&
      host.imports.length &&
      host.imports.map((portData, i) => {
        let x = _module.x;
        let y = _module.y + moduleInitialHeight + i * singlePortPlaceholderHeight;
        let port = Node.createPort({
          x: x,
          y: y + portOffsetY,
          size: portSize,
          nameFontSize: nameFontSize,
          dir: 'LTR',
          name: portData.name,
          lineWidth: 1,
          fill: `hsl(${portHue || 0}, ${portSaturation || 100}%, ${portLight || 50}%)`,
          stroke: `hsl(${portHue || 0}, ${portSaturation || 100}%, ${portLight || 50}%)`,
        });
        port.userData = {
          type: 'target',
          sourceNodeId: portData.sourceNodeId,
          sourcePortId: portData.sourcePortId,
          node: _module,
          name: portData.name,
        };
        port.updatePath();
        renderers.port.scene.add(port);
        targetPorts.push(port);
        return port;
      }) || [];

    _module.exports = host.exports &&
      host.exports.length &&
      host.exports.map((portData, i) => {
        let x = _module.x + _module.width;
        let y = _module.y + moduleInitialHeight + i * singlePortPlaceholderHeight;
        let port = Node.createPort({
          x: x,
          y: y + portOffsetY,
          size: portSize,
          name: portData.name,
          nameFontSize: nameFontSize,
          dir: 'RTL',
          fill: `hsl(${portHue || 0}, 100%, 50%)`,
          stroke: `hsl(${portHue || 0}, 100%, 50%)`,
        });
        port.userData = {
          type: 'source',
          nodeId: host.id,
          portId: portData.id,
          node: _module,
          processor: portData.processor,
          name: portData.name,
          params: portData.params || {},
        };
        port.updatePath();
        renderers.port.scene.add(port);
        sourcePorts.push(port);
        return port;
      }) || [];

    if (host.height) {
      _module.height = host.height;
    } else {
      _module.height = moduleInitialHeight + max([importPortsTotalHeight, exportPortsToTalHeight]) + hostTBPadding;
    }
    _module.updatePath();
    renderers.node.scene.add(_module);
  });

  sourcePorts.forEach(sourcePort => {
    targetPorts.forEach(targetPort => {
      if (targetPort.userData.sourceNodeId == sourcePort.userData.nodeId && targetPort.userData.sourcePortId == sourcePort.userData.portId) {
        processing('connect', targetPort, sourcePort);
      }
    });
  });

  renderers.node.reRender();
  renderers.port.reRender();
  renderers.link.reRender();

  animate();

  ag.subscribe(subscriber);
});

function animate() {
  if (animateLinkTimer) {
    clearInterval(animateLinkTimer);
  }
  renderers.link.scene.children.forEach(link => {
    link.keyframes.currentFrameIndex = Math.floor(Math.random() * link.keyframes.frames.length);
  });
  animateLinkTimer = setInterval(() => {
    renderers.link.reRender();
  }, 80);
}

let needInitKeyframes = false;
let lastTouchstartPosition = null;

function subscriber(event, originEvent) {
  // 初始化上次事件位置
  !lastEventPosition && (lastEventPosition = { x: event.x, y: event.y });

  if (event.type == 'touchstart') {
    touchstart: {
      needInitKeyframes = false;
      renderers.linkLight.clear();
      // 初始化touchstart事件位置
      lastTouchstartPosition = [event.x, event.y];
      let ports = renderers.port.getElementsContainPoint(event);
      if (ports.length) {
        let port = ports[ports.length - 1];
        if (port.userData.type == 'source') {
          activeSourcePort = port;
          console.table({
            '输出ID': activeSourcePort.userData.portId,
            name: activeSourcePort.userData.name,
            params: JSON.stringify(activeSourcePort.userData.params),
            processor: activeSourcePort.userData.processor,
          });
          break touchstart;
        }
        if (port.userData.type == 'target') {
          activeTargetPort = port;
          console.table({
            name: activeTargetPort.userData.name,
            '有无数据': !!activeTargetPort.userData.data,
            sourceNodeId: activeTargetPort.userData.sourceNodeId,
            sourcePortId: activeTargetPort.userData.sourcePortId,
          });
          break touchstart;
        }
      }

      let nodes = renderers.node.getElementsContainPoint(event);
      if (nodes.length) {
        activeNode = nodes[nodes.length - 1];
        console.table({
          '节点ID': activeNode.userData.id,
          name: activeNode.userData.name,
          type: activeNode.userData.type,
        });
        activeNode.imports.forEach(port => {
          renderers.tempPort.scene.add(renderers.port.scene.remove(port));
        });
        activeNode.exports.forEach(port => {
          renderers.tempPort.scene.add(renderers.port.scene.remove(port));
        });
        renderers.tempNode.scene.add(renderers.node.scene.remove(activeNode));
        renderers.tempPort.reRender();
        renderers.tempNode.reRender();

        renderers.port.reRender();
        renderers.node.reRender();
        break touchstart;
      }
    }
  }

  if (event.type == 'touchmove') {
    touchmove: {
      if (lastEventPosition.x == event.x && lastEventPosition.y == event.y) {
        break touchmove;
      }

      if (activeSourcePort) {
        needInitKeyframes = true;
        originEvent.preventDefault();
        renderers.tempLink.clear();
        let link = Node.createNodeLine({
          startPoint: activeSourcePort,
          endPoint: event
        });
        link.stroke = `hsl(${activeSourcePort.userData.node.userData.hue}, 100%, 50%)`;
        link.lineWidth = 3;
        // link.updatePath();
        renderers.tempLink.scene.children = [link];
        renderers.tempLink.reRender();
        break touchmove;
      }
      if (activeNode) {
        needInitKeyframes = true;
        originEvent.preventDefault();
        activeNode.x = activeNode.x + event.x - lastEventPosition.x;
        activeNode.y = activeNode.y + event.y - lastEventPosition.y;
        activeNode.updatePath();
        renderers.tempNode.reRender();

        activeNode.imports.forEach(port => {
          port.x = port.x + event.x - lastEventPosition.x;
          port.y = port.y + event.y - lastEventPosition.y;
          port.updatePath();
        });
        activeNode.exports.forEach(port => {
          port.x = port.x + event.x - lastEventPosition.x;
          port.y = port.y + event.y - lastEventPosition.y;
          port.updatePath();
        });
        renderers.tempPort.reRender();

        renderers.link.clear();
        animateLinkTimer && clearInterval(animateLinkTimer);
      }
    }
  }

  if (event.type == 'touchend') {
    touchend: {
      renderers.tempLink.clear();
      let ports = renderers.port.getElementsContainPoint(lastEventPosition);
      if (ports.length) {
        let port = ports[ports.length - 1];
        if (activeSourcePort && !activeSourcePort.userData.targetPort && port !== activeSourcePort) {
          if (port.userData.type == 'target' && !port.userData.sourceNodeId && !port.userData.sourcePortId) {
            processing('connect', port, activeSourcePort);
          }
        }
        if (port === activeTargetPort) {
          if (port.userData.sourcePort) {
            processing('disconnect', port);
          }
        }
      }
      if (activeNode) {
        activeNode.imports.forEach(port => {
          renderers.port.scene.add(renderers.tempPort.scene.remove(port));
        });
        activeNode.exports.forEach(port => {
          renderers.port.scene.add(renderers.tempPort.scene.remove(port));
        });
        renderers.node.scene.add(renderers.tempNode.scene.remove(activeNode));
        renderers.node.reRender();
        renderers.port.reRender();
        renderers.tempNode.reRender();
        renderers.tempPort.reRender();
        activeNode = null;
      }
      activeSourcePort = null;
      activeTargetPort = null;

      if (needInitKeyframes) {
        renderers.link.scene.children.forEach(link => {
          link.init();
        });
        animate();
      }
    }
  }

  lastEventPosition = { x: event.x, y: event.y };
}

function processing(type, TP, SP) {
  let targetPort = TP;
  let sourcePort;
  let sourcePortProcessorName;
  if (type == 'connect') {
    sourcePort = SP;
  }
  if (type == 'disconnect') {
    sourcePort = targetPort.userData.sourcePort;
  }
  let nodeType = sourcePort.userData.node.userData.type;
  sourcePortProcessorName = sourcePort.userData.processor;
  try {
    funcs[nodeType] &&
      funcs[nodeType][sourcePortProcessorName] &&
      funcs[nodeType][sourcePortProcessorName].call(sourcePort, type, targetPort);
  } catch (e) {
    console.log(e);
    // 连接发生错误
    if (type == 'connect') {
      sourcePort.userData.targetPort = null;
      targetPort.userData.sourcePort = null;
      targetPort.userData.sourceNodeId = null;
      targetPort.userData.sourcePortId = null;
    }
    // 断开连接发生错误
    if (type == 'disconnect') {

    }
  }
}

function createLineBySourcePort(sourcePort, targetPort) {
  sourcePort.userData.targetPort = targetPort;
  targetPort.userData.sourcePort = sourcePort;
  targetPort.userData.sourceNodeId = sourcePort.userData.nodeId;
  targetPort.userData.sourcePortId = sourcePort.userData.portId;
  let link = Node.createNodeLine({
    startPoint: sourcePort,
    endPoint: targetPort,
    stroke: `hsla(${sourcePort.userData.node.userData.properties.portHue || 0}, 100%, 50%, .2)`,
    line: 2
  });
  link.init();
  link.locate(link.bounds.centerX - link.line / 2, link.bounds.centerY - link.line / 2, 0);
  renderers.link.scene.add(link);
  renderers.link.reRender();
}

// 清除port循环引用关系
// 清除line
// 清除_sourceNodeId和_sourcePortId
// 更新渲染line的Glass（擦玻璃+重新画）
function deleteLineByTargetPorts() {
  let targetPort = [].slice.call(arguments, 0);
  renderers.link.scene.children.forEach((link, linkIndex) => {
    targetPort.forEach(targetPort => {
      if (targetPort == link.endPoint) {
        targetPort.userData.sourcePort.userData.targetPort = null;
        targetPort.userData.sourcePort = null;
        targetPort.userData.sourceNodeId = undefined;
        targetPort.userData.sourcePortId = undefined;
        renderers.link.scene.children.splice(linkIndex, 1);
      }
    });
    renderers.link.reRender();
  });
}

function exportData() {
  let data = {
    width: ag.bounds.width,
    height: ag.bounds.height,
    hosts: renderers.node.scene.children.map(hostChild => {
      return {
        id: hostChild.userData.id,
        name: hostChild.userData.name,
        type: hostChild.userData.type,
        x: hostChild.x,
        y: hostChild.y,
        width: hostChild.userData.width,
        height: hostChild.userData.height,
        properties: hostChild.userData.properties,
        imports: hostChild.imports.map(importPort => {
          return {
            sourceNodeId: importPort.userData.sourceNodeId,
            sourcePortId: importPort.userData.sourcePortId,
            name: importPort.userData.name,
          };
        }),
        exports: hostChild.exports.map(exportPort => {
          return {
            id: exportPort.userData.portId,
            name: exportPort.userData.name,
            params: exportPort.userData.params,
            processor: exportPort.userData.processor,
          };
        })
      };
    })
  };
  return data;
}

function ajax(url, opts, cb) {
  let client = new XMLHttpRequest();
  opts.responseType && (client.responseType = opts.responseType);
  client.onreadystatechange = function () {
    if (client.status == 200 && client.readyState == 4) {
      cb && cb(client.response);
    }
  };
  client.open('GET', url, true);
  client.send(null);
}
function max(array) {
  let max = -1;
  for (const value of array) {
    if (value != null && (max < value || (max == -1 && value >= value))) {
      max = value;
    }
  }
  return max;
}
function min(array) {
  let min = -1;
  for (const value of array) {
    if (value != null && (min > value || (min === -1 && value >= value))) {
      min = value;
    }
  }
  return min;
}