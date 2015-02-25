(function(params){

  Polymer('olos-environment', {
    _elements: [],

    ready: function() {
      console.log('ready!');
    },

    // inspired by th-connector -->

    // appends element to olos-environment
    addElement: function(newElName, left, top){
      var self = this;
      var newEl = document.createElement(newElName);
      // TO DO: check to make sure element is loaded, otherwise load it
      // newEl.setAttribute('_top', top);
      // newEl.setAttribute('_left', left);
      newEl.innerHTML = 'hello';
      self._processChild(newEl);
      // console.log(newEl.$.container)

      // create ports
      self._createPorts(newEl);
    },

    _createPorts: function(newEl) {
      // add input ports
      console.log(newEl.inputCount);

      for (var i = 0; i< newEl.inputCount; i++) {
        var port = document.createElement('olos-port');

        // newEl.$.container.appendChild(port);
        newEl.$.container.insertBefore(port, newEl.$.container.firstChild);

        port.setAttribute('parent', newEl);
        port.setAttribute('type', 'in');
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
      var eventOrigin = event.interaction.downEvent.path[0];
      if (eventOrigin.id.indexOf('port') > -1 ) {
        console.log('startDraggingPort');
        return;
      }
    },

    dragMove: function(event) {
      // only drag if the event origin ID === #container
      var eventOrigin = event.interaction.downEvent.path[0];
      // console.log(eventOrigin);
      
      // is it a connector?
      if (eventOrigin.id.indexOf('port') > -1 ) {
        console.log('dragging a port!');
        return;
      }

      if (eventOrigin.id !== 'container') {
        return;
      }

      var target = event.target.$.container;

      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    },

    dragEnd: function(event) {
      var eventTarget = event.interaction._curEventTarget.id;
      console.log(eventTarget);
    },
    // <--

    // --> SVG Dragging
    // startDragging

  });

})();