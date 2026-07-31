/*
 * The barbering site, statically generated. Every section below is a server
 * component; only the navbar, the gallery and the booking form ship JavaScript.
 */

import Image from "next/image";
import Gallery from "@/components/Gallery";
import BookingForm from "@/components/BookingForm";
import Footer from "@/components/Footer";
import { bookingPolicies, locations, services, site } from "@/lib/site";

/* LocalBusiness markup so the shop's name, locations and services are legible
   to search engines without them having to infer any of it from the copy. */
const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: site.name,
  description: site.description,
  url: site.url,
  image: `${site.url}${site.ogImage}`,
  telephone: site.phone,
  foundingDate: String(site.foundedYear),
  sameAs: [site.instagram],
  location: locations.map((location) => ({
    "@type": "Place",
    name: `${site.name} -- ${location.name}`,
    address: { "@type": "PostalAddress", streetAddress: location.address, addressCountry: "US" }
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Services",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: service.name },
      price: service.price
    }))
  }
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Hero */}
      <section id="hero" className="relative h-screen">
        <Image
          src="/img/barbershop-interior.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <h1 className="text-white text-4xl font-bold">Welcome!</h1>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-16 bg-gray-100">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-center px-6 text-center md:text-left">
          <Image
            src="/img/henry-portrait.jpg"
            alt="Henry Hai in the shop"
            width={600}
            height={800}
            sizes="(min-width: 768px) 25vw, 75vw"
            className="w-3/4 sm:w-2/3 md:w-1/4 h-auto rounded-lg shadow-lg mb-8 md:mb-0"
          />
          <div className="md:ml-8">
            <h2 className="text-3xl font-bold mb-4">About</h2>
            <p className="text-gray-700">
              Hi, I&rsquo;m Henry!<br />
              I started this barbershop back in {site.foundedYear} &amp; have been<br />
              dedicated to creating personalized, luxury haircut experiences ever since.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row md:justify-between items-center">
          <div className="md:w-2/3 bg-white shadow-md p-8">
            <h2 className="text-3xl font-bold text-center mb-8">Services</h2>
            <ul className="space-y-4 text-lg">
              {services.map((service) => (
                <li key={service.name} className="flex justify-between items-center">
                  <span>{service.name}</span>
                  <span>{service.price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-gray-500 text-sm">
              * Add-On Prices are denoted with &lsquo;+&rsquo; &amp; can only be added to
              Haircuts, Line-Up Services are A LA CARTE ONLY (Haircut Services incl.
              Line-Ups) *
            </p>
          </div>

          <div className="hidden md:block md:mt-0 md:w-1/3 md:ml-8">
            <Image
              src="/img/ksg-01.jpg"
              alt="Mid fade with a scissor-cut top"
              width={600}
              height={800}
              sizes="33vw"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
            />
          </div>
        </div>
      </section>

      <Gallery />

      {/* Locations */}
      <section id="locations" className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Locations</h2>
          <div className="flex flex-wrap -mx-4">
            {locations.map((location) => (
              <div key={location.id} className="md:w-1/2 px-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
                  <Image
                    src={location.image}
                    alt={location.name}
                    width={300}
                    height={400}
                    sizes="(min-width: 640px) 12vw, 33vw"
                    className="w-1/3 sm:w-1/4 h-auto rounded-lg shadow-md mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold mb-2">{location.name}</h3>
                    <p className="text-gray-700">{location.address}</p>
                    <p className="text-gray-700">Phone: {location.phone}</p>
                    <h4 className="mt-4 font-bold text-lg">*Seasonal Hours*</h4>
                    <ul className="text-gray-600">
                      {location.hours.map((line) => <li key={line}>{line}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appointment */}
      <section id="appointment" className="py-16 bg-gray-100">
        <div className="container mx-auto flex flex-col md:flex-row md:space-x-8 px-6">
          <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md mb-8 md:mb-0">
            <h2 className="text-2xl font-bold mb-4">Booking Policies</h2>
            <p className="text-gray-600">
              Please read and accept my booking policies before making an appointment.
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-4">
              {bookingPolicies.map((policy) => <li key={policy}>{policy}</li>)}
            </ul>
          </div>

          <BookingForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
