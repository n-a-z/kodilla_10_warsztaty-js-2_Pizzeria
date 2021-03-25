import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
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

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    //console.log('thisBooking.dom.peopleAmount',thisBooking.dom.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
    //console.log('thisBooking.dom.hoursAmount',thisBooking.dom.hoursAmount);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }

  initWidget() {
    //const thisBooking = this;
  }
}

export default Booking;
