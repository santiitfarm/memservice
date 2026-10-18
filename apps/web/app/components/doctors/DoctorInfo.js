const DoctorInfo = ({ doctor }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 ">
      <div className="mt-10 border shadow-lg rounded-lg p-3">
        <p className="text-[#212529] font-bold text-xl">
          About {doctor?.name} - {doctor?.specialty}
        </p>
        <p>{doctor?.doctor_info}</p>
      </div>
      <div>
        <div className="mt-10 border  p-3 shadow-lg rounded-lg ">
          <h3 className="text-[#212529] font-bold text-[18px]">Availability</h3>
          <div className=" border-l-2 border-[#4285f4]">
            <p className="text-[#6B7280] pl-3">Instant Consultation Time</p>
            <p className="text-[#212529] text-[14px] font-bold pl-3">
              {doctor?.available_day}
            </p>
          </div>
        </div>
        <div className="mt-4 border  p-3 shadow-lg rounded-lg">
          <h3 className="text-[#212529] font-bold text-[18px]">At a Glance</h3>
          <div className="flex flex-col lg:flex-row lg:gap-5 ">
            <div className="flex flex-col gap-3">
              <div className=" border-l-2 border-[#4285f4]">
                <p className="text-[#6B7280] pl-3">Consultation fee</p>
                <p className="text-[#212529] text-[14px] font-bold pl-3">
                  ৳{doctor?.consultation_fee}{" "}
                  <span className="text-[#6B7280] text-xs">(incl. VAT)</span>
                </p>
              </div>
              {/* <div className=' border-l-2 border-[#4285f4]'>
                                <p className='text-[#6B7280] pl-3'>Contract</p>
                                <p className='text-[#212529] text-[14px] font-bold pl-3'>{doctor?.contract_number}</p>
                            </div> */}
              <div className=" border-l-2 border-[#4285f4]">
                <p className="text-[#6B7280] pl-3">Doctor code</p>
                <p className="text-[#212529] text-[14px] font-bold pl-3">
                  {doctor?.doctor_code}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className=" border-l-2 border-[#4285f4]">
                <p className="text-[#6B7280] pl-3">Follow-up fee</p>
                <p className="text-[#212529] text-[14px] font-bold pl-3">
                  ৳{doctor?.follow_up_fee}{" "}
                  <span className="text-[#6B7280] text-xs">(incl. VAT)</span>
                </p>
                <p className="text-[#212529] text-[14px] font-bold pl-3">
                  (Within 60 days)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfo;
