import Button from "@/components/ui/Button";
import { Sparkles } from "lucide-react";

export default function AutoFillProductForm({ setValue }) {
  const autoFillForm = () => {
    const sampleData = {
      name: "Cefuroxime Axetil 500mg Tablets",
      manufacturer_name: "Square Pharmaceuticals PLC",
      brand: "sample-brand-id",
      category: "Antibiotics",
      products_type: "Prescription Medicine",
      generic_name: "Cefuroxime Axetil",
      strength: "500mg",
      pack_size: "10 tablets per strip",
      color: "White",
      regular_price: "350",
      discount_price: "315",
      purchase_price: "270",
      stock: 120,
      special_tag: "Popular",
      tags: "antibiotic,cefuroxime,infection,tablets",
      short_description: "Second-generation cephalosporin antibiotic for respiratory and bacterial infections.",
      product_features: "Fast systemic absorption\nEffective against broad-spectrum gram-positive and gram-negative bacteria\nManufactured in WHO cGMP compliant facility",
      additional_info: "Keep in a cool and dry place away from direct sunlight.",
      specificationsHtml: `<h2>Indications & Clinical Usage</h2>
<p>Cefuroxime axetil is indicated for the treatment of mild to moderate infections caused by susceptible strains of designated microorganisms:</p>
<ul>
  <li>Upper respiratory tract infections (pharyngitis, tonsillitis, acute sinusitis)</li>
  <li>Lower respiratory tract infections (acute bronchitis, community-acquired pneumonia)</li>
  <li>Urinary tract infections (pyelonephritis, cystitis)</li>
  <li>Skin and soft-tissue infections</li>
</ul>
<h2>Dosage & Administration</h2>
<p>Adults: 250mg to 500mg twice daily with meals for 7 to 10 days, or as directed by a registered physician.</p>`,
      specificationsHtmlBangla: `<h2>নির্দেশনা ও ব্যবহারবিধি</h2>
<p>সেফুরোক্সিম একটি দ্বিতীয় প্রজন্মের সেফালোস্পোরিন অ্যান্টিবায়োটিক যা ব্যাকটেরিয়াজনিত বিভিন্ন সংক্রমণের চিকিৎসায় ব্যবহৃত হয়:</p>
<ul>
  <li>শ্বাসনালীর সংক্রমণ (ব্রঙ্কাইটিস, সাইনোসাইটিস, টনসিলাইটিস)</li>
  <li>মূত্রনালীর সংক্রমণ</li>
  <li>ত্বক ও কোমল কলার সংক্রমণ</li>
</ul>
<h2>সেবনমাত্রা</h2>
<p>প্রাপ্তবয়স্কদের জন্য: ২৫০ মি.গ্রা. থেকে ৫০০ মি.গ্রা. দিনে দুইবার খাবারের পর ৭ থেকে ১০ দিন, অথবা রেজিস্টার্ড চিকিৎসকের পরামর্শ অনুযায়ী সেব্য।</p>`,
    };

    // Auto-fill the form fields
    Object.entries(sampleData).forEach(([key, value]) => {
      setValue(key, value, { shouldValidate: true, shouldDirty: true });
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={autoFillForm}
      className="absolute -top-12 right-0 gap-1.5 border-dashed border-primary/40 text-primary hover:bg-primary/10"
      title="Auto-fill form with realistic pharmaceutical sample data"
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>Auto Fill Sample</span>
    </Button>
  );
}
