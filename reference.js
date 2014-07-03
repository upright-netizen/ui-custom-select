GC || (GC = {});

GC.FancySelects = (function(){
  var Select, Option;
   /**
    * Create a new instance of Select
    *
    * @classDescription This class creates a new instance of Select, hides the original select element, and creates the options
    * @param {Object} $el Element or jQuery select element
    * @return {Object} returns a new Select object
    * @constructor
    */
   Select = (function(){
    function Select($el){
      // return a new Select object even if you didn't say "new"
      if (!(this instanceof Select)) return new Select($el);

      // Ensure $el is a jquery object
      if (!$el.jquery) $el = $($el);

      var self = this;

      $label = $el.prev('label');
      Select.init($label, $el, self);

      Select.all.push(self);

      this.refresh = function($newEl) {
        $label = self.$newElement.prev('label');
        self.$selectButton.remove();
        self.$optionList.remove();
        self.$newElement.remove();
        Select.init($label, $newEl, self);
      };
    }

    Select.init = function init($label, $el, self) {
      // Ensure $el is a jquery object
      if (!$el.jquery) $el = $($el);

      self.$originalSelect = $el;

      // get value for fake label
      var initialLabel = $el.find('option:selected').text();

      // set up empty array for the options
      self.options = [];

      // find label using closest (requires select to be right after label)
      self.$label = $label;

      // create select button
      self.$selectButton = $(document.createElement('div')).addClass('select-button')
      .attr('id','select-' + self.$originalSelect.attr('id') + '-button')
      .html('<span class="label"></span><div class="action-wrap"><span class="action"></span></div>')
      .width(self.$originalSelect.outerWidth() + 21)
      .click(function(e){
        self.open();
        e.stopPropagation();
      });

      // create new child list, initially hidden
      self.$optionList = $(document.createElement('div')).addClass('select-list')
      .attr('id','select-' + self.$originalSelect.attr('id') + '-list')
      .html('<ul></ul>')
      .width(self.$originalSelect.outerWidth() + 23)
      .appendTo('body');

      // create new container element
      self.$newElement = $(document.createElement('div'));

      // build element
      self.$newElement.addClass('select-container ' + self.$originalSelect.attr('class') + '-select')
      .append(self.$selectButton)
      .append($($el).hide());

      // create new option object for each child, and add to the options array
      $el.children('option').each(function(i, el){
        self.options.push(new Option(el, self));
      });

      // set fake label to initial value of the select
      self.$fakeLabel = self.$newElement.find('.label');
      self.$fakeLabel.text(initialLabel);

      // place new select on page
      self.$label.after(self.$newElement);
    }

    Select.all = [];

    Select.disableAll = function disableAllSelects(){
      _.each(Select.all, function(s){
        s.close();
      });
    }

    Select.prototype.open = function openSelect(){
      if(this.enabled) return(this.close());

      Select.disableAll();
      this.$optionList.show();
      this.$optionList.css('display', 'block');
      this.$selectButton.addClass('open');
      this.enabled = true;
      this.$optionList.position({
        of: '#select-' + this.$originalSelect.attr('id') + '-button',
        my: 'left top',
        at: 'left bottom',
        collision: 'none none'
      });

      var height = this.$optionList.find('ul').height();

      if (height >= 305) {
        this.$optionList.css({'height':'300', 'overflow-y' : 'scroll'})
      }

      $(document).click(function(){
        Select.disableAll();
      });

    }

    Select.prototype.close = function closeSelect(){
      if(!this.enabled) return;

      this.enabled = false;
      this.$optionList.hide();
      this.$selectButton.removeClass('open');
    }

    Select.prototype.update = function updateSelect(option){
      this.$fakeLabel.text(option.text);

      this.$originalSelect.val(option.value).change();

      // if this is the quantity select, don't trigger the event
      if(!this.$originalSelect.hasClass('quantity')){
        this.$originalSelect.trigger('gc_select_change', [option.value, option.$el.data()]);
      }
    }

    return Select;

   })();

   Option = (function(){
    function Option($el, parent){
      // return a new Option object even if you didn't say "new"
      if (!(this instanceof Option)) return new Option($el);
      // Ensure $el is a jquery object
      if (!$el.jquery) $el = $($el);
      var self = this;

      // this.parent.options = siblings

      self.$el = $el;

      self.text = $el.text();
      self.value = $el.val();
      self.parent = parent;

      // create HTML element
      self.$newElement = $(document.createElement('li'))
      .text(self.text)
      .attr('id', self.value)
      .click(function(e){
        self.choose(parent);
        e.stopPropagation();
      });

      if ($el.hasClass('sold-out')){
        self.$newElement.addClass('sold-out');
      }

      // Append to parent
      self.$newElement.appendTo(parent.$optionList.find('ul'));

    }

    Option.prototype.choose = function chooseOption(parent){
      parent.update(this);
      parent.close();
    }

    return Option;
   })();

   return {
    Select: Select,
    allSelects: Select.all
   }

})();
