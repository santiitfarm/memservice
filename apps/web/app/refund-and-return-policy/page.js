import Head from "next/head";

const RefundPolicyPage = () => {
    return (
        <div className="bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <Head>
                <title>ফেরত ও রিফান্ড নীতিমালা | MemserviceBD</title>
            </Head>

            <div className="max-w-7xl mx-auto bg-white shadow-md rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
                    ফেরত ও রিফান্ড নীতিমালা
                </h1>

                <section className="mb-8">
                    <p className="text-lg font-semibold text-gray-700 mb-4">
                        MemserviceBD-এ আপনাকে স্বাগতম।
                    </p>
                    <p className="text-gray-600 leading-7">
                        আপনার ক্রয় এবং ডেলিভারি নিয়ে আপনি সম্পূর্ণ সন্তুষ্ট না হলে, আমরা সাহায্যের জন্য এখানে আছি।
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">ফেরতের নীতিমালা:</h2>
                    <ul className="list-disc list-inside text-gray-600 leading-7 space-y-2">
                        <li>
                            আপনি যদি প্রমাণ করতে পারেন যে ভুল ওষুধ, পণ্য বা অর্ডারকৃত আইটেমটি আপনার কাছে পৌঁছেছে, তবেই ফেরতের জন্য যোগ্য হবেন।
                        </li>
                        <li>
                            পণ্যটি সেই অবস্থায় থাকতে হবে যেটি আপনি পেয়েছিলেন।
                        </li>
                        <li>
                            ওয়েবসাইট বা অ্যাপে “অভিযোগ জানান” বোতামটি ব্যবহার করে ফেরতের অনুরোধ করুন।
                        </li>
                        <li>
                            গ্রাহককে আমাদের ডেলিভারিম্যানের সামনে প্যাকেটটি খুলে পরীক্ষা করার জন্য অনুরোধ করা হয়।
                        </li>
                        <li>
                            ডেলিভারির ৬ ঘণ্টার মধ্যে ভুল আইটেম, ভুল পরিমাণ, অথবা ক্ষতিগ্রস্ত আইটেমের অভিযোগ দাখিল করতে হবে।
                        </li>
                        <li>
                            চিকিৎসকের প্রেসক্রিপশন পরিবর্তনের ক্ষেত্রে ৩০ দিনের মধ্যে ওষুধ ফেরত দেয়া যাবে।
                        </li>
                        <li>
                            গ্রাহকের দোষের কারণে ফেরত হলে, ডেলিভারি খরচ প্রযোজ্য হবে এবং ১৫% ইনভয়েস মূল্য কেটে ফেরত দেয়া হবে।
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">রিফান্ড নীতিমালা:</h2>
                    <ul className="list-disc list-inside text-gray-600 leading-7 space-y-2">
                        <li>
                            রিফান্ড ১-৭ কার্যদিবসের মধ্যে প্রক্রিয়াজাত হবে।
                        </li>
                        <li>
                            গ্রাহকের অর্থ তার রিওয়ার্ড ওয়ালেটে জমা হবে।
                        </li>
                        <li>
                            ত্রুটিপূর্ণ ট্রানজেকশন ফি গ্রাহকের রিফান্ড থেকে কেটে নেয়া হবে।
                        </li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">যে পণ্য ফেরতযোগ্য নয়:</h2>
                    <ul className="list-disc list-inside text-gray-600 leading-7 space-y-2">
                        <li>যে পণ্য খোলা হয়েছে বা আংশিক ব্যবহৃত হয়েছে।</li>
                        <li>যে পণ্য প্যাকেজিং বা সিল ভাঙা হয়েছে।</li>
                        <li>টেম্পারড পণ্য।</li>
                        <li>গুণগতমানের সমস্যার জন্য প্রস্তুতকারক দায়ী।</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">যোগাযোগ করুন:</h2>
                    <p className="text-gray-600 leading-7">
                        আপনার প্রশ্ন থাকলে, আমাদের সাথে যোগাযোগ করুন।
                    </p>
                </section>
            </div>
        </div>
    );
};

export default RefundPolicyPage;