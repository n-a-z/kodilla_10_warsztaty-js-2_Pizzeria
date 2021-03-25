import { templates } from '../settings.js';
//import CartProduct from './CartProduct.js';
//import utils from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
    //console.log('thisBooking.booking',thisBooking.booking);

  }

  render(element) {
    const thisBooking = this;

    //console.log('Booking.render(element)',element);

    const generatedHTML = templates.bookingWidget(element);
    //const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

  }

  initWidget() {
    //const thisBooking = this;
  }
}

export default Booking;
