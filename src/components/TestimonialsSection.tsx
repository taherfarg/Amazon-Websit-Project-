"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  product: string;
  verified: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Ahmed Al-Mansoori",
    role: "Dubai Resident",
    avatar: "/testimonials/user1.jpg",
    rating: 5,
    text: "The AI-powered recommendations helped me find exactly what I needed. Saved me hours of research and got the best price in UAE!",
    product: "Smart Home Device",
    verified: true,
  },
  {
    id: 2,
    name: "Fatima Hassan",
    role: "Tech Enthusiast",
    avatar: "/testimonials/user2.jpg",
    rating: 5,
    text: "Incredible platform! The detailed AI reviews are so helpful. I always check here before making any purchase. Highly recommended!",
    product: "Laptop",
    verified: true,
  },
  {
    id: 3,
    name: "Mohammed Khalid",
    role: "Business Owner",
    avatar: "/testimonials/user3.jpg",
    rating: 5,
    text: "Best product comparison tool I've used. The AI verdicts are spot-on and saved me from buying overpriced items. 5 stars!",
    product: "Office Equipment",
    verified: true,
  },
  {
    id: 4,
    name: "Sara Al-Rashid",
    role: "Shopping Expert",
    avatar: "/testimonials/user4.jpg",
    rating: 5,
    text: "Love how the AI breaks down pros and cons with actual scores. Makes shopping decisions so much easier! Will keep using this!",
    product: "Kitchen Appliance",
    verified: true,
  },
  {
    id: 5,
    name: "Khalid bin Zayed",
    role: "Abu Dhabi",
    avatar: "/testimonials/user5.jpg",
    rating: 5,
    text: "The price tracking feature is amazing! Got notified when my wishlist item dropped 30%. Saved hundreds of dirhams!",
    product: "Smart Watch",
    verified: true,
  },
];

export default function TestimonialsSection({ locale }: { locale: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + newDirection;
      if (newIndex < 0) newIndex = testimonials.length - 1;
      if (newIndex >= testimonials.length) newIndex = 0;
      return newIndex;
    });
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="relative py-16 md:py-24 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4  w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-semibold text-primary">
              {locale === "en" ? "Customer Reviews" : "آراء العملاء"}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            {locale === "en" ? "Loved by Thousands" : "محبوب من قبل الآلاف"}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            {locale === "en"
              ? "See what our customers say about their shopping experience"
              : "شاهد ما يقوله عملاؤنا عن تجربة التسوق الخاصة بهم"}
          </motion.p>
        </div>

        {/* Testimonial Card */}
        <div className="relative h-[400px] md:h-[350px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);

                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full max-w-4xl"
            >
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-16 h-16 text-primary/10" />

                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-[3px]">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-white">
                        {currentTestimonial.name.charAt(0)}
                      </div>
                    </div>
                    {currentTestimonial.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-gray-900">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-center md:text-left">
                    {/* Rating */}
                    <div className="flex justify-center md:justify-start gap-1 mb-3">
                      {[...Array(currentTestimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-4">
                      "{currentTestimonial.text}"
                    </p>

                    {/* Product Tag */}
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm mb-4">
                      {currentTestimonial.product}
                    </span>

                    {/* Author Info */}
                    <div>
                      <h4 className="text-white font-bold text-lg">
                        {currentTestimonial.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {currentTestimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={() => paginate(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all active:scale-95"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 md:mt-16 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              10K+
            </div>
            <div className="text-sm text-gray-400">
              {locale === "en" ? "Happy Customers" : "عميل سعيد"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              4.9
            </div>
            <div className="text-sm text-gray-400">
              {locale === "en" ? "Average Rating" : "متوسط التقييم"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-white mb-2">
              98%
            </div>
            <div className="text-sm text-gray-400">
              {locale === "en" ? "Satisfaction" : "رضا العملاء"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
