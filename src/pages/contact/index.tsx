import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import emailjs from 'emailjs-com';

interface ContactFormInputs {
  name: string;
  email: string;
  message: string;
}

const ContactPage = () => {
  // This component contains both the contact form and the contact links
  return (
    <>
      {/* Contact links in the middle of the screen */}
      <div className="contact-links">
        <a href="mailto:Aaronber@pdx.edu">Email: Aaronber@pdx.edu</a>
        <a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
        <a href="https://github.com/yourusername">GitHub</a>
      </div>

      {/* Bottom navigation links */}
      <div className="bottom-links">
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#projects">Projects</a>
      </div>

      {/* Contact form is hidden by default unless shown by some state or navigation */}
      <div style={{ display: 'none' }}>
        <ContactForm />
      </div>
    </>
  );
};

// The contact form component remains unchanged
export const ContactForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInputs>();
  const [isSent, setIsSent] = useState(false);

  const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
    const emailData = {
      from_name: data.name,
      from_email: data.email,
      message: data.message,
    };

    emailjs
      .send(
        'service_iixemqc',
        'template_t6ja56p',
        emailData,
        'UEkOXZOgq5NDGXhU6'
      )
      .then(() => {
        console.log('Your message has been sent successfully!');
        setIsSent(true);
        reset();
        setTimeout(() => setIsSent(false), 3000); 
      })
      .catch((error) => {
        console.error('Email sending error:', error);
      });
  };

  return (
    <div>
      {isSent && <p className="success-message">Your message has been sent successfully!</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="spacey-form">
        <div className="input-group">
          <label htmlFor="name" className="input-label">Name</label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className="input-field"
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="email" className="input-label">Email</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email address" }
            })}
            className="input-field"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="input-group">
          <label htmlFor="message" className="input-label">Message</label>
          <textarea
            id="message"
            {...register('message', { required: 'Message is required' })}
            className="input-field"
          />
          {errors.message && <span className="error-message">{errors.message.message}</span>}
        </div>

        <div className="flex justify-center mt-4">
          <button type="submit" className="submit-button">Send</button>
        </div>
      </form>
    </div>
  );
};

export default ContactPage;