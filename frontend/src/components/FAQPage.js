import React from "react";
import "./FAQPage.css";

function FAQPage() {
  return (
    <div className="faq-page">
      <div className="faq-container">
        <h1>Frequently Asked Questions</h1>

        <section className="faq-section">
          <h2>How do I place an order?</h2>
          <p>
            Browse our menu, click 'Add to Cart' on any item, fill in your
            child's details (name, room number, school), and add it to your
            cart. You can add multiple items for different children. When ready,
            proceed to checkout to complete your order.
          </p>
        </section>

        <section className="faq-section">
          <h2>What are your delivery times?</h2>
          <p>
            Orders are delivered directly to your child's classroom during their
            designated lunch period. Delivery times vary by school, typically
            between 12:00 PM and 1:00 PM.
          </p>
        </section>

        <section className="faq-section">
          <h2>How far in advance do I need to order?</h2>
          <p>
            Orders must be placed by 9:00 AM on the day of delivery. For
            guaranteed availability, we recommend ordering the night before.
          </p>
        </section>

        <section className="faq-section">
          <h2>Which schools do you deliver to?</h2>
          <p>
            We currently deliver to Matipo Road School, Stonefields School, and
            Te Atatu Intermediate. We're always looking to expand to more
            schools in the Auckland area.
          </p>
        </section>

        <section className="faq-section">
          <h2>Can I order for multiple children?</h2>
          <p>
            Yes! Simply add each child's order separately to your cart. Make
            sure to enter the correct name and room number for each child so we
            can deliver to the right classroom.
          </p>
        </section>

        <section className="faq-section">
          <h2>What if my child has allergies?</h2>
          <p>
            Please note any allergies or dietary requirements in the 'Special
            Instructions' field when adding items to your cart. For severe
            allergies, please contact us directly at orders@narusushi.co.nz.
          </p>
        </section>

        <section className="faq-section">
          <h2>Are your ingredients fresh?</h2>
          <p>
            Yes! All our ingredients are sourced fresh daily, and meals are
            prepared on the morning of delivery to ensure maximum freshness and
            quality.
          </p>
        </section>

        <section className="faq-section">
          <h2>How will I know my order was received?</h2>
          <p>
            You'll receive an email confirmation immediately after placing your
            order, including all order details and delivery information.
          </p>
        </section>

        <section className="faq-section">
          <h2>What if my child is absent on the day of delivery?</h2>
          <p>
            Please notify us as soon as possible if your child will be absent.
            Orders cancelled before 9:00 AM on the delivery day are eligible for
            a full refund.
          </p>
        </section>

        <section className="faq-section">
          <h2>Do you offer vegetarian or vegan options?</h2>
          <p>
            Yes! Check our menu for vegetarian sushi options. We're working on
            expanding our vegan offerings. Contact us if you have specific
            dietary requirements.
          </p>
        </section>
      </div>
    </div>
  );
}

export default FAQPage;
