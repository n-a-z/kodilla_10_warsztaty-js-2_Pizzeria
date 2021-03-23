import { select, classNames, settings, templates } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(
      select.cart.toggleTrigger
    );
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(
      select.cart.productList
    );
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(
      select.cart.deliveryFee
    );
    thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(
      select.cart.subtotalPrice
    );
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(
      select.cart.totalPrice
    );
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(
      select.cart.totalNumber
    );
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(
      select.cart.address
    );
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    //console.log(thisCart.dom.toggleTrigger);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function () {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (event) {
      thisCart.remove(event.detail.cartProduct);
      //console.log('event.detail.cartProduct',event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('generatedHTML:',generatedHTML);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log('generatedDOM:',generatedDOM);

    thisCart.dom.productList.appendChild(generatedDOM);

    //console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    //thisCart.products.push(menuProduct);
    //console.log('thisCart.products:',thisCart.products);
    thisCart.update();
  }

  update() {
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subTotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.totalNumber += product.amount;
      thisCart.subTotalPrice += product.price;
    }

    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.deliveryFee + thisCart.subTotalPrice;
    } else {
      thisCart.totalPrice = thisCart.subTotalPrice;
    }

    //console.log('totalNumber:',totalNumber);
    //console.log('subTotalPrice:',subTotalPrice);
    //console.log('thisCart.totalPrice:',thisCart.totalPrice);

    //console.log('thisCart.dom.subTotalPrice:',thisCart.dom.subTotalPrice);
    if (thisCart.totalNumber > 0) {
      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    } else {
      thisCart.dom.deliveryFee.innerHTML = 0;
    }

    thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
    //console.log('thisCart.totalPrice:',thisCart.totalPrice);
    //console.log('thisCart.dom.totalPrice:',thisCart.dom.totalPrice);
    for (let totalPrice of thisCart.dom.totalPrice) {
      totalPrice.innerHTML = thisCart.totalPrice;
    }
  }

  remove(product) {
    const thisCart = this;

    //console.log('thisCart.products.indexOf(product):',thisCart.products.indexOf(product));

    /* Removes product values from thisCart.products table */
    //const productIndex = thisCart.products.indexOf(product);
    //thisCart.products.splice(productIndex,1);
    thisCart.products.splice(thisCart.products.indexOf(product), 1);

    /* Removes dom element of product */
    //console.log('product',product);
    product.dom.wrapper.remove(); //Pytanie: dlaczego to działa (dom.wrapper na product)? Czy dlatego, że product to tak naprawdę event.detail.cartProduct ?

    thisCart.update();
  }

  sendOrder() {
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    //console.log('url:',url);

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subTotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData()); //Pytanie: getData() jest zadeklarowana w innej metodzie. Widzi ją dlatego, że Cart tworzy instancję new CartProduct? Czemu this nie jest potrzebne?
    }
    //console.log('payload:',payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      //.then(function(response){
      //return response.json();
      //})
      //.then(function(parsedResponse){
      //console.log('parsedResponse:',parsedResponse);
      //})
      .catch((error) => {
        console.error('Error:', error);
      });
  }
}

export default Cart;
