import { Instagram, Facebook } from "lucide-react";

const INSTAGRAM_URL = "https://www.instagram.com/celewe.events?utm_source=qr&igsh=MTRuY21mY3ZodXRzaw%3D%3D";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61585966952557&rdid=JAeUbh8oY9EOFqpk&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1GWTfupjGP%2F#";

export function SocialSeeMore() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group inline-flex items-center gap-3 px-8 py-4
          bg-[#2D2021] border border-[#970C10]/40 text-white text-sm uppercase tracking-widest font-medium
          transition-all duration-300
          hover:border-[#970C10] hover:shadow-[0_0_18px_0_rgba(151,12,16,0.45)] hover:bg-[#3a2426]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#970C10]
        "
      >
        <Instagram size={18} className="text-[#970C10] group-hover:text-white transition-colors duration-300" />
        See more on Instagram
      </a>

      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group inline-flex items-center gap-3 px-8 py-4
          bg-[#2D2021] border border-[#970C10]/40 text-white text-sm uppercase tracking-widest font-medium
          transition-all duration-300
          hover:border-[#970C10] hover:shadow-[0_0_18px_0_rgba(151,12,16,0.45)] hover:bg-[#3a2426]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#970C10]
        "
      >
        <Facebook size={18} className="text-[#970C10] group-hover:text-white transition-colors duration-300" />
        See more on Facebook
      </a>
    </div>
  );
}
