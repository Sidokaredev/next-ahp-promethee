import HomeNavigation from "@/components/navigations/home-navigation";
import Image from "next/image";

export default function Home() {
  return (
    <div className="wrapper"
      style={{
        width: "100%",

      }}
    >
      <HomeNavigation />
    </div>
  );
}
