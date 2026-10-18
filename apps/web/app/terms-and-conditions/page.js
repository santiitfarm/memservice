
const TermsAndConditionsPage = () => {
    return (
        <div className="container mx-auto px-6  min-h-screen">
            <header className="bg-blue-600 rounded-lg text-white py-4 shadow-lg">
                <div className="container mx-auto text-center">
                    <h1 className="text-3xl font-bold">MemServiceBD</h1>
                    <p className="text-sm mt-1">আপনার নির্ভরযোগ্য ডিজিটাল স্বাস্থ্যসেবা</p>
                </div>
            </header>

            <main className=" mx-auto p-6 bg-gray-50">
                {/* Terms and Conditions */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">শর্তাবলী</h2>
                    <p className="text-gray-600 leading-7 mb-4">
                        MemServiceBD ওয়েবসাইট/মোবাইল অ্যাপ্লিকেশনটিতে অ্যাক্সেস এবং ব্যবহার করা চালিয়ে যাওয়ার মাধ্যমে আপনি নিশ্চিত করছেন যে আপনি নীচে উল্লেখিত আমাদের নিয়ম ও শর্তাবলী স্বীকার করছেন।
                        আপনি যদি শর্তাবলী স্বীকার না করেন, তাহলে আপনাকে অবশ্যই এই ওয়েবসাইট/মোবাইল অ্যাপ্লিকেশনটি ছেড়ে যেতে হবে।
                    </p>
                    <p className="text-gray-600 leading-7">
                        এই ওয়েবসাইট/মোবাইল অ্যাপ্লিকেশনটি MemServiceBD হেলথকেয়ার লিমিটেড দ্বারা পরিচালিত, যা কোম্পানি আইন ১৯৯৪ এর অধীনে নিবন্ধিত।
                        আপনার যদি কোনো তথ্যের প্রয়োজন হয় বা কোনো অভিযোগ থাকে, তাহলে যোগাযোগ করুন:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 mt-4">
                        <li>ফোন: ০১৮৪৪৬৭১১১২</li>
                        <li>ইমেল: support@memservicebd.health</li>
                    </ul>
                </section>

                {/* Delivery Time */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">ডেলিভারি সময়</h2>
                    <p className="text-gray-600 leading-7 mb-4">
                        আমরা ঢাকা, চট্টগ্রাম সিটি করপোরেশন এবং বগুড়া সদর এলাকায় ১২-২৪ ঘণ্টার মধ্যে ক্যাশ অন ডেলিভারি দিয়ে থাকি।
                        অন্যান্য জেলায় কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি করা হয়। বিস্তারিত:
                    </p>
                    <ul className="list-disc list-inside text-gray-600">
                        <li>১০০০ টাকার উপর অর্ডারে ৩০ টাকা ডেলিভারি চার্জ।</li>
                        <li>১০০০ টাকার নিচের অর্ডারে সম্পূর্ণ কুরিয়ার চার্জ গ্রাহক বহন করবেন।</li>
                        <li>ডেলিভারি পেতে ৩-৪ দিন সময় লাগতে পারে।</li>
                    </ul>
                </section>

                {/* Refund Policy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">মূল্য ফেরত নীতিমালা</h2>
                    <p className="text-gray-600 leading-7 mb-4">
                        যদি ওষুধের অর্ডার বাতিল হয়ে যায় বা ডাক্তারের অ্যাপয়েন্টমেন্ট ব্যর্থ হয়, তাহলে গ্রাহক ৭ কার্যদিবসের মধ্যে পুরো টাকা ফেরত পাবেন।
                        ফেরত দেওয়া হবে বিকাশের মাধ্যমে।
                    </p>
                </section>

                {/* Product Return Policy */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">পণ্য ফেরত নীতিমালা</h2>
                    <p className="text-gray-600 leading-7">
                        যদি ক্রয়কৃত ওষুধগুলি অক্ষত থাকে, তাহলে ৭ দিনের মধ্যে ফেরত বা বিনিময় করা যাবে।
                        ব্যবহৃত স্ট্রিপ বা বোতল ফেরত নেওয়া হয় না। নতুন প্রেসক্রিপশন অনুযায়ী ১ মাসের মধ্যে বিনিময় করা যাবে।
                    </p>
                </section>

                {/* Referral Policy */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">রেফারেল নীতিমালা</h2>
                    <p className="text-gray-600 leading-7">
                        রেফারাল কোডের অপব্যবহার বা অসদাচরণ হলে কোম্পানি রেফারাল সুবিধা বাতিল করার অধিকার সংরক্ষণ করে।
                        প্রতিটি রেফারালে ভিন্ন ফোন নম্বর এবং ডেলিভারি ঠিকানা ব্যবহার করতে হবে।
                    </p>
                </section>
            </main>

            <footer className="bg-blue-600 rounded-lg text-white py-4 mt-12">
                <div className="container mx-auto text-center">
                    <p>&copy; 2024 MemServiceBD. সর্বস্বত্ব সংরক্ষিত।</p>
                </div>
            </footer>
        </div>

    );
};

export default TermsAndConditionsPage;