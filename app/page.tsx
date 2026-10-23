import PersonaDetailCard from "@/components/page/main/AiReviewer";
import AiReviewSection from "@/components/page/main/AiReviewSection";
import FeaturedBooks from "@/components/page/main/FeaturedBooks";
import HeroSection from "@/components/page/main/Hero";
import { fetchBestSeller } from "@/lib/SSG/fetchBestSeller";

export default async function Page() {
  const [bestSellerData] = await Promise.all([
    fetchBestSeller("best_category_eBook", "추천일순"),
  ]);

  return (
    <div>
      <HeroSection />
      <AiReviewSection />
      <PersonaDetailCard />
      <FeaturedBooks data={bestSellerData} />
    </div>
  );
}
