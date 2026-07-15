import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import GetInTouchFormCard from "@/components/site/GetInTouchFormCard";

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
            <GetInTouchFormCard />
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
