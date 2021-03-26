import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    //console.log('AmountWidget:',thisWidget);
    //console.log('constructor arguments:',element);

    thisWidget.getElements(element);
    //thisWidget.setValue(thisWidget.input.value); //BaseWidget
    //console.log('thisWidget.input.value:',thisWidget.input.value);

    thisWidget.initActions();
  }

  getElements() {
    const thisWidget = this;

    //thisWidget.element = element; //BaseWidget
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
    //thisWidget.value = thisWidget.input.value;
    //thisWidget.value = settings.amountWidget.defaultValue; //BaseWidget
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    //console.log('thisWidget.value:',thisWidget.value);

    if (
      //!isNaN(newValue) &&
      thisWidget.value !== newValue &&
      thisWidget.isValid(newValue)
    ) {
      thisWidget.value = newValue;
      //console.log('if newValue',newValue);
      //thisWidget.announce();
      thisWidget.announce();
    }

    thisWidget.dom.input.value = thisWidget.value;
  }

  parseValue(value) {
    return parseInt(value);
  }

  isValid(value) {
    return !isNaN(value)
    && value >= settings.amountWidget.defaultMin
    && value <= settings.amountWidget.defaultMax;
  }

  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      //thisWidget.value++;
      thisWidget.setValue(thisWidget.value + 1);
      //thisWidget.setValue(thisWidget.value++); //Dlaczego to nie zadziała?
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      //thisWidget.value--;
      thisWidget.setValue(thisWidget.value - 1);
    });
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default AmountWidget;
