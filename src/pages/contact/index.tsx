import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import { useForm, SubmitHandler } from 'react-hook-form';
import emailjs from 'emailjs-com';

interface ContactFormInputs {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormInputs>();
  const [submitStatus] = useState<string | null>(null);

  const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
    const emailData = {
      from_name: data.name,
      from_email: data.email,
      message: data.message,
    };

    emailjs.send(
      'service_iixemqc',     // Replace with your actual service ID
      'template_t6ja56p',    // Replace with your actual template ID
      emailData,
      'UEkOXZOgq5NDGXhU6'    // Replace with your actual user ID (public key)
    )
  };

  return (
    <>
      <SEO title="Contact Me" description="Get in touch with me through this contact form" />
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Contact Me</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 shadow-md rounded-lg">
            <div className="mb-4">
              <label className="block font-semibold mb-2" htmlFor="name">Name</label>
              <input
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="w-full p-2 border rounded"
              />
              {errors.name && <span className="text-red-600 text-sm">{errors.name.message}</span>}
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required', pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: "Invalid email address" } })}
                className="w-full p-2 border rounded"
              />
              {errors.email && <span className="text-red-600 text-sm">{errors.email.message}</span>}
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-2" htmlFor="message">Message</label>
              <textarea
                id="message"
                {...register('message', { required: 'Message is required' })}
                className="w-full p-2 border rounded"
              />
              {errors.message && <span className="text-red-600 text-sm">{errors.message.message}</span>}
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
              Send
            </button>

            {submitStatus && (
              <div role="alert" className={`mt-4 p-4 rounded ${submitStatus.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {submitStatus}
              </div>
            )}
          </form>
        </main>
        <Footer />
      </div>
    </>
  );
}