import { select, classNames, settings, templates } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidget();
    //console.log('thisBooking.booking',thisBooking.booking);

  }

  render(element) {
    const thisBooking = this;

    //console.log('thisBooking.booking',thisBooking.booking);

  }

  initWidget() {
    const thisBooking = this;
  }
}

export default Booking;
