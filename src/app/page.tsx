"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">College Management System</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Login
            </Link>
            <Link href="/login">
              <Button className="btn-hover-effect">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div
              className={`space-y-6 ${mounted ? "animate-fade-in-up" : ""}`}
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Streamline Your Institution Management
              </h2>
              <p className="text-xl text-gray-600">
                A comprehensive solution for educational institutions to manage
                students, faculty, courses, and more.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login">
                  <Button size="lg" className="gap-2 btn-hover-effect">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="btn-hover-effect"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div
              className={`${mounted ? "animate-fade-in-up" : ""}`}
              style={{ animationDelay: "0.3s" }}
            >
              <Image
                src="/placeholder.svg?height=400&width=500"
                alt="College Management"
                width={500}
                height={400}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                Comprehensive Management Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to efficiently manage your educational
                institution in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "User Management",
                  description:
                    "Manage students, faculty, and staff with role-based access control.",
                  delay: "0.1s",
                },
                {
                  icon: <BookOpen className="h-10 w-10 text-primary" />,
                  title: "Academic Management",
                  description:
                    "Handle courses, programs, and departments efficiently.",
                  delay: "0.2s",
                },
                {
                  icon: <Calendar className="h-10 w-10 text-primary" />,
                  title: "Scheduling",
                  description:
                    "Create and manage timetables, events, and academic calendar.",
                  delay: "0.3s",
                },
                {
                  icon: <FileText className="h-10 w-10 text-primary" />,
                  title: "Examination System",
                  description:
                    "Conduct exams, record results, and generate report cards.",
                  delay: "0.4s",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`p-6 border rounded-lg shadow-sm dashboard-card ${mounted ? "animate-fade-in-up" : ""}`}
                  style={{ animationDelay: feature.delay }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Institution?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join hundreds of educational institutions already using our
              platform to streamline their operations.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="btn-hover-effect"
              >
                Get Started Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6" />
                <h3 className="text-xl font-bold">College CMS</h3>
              </div>
              <p className="text-gray-400">
                A comprehensive solution for educational institutions.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    User Management
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Academic Management
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Scheduling
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Examination System
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    API Reference
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="text-gray-400">Email: info@collegecms.com</li>
                <li className="text-gray-400">Phone: +1 (555) 123-4567</li>
                <li className="text-gray-400">
                  Address: 123 Education St, Learning City
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} College Management System. All
              rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
