import { createRequire } from "module";
const require = createRequire(import.meta.url);
const mongoose = require("../apps/api/node_modules/mongoose");

const MONGODB_URI =
  process.env.MONGODB_CONNECTION_STRING ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/memservice";

const pageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    titleBn: { type: String, default: "", trim: true },
    template: {
      type: String,
      enum: ["default", "about", "legal", "contact", "landing"],
      default: "default",
    },
    content: { type: String, default: "" },
    contentBn: { type: String, default: "" },
    seo: {
      title: { type: String, default: "" },
      titleBn: { type: String, default: "" },
      description: { type: String, default: "" },
      descriptionBn: { type: String, default: "" },
      ogImage: { type: String, default: "" },
      noIndex: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    questionBn: { type: String, default: "" },
    answer: { type: String, required: true },
    answerBn: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);
const Faq = mongoose.models.Faq || mongoose.model("Faq", faqSchema);

const pagesData = [
  {
    slug: "about-us",
    title: "About Us",
    titleBn: "আমাদের সম্পর্কে",
    template: "about",
    status: "published",
    seo: {
      title: "About Mem Service - Bangladesh's Trusted Digital Pharmacy & Healthcare",
      titleBn: "মেম সার্ভিস সম্পর্কে - বাংলাদেশের বিশ্বস্ত ডিজিটাল ফার্মেসি ও স্বাস্থ্যসেবা",
      description:
        "Learn about Mem Service, delivering 100% authentic medicines, temperature-controlled cold chain logistics, and specialist doctor consultations across Bangladesh.",
      descriptionBn:
        "মেম সার্ভিস সম্পর্কে জানুন - ১০০% আসল ওষুধ, কোল্ড-চেইন ডেলিভারি এবং বিশেষজ্ঞ চিকিৎসকদের পরামর্শ সেবা।",
    },
    content: `
      <h2>Welcome to Mem Service</h2>
      <p>
        <strong>Mem Service</strong> is one of Bangladesh's premier licensed digital healthcare and pharmacy platforms.
        Headquartered in Dhaka, we are dedicated to bridging the healthcare access gap by providing patients across all 64 districts
        with authentic medicines, diagnostic healthcare essentials, and direct telemedicine consultations with verified specialist doctors.
      </p>

      <h2>Our Core Mission & Vision</h2>
      <p>
        Our mission is simple yet vital: <em>to guarantee that every individual in Bangladesh has immediate access to 100% authentic,
        affordable, and safely stored pharmaceuticals whenever they need them.</em> We believe healthcare is a fundamental right,
        and no patient should ever worry about counterfeit medications or compromised cold-chain storage.
      </p>

      <h2>What Sets Mem Service Apart</h2>
      <ul>
        <li><strong>100% Genuine Medicine Guarantee:</strong> Sourced directly from DGDA-licensed pharmaceutical manufacturers including Square, Beximco, Incepta, Renata, Acme, and Healthcare Pharmaceuticals.</li>
        <li><strong>Certified Cold-Chain Logistics:</strong> Temperature-sensitive biologicals, insulin, and vaccines are preserved between 2°C to 8°C in insulated cold-box packaging throughout storage and transit.</li>
        <li><strong>Registered Pharmacist Verification:</strong> Every prescription uploaded is verified by a registered A-grade pharmacist before order dispensing.</li>
        <li><strong>Fast Nationwide Delivery:</strong> Same-day express delivery within Dhaka Metro and 24 to 48-hour delivery across all divisions and district towns.</li>
        <li><strong>Specialist Teleconsultation:</strong> Direct online consultations with experienced BMDC-registered medical practitioners across cardiology, pediatrics, medicine, gynecology, and more.</li>
      </ul>

      <h2>Regulatory Compliance & Standards</h2>
      <p>
        Mem Service strictly adheres to the drug policies established by the <strong>Directorate General of Drug Administration (DGDA)</strong>
        of Bangladesh. All medications are sold strictly at or below government-approved Maximum Retail Prices (MRP).
      </p>

      <blockquote>
        "Our promise is your health and peace of mind. We stand for genuine medicines, ethical healthcare, and compassionate service."
      </blockquote>

      <h2>Corporate Office & Contact</h2>
      <p>
        <strong>Head Office:</strong> Suite #402, Sena Kalyan Bhaban, Motijheel C/A, Dhaka-1000, Bangladesh<br>
        <strong>Customer Care Hotline:</strong> +8801711655686 (Available 24/7)<br>
        <strong>Email Inquiries:</strong> <a href="mailto:support@memservice.com">support@memservice.com</a>
      </p>
    `,
    contentBn: `
      <h2>মেম সার্ভিসে আপনাকে স্বাগতম</h2>
      <p>
        <strong>মেম সার্ভিস (Mem Service)</strong> বাংলাদেশের অন্যতম শীর্ষস্থানীয় অনুমোদিত ডিজিটাল ফার্মেসি ও সমন্বিত স্বাস্থ্যসেবা প্ল্যাটফর্ম।
        ঢাকার মতিঝিলে প্রধান কার্যালয় নিয়ে আমরা দেশের ৬৪টি জেলার প্রতিটি প্রান্তে ১০০% আসল ওষুধ, মেডিকেল ইকুইপমেন্ট এবং অভিজ্ঞ বিশেষজ্ঞ চিকিৎসকদের টেলিমেডিসিন পরামর্শ পৌঁছে দিতে অঙ্গীকারবদ্ধ।
      </p>

      <h2>আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
      <p>
        আমাদের মূল লক্ষ্য হলো প্রতিটি নাগরিকের কাছে গুণগত মানসম্পন্ন, সাশ্রয়ী এবং সঠিক তাপমাত্রায় সংরক্ষিত জীবনরক্ষাকারী ওষুধ সহজে ও দ্রুততম সময়ে পৌঁছে দেওয়া।
        ভেজাল ওষুধের ঝুঁকি দূর করে নির্ভরযোগ্য স্বাস্থ্যসেবা নিশ্চিত করাই আমাদের মূল ব্রত।
      </p>

      <h2>আমাদের বিশেষ সেবাসমূহ</h2>
      <ul>
        <li><strong>১০০% আসল ওষুধের নিশ্চয়তা:</strong> স্কয়ার, বেক্সিমকো, ইনসেপ্টা, রেনাটা, একমি সহ শীর্ষস্থানীয় ওষুধ প্রস্তুতকারক প্রতিষ্ঠান থেকে সরাসরি সংগৃহীত।</li>
        <li><strong>কোল্ড-চেইন সংরক্ষণ ব্যবস্থা:</strong> ইনসুলিন, ভ্যাকসিন এবং তাপমাত্রা সংবেদনশীল ওষুধ ২° সে. থেকে ৮° সে. তাপমাত্রায় বিশেষায়িত কোল্ড-বক্সে ডেলিভারি।</li>
        <li><strong>রেজিস্টার্ড এ-গ্রেড ফার্মাসিস্ট:</strong> প্রতিটি প্রেসক্রিপশন অভিজ্ঞ ফার্মাসিস্ট দ্বারা সতর্কতার সাথে নিরীক্ষণ ও যাচাই করা হয়।</li>
        <li><strong>দ্রুত ডেলিভারি:</strong> ঢাকা মেট্রোপলিটন এলাকায় দ্রুততম এক্সপ্রেস ডেলিভারি এবং দেশের যেকোনো জেলায় ২৪ থেকে ৪৮ ঘণ্টার মধ্যে নিরাপদ সরবরাহ।</li>
        <li><strong>অনলাইন ডাক্তার কনসাল্টেশন:</strong> ঘরে বসেই বিএমডিসি নিবন্ধিত বিশেষজ্ঞ চিকিৎসকদের সাথে সরাসরি ভিডিও কনসাল্টেশনের সুযোগ।</li>
      </ul>

      <h2>সরকারি নীতিমালা ও ডিজিডিএ অনুমোদন</h2>
      <p>
        মেম সার্ভিস বাংলাদেশ সরকারের <strong>ওষুধ প্রশাসন অধিদপ্তর (DGDA)</strong>-এর সকল স্বাস্থ্য ও ফার্মেসি নীতিমালা কঠোরভাবে অনুসরণ করে। সরকারি নির্ধারিত সর্বোচ্চ খুচরা মূল্য (MRP) মেনেই ওষুধ সরবরাহ করা হয়।
      </p>

      <blockquote>
        "আপনার ও আপনার পরিবারের স্বাস্থ্য সুরক্ষায় মেম সার্ভিস সর্বদাই আপনার বিশ্বস্ত সহযোগী।"
      </blockquote>

      <h2>যোগাযোগের ঠিকানা</h2>
      <p>
        <strong>হেড অফিস:</strong> স্যুট #৪০২, সেনা কল্যাণ ভবন, মতিঝিল বা/এ, ঢাকা-১০০০, বাংলাদেশ<br>
        <strong>হটলাইন:</strong> +৮৮০১৭১১৬৫৫৬৮৬ (২৪/৭ সেবা চালু)<br>
        <strong>ইমেইল:</strong> <a href="mailto:support@memservice.com">support@memservice.com</a>
      </p>
    `,
  },
  {
    slug: "privacy-policy",
    title: "Privacy Policy",
    titleBn: "গোপনীয়তা নীতি",
    template: "legal",
    status: "published",
    seo: {
      title: "Privacy Policy & Patient Data Security - Mem Service",
      titleBn: "গোপনীয়তা নীতি ও রোগীর তথ্য সুরক্ষা - মেম সার্ভিস",
      description:
        "Learn how Mem Service protects your personal health information, prescription confidentiality, and secure transactions.",
      descriptionBn:
        "মেম সার্ভিসের গোপনীয়তা নীতি ও স্বাস্থ্য সম্পর্কিত ব্যক্তিগত তথ্যের নিরাপত্তা সম্পর্কে জানুন।",
    },
    content: `
      <h2>1. Introduction & Overview</h2>
      <p>
        At <strong>Mem Service</strong> ("we", "our", or "us"), we prioritize the privacy and confidentiality of our patients and customers.
        This Privacy Policy outlines how we collect, store, utilize, and protect your personal identification, medical prescriptions,
        and transaction information when you access our website, applications, and services.
      </p>

      <h2>2. Information We Collect</h2>
      <p>To fulfill your healthcare orders and consultations, we may collect the following information:</p>
      <ul>
        <li><strong>Personal Identifiers:</strong> Name, phone number, email address, and physical shipping address.</li>
        <li><strong>Medical & Health Data:</strong> Doctor's prescription uploads, health records shared during consultations, and allergy or dietary specifications.</li>
        <li><strong>Transaction Details:</strong> Order history, selected payment method, and billing records (we do not store credit card CVV numbers or mobile banking PINs).</li>
        <li><strong>Device & Usage Data:</strong> IP address, browser type, operating system, and cookie data for platform performance.</li>
      </ul>

      <h2>3. Prescription & Medical Data Confidentiality</h2>
      <p>
        Uploaded prescriptions and health consultation notes are treated as <strong>strictly confidential medical records</strong>.
        They are accessible solely by certified registered pharmacists dispensing your medicines and the attending physicians during appointments.
        We will never sell, rent, or publicly disclose your medical records to third-party advertisers.
      </p>

      <h2>4. Payment Security & Financial Protection</h2>
      <p>
        All financial transactions made on Mem Service are processed through encrypted, PCI-DSS compliant secure payment gateways
        (such as bKash, Nagad, Rocket, Visa, Mastercard, and SSLCommerz). We employ end-to-end SSL/TLS encryption to ensure your financial transactions remain impenetrable.
      </p>

      <h2>5. Information Sharing with Third Parties</h2>
      <p>We do not share your personal information except under the following strict conditions:</p>
      <ul>
        <li><strong>Logistics Partners:</strong> Sharing your name, phone number, and delivery address with our verified courier dispatch team to deliver your packages.</li>
        <li><strong>Legal & Regulatory Mandates:</strong> In compliance with Bangladeshi law, judicial orders, or DGDA regulations.</li>
      </ul>

      <h2>6. Your Rights & Data Control</h2>
      <p>
        You have the right to request access to your stored personal data, request corrections, or request deletion of your account.
        To exercise any of these rights, please contact our data compliance desk at <a href="mailto:support@memservice.com">support@memservice.com</a>.
      </p>

      <h2>7. Updates to This Policy</h2>
      <p>
        We may update this Privacy Policy periodically to reflect technological advances or regulatory updates. Continued use of Mem Service after any updates constitutes your acceptance of the revised terms.
      </p>
    `,
    contentBn: `
      <h2>১. ভূমিকা ও পরিচিতি</h2>
      <p>
        <strong>মেম সার্ভিস</strong> গ্রাহক ও রোগীদের তথ্যের সর্বোচ্চ গোপনীয়তা ও সুরক্ষায় প্রতিশ্রুতিবদ্ধ।
        এই গোপনীয়তা নীতিমালায় বর্ণনা করা হয়েছে কীভাবে আপনার ব্যক্তিগত তথ্য, প্রেসক্রিপশন ও লেনদেনের তথ্য সংগ্রহ, সংরক্ষণ ও নিরাপদ রাখা হয়।
      </p>

      <h2>২. সংগৃহীত তথ্যাবলী</h2>
      <ul>
        <li><strong>ব্যক্তিগত তথ্য:</strong> নাম, মোবাইল নম্বর, ডেলিভারির ঠিকানা এবং ইমেইল।</li>
        <li><strong>প্রেসক্রিপশন ও স্বাস্থ্য তথ্য:</strong> ডাক্তারের প্রেসক্রিপশনের ছবি, ওষুধের তালিকা ও কনসাল্টেশন নোট।</li>
        <li><strong>পেমেন্ট সংক্রান্ত তথ্য:</strong> লেনদেনের আইডি ও নির্বাচিত পেমেন্ট মেথড (আমরা কোনো কার্ড পিন বা বিকাশ পিন সংরক্ষণ করি না)।</li>
      </ul>

      <h2>৩. প্রেসক্রিপশন ও স্বাস্থ্য তথ্যের বিশেষ সুরক্ষা</h2>
      <p>
        আপনার আপলোডকৃত প্রেসক্রিপশন অত্যন্ত গোপনীয়ভাবে সংরক্ষিত থাকে। শুধুমাত্র অনুমোদিত এ-গ্রেড ফার্মাসিস্ট এবং কনসাল্টেন্ট ডাক্তার ছাড়া অন্য কোনো ব্যক্তি বা বিজ্ঞাপনদাতার কাছে এই তথ্য হস্তান্তর বা বিক্রি করা হয় না।
      </p>

      <h2>৪. লেনদেনের নিরাপত্তা</h2>
      <p>
        মেম সার্ভিসে সকল অনলাইন পেমেন্ট (বিকাশ, নগদ, ভিসা, মাস্টারকার্ড) বিশ্বস্ত ও এনক্রিপ্টেড পেমেন্ট গেটওয়ের মাধ্যমে পরিচালিত হয়।
      </p>

      <h2>৫. তথ্যের নিয়ন্ত্রণ ও সহায়তা</h2>
      <p>
        আপনার তথ্য পরিবর্তন বা অ্যাকাউন্ট ডিলিট করতে চাইলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করতে পারেন: <a href="mailto:support@memservice.com">support@memservice.com</a>
      </p>
    `,
  },
  {
    slug: "refund-and-return-policy",
    title: "Refund & Return Policy",
    titleBn: "রিফান্ড ও রিটার্ন নীতি",
    template: "legal",
    status: "published",
    seo: {
      title: "Refund & Return Policy - Mem Service Bangladesh",
      titleBn: "রিফান্ড ও রিটার্ন নীতি - মেম সার্ভিস বাংলাদেশ",
      description:
        "Understand our transparent refund and return terms, non-returnable items, and rapid money return timelines.",
      descriptionBn:
        "মেম সার্ভিসের স্বচ্ছ রিটার্ন নীতিমালা, পণ্যের পরিবর্তন ও রিফান্ডের সময়সীমা সম্পর্কে জানুন।",
    },
    content: `
      <h2>1. Overview of Return Policy</h2>
      <p>
        At <strong>Mem Service</strong>, we take utmost care to ensure all medications and healthcare products reach you in pristine, tamper-proof condition.
        However, if an issue occurs with your delivery, we offer a transparent and hassle-free return and refund procedure.
      </p>

      <h2>2. Eligibility for Returns</h2>
      <p>You may initiate a return or replacement request within <strong>7 days</strong> of delivery under the following circumstances:</p>
      <ul>
        <li>The delivered item is damaged, broken, or has leaked packaging during transit.</li>
        <li>The delivered product differs from what was ordered (incorrect brand, strength, or quantity).</li>
        <li>The product has passed its expiration date or has less than 3 months remaining shelf-life without prior notice.</li>
      </ul>

      <h2>3. Non-Returnable Products (Patient Safety)</h2>
      <p>
        In accordance with pharmaceutical safety protocols and DGDA healthcare regulations, certain items <strong>cannot be returned</strong> once accepted by the customer:
      </p>
      <ul>
        <li><strong>Cold-Chain Items:</strong> Temperature-sensitive biologicals, insulin, and vaccines cannot be returned once delivered, as thermal integrity outside our cold chain cannot be guaranteed.</li>
        <li><strong>Unsealed Liquid Medicines:</strong> Syrups, eye/ear drops, and oral suspensions with broken tamper seals.</li>
        <li><strong>Personal Hygiene & Baby Nutrition:</strong> Diapers, opened baby milk/formula, breast pumps, and intimate care products.</li>
      </ul>

      <h2>4. Replacement Procedure</h2>
      <p>
        If an incorrect or defective product is delivered, contact our support team within 48 hours with a photo of the package.
        We will dispatch the correct replacement immediately free of any additional delivery charges.
      </p>

      <h2>5. Refund Methods & Timelines</h2>
      <p>Once your return is inspected and approved by our quality control pharmacists:</p>
      <ul>
        <li><strong>bKash / Nagad / Rocket:</strong> Refund issued to your mobile wallet within <strong>24 to 48 hours</strong>.</li>
        <li><strong>Debit / Credit Cards:</strong> Refund credited to your original bank account within <strong>5 to 7 business days</strong> (depending on your card issuing bank).</li>
        <li><strong>Cash on Delivery Orders:</strong> Refund dispatched directly via your preferred bKash/Nagad number.</li>
      </ul>

      <h2>6. Order Cancellations</h2>
      <p>
        You may cancel an order free of charge at any time before it has been dispatched from our central pharmacy warehouse. Once dispatched, standard return guidelines apply.
      </p>

      <h2>7. Contact Customer Care</h2>
      <p>
        For return or refund requests, please reach out to:<br>
        <strong>Hotline:</strong> +8801711655686<br>
        <strong>Email:</strong> <a href="mailto:support@memservice.com">support@memservice.com</a>
      </p>
    `,
    contentBn: `
      <h2>১. সাধারণ নীতিমালা</h2>
      <p>
        মেম সার্ভিস গ্রাহকদের সঠিক ও সর্বোচ্চ মানসম্পন্ন ওষুধ সরবরাহে প্রতিশ্রুতিবদ্ধ। তবে ডেলিভারির পর পণ্যে কোনো সমস্যা দেখা দিলে আমাদের সহজ রিটার্ন ও রিফান্ড নীতি প্রযোজ্য হবে।
      </p>

      <h2>২. যেসব ক্ষেত্রে রিটার্ন প্রযোজ্য</h2>
      <ul>
        <li>ডেলিভারির সময় ওষুধ ভাঙা, লিক হওয়া বা ক্ষতিগ্রস্ত অবস্থায় পেলে।</li>
        <li>অর্ডারকৃত ওষুধের পরিবর্তে ভুল ওষুধ বা ভিন্ন পাওয়ারের ওষুধ সরবরাহ করা হলে।</li>
        <li>ওষুধের মেয়াদের তারিখ উত্তীর্ণ বা মেয়াদ স্বল্প হলে।</li>
      </ul>

      <h2>৩. যেসব পণ্য ফেরতযোগ্য নয় (রোগীর স্বাস্থ্য সুরক্ষায়)</h2>
      <ul>
        <li><strong>কোল্ড-চেইন ওষুধ:</strong> ইনসুলিন, ভ্যাকসিন এবং তাপমাত্রা সংবেদনশীল ওষুধ একবার রিসিভ করার পর ফেরত নেওয়া হয় না।</li>
        <li><strong>সিলখোলা ড্রপ বা সিরাপ:</strong> যেসব লিকুইড ওষুধের সিল খোলা হয়েছে।</li>
        <li><strong>শিশুখাদ্য ও পার্সোনাল হাইজিন পণ্য:</strong> প্যাকেট খোলা বেবি ফুড, ডায়াপার ইত্যাদি।</li>
      </ul>

      <h2>৪. রিফান্ডের সময়সীমা</h2>
      <ul>
        <li><strong>বিকাশ / নগদ:</strong> রিটার্ন অনুমোদনের ২৪ থেকে ৪৮ ঘণ্টার মধ্যে রিফান্ড প্রদান করা হয়।</li>
        <li><strong>ব্যাংক কার্ড:</strong> কার্ড ইস্যুকারী ব্যাংকের নিয়ম অনুযায়ী ৫ থেকে ৭ কার্যদিবসের মধ্যে টাকা ফেরত দেওয়া হয়।</li>
      </ul>

      <h2>৫. কাস্টমার সাপোর্ট</h2>
      <p>
        যেকোনো সহায়তায় কল করুন: +৮৮০১৭১১৬৫৫৬৮৬ অথবা ইমেইল করুন: <a href="mailto:support@memservice.com">support@memservice.com</a>
      </p>
    `,
  },
  {
    slug: "terms-and-conditions",
    title: "Terms & Conditions",
    titleBn: "ব্যবহারের শর্তাবলী",
    template: "legal",
    status: "published",
    seo: {
      title: "Terms and Conditions of Service - Mem Service",
      titleBn: "ব্যবহারের শর্তাবলী - মেম সার্ভিস",
      description:
        "Read the official terms and conditions for ordering medicines, prescription policies, and doctor appointments on Mem Service.",
      descriptionBn:
        "মেম সার্ভিসের মাধ্যমে ওষুধ অর্ডার ও স্বাস্থ্যসেবা গ্রহণের অফিসিয়াল শর্তাবলী ও নিয়মাবলী।",
    },
    content: `
      <h2>1. Introduction & Acceptance</h2>
      <p>
        Welcome to <strong>Mem Service</strong>. By accessing our website, mobile application, or purchasing healthcare products and scheduling consultations,
        you agree to be bound by these Terms and Conditions. Please review them carefully before using our platform.
      </p>

      <h2>2. Prescription-Only Medicines (Rx)</h2>
      <p>
        In accordance with the <strong>Drugs Act</strong> and Bangladesh DGDA regulations, prescription-only medicines (such as antibiotics, psychotropics, and controlled substances)
        will only be dispensed upon presentation of a valid prescription issued by a registered BMDC medical practitioner.
        Our licensed pharmacists reserve the right to verify prescriptions or decline dispensing if the prescription appears invalid or expired.
      </p>

      <h2>3. Emergency Medical Situations Disclaimer</h2>
      <p>
        <strong>Mem Service is not an emergency medical service.</strong> If you or someone you are assisting is experiencing an acute life-threatening emergency,
        severe chest pain, breathing difficulty, or serious trauma, please immediately proceed to the nearest emergency hospital or contact the national emergency hotline <strong>999</strong>.
      </p>

      <h2>4. Pricing, Accuracy & MRP Compliance</h2>
      <p>
        All pharmaceutical product prices listed on Mem Service strictly comply with the Maximum Retail Prices (MRP) approved by the Directorate General of Drug Administration (DGDA).
        In the event of an inadvertent technical pricing discrepancy, our team will notify you prior to order confirmation.
      </p>

      <h2>5. Delivery Terms & Timelines</h2>
      <ul>
        <li><strong>Dhaka City Metro:</strong> Standard express delivery within 2 to 6 hours or scheduled slot.</li>
        <li><strong>Outside Dhaka (All 64 Districts):</strong> Dispatched via reliable courier partners within 24 to 48 hours.</li>
        <li><strong>Receipt Inspection:</strong> Customers are advised to inspect medicine seals and invoice details upon delivery before confirming receipt.</li>
      </ul>

      <h2>6. Online Doctor Consultations</h2>
      <p>
        Telemedicine consultations are provided by independent registered doctors who exercise professional medical judgment.
        Patients must provide accurate medical history. Teleconsultation is suitable for non-emergency conditions and follow-ups.
      </p>

      <h2>7. Governing Law & Jurisdiction</h2>
      <p>
        These Terms and Conditions shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh.
        Any disputes shall fall under the exclusive jurisdiction of the competent courts of Dhaka, Bangladesh.
      </p>
    `,
    contentBn: `
      <h2>১. ভূমিকা ও সম্মতি</h2>
      <p>
        মেম সার্ভিস ওয়েবসাইটে আপনাকে স্বাগতম। আমাদের সাইট ব্রাউজ, ওষুধ অর্ডার বা ডাক্তার কনসাল্টেশন গ্রহণের মাধ্যমে আপনি এই শর্তাবলীতে সম্মতি প্রদান করছেন।
      </p>

      <h2>২. প্রেসক্রিপশন সংক্রান্ত সরকারি নীতিমালা</h2>
      <p>
        বাংলাদেশ সরকারের ডিজিডিএ নিয়ম অনুসারে প্রেসক্রিপশন-অনলি ওষুধ সংগ্রহের জন্য বৈধ বিএমডিসি নিবন্ধিত ডাক্তারের প্রেসক্রিপশন প্রদান বাধ্যতামূলক।
        আমাদের অনুমোদিত ফার্মাসিস্ট প্রেসক্রিপশন যাচাই করার পর ওষুধ সরবরাহের অনুমোদন প্রদান করেন।
      </p>

      <h2>৩. জরুরি স্বাস্থ্য সতর্কবাণী</h2>
      <p>
        মেম সার্ভিস কোনো জরুরি মেডিকেল রেসকিউ সার্ভিস নয়। জীবনঝুঁকিপূর্ণ পরিস্থিতিতে অবিলম্বে নিকটস্থ জরুরি বিভাগে যোগাযোগ করুন অথবা জরুরি হেল্পলাইন ৯৯৯ এ কল করুন।
      </p>

      <h2>৪. ওষুধের মূল্য ও এমআরপি নীতি</h2>
      <p>
        সকল ওষুধের মূল্য সরকারি নির্ধারিত খুচরা মূল্য (MRP) অনুযায়ী তালিকাভুক্ত করা হয়েছে।
      </p>

      <h2>৫. ডেলিভারি এলাকা ও সময়</h2>
      <p>
        ঢাকা মহানগরে দ্রুততম এক্সপ্রেস ডেলিভারি এবং ঢাকার বাইরে সারা দেশের ৬৪ জেলায় ২৪-৪৮ ঘণ্টার মধ্যে কুরিয়ারের মাধ্যমে ওষুধ সরবরাহ করা হয়।
      </p>

      <h2>৬. আইনগত এখতিয়ার</h2>
      <p>
        এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন দ্বারা পরিচালিত ও নিয়ন্ত্রিত হবে।
      </p>
    `,
  },
  {
    slug: "faq",
    title: "Frequently Asked Questions",
    titleBn: "সাধারণ প্রশ্নোত্তর (FAQ)",
    template: "default",
    status: "published",
    seo: {
      title: "Frequently Asked Questions (FAQ) - Mem Service",
      titleBn: "সাধারণ প্রশ্নোত্তর (FAQ) - মেম সার্ভিস",
      description:
        "Find quick answers to common questions about prescription uploads, genuine medicines, cold chain delivery, and payment options.",
      descriptionBn:
        "ওষুধ অর্ডার, প্রেসক্রিপশন আপলোড, ডেলিভারি ও পেমেন্ট সম্পর্কিত সাধারণ প্রশ্নের উত্তর জানুন।",
    },
    content: `
      <h2>Need Help? We've Got Answers</h2>
      <p>
        Here are answers to the most common questions our patients and customers ask about ordering medications,
        prescription safety, temperature-controlled delivery, and payment procedures on Mem Service.
      </p>
      <p>
        If your query isn't listed below, our healthcare support team is available 24/7 at <strong>+8801711655686</strong> or via WhatsApp.
      </p>
    `,
    contentBn: `
      <h2>আপনার প্রশ্নের সহজ সমাধান</h2>
      <p>
        মেম সার্ভিসের মাধ্যমে ওষুধ অর্ডার, প্রেসক্রিপশন যাচাই, হোম ডেলিভারি এবং অনলাইন পেমেন্ট সংক্রান্ত সাধারণ প্রশ্ন ও সেগুলোর নির্ভরযোগ্য উত্তর নিচে দেওয়া হলো।
      </p>
      <p>
        আরো কোনো তথ্যের জন্য আমাদের ২৪/৭ হেল্পলাইনে কল করুন: <strong>+৮৮০১৭১১৬৫৫৬৮৬</strong> অথবা সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন।
      </p>
    `,
  },
];

const faqsData = [
  {
    question: "How do I order prescription medicines on Mem Service?",
    questionBn: "মেম সার্ভিসে প্রেসক্রিপশনের ওষুধ কীভাবে অর্ডার করব?",
    answer:
      "You can search for your required medicines directly on our store or simply upload a clear photo of your prescription. Our licensed pharmacist will review the prescription, prepare the items, and confirm your order before dispatch.",
    answerBn:
      "আপনি সরাসরি সার্চ করে ওষুধ বাছাই করতে পারেন অথবা আপনার প্রেসক্রিপশনের স্পষ্ট ছবি আপলোড করতে পারেন। আমাদের এ-গ্রেড ফার্মাসিস্ট প্রেসক্রিপশন যাচাই করে অর্ডার নিশ্চিত করবেন।",
    order: 1,
    isActive: true,
  },
  {
    question: "Are all medicines 100% genuine and authentic?",
    questionBn: "মেম সার্ভিসের ওষুধ কি ১০০% আসল ও যাচাইকৃত?",
    answer:
      "Yes, absolutely. We source all medications directly from top DGDA-licensed pharmaceutical manufacturers such as Square, Beximco, Incepta, Renata, Acme, and Healthcare Pharmaceuticals. We have a zero-tolerance policy for counterfeit drugs.",
    answerBn:
      "হ্যাঁ, শতভাগ নিশ্চিত। আমরা সরাসরি স্কয়ার, বেক্সিমকো, ইনসেপ্টা, রেনাটা ইত্যাদি অনুমোদিত ওষুধ প্রস্তুতকারক প্রতিষ্ঠান থেকে ওষুধ সংগ্রহ করি।",
    order: 2,
    isActive: true,
  },
  {
    question: "How do you deliver temperature-sensitive medicines like insulin?",
    questionBn: "ইনসুলিনের মতো তাপমাত্রা-সংবেদনশীল ওষুধ কীভাবে ডেলিভারি করা হয়?",
    answer:
      "Cold-chain medicines are stored in specialized pharmaceutical refrigerators and dispatched in insulated ice-box containers to maintain 2°C to 8°C throughout transit until delivery to your hands.",
    answerBn:
      "ইনসুলিন ও কোল্ড-চেইন ওষুধ বিশেষায়িত রেফ্রিজারেটরে সংরক্ষিত থাকে এবং আইস-প্যাক সম্বলিত কোল্ড-বক্স প্যাকেজিংয়ে নির্দিষ্ট তাপমাত্রায় ডেলিভারি করা হয়।",
    order: 3,
    isActive: true,
  },
  {
    question: "What payment methods are supported?",
    questionBn: "কী কী মাধ্যমে পেমেন্ট করা যায়?",
    answer:
      "We accept Cash on Delivery (COD), bKash, Nagad, Rocket, and all major Visa, Mastercard, and American Express debit/credit cards through our secure payment gateway.",
    answerBn:
      "ক্যাশ অন ডেলিভারি (হোম ডেলিভারিতে মূল্য পরিশোধ), বিকাশ, নগদ, রকেট এবং ভিসা ও মাস্টারকার্ডের মাধ্যমে সম্পূর্ণ নিরাপদে পেমেন্ট করা যায়।",
    order: 4,
    isActive: true,
  },
  {
    question: "What is your delivery timeframe across Bangladesh?",
    questionBn: "ডেলিভারি পেতে কত সময় লাগে?",
    answer:
      "Inside Dhaka Metro, express delivery takes 2 to 6 hours. For all other districts and divisional cities across Bangladesh, delivery typically takes 24 to 48 hours via fast courier services.",
    answerBn:
      "ঢাকা শহরে ২ থেকে ৬ ঘণ্টার মধ্যে এক্সপ্রেস ডেলিভারি দেওয়া হয়। আর ঢাকার বাইরে সারা দেশের ৬৪ জেলায় ২৪ থেকে ৪৮ ঘণ্টার মধ্যে পৌঁছে যায়।",
    order: 5,
    isActive: true,
  },
];

async function seedPages() {
  try {
    console.log("Connecting to MongoDB:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    // Seed Pages
    for (const pageItem of pagesData) {
      const existing = await Page.findOne({ slug: pageItem.slug });
      if (existing) {
        console.log(`Page [/${pageItem.slug}] already exists, updating content...`);
        await Page.updateOne({ slug: pageItem.slug }, { $set: pageItem });
      } else {
        console.log(`Creating page [/${pageItem.slug}]...`);
        await Page.create(pageItem);
      }
    }

    // Seed FAQs
    for (const faqItem of faqsData) {
      await Faq.updateOne(
        { question: faqItem.question },
        { $set: { ...faqItem, status: "active" } },
        { upsert: true }
      );
      console.log(`Upserted FAQ: "${faqItem.question}"`);
    }

    console.log("All CMS pages and FAQs seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seedPages();
