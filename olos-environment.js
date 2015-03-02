(function(params){
    var _dragObj = {};

    // --> SVG Dragging
    // adaptation of dragging.js from Web Audio Playground, MIT license by Chris Wilson
    function _startDraggingPort(event) {
      var self = this;
      var el;
      var x, y;

      _dragObj.elNode = event.interaction.downEvent.path[0];
      _dragObj.path = event.interaction.downEvent.path;
      // Get the position of the originating connector with respect to the page.
      var off = event.target;
      // x = window.scrollX + event.clientX + 12;
      // y = window.scrollY + event.clientX + 12;
      x = event.clientX;
      y = event.clientY;

      while (off) {
        x+=off.offsetLeft;
        y+=off.offsetTop;
        off=off.offsetParent;
        console.log('off');
      }

      // Save starting positions of cursor and element.
      _dragObj.cursorStartX = x;
      _dragObj.cursorStartY = y;

      // console.log(_dragObj.elNode.icon.indexOf('down') > 0);
      // remember if this is an input (1) or output node (0), so we can match
      _dragObj.originIsInput = _dragObj.elNode.icon.indexOf('up') > 0;
      // console.log('origin is input? ' + _dragObj.originIsInput);

      // Create a connector visual line
      var svgns = "http://www.w3.org/2000/svg";

      var shape = document.createElementNS(svgns, "line");
      shape.setAttributeNS(null, "x1", x);
      shape.setAttributeNS(null, "y1", y);
      shape.setAttributeNS(null, "x2", x);
      shape.setAttributeNS(null, "y2", y);
      shape.setAttributeNS(null, "stroke", "black");
      shape.setAttributeNS(null, "stroke-width", "2");
      _dragObj.connectorShape=shape;

      // environment.$.svg.appendChild(shape);
      environment.$.svg.insertBefore(shape, environment.$.svg.firstChild);


      // Capture mousemove and mouseup events on the page.
      document.addEventListener("mousemove", _whileDraggingPort,   true);
      document.addEventListener("mouseup",   _stopDraggingPort,   true);
      event.preventDefault();
      event.stopPropagation();

    };

    function _whileDraggingPort(event) {
      var x, y;

      x = event.clientX + window.scrollX;
      y = event.clientY + window.scrollY;

      // move visual lines
      _dragObj.connectorShape.setAttributeNS(null, "x2", x);
      _dragObj.connectorShape.setAttributeNS(null, "y2", y);


      var toElem = event.path[0];

      if (toElem == _dragObj.elemNode){
        return;
      }

      // If we used to be lighting up a node, but we're not over it anymore,
      // unlight it.
      if (_dragObj.lastLit && (_dragObj.lastLit != toElem ) ) {
        // console.log('unlight');
        _dragObj.lastLit.className = _dragObj.lastLit.unlitClassname;
        _dragObj.lastLit = null;
      }

      // light up connector point underneath, if any
      if (!_dragObj.lastLit || (_dragObj.lastLit != toElem )) {
        if (toElem.id.indexOf('port') > -1) {
          // console.log(toElem.id);
          toElem.unlitClassname = toElem.className;
          toElem.className += ' canConnect';
          _dragObj.lastLit = toElem;

        }
      }

      event.preventDefault();
      // event.stopPropagation();
    };

    function _stopDraggingPort(event) {
      // stop listeners
      document.removeEventListener("mousemove", _whileDraggingPort,   true);
      document.removeEventListener("mouseup",   _stopDraggingPort, true);
      document.removeEventListener("mousemove", _whileDraggingPort,   true);

      if (_dragObj.lastLit) {
        _dragObj.lastLit.className = _dragObj.lastLit.unlitClassname;
        _dragObj.lastLit = null;
      }

      _dragObj.elNode.className = _dragObj.elNode.unlitClassname;

      // find the port, and the element
      var toPort = '';
      var toElem = '';

      var eventPath = event.path;

      var dst = flipThruPath(eventPath, 'olos');
      var src = flipThruPath(_dragObj.path, 'olos');

      // if no connection was made
      if (typeof(dst) == 'undefined'){ //|| typeof (toElem.id) == 'undefined') {
        _dragObj.connectorShape.parentNode.removeChild(_dragObj.connectorShape);
        _dragObj.connectorShape = null;
      }
      else {
        // helper: flip thru the source parents until we find one with classname
        function flipThruPath(pathArray, className) {
          for (var i = 0; i < pathArray.length; i++) {
            var theClass = pathArray[i].className;
            if (typeof(theClass) === 'string') {
              if (pathArray[i].className === className) {
                obj = pathArray[i];
                return obj;
              }
            }
          }
        }

        makeConnection(src, dst);
        // environment._elements[1].input = environment._elements[0].output
      }

      // remove event listeners

      event.preventDefault();
    };

    function makeConnection(src, dst) {
      console.log('making a connection');
      var connectorShape = {};

      if (_dragObj && _dragObj.connectorShape) {
        connectorShape = _dragObj.connectorShape;
      }
      // Put an entry into the source's outputs
      if (!src.outputConnections)
          src.outputConnections = new Array();
      var connector = new Object();
      connector.line = connectorShape;
      connector.destination = dst;
      src.outputConnections.push(connector);

      // Put an entry into the destinations's inputs
      if (!dst.inputConnections)
        dst.inputConnections = new Array();
      connector = new Object();
      connector.line = connectorShape;
      connector.source = src;
      connector.destination = dst;
      dst.inputConnections.push(connector);

      connectorShape.inputConnection = connector;
      connectorShape.destination = dst;
      connectorShape.onclick = deleteConnection;

      connectorShape = null;

      // save connections to component source and destination
      src.output.connect(dst.input);        // dst.input = src.output;

      console.log(dst.input);
      console.log(src.output);
    }

    function deleteConnection() {
      var connections = this.destination.inputConnections;
      breakSingleInputConnection( connections, connections.indexOf( this.inputConnection ) );
    }

    function breakSingleInputConnection( connections, index ) {
      var connector = connections[index];
      var src = connector.source;
      var dst = connector.destination;

      // delete us from their .outputConnections,
      src.outputConnections.splice( src.outputConnections.indexOf( connector.destination ), 1);
      if (src.output) {  // they may not have an audioNode, if they're a BSN or an Oscillator
        // call disconnect() on the src,
        src.output.disconnect();
        // if there's anything left in their outputConnections, re.connect() those nodes.
        // TODO: again, this will break due to src resetting.
        for (var j=0; j<src.outputConnections.length; j++) {
          src.output.connect( src.outputConnections[j].destination.input);
        }
      }

      // and delete the line 
      connector.line.parentNode.removeChild( connector.line );

      // finally, remove us from the line.
      connections.splice( index, 1 );
    }

    -->

  Polymer('olos-environment', {
    _elements: [],

    ready: function() {
      console.log('ready!');
    },

    // inspired by th-connector -->

    // appends element to olos-environment
    // TO DO: give it a custom page position
    addElement: function(newElName, left, top){
      var self = this;
      var newEl = document.createElement(newElName);

      // TO DO: check to make sure element is loaded, otherwise load it
      // newEl.setAttribute('_top', top);
      // newEl.setAttribute('_left', left);
      // newEl.innerHTML = 'hello';
      self._processChild(newEl);

      // create ports
      self._createPorts(newEl);

      // add connect method
      self._initConnectMethod(newEl);

      // add UI
      self._createUI(newEl);
    },

    // make olos objects connectable
    _initConnectMethod: function(newEl) {
      newEl.connect = function(element) {
        // makeConnection(newEl, element);
        newEl.output.connect(element.input);
      }

      newEl.disconnect = function(element) {
        var connections = self.outputConnections;
          breakSingleInputConnection( connections, connections.indexOf( element ) );
      }

    },

    _createPorts: function(newEl) {
      // add input ports
      // console.log(newEl.inputCount);

      for (var i = 0; i< newEl.inputCount; i++) {
        var port = document.createElement('olos-port');

        // newEl.$.container.appendChild(port);
        newEl.$.container.insertBefore(port, newEl.$.container.firstChild);

        port.setAttribute('parent', newEl);
        port.setAttribute('type', 'in');
        port.setAttribute('class', 'port');
        port.setAttribute('pdimensions', [newEl.$.container.offsetWidth, newEl.$.container.offsetHeight]);
      }
      // add output ports
      for (var j = 0; j< newEl.outputCount; j++) {
        var port = document.createElement('olos-port');

        // newEl.$.container.appendChild(port);
        newEl.$.container.insertBefore(port, newEl.$.container.firstChild);

        port.setAttribute('parent', newEl);
        port.setAttribute('type', 'out');
        port.setAttribute('pdimensions', [newEl.$.container.offsetWidth, newEl.$.container.offsetHeight]);
      }
    },

    _createUI: function(newEl) {
      console.log('create UI');
      var button = document.createElement('button');
      newEl.analyser = null;

      // toggle whether to show or hide analyser
      button.addEventListener('click', function(e) {
        if (newEl.analyser === null) {
          var analyser = document.createElement('olos-analyser')
          analyser.setAttribute('id', 'analyser');
          newEl.$.container.appendChild(analyser);
          console.log(newEl);

          newEl.analyser = analyser;

          // what is the way to make a connect?
          // newEl.output.connect(newEl.analyser.input);
          newEl.connect(analyser);

        } else {
          console.log(newEl.analyser);
          newEl.$.container.removeChild(newEl.analyser);
          newEl.analyser.dispose();
          newEl.analyser = null;
        }
      })

      newEl.$.container.appendChild(button);


    },

    droppedInContainer: function(e, detail, selection) {
      var self = this;
      console.log(e);
      console.log('dropped in container');
      e.preventDefault();
      e.stopPropagation();
    },

    dragOver: function(e, detail, selection){
      console.log('dragover');
      e.preventDefault();
      e.stopPropagation();
    },

    _processChild: function(newChild) {
      var self = this;
      var el = newChild;
      el.className = 'olos';
      // interact.js
      interact(el).draggable({
        inertia: true,
        // keep the element within the area of it's parent
        restrict: {
          // restriction: "parent",
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        onstart: self.dragStart,
        onmove: self.dragMove,
        onend: self.dragEnd
      });
      // console.log(el.$.container);
      self._elements.push(el);
      self.$.container.appendChild(el);
    },
    // <--

    // --> interact.js callbacks
    dragStart: function(event) {
      var self = this;
      var eventOrigin = event.interaction.downEvent.path[0];
      if (eventOrigin.id.indexOf('port') > -1 ) {
        // console.log('startDraggingPort');
        _startDraggingPort(event);
        return;
      }
    },

    dragMove: function(event) {
      // only drag if the event origin ID === #container
      var eventOrigin = event.interaction.downEvent.path[0];
      
      // is it a port, or a container?
      if ( eventOrigin.id.indexOf('port') > -1  || eventOrigin.id !== 'container') {
        return;
      }

      var target = event.target.$.container;

      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';


      // from Chris Wilson's Web Audio Playground  -->
      if (event.target.inputConnections) { // update any lines that point in here.
        console.log('input connex!');
        var c;
        for (c=0; c<event.target.inputConnections.length; c++) {
          event.target.inputConnections[c].line.setAttributeNS(null, "x1", x);
          event.target.inputConnections[c].line.setAttributeNS(null, "y1", y);
        }
      }

      if (event.target.outputConnections) {  // update any lines that point out of here.
        var c;
        var oc = event.target.outputConnections;
        
        for (c=0; c<oc.length; c++) {
          // var oX = Math.round( Number( oc[0].destination.$.container.getAttribute('data-x') ) );
          // var oY = Math.round( Number( oc[0].destination.$.container.getAttribute('data-y') ) )
          event.target.outputConnections[c].line.setAttributeNS(null, "x2", x);
          event.target.outputConnections[c].line.setAttributeNS(null, "y2", y);
        }
      }
      // <--

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },

    dragEnd: function(event) {
      var eventTarget = event.interaction._curEventTarget.id;
    }
    // <--

  });

})();