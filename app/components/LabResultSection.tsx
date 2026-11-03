"use client";

import React from "react";

export default function LabResultSection() {

  const steps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
        </svg>
      ),
      step: "01",
      title: "Upload Your Test Result",
      desc: "Securely upload your lab report — blood work, urinalysis, MRI, X-ray, and more.",
      color: "#00A654",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      step: "02",
      title: "Doctor Reviews Your Result",
      desc: "A licensed GloPharm pharmacist or doctor analyses your report within hours.",
      color: "#00A654",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
        </svg>
      ),
      step: "03",
      title: "Get Your Prescription",
      desc: "Receive a personalised prescription and have your meds delivered to your door.",
      color: "#00A654",
    },
  ];

  return (
    <section className="w-full bg-white py-16 sm:py-24 relative overflow-hidden">

      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#00A654]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[#0265CB]/10 blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">

        {/* Top Label */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#00A654]/10 text-[#00A654] text-xs font-bold uppercase tracking-widest rounded-full border border-[#00A654]/20">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
            </svg>
            Online Doctor Consultation
          </span>
        </div>

        {/* Main Grid: Text Left, Image Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-neutral-900 leading-[1.15] tracking-tight">
                Upload Your Test Result &amp;{" "}
                <span className="text-[#00A654]">Get Prescribed</span>{" "}
                From Home
              </h2>
              <p className="mt-4 text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg">
                No need to visit a clinic. Simply upload your lab test results and our licensed doctors will review them and prescribe the right medications — delivered straight to your doorstep across Nigeria.
              </p>
            </div>

            {/* Steps */}
            <div className="flex flex-col gap-4">
              {steps.map((s) => (
                <div key={s.step} className="flex items-start gap-4 group">
                  {/* Icon bubble */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white transition-transform group-hover:scale-110"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
                      Step {s.step}
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href="/account/prescriptions"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#00A654] hover:bg-[#008f48] text-white font-bold text-sm rounded-full shadow-[0_4px_16px_rgba(0,166,84,0.3)] hover:shadow-[0_6px_22px_rgba(0,166,84,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span>Upload My Test Result</span>
              </a>
              <a
                href="/account/prescriptions"
                className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-[#00A654] text-[#00A654] hover:bg-[#00A654] hover:text-white font-bold text-sm rounded-full transition-all duration-200"
              >
                View Prescriptions
              </a>
            </div>

            {/* Trust micro-badges */}
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#00A654]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0 0 10 1.944 11.954 11.954 0 0 1 17.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001Zm11.541 3.708a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clipRule="evenodd" />
                </svg>
                End-to-end encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#00A654]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
                NAFDAC-registered doctors
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
                </svg>
                4.9 / 5 rating (2,400+ reviews)
              </span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Image Composition ── */}
          <div className="relative flex items-center justify-center min-h-[420px]">
            {/* Main green circle backdrop */}
            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br from-[#00A654]/15 to-[#00A654]/5 border border-[#00A654]/10" />
            {/* Outer ring */}
            <div className="absolute w-80 h-80 sm:w-[440px] sm:h-[440px] rounded-full border-2 border-dashed border-[#00A654]/20 animate-spin-slow" />

            {/* Doctor Image */}
            <img
              src="/images/lab-results-doctor.jpg"
              alt="Doctor reviewing your uploaded lab test result"
              className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 object-cover rounded-full shadow-[0_20px_50px_rgba(0,166,84,0.2)] border-4 border-white"
            />

            {/* Floating Card 1: Upload confirmation */}
            <div className="absolute top-4 right-0 sm:right-4 z-20 flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-[#00A654] flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Result uploaded</p>
                <p className="text-xs font-bold text-gray-900">Blood Test · 2.4 MB</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#00A654] ml-1 animate-pulse" />
            </div>

            {/* Floating Card 2: Prescription ready */}
            <div className="absolute bottom-6 left-0 sm:-left-4 z-20 flex items-center gap-2.5 px-4 py-2.5 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100 hover:-translate-y-1 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-[#0265CB] flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Prescription ready</p>
                <p className="text-xs font-bold text-gray-900">Dr. Adaeze · 42 min ago</p>
              </div>
            </div>

            {/* Floating stat */}
            <div className="absolute top-1/2 -translate-y-1/2 -right-2 sm:-right-6 z-20 flex flex-col items-center px-3 py-3 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100">
              <span className="text-2xl font-black text-[#00A654]">98%</span>
              <span className="text-[9px] text-gray-500 font-medium text-center leading-tight">Patient<br />satisfaction</span>
            </div>
          </div>
        </div>



      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}} />
    </section>
  );
}
