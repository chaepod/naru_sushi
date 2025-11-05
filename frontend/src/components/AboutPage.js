import React from 'react';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Naru Sushi</h1>
        
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Naru Sushi has been serving delicious, fresh Japanese cuisine to 
            Auckland schools since 2020. We're passionate about providing 
            nutritious and tasty lunch options for students.
          </p>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <p>
            Our menu features traditional Japanese dishes, from classic sushi 
            rolls to hearty rice bowls. All ingredients are fresh and meals 
            are prepared daily.
          </p>
        </section>

        <section className="about-section">
          <h2>School Lunch Service</h2>
          <p>
            We partner with schools across Auckland to provide convenient 
            pre-ordering for school lunches. Parents can order online, and 
            we deliver fresh meals directly to your child's classroom.
          </p>
        </section>

        <section className="about-section">
          <h2>Contact Us</h2>
          <p>Email: orders@narusushi.co.nz</p>
          <p>Phone: (09) 123-4567</p>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;