import { select, settings } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    //console.log('AmountWidget:',thisWidget);
    //console.log('constructor arguments:',element);

    thisWidget.getElements(element);
    thisWidget.setValue(thisWidget.input.value);
    //console.log('thisWidget.input.value:',thisWidget.input.value);

    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
    //thisWidget.value = thisWidget.input.value;
    thisWidget.value = settings.amountWidget.defaultValue;
  }

  setValue(value) {
    const thisWidget = this;
    const newValue = parseInt(value);
    //console.log('thisWidget.value:',thisWidget.value);

    if (
      !isNaN(newValue) &&
      thisWidget.value !== newValue &&
      newValue >= settings.amountWidget.defaultMin &&
      newValue <= settings.amountWidget.defaultMax
    ) {
      thisWidget.value = newValue;
      //console.log('if newValue',newValue);
      //thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }

  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      //thisWidget.value++;
      thisWidget.setValue(thisWidget.value + 1);
      //thisWidget.setValue(thisWidget.value++); //Dlaczego to nie zadziała?
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
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
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
