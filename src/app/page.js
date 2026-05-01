"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, MessageCircle, BarChart3, ArrowRight, ShieldCheck, Clock } from "lucide-react";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100/50 shadow-sm">
        <Link className="flex items-center gap-2 group" href="/">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Calendar className="text-white w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-indigo-800 tracking-tight">ClinicPilot</span>
        </Link>
        <nav className="hidden md:flex gap-8 items-center">
          <Link className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors" href="#pricing">Pricing</Link>
          <Link href="/login">
            <span className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Sign in</span>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all">Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-[100px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
          </div>
          
          <div className="container relative z-10 px-4 md:px-6 mx-auto">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="flex flex-col items-center space-y-8 text-center"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-4 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
                The #1 WhatsApp Automated Clinic Tool
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-slate-900 leading-[1.1]">
                We&apos;re not just clinic management. <br className="hidden md:block"/> We&apos;re a <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">no-show killer.</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="mx-auto max-w-[700px] text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                Cut your missed appointments by 40% with native WhatsApp automation and 1-click rescheduling. Built for modern Indian clinics.
              </motion.p>
              
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-14 px-8 text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    Start 14-Day Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.p variants={itemVariants} className="text-sm text-slate-500 font-medium">
                No credit card required • Cancel anytime • Setup in 2 mins
              </motion.p>
            </motion.div>
          </div>
        </section>
        
        {/* STATS DIVIDER */}
        <section className="w-full py-10 bg-white border-y border-slate-100">
           <div className="container px-4 md:px-6 mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-4xl font-black text-slate-900 mb-1">Reduce</h4>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Patient No-Shows</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-4xl font-black text-slate-900 mb-1">100%</h4>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Automated</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-4xl font-black text-slate-900 mb-1">Quick</h4>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">To Setup</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <h4 className="text-4xl font-black text-slate-900 mb-1">Maximize</h4>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Clinic Revenue</p>
                </div>
              </div>
           </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="w-full py-24 bg-slate-50 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-slate-900 mb-4">Why top clinics switch to us</h2>
              <p className="text-lg text-slate-600 font-medium">We replaced bloated, expensive software with a lean, automated engine that guarantees patients show up.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                  <MessageCircle className="text-green-600 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Native WhatsApp</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Automated confirmations, 24h & 2h reminders sent directly to your patient&apos;s WhatsApp. Nobody reads SMS anymore.</p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="text-blue-600 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">1-Click Reschedule</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Patients can reschedule directly from their WhatsApp message without calling your reception. Frictionless.</p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div whileHover={{ y: -10 }} className="flex flex-col p-8 bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="text-purple-600 w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No-Show Analytics</h3>
                <p className="text-slate-600 leading-relaxed font-medium">Track exactly how much revenue you&apos;re recovering every week with our beautiful, actionable dashboard.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-slate-900 mb-4">Half the price. Double the value.</h2>
              <p className="text-lg text-slate-600 font-medium">Stop paying ₹2,500/mo for features you don&apos;t use.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-center">
              
              {/* Starter Plan */}
              <div className="flex flex-col p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-2xl font-bold text-slate-900">Starter</h3>
                <p className="text-slate-500 mt-2 font-medium">Perfect for solo practitioners.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-black text-slate-900">₹749</span>
                  <span className="text-lg font-medium text-slate-500 ml-2">/mo</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> 1 Doctor, 2 Staff</li>
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> 300 WhatsApp Reminders</li>
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> SMS Fallback Included</li>
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> 1-Click Reschedule</li>
                </ul>
                <Link href="/register" className="mt-8 block">
                  <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-md">Start Free Trial</Button>
                </Link>
              </div>

              {/* Growth Plan */}
              <div className="flex flex-col p-8 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl shadow-2xl relative lg:-mt-8 lg:mb-8 border border-blue-400">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-yellow-400 text-yellow-900 text-sm font-bold px-4 py-1 rounded-full shadow-md uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-bold text-white">Growth</h3>
                <p className="text-blue-100 mt-2 font-medium">For growing multi-doctor clinics.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-black text-white">₹1,249</span>
                  <span className="text-lg font-medium text-blue-200 ml-2">/mo</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-center text-white font-medium"><ShieldCheck className="w-5 h-5 text-blue-300 mr-3 shrink-0"/> Up to 5 Doctors</li>
                  <li className="flex items-center text-white font-medium"><ShieldCheck className="w-5 h-5 text-blue-300 mr-3 shrink-0"/> Unlimited WhatsApp</li>
                  <li className="flex items-center text-white font-medium"><ShieldCheck className="w-5 h-5 text-blue-300 mr-3 shrink-0"/> 5 Regional Languages</li>
                  <li className="flex items-center text-white font-medium"><ShieldCheck className="w-5 h-5 text-blue-300 mr-3 shrink-0"/> Advanced Analytics</li>
                </ul>
                <Link href="/register" className="mt-8 block">
                  <Button className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-md shadow-lg">Start Free Trial</Button>
                </Link>
              </div>

              {/* Clinic Pro Plan */}
              <div className="flex flex-col p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                <h3 className="text-2xl font-bold text-slate-900">Clinic Pro</h3>
                <p className="text-slate-500 mt-2 font-medium">For established hospital branches.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-5xl font-black text-slate-900">₹2,249</span>
                  <span className="text-lg font-medium text-slate-500 ml-2">/mo</span>
                </div>
                <ul className="mt-8 space-y-4 flex-1">
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> Up to 15 Doctors</li>
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> Unlimited WhatsApp</li>
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> Priority Dedicated Support</li>
                  <li className="flex items-center text-slate-700 font-medium"><ShieldCheck className="w-5 h-5 text-blue-600 mr-3 shrink-0"/> Custom Branding</li>
                </ul>
                <Link href="/register" className="mt-8 block">
                  <Button variant="outline" className="w-full h-12 rounded-xl font-bold text-md border-2">Contact Sales</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
        <div className="container px-4 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-xl text-white">ClinicPilot</span>
          </div>
          <p className="text-sm font-medium">© 2026 ClinicPilot Technologies. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
