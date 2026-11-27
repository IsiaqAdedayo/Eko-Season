/**
 * The campuses. These are working institutions rather than attractions, so a
 * card carries only what is verifiable — where the school is, when it was
 * founded, and what is actually on the campus in the photograph. Nothing here
 * claims a visitor gets past the gate.
 *
 * Photographs are Commons files of that campus, credited per card.
 */

export type School = {
  id: string;
  /** What the gate says, with the name people still use in brackets. */
  name: string;
  short: string;
  area: string;
  founded: string;
  note: string;
  address: string;
  url?: string;
  image: string;
  imageAlt: string;
  imageCredit: string;
  imagePage: string;
};

export const schools: School[] = [
  {
    id: "unilag",
    name: "University of Lagos",
    short: "UNILAG",
    area: "Akoka",
    founded: "1962",
    note: "Founded in 1962 as one of the country's first-generation universities. The main campus at Akoka runs along the lagoon on 802 acres, with the College of Medicine out at Idi-Araba. The main gate is the orientation point: two yellow towers with the crest between them, and the queue of cars that forms every morning.",
    address: "University of Lagos, Akoka, Yaba, Lagos",
    url: "https://unilag.edu.ng/about",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8f/University_of_Lagos_Main_Gate.jpg/1280px-University_of_Lagos_Main_Gate.jpg",
    imageAlt:
      "The main gate at the University of Lagos: yellow tower wings on either side, the crest over the road and cars passing through under a tall cloud sky.",
    imageCredit: "Ei'eke, CC BY 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:University_of_Lagos_Main_Gate.jpg",
  },
  {
    id: "yabatech",
    name: "Yaba College of Technology",
    short: "Yabatech",
    area: "Yaba",
    founded: "1947",
    note: "Started day and evening classes in October 1947 as Yaba Technical Institute, the country's first technical institute, and took its present name in 1963. Nine schools now, and the arcade of the School of Art, Design and Printing is the one to walk: the course board in green at the entrance, sculpture in every direction, and students carrying work between studios.",
    address: "Yaba College of Technology, Herbert Macaulay Way, Yaba, Lagos",
    url: "https://yabatech.edu.ng/history.php",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/School_of_Art%2C_Design_and_Printing%2C_YabaTech_2.jpg/1280px-School_of_Art%2C_Design_and_Printing%2C_YabaTech_2.jpg",
    imageAlt:
      "The entrance arcade of the School of Art, Design and Printing at Yabatech: a green course board listing fine art, graphic and industrial design, sculptures among the columns, and students walking through.",
    imageCredit: "Official alade, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:School_of_Art,_Design_and_Printing,_YabaTech_2.jpg",
  },
  {
    id: "lasu",
    name: "Lagos State University",
    short: "LASU",
    area: "Ojo",
    founded: "1983",
    note: "Established by Lagos State law in 1983 and moved to its main campus at Ojo that December, at the far end of the Badagry expressway. A flat, green, enormous campus: the Babajide Olusola Sanwo-Olu Library Complex in the photograph is the newest landmark, and the walk between faculties is the point.",
    address: "Lagos State University, Ojo, Lagos",
    url: "https://lasu.edu.ng/home/about/",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/64/Lagos_State_University_Babajide_Olusola_Sanwo-Olu_Library_Complex_aug_2026_IMG_5994b.jpg/1280px-Lagos_State_University_Babajide_Olusola_Sanwo-Olu_Library_Complex_aug_2026_IMG_5994b.jpg",
    imageAlt:
      "The Babajide Olusola Sanwo-Olu Library Complex at Lagos State University's Ojo campus, with its paved forecourt and lawn.",
    imageCredit: "FrankvEck, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Lagos_State_University_Babajide_Olusola_Sanwo-Olu_Library_Complex_aug_2026_IMG_5994b.jpg",
  },
  {
    id: "lasustech",
    name: "LASUSTECH (LASPOTECH)",
    short: "LASUSTECH",
    area: "Ikorodu",
    founded: "1977",
    note: "The polytechnic everyone still calls LASPOTECH. It opened in 1977 as the Lagos State College of Science and Technology, became Lagos State Polytechnic in 1986, and was signed into a university in February 2022. The Ikorodu campus is built around its engineering and technology schools — the place to watch things being made.",
    address: "Lagos State University of Science and Technology, Ikorodu, Lagos",
    url: "https://lasustech.edu.ng/about",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Lagos_State_University_of_Science_and_Technology_%28Lasutech%29.jpg/1280px-Lagos_State_University_of_Science_and_Technology_%28Lasutech%29.jpg",
    imageAlt:
      "The LASUSTECH main gate: a wide green sign reading Lagos State University of Science and Technology on two concrete pillars, students and a car passing under it.",
    imageCredit: "Ei'eke, CC BY-SA 4.0",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Lagos_State_University_of_Science_and_Technology_(Lasutech).jpg",
  },
  {
    id: "lasued",
    name: "Lagos State University of Education",
    short: "LASUED",
    area: "Oto/Ijanikin",
    founded: "2022",
    note: "The state's teacher-training university, created in 2022 out of two colleges of education: Adeniran Ogunsanya at Oto/Ijanikin and Michael Otedola at Epe. The Oto gate in the photograph still carries the old college name on its arch, which is the whole story of the merger in one sign. Both campuses sit far out on the Badagry expressway, so go for a reason and not on the way to something else.",
    address: "Lagos State University of Education, Oto/Ijanikin, Lagos",
    url: "https://lasued.edu.ng/web/our-history.php",
    image:
      "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Adeniran_Ogunsanya_College_of_Education.jpg/1280px-Adeniran_Ogunsanya_College_of_Education.jpg",
    imageAlt:
      "The gate of the Adeniran Ogunsanya campus at Oto/Ijanikin: a wide stone-clad arch with the college name and crest across it, hedges in front and a car turning in.",
    imageCredit: "Kaizenify, public domain",
    imagePage:
      "https://commons.wikimedia.org/wiki/File:Adeniran_Ogunsanya_College_of_Education.jpg",
  },
];
