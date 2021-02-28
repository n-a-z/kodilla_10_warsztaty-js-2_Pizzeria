/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:',thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //console.log('thisProduct.element:',thisProduct.element);

      const menuContainer = document.querySelector(select.containerOf.menu);
      //console.log('menuContainer:', menuContainer);

      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      //thisCart.dom.productList = thisProduct.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = select.menuProduct.clickable;
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log('clickableTrigger:',clickableTrigger);

      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);

        for(let activeProduct of activeProducts) {
          /* if there is active product and it's not thisProduct.element, remove class active from it */
          if(activeProduct && activeProduct !== thisProduct.element) {
            activeProduct.classList.remove('active');
          }
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');
      });
    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('initOrderForm');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // set price to default price
      let price = thisProduct.data.price;

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);

          if(optionImage){
            //console.log('optionImage:',optionImage);
            if(optionSelected){
              //console.log(optionImage.className);
              //console.log(classNames.menuProduct.imageVisible);
              //optionImage.className = classNames.menuProduct.imageVisible + ' ' + paramId + '-' + optionId;
              //optionImage.className = 'active' + ' ' + paramId + '-' + optionId;
              //optionImage.className = classNames.menuProduct.imageVisible; //dlaczego sama klasa active nie działa?
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              //optionImage.className = paramId + '-' + optionId;
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
            //console.log(optionImage.className);
          }

          if(optionSelected){
            if(!option.defaul){
              price += option.price;

            } else if(option.default) {
              price -= option.price;
            }
          }
        }
      }

      // update calculated price in the HTML
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
      thisProduct.price = price;
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.price,
        //price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams()
      };
      //productSummary.price = productSummary.amount * productSummary.priceSingle;
      //productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      const params = {};

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log("params[paramId]:",param);
        params[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          // const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //console.log('option:',optionId);
          //console.log('optionSelected:',optionSelected);
          if(optionSelected){
            //params[paramId].label = param.label;
            params[paramId].options[optionId] = param.options[optionId].label;
          }
        }
      }
      return params;
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
      //app.cart.add(thisProduct.prepareCartProductParams());
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      //console.log('AmountWidget:',thisWidget);
      //console.log('constructor arguments:',element);

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      //console.log('thisWidget.input.value:',thisWidget.input.value);

      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      //thisWidget.value = thisWidget.input.value;
      thisWidget.value = settings.amountWidget.defaultValue;
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      //console.log('thisWidget.value:',thisWidget.value);

      if(!isNaN(newValue) && thisWidget.value !== newValue && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
        thisWidget.value = newValue;
        //console.log('if newValue',newValue);
        //thisWidget.announce();
      }

      thisWidget.input.value = thisWidget.value;
      thisWidget.announce();
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        //thisWidget.value++;
        thisWidget.setValue(thisWidget.value + 1);
        //thisWidget.setValue(thisWidget.value++); //Dlaczego to nie zadziała?
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        //thisWidget.value--;
        thisWidget.setValue(thisWidget.value - 1);
      });
    }

    announce(){
      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

      //console.log(thisCart.dom.toggleTrigger);
    }

    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
        //console.log('event.detail.cartProduct',event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    add(menuProduct){
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

    update(){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subTotalPrice = 0;

      for(let product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subTotalPrice += product.price;
      }

      if(thisCart.totalNumber > 0) {
        thisCart.totalPrice = thisCart.deliveryFee + thisCart.subTotalPrice;
      } else {
        thisCart.totalPrice = thisCart.subTotalPrice;
      }

      //console.log('totalNumber:',totalNumber);
      //console.log('subTotalPrice:',subTotalPrice);
      //console.log('thisCart.totalPrice:',thisCart.totalPrice);

      //console.log('thisCart.dom.subTotalPrice:',thisCart.dom.subTotalPrice);
      if(thisCart.totalNumber > 0){
        thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      }else {
        thisCart.dom.deliveryFee.innerHTML = 0;
      }

      thisCart.dom.subTotalPrice.innerHTML = thisCart.subTotalPrice;
      //console.log('thisCart.totalPrice:',thisCart.totalPrice);
      //console.log('thisCart.dom.totalPrice:',thisCart.dom.totalPrice);
      for(let totalPrice of thisCart.dom.totalPrice){
        totalPrice.innerHTML = thisCart.totalPrice;
      }
    }

    remove(product){
      const thisCart = this;

      //console.log('thisCart.products.indexOf(product):',thisCart.products.indexOf(product));

      /* Removes product values from thisCart.products table */
      //const productIndex = thisCart.products.indexOf(product);
      //thisCart.products.splice(productIndex,1);
      thisCart.products.splice(thisCart.products.indexOf(product),1);

      /* Removes dom element of product */
      //console.log('product',product);
      product.dom.wrapper.remove(); //Pytanie: dlaczego to działa (dom.wrapper na product)? Czy dlatego, że product to tak naprawdę event.detail.cartProduct ?

      thisCart.update();
    }

    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.order;
      console.log('url:',url);

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subTotalPrice: thisCart.subTotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: []
      };

      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      console.log('payload',payload);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle; //Pytanie: do czego odnosi się menuProduct. ?
      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();

      //console.log('thisCartProduct:',thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      //console.log('thisCartProduct.dom.menuProduct:',thisCartProduct.dom.menuProduct);
    }

    initAmountWidget(){
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        //console.log('thisCartProduct.amount:',thisCartProduct.amount);
        //thisCartProduct.priceSingle;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        //console.log('thisCartProduct.priceSingle:', thisCartProduct.priceSingle);
        //console.log('thisCartProduct.price:', thisCartProduct.price);
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        //console.log('thisCartProduct.dom.price:',thisCartProduct.dom.price);
      });
    }

    remove(){
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

    initActions(){
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;

      return {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params
      };
    }
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      //console.log('thisApp.data:',thisApp.data);

      for(let productData in thisApp.data.products){
        //new Product(productData, thisApp.data.products[productData]);
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          //console.log('parsedResponse:',parsedResponse);

          thisApp.data.products = parsedResponse;
          thisApp.initMenu();
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      console.log('thisApp.data:', JSON.stringify(thisApp.data));
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();
    }
  };

  app.init();
}
