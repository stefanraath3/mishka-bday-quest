import * as THREE from "three";
import { MemoryPhoto } from "../components/PaintingFrame";

// Memory photos data - you can replace these with actual photos and memories
export const memoryPhotos: MemoryPhoto[] = [
  {
    id: "photo-1",
    imagePath: "/images/memories/photo1.jpg", // Add your photos to public/images/memories/
    title: "Our First Restaurant Date",
    description:
      "September 3rd, 2024 - our very first restaurant date together at Eden on the Bay! Remember how the place we originally wanted to go to was mysteriously shut down? We couldn't stop joking that they closed right after Mishka called to book! But it turned out to be perfect - this cozy spot by the bay in Bloubergstrand gave us the most amazing evening. Three friends becoming something more special, sharing laughs, stories, and that unforgettable night that started it all.",
    date: "September 3, 2024",
    location: "Eden on the Bay, Bloubergstrand",
    people: ["Garthy", "Mishka"],
  },
  {
    id: "photo-2",
    imagePath: "/images/memories/photo2.jpg",
    title: "Epic Parking Struggle & Great Views",
    description:
      "September 23rd, 2024 at Cafe Caprice - the day we spent almost an hour hunting for parking and arrived reeaaallly late! Remember how they first squeezed us into that tiny corner spot at the bar? We weren't having it and demanded an upgrade. Best decision ever - ended up with an amazing view and had so much fun! Great vaaarbss.",
    date: "September 23, 2024",
    location: "Cafe Caprice, Camps Bay",
    people: ["Stefan", "Mishka", "Garthy"],
  },
  {
    id: "photo-3",
    imagePath: "/images/memories/photo3.jpg",
    title: "Vineyard Adventures & Wine Hacks",
    description:
      "December 3rd, 2024 at Blaauwklippen Vineyards - chocolate and fudge pairing because we were too late for the pizza lool! The day Garthy's pants got attacked by the table and we discovered white wine is actually a great stain remover (it worked!). Mishka's face said everything we need to know about the wine taste hahaha. Great photos, hilarious memories, perfect day.",
    date: "December 3, 2024",
    location: "Blaauwklippen Vineyards",
    people: ["Stefan", "Mishka", "Garthy"],
  },
  {
    id: "photo-4",
    imagePath: "/images/memories/photo4.jpg",
    title: "Vampire Valentine Madness",
    description:
      "February 16th, 2025 - The night of the Vampire Valentine! Started out wild, we almost didn't go, but when we finally decided and got there late, they let everyone into the VIP section! Garthy was fascinated by those boys at the back... and Mishka became our official 'trust peck muscle asker' - she went around asking people if Garthy could touch their pecks lool! Costumes on point, chaos at maximum, memories absolutely priceless. What a night!",
    date: "February 16, 2025",
    location: "Vampire Valentine Event",
    people: ["Stefan", "Mishka", "Garthy"],
  },
  {
    id: "photo-5",
    imagePath: "/images/memories/photo5.jpg",
    title: "Repentance Shopping Spree",
    description:
      "Saturday, March 8th, 2025 - China Town shopping adventure for Repentance outfits! We got some... interesting props (those water dick guns lool) and Mishka found her perfect cute wings. Little did we know we were prepping for a night filled with wax, whip wacking, and some very interesting lighting choices! The shopping was almost as memorable as the event itself.",
    date: "March 8, 2025",
    location: "China Town",
    people: ["Mishka"],
  },
  {
    id: "photo-6",
    imagePath: "/images/memories/photo6.jpg",
    title: "Mind-Bending Museum Night",
    description:
      "July 25th, 2025 at the Museum of Illusions - what a mind-bending night! That twisted tunnel that literally twisted the entire room around us was absolutely insane. So proud that we made it through (some even 3 times). Such an interesting night. Our brains were thoroughly twisted by the end hahah.",
    date: "July 25, 2025",
    location: "Museum of Illusions",
    people: ["Stefan", "Mishka", "Garthy"],
  },
];

// Define painting positions on the walls
export const paintingPositions = [
  // Left wall paintings
  {
    photoId: "photo-1",
    position: new THREE.Vector3(-14.3, 3.2, -3),
    rotation: new THREE.Euler(0, Math.PI / 2, 0),
    scale: 1.0,
  },
  {
    photoId: "photo-2",
    position: new THREE.Vector3(-14.3, 3.2, 3),
    rotation: new THREE.Euler(0, Math.PI / 2, 0),
    scale: 1.0,
  },

  // Right wall paintings
  {
    photoId: "photo-3",
    position: new THREE.Vector3(14.3, 3.2, -3),
    rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    scale: 1.0,
  },
  {
    photoId: "photo-4",
    position: new THREE.Vector3(14.3, 3.2, 3),
    rotation: new THREE.Euler(0, -Math.PI / 2, 0),
    scale: 1.0,
  },

  // Back wall paintings (on either side of torches)
  {
    photoId: "photo-5",
    position: new THREE.Vector3(-6, 3.2, -14.3),
    rotation: new THREE.Euler(0, Math.PI, 0),
    scale: 1.0,
  },
  {
    photoId: "photo-6",
    position: new THREE.Vector3(6, 3.2, -14.3),
    rotation: new THREE.Euler(0, Math.PI, 0),
    scale: 1.0,
  },
];

// Helper function to get photo data by ID
export function getPhotoById(id: string): MemoryPhoto | undefined {
  return memoryPhotos.find((photo) => photo.id === id);
}

// Helper function to get painting position by photo ID
export function getPaintingPosition(photoId: string) {
  return paintingPositions.find((pos) => pos.photoId === photoId);
}
