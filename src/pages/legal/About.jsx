import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Professional Heading */}
        <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tight">
          About <span className="text-teal-600">KonnectPro</span>
        </h1>
        
        <div className="prose prose-slate text-slate-600 leading-relaxed text-lg space-y-8">
          <p className="font-bold text-slate-800 text-xl">
            KonnectPro is more than just a platform; it is a vision to empower skilled professionals and provide customers with reliable service.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Our Story</h2>
            <p>
              Born in the heart of **Jabalpur**, KonnectPro was founded on the principles of <b>Honesty</b> and <b>Transparency</b>. We recognized a gap in the home services market—the need for a bridge that connects hard-working experts directly with customers who value quality and trust.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Our Philosophy</h2>
            <p>
              We believe that every skill deserves respect and every service should be transparent. Our platform ensures that experts get the fair value for their hard work, and customers receive high-quality service without any hidden costs or middleman complications.
            </p>
          </section>

          <div className="bg-teal-50 border-l-4 border-teal-600 p-6 rounded-r-xl shadow-sm">
            <p className="text-teal-900 font-bold mb-2">Our Commitment:</p>
            <ul className="list-disc list-inside space-y-2 text-teal-800 font-medium">
              <li>100% Transparency in pricing and earnings.</li>
              <li>Verified and highly skilled professionals only.</li>
              <li>Commitment to safety and quality results.</li>
              <li>Respect and dignity for every professional on our platform.</li>
            </ul>
          </div>

          <p className="italic text-slate-500 border-t pt-6">
            KonnectPro India Private Limited is dedicated to creating a sustainable ecosystem for home services, starting from local neighborhoods and expanding nationwide.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}