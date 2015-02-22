(function(params){

  Polymer('olos-environment', {
    _elements: [],

    ready: function() {
      console.log('ready!');
      this.$.container.addEventListener('click', this.clickCallback);
    },

    clickCallback: function(e) {
      // e.stopPropagation();
      // e.preventDefault();
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
      newEl.setAttribute('_top', top);
      newEl.setAttribute('_left', left);
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
      console.log(el);
      var droppedTop = el.getAttribute('_top');
      var droppedLeft = el.getAttribute('_left');

      // name
      var elName = el.tagName.toLowerCase();

      // Set unique ID to each element
      el.id = el.id; //|| self.generateUniqueId(elName);

      var elItem = {  element: el,
                      id: el.id,
                      name: elName,
                      top: droppedTop,
                      left: droppedLeft
      };
      self._elements.push(elItem);
      console.log(self._elements);
      self.$.container.appendChild(el);
    }

  });

})();