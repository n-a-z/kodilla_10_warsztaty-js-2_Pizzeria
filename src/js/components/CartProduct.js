import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.params = menuProduct.params;
    //thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('thisCartProduct:',thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.amountWidget
    );
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.price
    );
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.edit
    );
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(
      select.cartProduct.remove
    );
    //console.log('thisCartProduct.dom.menuProduct:',thisCartProduct.dom.menuProduct);
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(
      thisCartProduct.dom.amountWidget
    );

    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      //console.log('thisCartProduct.amount:',thisCartProduct.amount);
      //thisCartProduct.priceSingle;
      thisCartProduct.price =
        thisCartProduct.priceSingle * thisCartProduct.amount;
      //console.log('thisCartProduct.priceSingle:', thisCartProduct.priceSingle);
      //console.log('thisCartProduct.price:', thisCartProduct.price);
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      //console.log('thisCartProduct.dom.price:',thisCartProduct.dom.price);
    });
  }

  remove() {
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    //console.log('remove');
  }

  initActions() {
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function (event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function (event) {
      event.preventDefault();
      thisCartProduct.remove();
    });
  }

  getData() {
    const thisCartProduct = this;

    return {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
    };
  }
}

export default CartProduct;
