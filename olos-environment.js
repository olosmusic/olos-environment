// (function(params){

  Polymer('olos-environment', {

    ready: function() {
      console.log('ready!');
      this.addEventListener('click', this.clickCallback);
    },
    clickCallback: function(e) {
      console.log(e);
    }
  });

// })();