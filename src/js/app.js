import { select, classNames, settings, templates } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {
  initPages: function () {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    thisApp.orderLink = document.querySelector(select.containerOf.orderLink);
    thisApp.bookingLink = document.querySelector(
      select.containerOf.bookingLink
    );

    //thisApp.activatePage(thisApp.pages[0].id);
    const idFromHash = window.location.hash.replace('#/', '');
    //console.log(idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        //console.log('pageMatchingHash',pageMatchingHash);
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }

    thisApp.orderLink.addEventListener('click', function (event) {
      event.preventDefault();
      thisApp.activatePage('order');
      window.location.hash = '#/order';
    });
    thisApp.bookingLink.addEventListener('click', function (event) {
      event.preventDefault();
      thisApp.activatePage('booking');
      window.location.hash = '#/booking';
    });
  },

  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data:',thisApp.data);

    for (let productData in thisApp.data.products) {
      //new Product(productData, thisApp.data.products[productData]);
      new Product(
        thisApp.data.products[productData].id,
        thisApp.data.products[productData]
      );
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;

    /* add class "active" to matching pages, remove from non-matching */
    for (let page of thisApp.pages) {
      //console.log('page:',page);
      //if(page.id === pageId) page.classNames.toggle(classNames.pages.active);
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }

    /* add class "active" to matching links, remove from non-matching */
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId
      );
    }
  },

  initData: function () {
    const thisApp = this;

    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        //console.log('parsedResponse:',parsedResponse);

        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    console.log('thisApp.data:', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },

  initBooking: function () {
    const thisApp = this;

    const bookingContainer = document.querySelector(select.containerOf.booking);
    //console.log('bookingContainer',bookingContainer);

    thisApp.booking = new Booking(bookingContainer);
  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();
    //thisApp.initMenu();
    thisApp.initCart();
    thisApp.initBooking();
  },
};

app.init();
