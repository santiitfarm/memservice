const FAQPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          FAQ (প্রশ্ন ও উত্তর)
        </h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১. আমি কীভাবে অনলাইন পেমেন্ট করতে পারি?
            </h2>
            <p className="text-gray-600">
              MemServiceBD বিভিন্ন অনলাইন পেমেন্ট অপশন প্রদান করে যেমন: বিকাশ,
              নগদ, রকেট, MyCash, MasterCard, Visa, Visa ডেবিট, MasterCard ডেবিট
              ইত্যাদি। এছাড়াও MemServiceBD এর নিজস্ব ওয়ালেট রয়েছে। সকল অনলাইন
              পেমেন্ট অপশন ১০০% নিরাপদ।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ২. রিফান্ড পলিসি কী?
            </h2>
            <p className="text-gray-600">
              MemServiceBD একটি রিফান্ড পলিসি প্রদান করে। বিস্তারিত জানতে
              অনুগ্রহ করে আমাদের{" "}
              <a href="/refund-policy" className="text-blue-500 underline">
                রিফান্ড এবং রিটার্ন পলিসি
              </a>{" "}
              দেখুন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৩. আমার অর্ডার দ্রুত ডেলিভারি করা সম্ভব কি?
            </h2>
            <p className="text-gray-600">
              হ্যাঁ, MemServiceBD জরুরি ডেলিভারি সেবা প্রদান করে। অতিরিক্ত চার্জ
              প্রযোজ্য হতে পারে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৪. আমার অর্ডার প্রস্তুত হলে কি আমাকে নিশ্চিতকরণ দেওয়া হবে?
            </h2>
            <p className="text-gray-600">
              হ্যাঁ, আপনার অর্ডার প্রস্তুত হলে একটি ইনভয়েস ইমেইলের মাধ্যমে
              পাঠানো হবে। এরপর এটি আপনার নির্ধারিত ঠিকানায় ডেলিভারি করা হবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৫. আমি কি বাংলাদেশ ছাড়াও অন্য দেশে অর্ডার ডেলিভারি করতে পারি?
            </h2>
            <p className="text-gray-600">
              আইনগত কারণে, MemServiceBD বাংলাদেশের বাইরে অর্ডার প্রক্রিয়াকরণ
              করতে পারে না। যদি আপনি ভ্রমণে থাকেন এবং রিফিল প্রয়োজন হয়, তাহলে
              অনুগ্রহ করে আমাদের 09610-00-11-22 নম্বরে যোগাযোগ করুন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৬. প্রেসক্রিপশন কীভাবে আপলোড করব?
            </h2>
            <p className="text-gray-600">
              অর্ডার প্রক্রিয়ার সময় ওয়েবসাইট এবং মোবাইল অ্যাপে আপনাকে
              প্রেসক্রিপশন আপলোড করতে বলা হবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৭. আমার অর্ডারের ডেলিভারি স্ট্যাটাস কীভাবে চেক করব?
            </h2>
            <p className="text-gray-600">
              আপনার অর্ডার গ্রহণ, প্রেরণ এবং ডেলিভারি হওয়ার সময় ইমেইল পাওয়া
              যাবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৮. ক্যাশ অন ডেলিভারি (COD) কি পাওয়া যায়?
            </h2>
            <p className="text-gray-600">
              হ্যাঁ, MemServiceBD ক্যাশ অন ডেলিভারি (COD) সেবা প্রদান করে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ৯. MemServiceBD-এ কি ডিসকাউন্ট এবং অফার রয়েছে?
            </h2>
            <p className="text-gray-600">
              সকল ঔষধ এবং পণ্যে ডিসকাউন্ট মূল্য রয়েছে। সময়ে সময়ে বিভিন্ন অফার
              এবং ডিসকাউন্ট পাওয়া যাবে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১০. আমার অর্ডার পৌঁছাতে কতক্ষণ লাগবে?
            </h2>
            <p className="text-gray-600">
              সাধারণত অর্ডার ৩ থেকে ৪ ঘন্টার মধ্যে ডেলিভারি করা হয়। তবে,
              অনাকাঙ্ক্ষিত পরিস্থিতিতে ডেলিভারি দেরি হতে পারে। সাহায্যের জন্য
              আমাদের সাথে যোগাযোগ করুন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১১. কোনো লুকানো চার্জ আছে কি?
            </h2>
            <p className="text-gray-600">
              না, কোনো লুকানো চার্জ নেই। MemServiceBD সৎ এবং স্বচ্ছ ব্যবসায়িক
              নীতি অনুসরণ করে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১২. অর্ডার কীভাবে বাতিল করব?
            </h2>
            <p className="text-gray-600">
              আপনি সরাসরি লিঙ্ক বা ইমেইল/ফোনের মাধ্যমে অর্ডার বাতিল করতে পারবেন।
              অর্ডার শুধুমাত্র প্রেরণের আগে বাতিল করা সম্ভব।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১৩. কীভাবে অর্ডার করব?
            </h2>
            <p className="text-gray-600">
              আপনি প্রেসক্রিপশন আপলোড করে অথবা ঔষধের বিবরণ সিস্টেমে দিয়ে অর্ডার
              করতে পারবেন।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১৪. MemServiceBD-এ অর্ডারের জন্য কমপ্লায়েন্স প্রক্রিয়া কী?
            </h2>
            <p className="text-gray-600">
              যেকোনো চ্যানেল (অ্যাপ, ওয়েব, সোশ্যাল মিডিয়া ইত্যাদি) এর মাধ্যমে
              অর্ডার প্লেস করার পর অর্ডার স্ট্যাটাস &#34;পেন্ডিং&#34; থাকবে।
              একজন ফার্মাসিস্ট বা কাস্টমার কেয়ার এজেন্ট স্টক, মূল্য পরিবর্তন,
              এবং প্রেসক্রিপশনের বৈধতা যাচাই করে অর্ডার গ্রহণ করবে। এই পর্যায়ে
              MemServiceBD যেকোনো অর্ডার বাতিল করার অধিকার রাখে।
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              ১৫. কাজের সময়সূচি কী?
            </h2>
            <p className="text-gray-600">
              MemServiceBD এর অনলাইন অর্ডারিং সিস্টেম, হোম ডেলিভারি এবং কাস্টমার
              কেয়ার সাপোর্ট টিম ২৪/৭ চালু রয়েছে।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
