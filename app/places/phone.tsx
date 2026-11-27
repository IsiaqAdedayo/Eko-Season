import { PlacesSection } from "../../components/places-section";

export const metadata = {
  title: "Places — phone-width preview",
};
export default function PhonePreview() {
  return (
    <div className="bg-cream px-4 pt-6 sm:px-10 sm:pt-10">
      <PlacesSection />
    </div>
  );
}
