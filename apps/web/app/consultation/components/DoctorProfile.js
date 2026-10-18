import Image from "next/image";
import Link from "next/link";

const DoctorProfile = ({ doc }) => {
    // console.log(doc);
    return (
        <Link href={`/doctors/${doc?._id}`} className=" flex flex-col lg:flex-row border shadow-md hover:shadow-lg p-4 rounded-md lg:justify-between lg:h-[200px]">
            {/* <div className="flex gap-3">
                <div>
                    <Image
                        alt="Doctor profile"
                        src={doc?.image}
                        height={150}
                        width={150}
                        className="rounded-lg"
                    />
                </div>
                <div className="w-1/2">
                    <h2 className="font-bold text-[#343A40] text-xl">{doc?.name} <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400"></span></h2>
                    <p className="text-[13px] text-[#343A40]">{doc?.degree}</p>
                    <h3 className="text-sm text-[#B4B4B4]">Specialities</h3>
                    <p className="text-[13px] text-[#343A40] lg:w-52 lg:h-14 overflow-hidden">{doc?.specialty}</p>
                </div>
            </div>
            <div className="lg:w-4/12">
                <p className="text-[13px] text-[#B4B4B4] font-bold">Working in</p>
                <p className="text-[14px] text-[#343A40] my-1 font-bold">{doc?.hospital_name}</p>
                <p className="text-[13px] text-[#B4B4B4] font-bold">Total Experience</p>
                <p className=" text-[14px] text-[#343A40] my-1 font-bold">{doc?.experience}+ Years</p>
            </div> */}
            <div className="flex gap-3">
                <div>
                    <Image
                        alt="Doctor profile"
                        src={doc?.image}
                        height={150}
                        width={150}
                        className="rounded-lg"
                    />
                </div>
                <div className="">
                    <h2 className="font-bold text-[#343A40] text-xl">{doc?.name}
                        <span className={`relative inline-flex h-3 w-3 rounded-full ml-2 ${doc?.status === "active" ? " bg-green-400" : " bg-gray-400"}`}></span>
                    </h2>
                    <p className="text-[13px] text-[#343A40]">{doc?.degree}</p>
                    <h3 className="text-xs text-[#B4B4B4]">Specialities</h3>
                    <p className="text-[14px] text-[#343A40] font-bold">{doc?.specialty}</p>
                    <p className="text-xs text-[#B4B4B4]">Working in</p>
                    <p className="text-[14px] text-[#343A40] font-bold">{doc?.hospital_name}</p>
                    <p className="text-xs text-[#B4B4B4] ">Total Experience</p>
                    <p className=" text-[14px] text-[#343A40]  font-bold">{doc?.experience}+ Years</p>
                </div>
            </div>
        </Link>

    );
};

export default DoctorProfile;