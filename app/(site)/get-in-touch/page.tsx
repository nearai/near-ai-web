import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import GetInTouchFormCard from "@/components/site/GetInTouchFormCard";
import IsoCube from "@/components/site/IsoCube";

export const metadata = {
  title: "Get In Touch | NEAR AI",
};

export default function GetInTouchPage() {
  return (
    <div className="relative w-full font-sans bg-[#ECECEC] text-[#101010]">
      <div className="relative w-full flex flex-col">

        {/* HERO */}
        <section className="relative min-h-[30vh] flex flex-col bg-gradient-to-b from-[#525252] from-[35%] to-[#ECECEC]">
          <div className="absolute inset-0 z-[1] bg-[#101010]/40 pointer-events-none" />
          <div className="relative z-10 flex flex-col flex-1 mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <SiteHeader />
            <div className="flex flex-col flex-1 justify-end pb-12 lg:pb-16 pt-8">
              <h1
                className="text-white font-medium leading-[1.05] tracking-tight"
                style={{ fontSize: "var(--font-size-h1)" }}
              >
                Get In Touch
              </h1>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="bg-[#ECECEC] pb-20 pt-12 lg:pb-28 lg:pt-20">
          <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-10 lg:px-20">
            <div className="mx-auto max-w-3xl grid lg:grid-cols-2 gap-6 items-center">
              <GetInTouchFormCard />
              <div className="hidden lg:flex items-center justify-center">
                <svg viewBox="-100 -100 200 200" className="w-64 h-64 xl:w-80 xl:h-80 overflow-visible">
                  <IsoCube x={-33} y={-19} scale={0.8} />
                  <IsoCube x={33} y={-19} scale={0.8} />
                  <IsoCube x={0} y={0} scale={0.8} />
                  <IsoCube x={0} y={-44} scale={0.8} />
                  <IsoCube x={0} y={44} scale={0.8} />
                  <IsoCube x={-33} y={19} scale={0.8} />
                  <IsoCube x={33} y={19} scale={0.8} />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
