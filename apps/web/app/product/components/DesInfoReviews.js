"use client";
import { useState } from "react";

function DesInfoReviews({
  specificationsHtml,
  specificationsHtmlBangla,
  additionalInfo,
}) {
  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("en");

  const description = {
    en: specificationsHtml ?? "<p>No English description provided.</p>",
    bn: specificationsHtmlBangla ?? "<p>বাংলায় কোন বর্ণনা প্রদান করা হয়নি।</p>",
  };

  const additional = [
    { label: "Manufacturer", value: additionalInfo.manufacturer },
    { label: "Product Type", value: additionalInfo.productType },
    { label: "Milliliters", value: additionalInfo.mililiter },
  ];

  const handleTabChange = (tab) => setActiveTab(tab);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "bn" : "en"));
  };

  return (
    <section>
      {/* Tabs and Toggle Button */}
      <div className="flex justify-between pb-5">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => handleTabChange("description")}
            className={`${
              activeTab === "description" &&
              "bg-light-mist p-2 rounded-md font-semibold text-sky-blue text-sm"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => handleTabChange("additional")}
            className={`${
              activeTab === "additional" &&
              "bg-light-mist p-2 rounded-md font-semibold text-sky-blue text-sm"
            }`}
          >
            Additional information
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleLanguage}
          className="bg-light-mist p-2 rounded-md text-sm hover:text-sky-blue transition-all duration-200"
        >
          {language === "en" ? "বাংলা দেখুন" : "Switch to English"}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {/* Description Tab */}
        {activeTab === "description" && (
          <div
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: description[language] }}
          />
        )}

        {/* Additional Information Tab */}
        {activeTab === "additional" && (
          <table className="w-full text-left border border-gray-300 rounded-md font-medium text-gray-700">
            <tbody>
              {additional.map(({ label, value }, index) => (
                <tr key={index} className="border text-sm">
                  <td className="px-4 py-2 bg-light-mist w-3/12">{label}</td>
                  <td className="px-4 py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default DesInfoReviews;
