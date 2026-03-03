// This file contains simple static pages requested by the prompt (Brands, About, Contact)
import { Citrus, Users, PhoneCall } from "lucide-react";

export function Brands() {
  return (
    <div className="pt-32 pb-20 min-h-[70vh] bg-background max-w-7xl mx-auto px-4">
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-12 text-center">Our Brands</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square bg-white rounded-[3rem] border border-border shadow-sm flex items-center justify-center p-8 hover:-translate-y-2 transition-transform">
             <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                <Citrus className="w-10 h-10 text-muted-foreground opacity-50" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function About() {
  return (
    <div className="pt-32 pb-20 min-h-[70vh] bg-background max-w-4xl mx-auto px-4 text-center">
      <div className="w-24 h-24 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary/20 rotate-6">
        <Users className="w-10 h-10" />
      </div>
      <h1 className="text-4xl md:text-5xl font-display font-bold mb-8">About ALNOURS</h1>
      <p className="text-xl text-muted-foreground leading-relaxed">
        ALNOURS is the premier food trading and distribution company in Saudi Arabia, specializing in high-quality fresh juices, premium snacks, and authentic organic food products. 
        <br/><br/>
        Founded with a vision to elevate the daily consumption of natural foods, we partner with world-renowned brands to bring the finest taste directly to consumers and retailers alike.
      </p>
    </div>
  );
}

export function Contact() {
  return (
    <div className="pt-32 pb-20 min-h-[70vh] bg-background max-w-xl mx-auto px-4">
      <div className="bg-white rounded-[3rem] p-10 border border-border shadow-sm text-center">
        <div className="w-20 h-20 bg-accent text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <PhoneCall className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground mb-8">Have a question about an order, our products, or wholesale partnerships? We'd love to hear from you.</p>
        
        <form className="space-y-4 text-left" onSubmit={e=>e.preventDefault()}>
           <div>
              <label className="block text-sm font-bold mb-2">Name</label>
              <input type="text" className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none" />
           </div>
           <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input type="email" className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none" />
           </div>
           <div>
              <label className="block text-sm font-bold mb-2">Message</label>
              <textarea rows={4} className="w-full px-5 py-4 rounded-2xl bg-muted border-2 border-transparent focus:bg-white focus:border-primary focus:outline-none resize-none"></textarea>
           </div>
           <button className="w-full bg-foreground hover:bg-primary text-white py-4 rounded-2xl font-bold transition-colors mt-2">Send Message</button>
        </form>
      </div>
    </div>
  );
}
