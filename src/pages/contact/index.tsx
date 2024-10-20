// pages/contact/index.tsx
import { useForm, SubmitHandler } from 'react-hook-form';
import emailjs from 'emailjs-com';

interface ContactFormInputs {
  name: string;
  email: string;
  message: string;
}

export const ContactForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInputs>();

  const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
    const emailData = {
      from_name: data.name,
      from_email: data.email,
      message: data.message,
    };

    emailjs
      .send(
        'service_iixemqc',    // Your EmailJS service ID
        'template_t6ja56p',   // Your EmailJS template ID
        emailData,
        'UEkOXZOgq5NDGXhU6'   // Your EmailJS public key
      )
      .then(() => {
        console.log('Your message has been sent successfully!');
        reset(); // Reset form after submission
      })
      .catch((error) => {
        console.error('Email sending error:', error);
      });
  };

  return (
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

      <button type="submit" className="submit-button">Send</button>
    </form>
  );
};

export default ContactForm;
