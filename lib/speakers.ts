// The speaker line-up as it stood when /admin took over editing it.
//
// Used ONLY to seed an empty speakers table on first run. After that the database is the single
// source of truth and this list is never read again -- editing it would silently do nothing,
// which is why it is here rather than left looking authoritative inside the page component.
export type SpeakerGroup = "key" | "host" | "guest";

export const GROUPS: { value: SpeakerGroup; label: string; role: string }[] = [
  { value: "key", label: "Key guest speaker", role: "Key Guest Speaker" },
  { value: "host", label: "Conference host", role: "Conference Host" },
  { value: "guest", label: "Confirmed guest speaker", role: "Guest Speaker" },
];

export type Speaker = {
  id: number;
  group: string;
  name: string;
  country: string;
  role: string;
  bio: string;
  photoPath: string;
  photoType: string;
  sortOrder: number;
};

/** The URL a card should use: an uploaded photo is served from the database, a shipped one from
 *  the build's public/ directory. Empty means render the card without an image. */
export function photoUrl(s: { id: number; photoPath: string; photoType: string }) {
  if (s.photoType) return `/api/speaker-photo/${s.id}`;
  return s.photoPath || "";
}

export const SEED = [
  {
    group: "key", name: "Pastor Robert Kayanja", country: "Uganda", role: "Key Guest Speaker",
    photoPath: "/speakers/1000199588.jpg", sortOrder: 10,
    bio: "Pastor Robert Kayanja is a renowned Ugandan pastor, author, and global Christian leader. He is the founder and Senior Pastor of Miracle Centre Cathedral in Kampala and the founder of Robert Kayanja Ministries. For nearly four decades, he has preached the Gospel across nations, inspiring people through his message of faith, hope, restoration, and the transforming power of God.",
  },
  {
    group: "key", name: "Dr Francis Myles", country: "USA", role: "Key Guest Speaker",
    photoPath: "/speakers/1000202498.jpg", sortOrder: 20,
    bio: "Dr Francis Myles is an internationally recognised apostle, speaker, author, and teacher of the Word. He is known for his teaching on the Order of Melchizedek, healing, prophecy, faith, and Kingdom leadership. A bestselling author of more than 12 books, Dr Myles is also the founder of the Order of Melchizedek Supernatural School of Ministry and co-founder of Just Cause Foundation, which supports vulnerable communities in Africa.",
  },
  {
    group: "host", name: "Apostle Samuel Fidelis", country: "South Africa", role: "Conference Host",
    photoPath: "/hosts/apostle-samuel-fidelis.jpg", sortOrder: 10,
    bio: "Host of the Word In Action Global Conference and leader of the gathering.",
  },
  {
    group: "host", name: "Dr Sam Zungu-Fidelis, PhD", country: "South Africa", role: "Conference Host",
    photoPath: "/hosts/dr-sam-zungu-fidelis.jpg", sortOrder: 20,
    bio: "Dr Sam Zungu-Fidelis, PhD is a medical doctor, mental health and wellness specialist, researcher, author, and founder of Mental Wealth Conversations. She is a passionate advocate for shifting the conversation from mental health to mental wealth, empowering leaders, families, and communities to thrive. Dr Sam is also the author of Mental Wealth and other wellness journals.",
  },
  {
    group: "guest", name: "Dr Victor Tuwani Phume", country: "South Africa", role: "Guest Speaker",
    photoPath: "/speakers/dr-victor-tuwani-pume.jpg", sortOrder: 10,
    bio: "Dr Victor Tuwani Phume is a South African theologian, reverend, author, entrepreneur, and media leader. He holds a PhD in Leadership and Management and has authored numerous publications. He is the founder of Zallywood Media Group, including Tshwane TV and GauTV, and has dedicated much of his work to advancing faith, leadership, media, and community transformation.",
  },
  {
    group: "guest", name: "Apostle Mufaro Maposa", country: "Lesotho", role: "Guest Speaker",
    photoPath: "/speakers/apostle-mufaro-maposa.jpg", sortOrder: 20,
    bio: "Apostle Mufaro Maposa is an apostle, prophet, teacher, and Christian leader based in Lesotho. He is the founder and General Overseer of New Testament Church and the Manifest Sons of God Movement, established in 2006. Through his ministry, he is committed to equipping believers, advancing the Gospel, and helping people walk in the fullness of their identity and faith in Christ.",
  },
  {
    group: "guest", name: "Apostle Isaac Sithole", country: "South Africa", role: "Guest Speaker",
    photoPath: "/speakers/apostle-isaac-sithole.png", sortOrder: 30,
    bio: "Apostle Isaac Sithole is a respected Christian leader, pastor, and minister of the Gospel. He serves as Senior Pastor of Oasis of Life Family Church, where he is committed to building faith, strengthening families, and advancing the Kingdom of God. He is also actively involved in Christian leadership and initiatives that seek to bring hope, unity, and positive transformation to communities.",
  },
  {
    group: "guest", name: "Dr Osasuwa", country: "Nigeria", role: "Guest Speaker",
    photoPath: "/speakers/dr-osasuwa.png", sortOrder: 40, bio: "",
  },
  {
    group: "guest", name: "Pastors Timsimon & Erica Kamani", country: "Kenya", role: "Guest Speakers",
    photoPath: "/speakers/pastors-timsimon-erica-kamani.jpg", sortOrder: 50, bio: "",
  },
  {
    group: "guest", name: "Rev Moyo", country: "Bulawayo, Zimbabwe", role: "Guest Speaker",
    photoPath: "/speakers/rev-moyo.jpg", sortOrder: 60, bio: "",
  },
  {
    group: "guest", name: "Dr Thandi Ngomelo", country: "South Africa", role: "Guest Speaker",
    photoPath: "/speakers/dr-thandi-ngomelo.jpg", sortOrder: 70, bio: "",
  },
];
