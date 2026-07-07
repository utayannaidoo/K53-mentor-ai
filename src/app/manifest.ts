import type { MetadataRoute } from "next";
import { APP_NAME, APP_SHORT, APP_DESCRIPTION } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP_NAME,
    short_name: APP_SHORT,
    description: APP_DESCRIPTION,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F8F5EC",
    theme_color: "#2C5F4F",
    orientation: "portrait",
    categories: ["education"],
    icons: [
      // SVG scales to every size; Chrome accepts it for installability.
      // TODO: add maskable 192/512 PNGs for best Android home-screen results.
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
