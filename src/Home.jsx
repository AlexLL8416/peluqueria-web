import Hero from "./Hero";
import Navbar from "./Navbar";
import Studio from "./Studio";
import Services from "./Services";
import About from "./About";
import Gallery from "./Gallery";
import Reviews from "./Reviews";
import Footer from "./Footer";

export default function Home() {
    return (
        <div className="min-h-screen bg-scandi-light">
            <Navbar />            
            <section id="hero">
                <Hero />
            </section>            
            <section id="studio">
                <Studio />
            </section>            
            <section id="services">
                <Services />
            </section>            
            <section id="about">
                <About />
            </section>            
            <section id="gallery">
                <Gallery />
            </section>            
            <section id="reviews">
                <Reviews />
            </section>
            <Footer />
        </div>
    )
}