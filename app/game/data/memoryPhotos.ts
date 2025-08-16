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
    title: "Coffee & Dreams",
    description:
      "Those quiet morning talks over coffee where we shared our dreams, fears, and everything in between. These simple moments together are the ones I treasure most.",
    date: "September 8, 2023",
    location: "Corner Café",
    people: ["Mishka", "Best Friend"],
  },
  {
    id: "photo-4",
    imagePath: "/images/memories/photo4.jpg",
    title: "Concert Night",
    description:
      "That amazing concert where we sang along to every song, danced like nobody was watching, and felt completely alive. The music, the energy, the perfect company - unforgettable!",
    date: "October 22, 2023",
    location: "City Music Hall",
    people: ["Mishka", "Concert Crew"],
  },
  {
    id: "photo-5",
    imagePath: "/images/memories/photo5.jpg",
    title: "Hiking Achievement",
    description:
      "The day we conquered that challenging trail together. Your determination was inspiring, and the view from the top was breathtaking - almost as breathtaking as your smile when we made it!",
    date: "August 5, 2023",
    location: "Mountain Peak Trail",
    people: ["Mishka", "Adventure Buddies"],
  },
  {
    id: "photo-6",
    imagePath: "/images/memories/photo6.jpg",
    title: "Cozy Movie Night",
    description:
      "One of many perfect movie nights where we laughed, cried, and ate way too much popcorn. Your commentary made every movie better, and these cozy nights are pure happiness.",
    date: "November 14, 2023",
    location: "Living Room Fort",
    people: ["Mishka", "Movie Night Squad"],
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
