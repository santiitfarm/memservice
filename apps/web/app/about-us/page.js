
const AboutUsPage = () => {
    return (
        <div className="container  mx-auto px-6  min-h-screen">
            <header className="bg-blue-600 rounded-lg text-white py-4 shadow-lg">
                <div className=" mx-auto text-center">
                    <h1 className="text-3xl font-bold">MemServiceBD</h1>
                    <p className="text-sm mt-1">আপনার নির্ভরযোগ্য স্বাস্থ্যসেবা প্ল্যাটফর্ম</p>
                </div>
            </header>

            <main className="container mx-auto p-6">
                {/* About Us Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">আমাদের সম্পর্কে</h2>
                    <p className="text-gray-600 leading-7">
                        MemServiceBD হচ্ছে বাংলাদেশের বিখ্যাত একটি ডিজিটাল স্বাস্থ্যসেবা প্ল্যাটফর্ম।
                        MemServiceBD অ্যাপের মাধ্যমে সারাদেশে ঘরে বসে ওষুধ হোম ডেলিভারি দেওয়া হয়।
                        অনলাইন ভিডিও কনসালটেশনের মাধ্যমে আপনার ঘরে পৌঁছে দিচ্ছে নির্ভরযোগ্য স্বাস্থ্যসেবা।
                        আমাদের সাথে রয়েছে দেশের ১০০+ অভিজ্ঞ ও বিশেষজ্ঞ ডাক্তার যাদের আছে অনেক বছরের অভিজ্ঞতা।
                    </p>
                </section>

                {/* Medicine Delivery Section */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">মেডিসিন হোম ডেলিভারি</h2>
                    <p className="text-gray-600 leading-7 mb-4">
                        প্রতি মাসে আমাদের অনলাইন ফার্মেসি থেকে ওষুধ অর্ডার করুন এবং আপনার অর্থ ও সময় বাঁচান।
                        আমাদের ওষুধ খাঁটি এবং বেশিরভাগ ক্ষেত্রে ফার্মেসির তুলনায় সস্তা।
                        আপনার ওষুধের অর্ডারে 10% পর্যন্ত ছাড় পান।
                    </p>
                    <ol className="list-decimal list-inside text-gray-600 leading-7">
                        <li>MemServiceBD অ্যাপ ডাউনলোড করুন এবং আপনার প্রেসক্রিপশন আপলোড করুন।</li>
                        <li>আপনি আপনার পছন্দসই ওষুধটিও অনুসন্ধান করতে পারেন।</li>
                        <li>আপনি যে ওষুধটি কিনতে চান তা নির্বাচন করুন এবং কার্টে যোগ করুন।</li>
                        <li>ডেলিভারি ঠিকানা যোগ করুন এবং অর্ডার দেওয়ার জন্য এগিয়ে যান।</li>
                    </ol>
                </section>

                {/* Doctor Consultation Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">বিশেষজ্ঞ ডাক্তারদের পরামর্শ নিন</h2>
                    <p className="text-gray-600 leading-7 mb-4">
                        এখন আপনি নামকরা বিশেষজ্ঞ ডাক্তারদের সাথে অ্যাপয়েন্টমেন্ট বুকিং করে যেকোনো
                        জায়গা থেকে ভিডিও কলের মাধ্যমে পরামর্শ করতে পারেন। ডায়াবেটিস, উচ্চ রক্তচাপ, লিভারের রোগের মতো
                        দীর্ঘস্থায়ী স্বাস্থ্যের জন্য আপনি বিশেষজ্ঞ ডাক্তারের পরামর্শও পেতে পারেন। সাধারণ স্বাস্থ্যগত অবস্থার
                        জন্য আমাদের অভিজ্ঞ জেনারেল প্র্যাকটিশনারদের সাথে মাত্র 99 টাকায় পরামর্শ করতে পারেন।
                    </p>
                </section>
            </main>

            <footer className="bg-blue-600 rounded-lg text-white py-4 mt-12">
                <div className="container mx-auto text-center">
                    <p>&copy; 2025 MemServiceBD. সর্বস্বত্ব সংরক্ষিত।</p>
                </div>
            </footer>
        </div>
    );
};

export default AboutUsPage;