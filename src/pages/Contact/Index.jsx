function Contact() {
  return (
    <div className="container flex items-center justify-center mx-auto p-4 text-gray-700 py-12">
      <div className=" py-12 flex items-center justify-center flex-col">
        <h1 className="text-3xl font-bold mb-6 text-blue-500">Contact Us</h1>
        <p className="text-lg mb-2">Have questions? Reach out to us!</p>
        <div className=" p-6 text-center">
          <p>Email: info@higher.com.ng</p>
          <p>Phone: (234) 9043970401 </p>
        </div>
        <a href="https://wa.me/2349043970401?text=Hello%2C%20I'm%20interested%20in%20your%20courses!"><div className=" rounded-full text-white p-4 bg-green-500">Chat on WhatsApp</div></a>
      </div>
    </div>
  );
}

export default Contact;
