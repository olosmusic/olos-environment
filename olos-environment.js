(function(params){

  Polymer('olos-environment', {
    _elements: [],

    ready: function() {
      console.log('ready!');
      this.$.container.addEventListener('click', this.clickCallback);
    },

    clickCallback: function(e) {
      e.stopPropagation();
      e.preventDefault();
      console.log(e.path);
      // console.log(e.target);
      // console.log(e.currentTarget);
      // console.log(e.target.nodeName);
      // console.log(e.srcElement);
      // console.log(e.originalTarget);
      var elem, evt = e ? e:event;
       if (evt.srcElement)  elem = evt.srcElement;
       else if (evt.target) elem = evt.target;
      console.log(elem.tagName);
     // if (e.target !== e.currentTarget) {
     //        var clickedItem = e.target.id;
     //        alert("Hello " + clickedItem);
     //    }
     //  console.log(e);
    },

    /** inspired by th-connector **/

    // appends element to olos-environment
    addElement: function(newElName, left, top){
      var self = this,
      newEl = document.createElement(newElName);
      // TO DO: check to make sure element is loaded, otherwise load it
      // newEl.setAttribute('_top', top);
      // newEl.setAttribute('_left', left);
      newEl.innerHTML = 'hello';
      self._processChild(newEl);
      // self.$.container.appendChild(newEl);
      // self._processChildren();
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
      // var children = self.$.container.querySelectorAll('*');
      // [].forEach.call(children, function(el, i) {
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

      // // DELETE
      // console.log(el);
      // var droppedTop = el.getAttribute('_top');
      // var droppedLeft = el.getAttribute('_left');

      // // name
      // var elName = el.tagName.toLowerCase();

      // // Set unique ID to each element
      // el.id = el.id; //|| self.generateUniqueId(elName);

      // var elItem = {  element: el,
      //                 id: el.id,
      //                 name: elName,
      //                 top: droppedTop,
      //                 left: droppedLeft
      // };
      // self._elements.push(elItem);
      // console.log(self._elements);
      self.$.container.appendChild(el);
    },

    // interact.js
    dragStart: function(event) {
      // console.log(event);
      // console.log('drag start!');
      // console.log(event);
      console.log(event);
    },

    dragMove: function(event) {
      var eventOrigin = event.interaction.downEvent.path[0];
      console.log(eventOrigin.id);
      if (eventOrigin.id !== 'container') {
        return;
      }
      var target = event.target.$.container;
      // console.log(target);
      // keep the dragged position in the data-x/data-y attributes
      var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
      var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

      // translate the element
      target.style.webkitTransform =
      target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);

      // console.log('onmove!');
    },

    dragEnd: function(event) {
      // console.log(event);
      console.log('onend!');
    },

  });

})();