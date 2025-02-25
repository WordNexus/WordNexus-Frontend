import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-screen bg-[#E5E5EA] shadow-theme-toggle border-t-2 mt-[60px] lg:px-[240px] md:px-[40px] px-[30px] pt-8 pb-12">
      <div className="flex flex-col gap-6">
        <h2 className="text-xl text-foreground font-bold mb-4">
          Contact & Visit Us!
        </h2>

        <div className="flex md:flex-row flex-col justify-start items-start">
          <div className="md:mr-[120px] mr-[0px] md:mb-[0px] mb-[60px]">
            <h3 className="text-base text-foreground font-bold mb-4">
              Management
            </h3>
            <ul className="flex flex-col justify-between gap-1">
              <li>
                <span className="text-foreground text-sm font-semibold">
                  허준석
                </span>
              </li>
              <li className="flex gap-1">
                <p className="text-foreground text-sm font-normal">Blog: </p>
                <Link
                  href="https://hursome.tistory.com"
                  target="_blank"
                  className="hover:underline text-foreground text-sm font-semibold"
                >
                  https://hursome.tistory.com
                </Link>
              </li>
              <li className="flex gap-1">
                <p className="text-foreground text-sm font-normal">Email: </p>
                <Link
                  href="mailto:wordnexus.team@gmail.com"
                  className="hover:underline text-foreground text-sm font-semibold"
                >
                  wordnexus.dev@gmail.com
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base text-foreground font-bold mb-4">
              Development
            </h3>
            <ul className="flex flex-col justify-between gap-1">
              <li>
                <span className="text-foreground text-sm font-semibold">
                  이주한
                </span>
              </li>
              <li className="flex gap-1">
                <p className="text-foreground text-sm font-normal">Blog:</p>
                <Link
                  href="https://sapiens94.tistory.com"
                  target="_blank"
                  className="hover:underline text-foreground text-sm font-semibold"
                >
                  https://sapiens94.tistory.com
                </Link>
              </li>
              <li className="flex gap-1">
                <p className="text-foreground text-sm font-normal">GitHub:</p>
                <Link
                  href="https://github.com/JooHan10"
                  target="_blank"
                  className="hover:underline text-foreground text-sm font-semibold"
                >
                  https://github.com/JooHan10
                </Link>
              </li>
              <li className="flex gap-1">
                <p className="text-foreground text-sm font-normal">Email:</p>
                <Link
                  href="mailto:wordnexus.dev@gmail.com"
                  className="hover:underline text-foreground text-sm font-semibold"
                >
                  wordnexus.dev@gmail.com
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
